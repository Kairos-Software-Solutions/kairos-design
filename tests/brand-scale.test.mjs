/**
 * The Brand Scale: one opt-in stylesheet and one root attribute.
 *
 * `brand.css` moves the existing parts to the geometry, type and motion of
 * Kairos design brief v3 (lock revision 3), and only where the root element carries
 * `data-scale="brand"`. An app that imports it and never sets the attribute
 * gets nothing from it, and an app that never imports it is the Product Scale
 * `tests/product-scale.test.mjs` pins.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, resolve, splitTop, stripComments, tokenMaps } from './helpers/css.mjs';

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');
const brand = read('dist', 'brand.css');
const tokens = read('dist', 'tokens.css');
const kairos = read('dist', 'kairos.css');
const fixture = read('tests', 'fixtures', 'kairos-design-0.14.0', 'tokens.css');

const SWITCH = ":root[data-scale='brand']";
const BRAND = parse(brand);
const PRODUCT = tokenMaps(tokens);

/** The light Product Scale map with the Brand Scale rule applied over it. */
function brandMap() {
  const map = new Map(PRODUCT.light);
  for (const d of BRAND) map.set(d.prop, d.value);
  return map;
}

/**
 * `design.md` › Brand Scale, as each token resolves at the Brand Scale (light).
 * A row's knobs and the tokens it moves, all of them.
 */
const SOFT_CARD = '0 14px 30px -20px rgba(71, 55, 40, 0.32)';
const NONE = '0 0 0 0 transparent';
const PRESS = '4px 4px 0 0 #16110b';
const EPILOGUE = "'Epilogue', ui-sans-serif, system-ui, sans-serif";
const TABLE = {
  '--kairos-display': EPILOGUE,
  '--kairos-body': EPILOGUE,
  '--kairos-radius-button': '3px',
  '--kairos-radius-input': '3px',
  '--kairos-radius-panel': '2px',
  '--kairos-control-h': '50px',
  '--kairos-control-h-sm': '44px',
  '--kairos-button-pad-x': '26px',
  '--kairos-button-pad-x-sm': '18px',
  '--kairos-text-button': '16px',
  '--kairos-text-button-sm': '16px',
  '--kairos-button-weight': '700',
  '--kairos-button-case': 'none',
  '--kairos-track-button': '0.005em',
  '--kairos-button-shadow-rest': NONE,
  '--kairos-button-shadow-hover': PRESS,
  '--kairos-button-shadow-active': NONE,
  '--kairos-button-secondary-hover-bg': '#e3eedc',
  '--kairos-button-secondary-hover-shadow': PRESS,
  '--kairos-button-press-transform': 'scale(0.98)',
  '--kairos-control-duration': '160ms',
  '--kairos-shadow': SOFT_CARD,
  '--kairos-shadow-card': SOFT_CARD,
  '--kairos-shadow-lg': SOFT_CARD,
  '--kairos-shadow-pressed': NONE,
  '--kairos-input-h': '52px',
  '--kairos-input-h-multi': '120px',
  '--kairos-text-input': '18px',
  '--kairos-input-weight': '500',
  '--kairos-input-pad-y': '10px',
  '--kairos-input-pad-x': '14px',
  '--kairos-input-pad-y-multi': '10px',
  '--kairos-field-message-size': '15px',
  '--kairos-field-message-leading': '1.6',
  '--kairos-input-border-color': '#79624a',
  '--kairos-input-focus-bg': '#e3eedc',
  '--kairos-input-label-size': '15px',
  '--kairos-input-label-case': 'none',
  '--kairos-input-label-track': '0',
  '--kairos-input-label-color': '#16110b',
  '--kairos-required-display': 'inline',
  '--kairos-error-badge-display': 'inline-flex',
  '--kairos-field-error-color': '#b3261e',
  '--kairos-focus-outline-w': '3px',
  '--kairos-focus-offset': '3px',
  '--kairos-focus-w': '0px',
  '--kairos-text-body': '17px',
  '--kairos-text-body-lh': '1.6',
  '--kairos-duration-fast': '160ms',
  '--kairos-duration': '260ms',
  '--kairos-duration-enter': '560ms',
  '--kairos-ease': 'cubic-bezier(0.2, 0.75, 0.25, 1)',
};
/** The brief's type scale (lock revision 3): size, weight, line height, tracking. */
const RANKS = {
  display: ['clamp(31px, 3.8vw, 50px)', '800', '1.06', '-0.02em'],
  title: ['clamp(35px, 4.6vw, 63px)', '800', '1.06', '-0.02em'],
  h2: ['clamp(26px, 2.7vw, 37px)', '800', '1.08', '-0.015em'],
  h3: ['clamp(19px, 1.8vw, 24px)', '800', '1.15', '0'],
  quote: ['clamp(21px, 2vw, 27px)', '700', '1.3', '0'],
  lead: ['clamp(18px, 1.55vw, 20px)', '400', '1.55', '0'],
  statement: ['clamp(19px, 1.7vw, 22px)', '600', '1.4', '0'],
  body: ['17px', '400', '1.6', '0'],
  small: ['15px', '400', '1.6', '0'],
  legal: ['14px', '400', '1.6', '0'],
  label: ['15px', '700', '1.6', '0'],
  price: ['21px', '700', '1.6', '0'],
  button: ['16px', '700', '1.6', '0.005em'],
  nav: ['16px', '600', '1.6', '0'],
};
for (const [rank, [size, weight, leading, tracking]] of Object.entries(RANKS)) {
  Object.assign(TABLE, {
    [`--kairos-type-${rank}-size`]: size,
    [`--kairos-type-${rank}-weight`]: weight,
    [`--kairos-type-${rank}-leading`]: leading,
    [`--kairos-type-${rank}-tracking`]: tracking,
  });
}
TABLE['--kairos-type-display-phone-size'] = 'clamp(31px, 3.8vw, 50px)';

