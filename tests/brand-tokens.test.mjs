/**
 * The brand's colours, role names and fonts in the token layer.
 *
 * Kairos design brief v1 (approved 17 November 2026) names the roles; this
 * file pins that the tokens carry its approved hex, that every 0.14 name still
 * resolves where an app reads it, and that the new roles have a dark value
 * borrowed from the palette dark already had.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, resolve, stripComments, tokenMaps } from './helpers/css.mjs';

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');
const tokens = read('dist', 'tokens.css');
const fixture = read('tests', 'fixtures', 'kairos-design-0.14.0', 'tokens.css');

const MAPS = tokenMaps(tokens);
const OLD = tokenMaps(fixture);
const value = (theme, name) => resolve(`var(${name})`, MAPS[theme]);

/** The brief's light roles and their approved hex. */
const BRIEF_LIGHT = {
  '--kairos-page': '#fff8eb',
  '--kairos-card': '#ffffff',
  '--kairos-band': '#f1f6ec',
  '--kairos-tint': '#e3eedc',
  '--kairos-picked': '#fff0c4',
  '--kairos-ink': '#16110b',
  '--kairos-ink-2': '#473728',
  '--kairos-ink-3': '#79624a',
  '--kairos-highlight': '#ffc247',
  '--kairos-highlight-strong': '#ffb627',
  '--kairos-tick': '#3d6f57',
  '--kairos-placeholder': '#b93d10',
  '--kairos-error': '#b3261e',
  '--kairos-on-error': '#ffffff',
};

/** 0.14 name → the brief's name it now aliases. */
const RENAMED = {
  '--kairos-bg': '--kairos-page',
  '--kairos-surface': '--kairos-card',
  '--kairos-text': '--kairos-ink',
  '--kairos-text-2': '--kairos-ink-2',
  '--kairos-text-muted': '--kairos-ink-3',
  '--kairos-accent': '--kairos-highlight',
  '--kairos-accent-hover': '--kairos-highlight-strong',
  '--kairos-accent-text': '--kairos-on-highlight',
  '--kairos-focus': '--kairos-focus-ring',
};

/** The colour roles this release adds, solid and translucent. */
const NEW_SOLID = ['--kairos-band', '--kairos-tint', '--kairos-picked', '--kairos-tick', '--kairos-placeholder', '--kairos-error', '--kairos-on-error'];
const NEW_TRANSLUCENT = ['--kairos-rule', '--kairos-rule-frame', '--kairos-shadow-soft-color'];
const TRANSLUCENT = new Set([...NEW_TRANSLUCENT, '--kairos-overlay']);

/** Every custom property of tokens.css outside a width query: light, alias, dark and the shared block. */
const THEMED = parse(tokens).filter(
  (d) => d.prop.startsWith('--') && (d.context.length === 0 || d.context.join() === '@media not print'),
);

