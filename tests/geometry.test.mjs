/**
 * A row's shape comes from its slot, not from what is in it (ADR 0011).
 *
 * Every case here shipped as a wrapping flex row and broke on a phone in a
 * screenshot the owner sent on 2026-10-23: a menu trigger alone on a second
 * row, a dialog's close glyph under its title, step labels a letter per line.
 * Each fix is one rule, and each rule is easy to undo by someone tidying the
 * stylesheet, so each is pinned here. Static checks, like the rest of this
 * suite: nothing in the registry is rendered by a test runner.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(ROOT, 'dist', 'kairos.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const react = (name) => readFileSync(join(ROOT, 'dist', 'react', name), 'utf8');

/** The body of every `@media`/`@container` block whose prelude matches. */
function blocks(prelude) {
  const out = [];
  const pattern = new RegExp(`@(?:media|container)\\s*\\(${prelude}\\)\\s*\\{`, 'g');
  for (const match of css.matchAll(pattern)) {
    let depth = 1;
    let i = match.index + match[0].length;
    const start = i;
    while (depth > 0 && i < css.length) {
      if (css[i] === '{') depth += 1;
      if (css[i] === '}') depth -= 1;
      i += 1;
    }
    out.push(css.slice(start, i - 1));
  }
  return out.join('\n');
}

/** The declarations of the first rule whose selector ends with `selector`. */
function rule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`(?:^|[\\s},])${escaped}\\s*\\{([^}]*)\\}`, 'm'));
  return match ? match[1] : null;
}

for (const [width, row] of [
  ['767px', '.kairos-page-header-actions'],
  ['640px', '.kairos-action-row:not(.kairos-action-row--equal)'],
]) {
  test(`G1: below ${width} ${row} is a grid, not a wrapping row`, () => {
    const narrow = blocks(`max-width:\\s*${width}`);
    const grid = rule(narrow, row);
    assert.ok(grid, 'the narrow rule exists');
    assert.match(grid, /display:\s*grid/);
    assert.match(grid, /grid-auto-flow:\s*row dense/, 'the trigger backfills the first free end cell');
    assert.match(narrow, /grid-template-columns:\s*minmax\(0, 1fr\) auto/, 'a menu takes a narrow end column');
    assert.match(narrow, /> \.kairos-overflow-trigger\s*\{[^}]*grid-column:\s*2/, 'the trigger takes the end column');
    assert.match(narrow, /:is\(\.kairos-button--primary, \.kairos-page-header-primary[^{]*\{\s*order:\s*-1/, 'the primary leads whatever its markup order');
  });
}

test('G1: no rule stacks a page header\'s actions one per row with !important', () => {
  // The rule this replaced made every header action, the menu trigger
  // included, a full-width row of its own below 768px, and its `!important`
  // would beat the grid above.
  assert.doesNotMatch(css, /\.kairos-page-header-actions\s*\{[^}]*display:\s*grid\s*!important/);
});

test('G1: a selector inside :has() never nests another :has()', () => {
  // A nested :has() is invalid, and an invalid selector drops its whole rule
  // silently — which would put the wrapped rows straight back.
  for (const [, inner] of css.matchAll(/:has\(((?:[^()]|\([^()]*\))*)\)/g)) {
    assert.doesNotMatch(inner, /:has\(/, `nested :has() in ${inner}`);
  }
});

test('a page header secondary folds into the menu below 900px and nowhere else', () => {
  const below = blocks('max-width:\\s*899px');
  const above = blocks('min-width:\\s*900px');
  assert.match(below, /\.kairos-page-header-actions \.kairos-page-header-secondary\s*\{\s*display:\s*none/);
  assert.match(above, /\.kairos-overflow-item--folded,\s*\n\s*\.kairos-overflow-trigger--folded\s*\{\s*display:\s*none/);

  const actionSet = react('ActionSet.tsx');
  assert.match(actionSet, /folded: true/, 'ActionSet copies the secondary into the menu');
  assert.match(actionSet, /kairos-page-header-secondary/, 'and marks the button it hides');
  const menu = react('OverflowMenu.tsx');
  assert.match(menu, /'kairos-overflow-item--folded'/);
  assert.match(menu, /'kairos-overflow-trigger--folded'/);
});

test('G6: the dialog head is a grid and the close keeps its corner', () => {
  const head = rule(css, '.kairos-dialog-head');
  assert.ok(head, 'kairos-dialog-head exists');
  assert.match(head, /display:\s*grid/);
  assert.match(head, /grid-template-columns:\s*minmax\(0, 1fr\) auto/);
  const dialog = react('Dialog.tsx');
  assert.match(dialog, /className="kairos-dialog-head"/);
  assert.doesNotMatch(dialog, /className="kairos-split/, 'a wrapping split is what dropped the close');
});

test('G3: a unit shares its amount\'s box', () => {
  const affix = rule(css, '.kairos-affix');
  assert.ok(affix, 'kairos-affix exists');
  assert.match(affix, /grid-template-columns:\s*minmax\(0, 1fr\) auto/);
  const field = react('Field.tsx');
  assert.match(field, /suffix\?: ReactNode/);
  assert.match(field, /className="kairos-affix"/);
});

test('G5: a wizard step keeps its label on one line', () => {
  const step = rule(css, '.kairos-wizard-step');
  assert.ok(step);
  assert.match(step, /white-space:\s*nowrap/);
  assert.match(step, /flex:\s*0 0 auto/);
});

test('G5: Steps folds every count it can be given', () => {
  for (const count of [2, 3, 4, 5, 6, 7]) {
    assert.match(
      css,
      new RegExp(`\\.kairos-steps\\[data-count='${count}'\\] \\.kairos-steps-item:not\\(\\[data-current\\]\\) \\.kairos-step-label`),
      `a row of ${count} steps folds its names`
    );
  }
  assert.match(rule(css, '.kairos-step'), /white-space:\s*nowrap/);
  assert.match(react('Steps.tsx'), /data-count=\{steps\.length\}/);
});

test('G4: help has one place in a page header and one in a panel', () => {
  const panel = react('Panel.tsx');
  assert.match(panel, /className="kairos-panel-heading-row"/);
  assert.match(panel, /className="kairos-page-title-row"/);
  assert.match(rule(css, '.kairos-panel-heading-row'), /grid-template-columns:\s*minmax\(0, 1fr\) auto/);
});

test('a disclosure section is a details element that remembers only a change', () => {
  const source = react('DisclosureSection.tsx');
  assert.match(source, /<details\s+className="kairos-disclosure"/);
  assert.match(source, /if \(next !== open\) setOpen\(next\)/, 'React setting open itself is not a choice');
  const remember = readFileSync(join(ROOT, 'dist', 'react', 'remember.ts'), 'utf8');
  assert.match(remember, /if \(open === defaultOpen\) window\.localStorage\.removeItem/, 'a choice equal to the default is not stored');
});

test('the sub-navigation is one row that scrolls', () => {
  const list = rule(css, '.kairos-subnav-list');
  assert.ok(list);
  assert.match(list, /flex-wrap:\s*nowrap/);
  assert.match(list, /overflow-x:\s*auto/);
  assert.match(rule(css, '.kairos-subnav-link'), /white-space:\s*nowrap/);
  assert.match(react('SubNav.tsx'), /aria-current=\{item\.current \? 'page' : undefined\}/);
});
