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
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const raw = readFileSync(join(ROOT, 'dist', 'kairos.css'), 'utf8');
const tokens = readFileSync(join(ROOT, 'dist', 'tokens.css'), 'utf8');

/** Comments quote the values they replaced, so they are not evidence. */
const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Everything in the package that can read a token: both stylesheets and every
 * React module. Comments are stripped from kairos.css above because they quote
 * the values they replaced; tokens.css keeps its own, since a token read only
 * by another token inside that file is genuinely read.
 */
const surfaces = [
  css,
  readFileSync(join(ROOT, 'dist', 'base.css'), 'utf8'),
  ...readdirSync(join(ROOT, 'dist', 'react'))
    .filter((name) => /\.tsx?$/.test(name))
    .map((name) => readFileSync(join(ROOT, 'dist', 'react', name), 'utf8')),
].join('\n');

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

/**
 * Every declaration in the stylesheet, as `{ prop, value, line }`.
 *
 * This used to be a pass over the file's lines, matching a declaration against the
 * whole line, which meant a rule written as `.kairos-x { padding: 13px; }` was
 * invisible to every check built on it — the line holds a selector and a brace
 * as well as the declaration, so it never matched. That is a hole in a
 * guardrail rather than a live failure, because the stylesheet is formatted one
 * declaration per line throughout. It stops being formatted that way the first
 * time somebody adds a one-line rule, and the check would go quiet without
 * going red.
 *
 * A declaration starts at the beginning of a line, after a `;`, or after the
 * `{` that opens its block, and ends at the next `;` or `}`. The trailing
 * semicolon is optional, because the last declaration in a block may omit it
 * and CSS is still valid. Comments are already stripped from `css`.
 *
 * Selectors do not match: in `a:hover {` the character after `hover` is `{`,
 * which is not an end-of-declaration, and in `@media (min-width: 900px) {`
 * nothing opens a declaration before `min-width`.
 */
function declarations() {
  const out = [];
  const pattern = /(?:^|[;{])\s*(--[a-z0-9-]+|[a-z-]+)\s*:\s*([^;{}]*?)(\s*!important)?\s*(?=[;}])/gm;
  for (const match of css.matchAll(pattern)) {
    const [, prop, value] = match;
    out.push({
      prop,
      value: value.trim(),
      line: css.slice(0, match.index).split('\n').length,
    });
  }
  return out;
}

const DECLARATIONS = declarations();

test('the declaration scan sees a rule written on one line', () => {
  // The scan is what every check below is built on, so its blind spot is
  // theirs. This is the shape that used to escape: a whole rule on one line.
  const found = [
    ...'.probe { padding: 13px; }'.matchAll(
      /(?:^|[;{])\s*(--[a-z0-9-]+|[a-z-]+)\s*:\s*([^;{}]*?)(\s*!important)?\s*(?=[;}])/gm,
    ),
  ].map((m) => [m[1], m[2].trim()]);
  assert.deepEqual(found, [['padding', '13px']]);
});

test('every spacing value is a step on the scale', () => {
  const offenders = [];
  for (const { prop, value, line } of DECLARATIONS) {
    if (!SPACING_PROP.test(prop)) continue;
    // `calc()` around a safe-area inset is a layout expression, not a step.
    if (/calc\(|env\(/.test(value)) continue;
    for (const [, px] of value.matchAll(/(?<![\w(-])(\d*\.?\d+)px/g)) {
      if (px === '0') continue;
      if (!SPACE.has(`${px}px`)) offenders.push(`${line}: ${prop}: ${value}`);
    }
  }
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
  const offenders = DECLARATIONS.filter(
    (d) => d.prop === 'font-size' && /^[\d.]+(rem|px)$/.test(d.value),
  ).map((d) => `${d.line}: ${d.value}`);
  assert.deepEqual(offenders, [], `font size off the scale:\n${offenders.join('\n')}`);
});

test('every shadow comes from the stamp tokens', () => {
  // The stamp is the brand's only elevation signal and it has four ranks.
  // A hand-written offset is a fifth rank nobody agreed to.
  // A focus ring is drawn with `box-shadow` too, and it is a different
  // mechanism with its own width token. This is about the stamp.
  const offenders = DECLARATIONS.filter((d) => d.prop === 'box-shadow')
    .map((d) => d.value)
    .filter((value) => /\d+px/.test(value))
    .filter((value) => !value.includes('focus') && !value.startsWith('inset'))
    .filter((value) => !value.includes('var(--kairos-shadow'));
  assert.deepEqual(offenders, [], `hand-written shadow:\n${offenders.join('\n')}`);
});

test('no literal duration or easing', () => {
  const ms = [...css.matchAll(/\b\d+ms\b/g)].map((m) => m[0]);
  const ease = [...css.matchAll(/\bease(-in|-out|-in-out)?\b(?!\))/g)].map((m) => m[0]);
  assert.deepEqual([...ms, ...ease], [], 'motion belongs to --kairos-duration and --kairos-ease');
});

test('every token is read by something', () => {
  // The docblock at the top of this file describes a token nothing reads, and
  // for a while the only test of it was this one, narrowed to geometry, type
  // and motion because "a colour token is legitimately read by an app rather
  // than by this stylesheet". That exemption was doing the work of a missing
  // search surface, not of a real difference: once base.css and the React
  // modules are read too, a colour token nothing in the package touches is as
  // dead as an unread control height. Six were, and one of them named a zebra
  // stripe that had never been drawn.
  //
  // A consuming app may still be the only reader of a token, and that is
  // fine — the token has to be read HERE by whatever demonstrates it. If the
  // package cannot show its own token in use, the token is a document.
  const declared = [...new Set([...tokens.matchAll(/(--kairos-[a-z0-9-]+)\s*:/g)].map((m) => m[1]))];
  const unread = declared.filter((name) => {
    const reference = new RegExp(`var\\(${name}[,)]`);
    // `--kairos-shadow-color` is read by the four stamp tokens inside
    // tokens.css itself, which is a real reader; so is any role token
    // aliasing a scale step.
    return !reference.test(surfaces) && !reference.test(tokens);
  });
  assert.deepEqual(unread, [], `declared and never read:\n${unread.join('\n')}`);
});

test('a table panel is always a panel', () => {
  // `.kairos-table-panel` paints nothing on its own: no border, no ground, no
  // radius, no stamp. It is a modifier on `.kairos-panel`, and the release
  // where `DataTable` emitted it alone is the release where every table in
  // every Kairos app lost its container.
  // Every surface that writes the class, not only the component. The preview is
  // what the two surfaces with no bundler copy from, and it carried a table
  // panel with no panel of its own while this test watched `DataTable` alone.
  const sources = [
    ['DataTable.tsx', readFileSync(join(ROOT, 'dist', 'react', 'DataTable.tsx'), 'utf8'), /className="([^"]*kairos-table-panel[^"]*)"/g],
    ['preview.html', readFileSync(join(ROOT, 'docs', 'preview.html'), 'utf8'), /class="([^"]*kairos-table-panel[^"]*)"/g],
  ];

  for (const [name, source, pattern] of sources) {
    const classNames = [...source.matchAll(pattern)].map((m) => m[1]);
    assert.ok(classNames.length > 0, `${name} should render a table panel`);
    for (const value of classNames) {
      assert.match(value, /\bkairos-panel\b/, `${name}: "${value}" is a table panel with no panel`);
    }
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