/** Colour syntax, and the named colours a hand might write. */
const isColour = (v) =>
  /^(#|rgba?\(|hsla?\(|hwb\(|lab\(|lch\(|oklch\(|oklab\(|color-mix\(|color\()/i.test(v) ||
  /^(white|black|red|green|blue|gray|grey|currentcolor)$/i.test(v);

test("the brief's light colours are the token values", () => {
  const wrong = Object.entries(BRIEF_LIGHT)
    .filter(([name, hex]) => value('light', name) !== hex)
    .map(([name, hex]) => `${name} is ${value('light', name)}, the brief says ${hex}`);
  assert.deepEqual(wrong, []);
});

test('every solid colour token is plain hex', () => {
  const offenders = [];
  for (const theme of ['light', 'dark']) {
    for (const name of MAPS[theme].keys()) {
      const v = value(theme, name);
      if (!isColour(v)) continue;
      if (TRANSLUCENT.has(name)) {
        if (!/^rgba\(/.test(v)) offenders.push(`${theme}: ${name} should be rgba(), is ${v}`);
      } else if (!/^#[0-9a-f]{6}$/i.test(v)) {
        offenders.push(`${theme}: ${name} is ${v}`);
      }
    }
  }
  // Each declaration as written, too: a colour token is a hex, an rgba() or a var().
  for (const d of THEMED) {
    if (!isColour(d.value)) continue;
    if (!/^#[0-9a-f]{6}$/i.test(d.value) && !(TRANSLUCENT.has(d.prop) && /^rgba\(/.test(d.value))) {
      offenders.push(`${d.selector} ${d.prop}: ${d.value}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test('every 0.14 token name still resolves, to its 0.14 value unless listed', () => {
  const LISTED = {
    light: { '--kairos-accent-hover': ['#e6a92d', '#ffb627'] },
    both: ['--kairos-display', '--kairos-body', '--kairos-mono'],
  };
  const failures = [];
  for (const theme of ['light', 'dark']) {
    for (const name of OLD[theme].keys()) {
      if (!MAPS[theme].has(name)) {
        failures.push(`${theme}: ${name} is not declared`);
        continue;
      }
      if (LISTED.both.includes(name)) continue;
      const before = resolve(`var(${name})`, OLD[theme]);
      const after = value(theme, name);
      const change = LISTED[theme]?.[name];
      if (change) {
        assert.deepEqual([before, after], change, `${name} moves as listed`);
        continue;
      }
      if (before !== after) failures.push(`${theme}: ${name} was ${before}, is ${after}`);
    }
  }
  assert.deepEqual(failures, []);
});

test('a renamed role keeps its old name as an alias', () => {
  const alias = parse(tokens).filter((d) => d.selector === ':root, [data-theme]');
  for (const [old, now] of Object.entries(RENAMED)) {
    const d = alias.find((x) => x.prop === old);
    assert.ok(d, `${old} is declared in the alias block`);
    assert.equal(d.value, `var(${now})`, `${old} aliases ${now}`);
    // And nowhere else: a second declaration would stop it following the role.
    const elsewhere = parse(tokens).filter((x) => x.prop === old && x.selector !== ':root, [data-theme]');
    assert.deepEqual(elsewhere.map((x) => x.selector), [], `${old} is only an alias`);
  }
});

test('old names re-resolve wherever a theme is set', () => {
  const css = stripComments(tokens);
  const lightAt = css.indexOf(':root {');
  const aliasAt = css.search(/:root,\s*\[data-theme\]\s*\{/);
  const darkAt = css.search(/\[data-theme='dark'\]/);
  assert.ok(lightAt >= 0 && aliasAt > lightAt, 'the alias block follows the light block');
  assert.ok(darkAt > aliasAt, 'and comes before the dark block');
  // Its selector matches the root and any element carrying a theme.
  const alias = parse(tokens).filter((d) => d.prop === '--kairos-bg');
  assert.deepEqual(alias.map((d) => d.selector), [':root, [data-theme]']);
  assert.deepEqual(alias.map((d) => d.context), [[]], 'outside every at-rule');
});

test('the new colour roles take interim dark values from the 0.14 dark palette', () => {
  const darkAt = tokens.search(/\[data-theme='dark'\]/);
  const darkBlock = tokens.slice(darkAt);
  const oldDark = parse(fixture).filter((d) => d.selector === "[data-theme='dark']").map((d) => d.value.toLowerCase());
  const failures = [];
  for (const name of [...NEW_SOLID, ...NEW_TRANSLUCENT]) {
    const line = darkBlock.split('\n').find((l) => new RegExp(`^\\s*${name}\\s*:`).test(l));
    if (!line) {
      failures.push(`${name} has no dark value`);
      continue;
    }
    if (!/interim/.test(line)) failures.push(`${name}'s dark value is not marked interim`);
    const v = line.match(/:\s*([^;]+);/)[1].trim().toLowerCase();
    if (NEW_SOLID.includes(name) && !oldDark.includes(v)) failures.push(`${name} dark ${v} is not in the 0.14 dark palette`);
    if (NEW_TRANSLUCENT.includes(name) && !/^rgba\(/.test(v)) failures.push(`${name} dark ${v} is not translucent`);
  }
  assert.deepEqual(failures, []);
});

test('the font tokens name Archivo and Courier Prime', () => {
  for (const theme of ['light', 'dark']) {
    for (const name of ['--kairos-body', '--kairos-display']) {
      assert.match(value(theme, name), /^'Archivo', \S/, `${name} begins with Archivo and falls back`);
    }
    assert.match(value(theme, '--kairos-mono'), /^'Courier Prime', \S/, 'mono begins with Courier Prime and falls back');
  }
  assert.equal(value('light', '--kairos-body'), "'Archivo', ui-sans-serif, system-ui, sans-serif");
  assert.equal(value('light', '--kairos-mono'), "'Courier Prime', 'Courier New', ui-monospace, monospace");
});

test('the decorative rule is never a control edge', () => {
  // A control boundary owes 3:1 and `--kairos-rule` is an 18% hairline, so
  // a control drawn with it has no findable edge at rest. These are the
  // classes that draw a control's own boundary: the element a person presses,
  // types in or picks from, or the box that stands for it.
  const CONTROLS = [
    'kairos-button',
    'kairos-input-field',
    'kairos-select',
    'kairos-segmented-option',
    'kairos-overflow-trigger',
    'kairos-tick-box',
    'kairos-tick-box-label',
    'kairos-day-grid',
    'kairos-time-switch',
    'kairos-time-switch-pill',
    'kairos-site-menu-toggle',
  ];
  const kairos = parse(read('dist', 'kairos.css'));
  /** The classes on the element a selector part lands on: its last compound. */
  const subject = (part) => {
    const last = part.split(/\s+[>+~]\s+|\s+/).pop();
    return [...last.replace(/:not\([^)]*\)/g, '').matchAll(/\.(kairos-[a-z0-9-]+)/g)].map((m) => m[1]);
  };
  const offenders = kairos
    .filter((d) => /^(border|outline)/.test(d.prop))
    .filter((d) => d.selector.split(', ').some((part) => subject(part).some((cls) => CONTROLS.includes(cls))))
    .filter((d) => /var\(--kairos-rule(-frame)?\)/.test(d.value))
    .map((d) => `${d.selector} { ${d.prop}: ${d.value} }`);
  assert.deepEqual(offenders, []);
  // And the scan reaches the new controls at all.
  const edges = kairos.filter((d) => d.prop === 'border' && ['.kairos-day-grid', '.kairos-time-switch'].includes(d.selector));
  assert.equal(edges.length, 2, 'the day grid and time switch edges were read');
  assert.ok(edges.every((d) => /var\(--kairos-control-edge\)/.test(d.value)));
});

test('the Colour page groups every light colour token', () => {
  // The block `stories/tokens.ts` reads: the first `:root {` up to its closing
  // brace at the start of a line.
  const start = tokens.indexOf(':root {');
  const open = tokens.indexOf('{', start);
  const block = stripComments(tokens.slice(open + 1, tokens.indexOf('\n}', open)));
  const names = [...block.matchAll(/(--kairos-[a-z0-9-]+)\s*:/g)].map((m) => m[1]);
  assert.ok(names.includes('--kairos-page') && names.includes('--kairos-tick'), 'the first :root block is the light block');

  const page = read('stories', 'foundations', 'Colour.stories.tsx');
  const stems = [...page.matchAll(/group\(themed,([^)]*)\)/g)].flatMap((m) =>
    [...m[1].matchAll(/'([^']+)'/g)].map((s) => s[1])
  );
  assert.ok(stems.length > 0, 'the Colour page groups by stem');

  const missing = names.filter((name) => !name.startsWith('--kairos-shadow') && !stems.some((stem) => name.startsWith(stem)));
  assert.deepEqual(missing, [], 'every light colour token has a swatch group on the Colour page');
});
