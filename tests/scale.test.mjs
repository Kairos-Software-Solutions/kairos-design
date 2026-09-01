/**
 * The token layer has to be load-bearing.
 *
 * Every token in `tokens.css` was written down because a value drifted between
 * the apps, and then 17 of the 29 geometry and type tokens were referenced
 * zero times by the stylesheet they were written for. `--kairos-sidebar-w:
 * 220px` and `.kairos-sidebar { width: 244px }` shipped in the same release,
 * in the same package, because nothing connected them. A token nothing reads
 * is a comment.
 *
 * These tests are what makes the difference between a design system and a
 * document about one.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const raw = readFileSync(join(ROOT, 'dist', 'kairos.css'), 'utf8');
const tokens = readFileSync(join(ROOT, 'dist', 'tokens.css'), 'utf8');

/** Comments quote the values they replaced, so they are not evidence. */
const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');
const lines = css.split('\n');

/** The literal value of a scale token, resolved one level through `var()`. */
function scale(prefix) {
  const direct = new Map();
  for (const [, name, value] of tokens.matchAll(/(--kairos-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    direct.set(name, value.trim());
  }
  const out = new Set();
  for (const [name, value] of direct) {
    if (!name.startsWith(prefix)) continue;
    const alias = value.match(/^var\((--kairos-[a-z0-9-]+)\)$/);
    out.add(alias ? direct.get(alias[1]) : value);
  }
  return out;
}

const SPACE = scale('--kairos-space-');
const SPACING_PROP = /^(padding|margin|gap|row-gap|column-gap)(-|$)|^--(stack-gap|pad|split-gap)$/;

test('every spacing value is a step on the scale', () => {
  const offenders = [];
  lines.forEach((line, index) => {
    const m = line.match(/^\s*(--[a-z-]+|[a-z-]+)\s*:\s*(.+?)(\s*!important)?;\s*$/);
    if (!m) return;
    const [, prop, value] = m;
    if (!SPACING_PROP.test(prop)) return;
    // `calc()` around a safe-area inset is a layout expression, not a step.
    if (/calc\(|env\(/.test(value)) return;
    for (const [, px] of value.matchAll(/(?<![\w(-])(\d*\.?\d+)px/g)) {
      if (px === '0') continue;
      if (!SPACE.has(`${px}px`)) offenders.push(`${index + 1}: ${prop}: ${value}`);
    }
  });
  assert.deepEqual(offenders, [], `spacing off the scale:\n${offenders.join('\n')}`);
});

test('tracking, radius, and border weight come from tokens', () => {
  const checks = [
    [/letter-spacing:\s*([\d.]+em)/g, 'letter-spacing'],
    [/border-radius:\s*(\d+px)/g, 'border-radius'],
    [/\bborder(?:-(?:top|right|bottom|left|block|inline))?:\s*(\d+px)\s/g, 'border width'],
  ];
  const offenders = [];
  for (const [pattern, label] of checks) {
    for (const [, value] of css.matchAll(pattern)) {
      offenders.push(`${label}: ${value}`);
    }
  }
  assert.deepEqual(offenders, [], `literal where a token exists:\n${offenders.join('\n')}`);
});

test('every font size is a step on the type scale', () => {
  // 33 distinct sizes shipped before this, six of them inside one pixel of
  // each other. A rank nobody can see is not a rank; it is a value a later
  // screen copies and a fourth app then rounds differently.
  const offenders = [...css.matchAll(/font-size:\s*([\d.]+(?:rem|px))\s*;/g)].map((m) => m[1]);
  assert.deepEqual(offenders, [], `font size off the scale:\n${offenders.join('\n')}`);
});

test('every shadow comes from the stamp tokens', () => {
  // The stamp is the brand's only elevation signal and it has four ranks.
  // A hand-written offset is a fifth rank nobody agreed to.
  // A focus ring is drawn with `box-shadow` too, and it is a different
  // mechanism with its own width token. This is about the stamp.
  const offenders = [...css.matchAll(/box-shadow:\s*([^;]*\d+px[^;]*);/g)]
    .map((m) => m[1])
    .filter((value) => !value.includes('focus') && !value.startsWith('inset'))
    .filter((value) => !value.includes('var(--kairos-shadow'));
  assert.deepEqual(offenders, [], `hand-written shadow:\n${offenders.join('\n')}`);
});

test('no literal duration or easing', () => {
  const ms = [...css.matchAll(/\b\d+ms\b/g)].map((m) => m[0]);
  const ease = [...css.matchAll(/\bease(-in|-out|-in-out)?\b(?!\))/g)].map((m) => m[0]);
  assert.deepEqual([...ms, ...ease], [], 'motion belongs to --kairos-duration and --kairos-ease');
});

test('every geometry and type token is read by the stylesheet', () => {
  // A token nothing reads cannot enforce anything, and the four apps had
  // already drifted on every one of these before they were written down.
  // Geometry, type, and motion only. A colour token is legitimately read by an
  // app rather than by this stylesheet, so an unread one is not evidence of
  // anything; an unread control height is.
  const declared = [...tokens.matchAll(/(--kairos-(?:space|pad|gap|radius|border-w|track|duration|ease|row-h|nav-row-h|control-h|table-header-h|page-header-h|sidebar-w|panel-pad|section-pad|page-pad|screen-pad)[a-z0-9-]*)\s*:/g)]
    .map((m) => m[1]);
  const unread = [...new Set(declared)].filter((name) => {
    const used = new RegExp(`var\\(${name}[,)]`).test(css);
    const aliased = new RegExp(`var\\(${name}[,)]`).test(tokens);
    return !used && !aliased;
  });
  assert.deepEqual(unread, [], `declared and never read:\n${unread.join('\n')}`);
});

test('a table panel is always a panel', () => {
  // `.kairos-table-panel` paints nothing on its own: no border, no ground, no
  // radius, no stamp. It is a modifier on `.kairos-panel`, and the release
  // where `DataTable` emitted it alone is the release where every table in
  // every Kairos app lost its container.
  const react = readFileSync(join(ROOT, 'dist', 'react', 'DataTable.tsx'), 'utf8');
  const classNames = [...react.matchAll(/className="([^"]*kairos-table-panel[^"]*)"/g)].map((m) => m[1]);
  assert.ok(classNames.length > 0, 'DataTable should render a table panel');
  for (const value of classNames) {
    assert.match(value, /\bkairos-panel\b/, `"${value}" is a table panel with no panel`);
  }
});

test('a heading class sets its own family', () => {
  // Every one of these documents itself as Epilogue, and for as long as the
  // only rule dropping Bebas was scoped to `.kairos-app-shell`, all of them
  // rendered as uppercase condensed display type in a dialog, on a sign-in
  // page, and on any surface outside the shell.
  const HEADINGS = [
    'kairos-panel-heading',
    'kairos-panel-subheading',
    'kairos-section-title',
    'kairos-record-row-title',
    'kairos-tile-heading',
    'kairos-dialog-title',
  ];
  const rank = css.match(/([^}]*\.kairos-dialog-title[^{]*)\{([^}]*font-family[^}]*)\}/);
  assert.ok(rank, 'the Product Scale heading rank should exist');
  for (const name of HEADINGS) {
    assert.ok(rank[1].includes(name), `${name} is not in the heading rank, so it inherits Bebas`);
  }
});

test('the shell heading default carries no specificity', () => {
  // As `.kairos-app-shell :is(h2…)` this scored (0,1,1) and outranked every
  // named heading class at (0,1,0), so `.kairos-panel-heading` set a font size
  // it never got. A default has to lose to the thing it is a default for.
  assert.match(css, /:where\(\.kairos-app-shell\)\s*:where\(h2/);
  assert.doesNotMatch(css, /\.kairos-app-shell\s+:is\(h2/);
});