test('brand.css applies only under data-scale=brand on the root', () => {
  const css = stripComments(brand);
  assert.equal((css.match(/\{/g) ?? []).length, 1, 'exactly one rule');
  assert.doesNotMatch(css, /@/, 'no at-rule');
  assert.ok(BRAND.length > 0, 'the rule declares something');
  for (const d of BRAND) {
    assert.equal(d.selector, SWITCH, `${d.prop} sits under the switch`);
    assert.deepEqual(d.context, [], `${d.prop} is inside no at-rule`);
  }
});

test('brand.css declares only custom properties', () => {
  const offenders = BRAND.filter((d) => !d.prop.startsWith('--kairos-')).map((d) => d.prop);
  assert.deepEqual(offenders, []);
});

test('brand.css holds no colour value', () => {
  const css = stripComments(brand);
  for (const pattern of [/#[0-9a-f]{3,8}\b/i, /\brgba?\(/i, /\bhsla?\(/i, /\boklch\(/i, /\bcolor-mix\(/i, /@font-face/i, /\burl\(/i]) {
    assert.doesNotMatch(css, pattern);
  }
});

test('every token brand.css sets has a Product Scale default in tokens.css', () => {
  const productDefaults = new Set(
    parse(tokens).filter((d) => d.selector.split(', ').includes(':root') && d.context.length === 0).map((d) => d.prop),
  );
  const missing = BRAND.filter((d) => !productDefaults.has(d.prop)).map((d) => d.prop);
  assert.deepEqual(missing, [], 'set here with no default an app gets without the switch');

  const declared = new Set([...parse(tokens), ...BRAND].map((d) => d.prop));
  const reads = [...stripComments(brand).matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]);
  assert.deepEqual(reads.filter((name) => !declared.has(name)), [], 'read here and declared nowhere');
  assert.ok(!BRAND.some((d) => d.prop === '--kairos-duration-none'));
});

test("brand.css carries the brief's geometry, type and motion", () => {
  const map = brandMap();
  const set = BRAND.map((d) => d.prop);
  assert.deepEqual([...new Set(set)].sort(), Object.keys(TABLE).sort(), 'brand.css sets exactly the table');
  assert.equal(new Set(set).size, set.length, 'each once');
  const wrong = Object.entries(TABLE)
    .filter(([name, expected]) => resolve(`var(${name})`, map) !== expected)
    .map(([name, expected]) => `${name} is ${resolve(`var(${name})`, map)}, the table says ${expected}`);
  assert.deepEqual(wrong, []);
});

test('brand.css leaves reduced motion at 1ms', () => {
  assert.ok(!BRAND.some((d) => d.prop === '--kairos-duration-none'), 'brand.css does not set it');
  assert.equal(resolve('var(--kairos-duration-none)', brandMap()), '1ms');

  const reduced = parse(kairos).filter((d) => d.context.join() === '@media (prefers-reduced-motion: reduce)');
  const selectors = new Set(reduced.flatMap((d) => d.selector.split(', ')));
  for (const s of ["[class*='kairos-']", "[class*='kairos-']::before", "[class*='kairos-']::after"]) {
    assert.ok(selectors.has(s), `the reduced-motion block covers ${s}`);
  }
  const by = Object.fromEntries(reduced.map((d) => [d.prop, d]));
  for (const prop of ['animation-duration', 'transition-duration']) {
    assert.equal(by[prop]?.value, 'var(--kairos-duration-none)', `${prop} collapses to the token`);
    assert.ok(by[prop].important, `${prop} wins over any part`);
  }
  assert.equal(by['animation-iteration-count']?.value, '1');
});

test('every type rank has a Product Scale size from the 0.14 type scale', () => {
  const old = tokenMaps(fixture).light;
  const steps = new Set(
    [...old.keys()].filter((name) => /^--kairos-text-/.test(name)).map((name) => resolve(`var(${name})`, old)),
  );
  assert.ok(steps.has('24px'), 'the 24px title is a 0.14 step');
  const sizes = [...PRODUCT.light.keys()].filter((name) => /^--kairos-type-[a-z0-9-]+-size$/.test(name));
  assert.ok(sizes.length >= Object.keys(RANKS).length, 'every rank has a size');
  const off = sizes
    .map((name) => [name, resolve(`var(${name})`, PRODUCT.light)])
    .filter(([, value]) => !steps.has(value))
    .map(([name, value]) => `${name} is ${value}`);
  assert.deepEqual(off, []);
});

test('no width token is declared', () => {
  for (const [name, source] of [['tokens.css', tokens], ['brand.css', brand]]) {
    const offenders = parse(source).filter((d) => /-stretch$/.test(d.prop)).map((d) => d.prop);
    assert.deepEqual(offenders, [], `${name} declares no width token`);
  }
  assert.doesNotMatch(stripComments(brand), /stretch/i, 'brand.css holds no stretch');
});

test("kairos.css sets font-stretch only in the apps' type block", () => {
  const stretch = parse(kairos).filter((d) => d.prop === 'font-stretch');
  const prefix = ":root:not([data-scale='brand'])";
  const outside = stretch.filter((d) => !splitTop(d.selector, ',').every((part) => part.trim().startsWith(prefix)));
  assert.deepEqual(
    outside.map((d) => d.selector),
    [],
    'every font-stretch rule begins :root:not([data-scale=brand])',
  );
});
