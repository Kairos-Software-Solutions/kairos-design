/**
 * The shared parts of Kairos design brief v3, as package classes.
 *
 * The brief's Component vocabulary marks each part shared or site. The shared
 * ones are class blocks here; the site ones must never reach the package,
 * because an app that installs this gets every byte of it.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, resolve, stripComments, tokenMaps } from './helpers/css.mjs';

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');
const kairos = read('dist', 'kairos.css');
const tokens = read('dist', 'tokens.css');
const brand = read('dist', 'brand.css');
const RULES = parse(kairos);
const defined = new Set([...stripComments(kairos).matchAll(/\.(kairos-[a-z0-9-]+)/g)].map((m) => m[1]));

/** Every part the brief marks shared that 0.14 did not have, by its class block. */
const SHARED = [
  'kairos-text-link',
  'kairos-menu-link',
  'kairos-lang-link',
  'kairos-required',
  'kairos-error-line',
  'kairos-tick-box',
  'kairos-day-grid',
  'kairos-time-switch',
  'kairos-card--soft',
  'kairos-inset-band',
  'kairos-section-band',
  'kairos-tint-card',
  'kairos-tick-list',
  'kairos-step-line',
  'kairos-site-header',
  'kairos-site-menu',
  'kairos-site-footer',
  'kairos-placeholder',
  'kairos-photo-slot',
  'kairos-marker',
  'kairos-title-bar',
  ...['display', 'title', 'h2', 'h3', 'quote', 'lead', 'statement', 'body', 'small', 'legal', 'label', 'price', 'button', 'nav'].map(
    (rank) => `kairos-type-${rank}`,
  ),
  // 0.18.0: the form page title, card headings and the time line.
  'kairos-type-title--compact',
  'kairos-type-card',
  'kairos-type-card--sm',
  'kairos-type-time',
  'kairos-wrap',
];

test('every shared part from the brief has its class', () => {
  // A rule of its own: the class is the whole subject, or the subject with a
  // pseudo-element (`.kairos-title-bar::after` is the bar).
  const own = (cls) => new RegExp(`^\\.${cls}(::?[a-z-]+)?$`);
  const missing = SHARED.filter((cls) => !RULES.some((d) => d.selector.split(', ').some((s) => own(cls).test(s))));
  assert.deepEqual(missing, [], 'these have no rule of their own in kairos.css');
});

test('a time switch pill has a position for every option count it allows', () => {
  const declared = (prop, value, pattern) =>
    RULES.some((d) => d.prop === prop && d.value === value && pattern.test(d.selector));
  const missing = [];
  for (let k = 1; k <= 5; k += 1) {
    const at = new RegExp(`^\\.kairos-time-switch:has\\(> \\.kairos-time-switch-option:nth-of-type\\(${k}\\) \\.kairos-time-switch-input:checked\\)$`);
    if (!declared('--time-switch-at', String(k - 1), at)) missing.push(`no pill position for option ${k}`);
  }
  for (let n = 2; n <= 5; n += 1) {
    const count = new RegExp(`^\\.kairos-time-switch:has\\(> \\.kairos-time-switch-option:nth-of-type\\(${n}\\):last-of-type\\)$`);
    if (!declared('--time-switch-count', String(n), count)) missing.push(`no width for ${n} options`);
  }
  assert.deepEqual(missing, []);

  // The pill reads both: its width from the count, its place from the position.
  const pill = RULES.filter((d) => d.selector === '.kairos-time-switch-pill');
  assert.match(pill.find((d) => d.prop === 'width')?.value ?? '', /var\(--time-switch-count\)/);
  assert.match(pill.find((d) => d.prop === 'transform')?.value ?? '', /var\(--time-switch-at\)/);
  assert.equal(pill.find((d) => d.prop === 'opacity')?.value, '0', 'hidden until the first pick');
  assert.ok(
    RULES.some((d) => d.selector === '.kairos-time-switch:has(.kairos-time-switch-input:checked) .kairos-time-switch-pill' && d.prop === 'opacity' && d.value === '1'),
    'shown once something is picked',
  );
});

test('the required mark is hidden from assistive technology', () => {
  const source = read('dist', 'react', 'Field.tsx');
  const props = source.slice(source.indexOf('export interface FieldProps'), source.indexOf('export function Field'));
  assert.match(props, /required\?: boolean;/, 'Field accepts required');

  const field = source.slice(source.indexOf('export function Field'), source.indexOf('export interface InputFieldProps'));
  const label = field.match(/<label className="kairos-input-label"[\s\S]*?<\/label>/)?.[0] ?? '';
  assert.match(
    label,
    /\{required \? <span className="kairos-required" aria-hidden="true">\*<\/span> : null\}/,
    'the mark sits inside the label, only when required, hidden from assistive technology',
  );
  assert.ok(defined.has('kairos-required'), 'and the stylesheet draws it');

  for (const [name, control] of [['InputField', 'input'], ['Textarea', 'textarea'], ['SelectField', 'select']]) {
    const start = source.indexOf(`function ${name}(`);
    const body = source.slice(start, source.indexOf('\n});', start));
    assert.match(body, /\{ label, hint, error,[^}]*\brequired\b/, `${name} takes required out of the rest props`);
    assert.match(body, /<Field [^>]*required=\{required\}/, `${name} passes required to Field`);
    assert.match(body, new RegExp(`<${control}\\s[^>]*?required=\\{required\\}`), `${name} passes required to the ${control}`);
  }
});

test('no site-only part ships', () => {
  const files = [
    ...readdirSync(join(ROOT, 'dist')).filter((f) => f.endsWith('.css')).map((f) => join('dist', f)),
    ...readdirSync(join(ROOT, 'dist', 'react')).map((f) => join('dist', 'react', f)),
  ];
  const offenders = [];
  for (const file of files) {
    const source = read(file);
    for (const [, cls] of source.matchAll(/\b(kairos-[a-z0-9-]+)/g)) {
      if (/(reel|spotlight|logo-tile|verse|founder|topic)/.test(cls)) offenders.push(`${file}: class ${cls}`);
    }
    for (const [identifier] of source.matchAll(/\b[A-Za-z_$][\w$]*(Reel|Spotlight|LogoTile|Verse|Founder|FormTopic)[\w$]*\b|\b(Reel|Spotlight|LogoTile|Verse|Founder|FormTopic)[\w$]*\b/g)) {
      offenders.push(`${file}: identifier ${identifier}`);
    }
    if (/whatsapp/i.test(source)) offenders.push(`${file}: names WhatsApp`);
    if (/business review/i.test(source)) offenders.push(`${file}: names the business review`);
  }
  assert.deepEqual(offenders, []);
});

test('the error line shakes once on a duration token', () => {
  const keyframes = new Set([...stripComments(kairos).matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));
  const targets = ['.kairos-error-line', ":root[data-scale='brand'] .kairos-field-error:not(:empty)"];
  for (const selector of targets) {
    const animation = RULES.find((d) => d.selector === selector && d.prop === 'animation');
    assert.ok(animation, `${selector} runs an animation`);
    const parts = animation.value.split(/\s+(?![^(]*\))/);
    const name = parts.find((p) => keyframes.has(p));
    assert.ok(name, `${selector}: its keyframes are defined in kairos.css`);
    assert.ok(parts.includes('var(--kairos-duration-shake)'), `${selector}: it runs for the shake token`);
    assert.ok(parts.includes('1'), `${selector}: once`);
    assert.ok(!parts.includes('infinite'), `${selector}: never a loop`);
    assert.match(selector, /\.kairos-/, 'on a kairos- class, so the reduced-motion block reaches it');
  }
  assert.equal(resolve('var(--kairos-duration-shake)', tokenMaps(tokens).light), '320ms');
});

test('reduced motion stills the error line', () => {
  const reduced = RULES.filter((d) => d.context.join() === '@media (prefers-reduced-motion: reduce)');
  const selectors = new Set(reduced.flatMap((d) => d.selector.split(', ')));

  /** Whether a reduced-motion selector reaches an element of this class, or its pseudo-element. */
  const reaches = (cls, pseudo = '') =>
    [...selectors].some((s) => {
      const match = s.match(/^\[class\*='([^']+)'\](::before|::after)?$/);
      return match && cls.includes(match[1]) && (match[2] ?? '') === pseudo;
    });

  for (const [cls, pseudo] of [
    ['kairos-error-line', ''],
    ['kairos-error-line', '::before'],
    ['kairos-field-error', ''],
    ['kairos-field-error', '::before'],
  ]) {
    assert.ok(reaches(cls, pseudo), `the reduced-motion block covers .${cls}${pseudo}`);
  }
  const duration = reduced.find((d) => d.prop === 'animation-duration');
  assert.equal(duration?.value, 'var(--kairos-duration-none)');
  assert.ok(duration.important);
  assert.equal(reduced.find((d) => d.prop === 'animation-iteration-count')?.value, '1');
  assert.equal(resolve('var(--kairos-duration-none)', tokenMaps(tokens).light), '1ms');
  assert.doesNotMatch(stripComments(brand), /--kairos-duration-none/, 'brand.css leaves it alone');
});

/** The tokens at each scale (light): the Product Scale, and the Brand Scale rule applied over it. */
const PRODUCT_MAP = tokenMaps(tokens).light;
const BRAND_MAP = new Map(PRODUCT_MAP);
for (const d of parse(brand)) BRAND_MAP.set(d.prop, d.value);
const productValue = (name) => resolve(`var(${name})`, PRODUCT_MAP);
const brandValue = (name) => resolve(`var(${name})`, BRAND_MAP);
/** The declarations of the rule whose selector is exactly this, outside any at-rule, by property. */
const rule = (selector, context = []) =>
  Object.fromEntries(RULES.filter((d) => d.selector === selector && d.context.join(' | ') === context.join(' | ')).map((d) => [d.prop, d.value]));
/** The position of a rule's first declaration in the sheet, to say one comes after another. */
const position = (selector, context = []) =>
  RULES.findIndex((d) => d.selector === selector && d.context.join(' | ') === context.join(' | '));

test('the compact title, card and time ranks read their tokens', () => {
  // Compact title: the title rank at its own size, in a rule after the title's.
  assert.equal(rule('.kairos-type-title--compact')['font-size'], 'var(--kairos-type-title-compact-size)');
  assert.deepEqual(Object.keys(rule('.kairos-type-title--compact')), ['font-size'], 'weight, leading and tracking stay the title\'s');
  assert.ok(position('.kairos-type-title--compact') > position('.kairos-type-title'), 'it comes after .kairos-type-title');
  assert.equal(brandValue('--kairos-type-title-compact-size'), 'clamp(35px, 3.8vw, 52px)');
  assert.equal(productValue('--kairos-type-title-compact-size'), productValue('--kairos-text-title'), 'the 24px title at the Product Scale');

  // Card heading: 20px/800 at 1.15, 19px small; the h3 rank's steps at the Product Scale.
  const card = rule('.kairos-type-card');
  assert.equal(card['font-family'], 'var(--kairos-display)');
  assert.equal(card.margin, '0');
  assert.equal(card['text-transform'], 'none');
  assert.equal(card['text-wrap'], 'balance');
  for (const part of ['size', 'weight', 'leading', 'tracking']) {
    const prop = { size: 'font-size', weight: 'font-weight', leading: 'line-height', tracking: 'letter-spacing' }[part];
    assert.equal(card[prop], `var(--kairos-type-card-${part})`, `.kairos-type-card ${prop} reads the card ${part}`);
  }
  assert.equal(rule('.kairos-type-card--sm')['font-size'], 'var(--kairos-type-card-sm-size)');
  assert.ok(position('.kairos-type-card--sm') > position('.kairos-type-card'), 'the small step comes after the card');
  assert.deepEqual(
    ['size', 'sm-size', 'weight', 'leading', 'tracking'].map((part) => brandValue(`--kairos-type-card-${part}`)),
    ['20px', '19px', '800', '1.15', '0'],
  );
  assert.deepEqual(
    ['size', 'sm-size', 'weight', 'leading', 'tracking'].map((part) => productValue(`--kairos-type-card-${part}`)),
    [productValue('--kairos-text-lg'), productValue('--kairos-text-lg'), '700', '1.2', '0'],
  );

  // Time line: Courier Prime 16px at 400, 1.6.
  const time = rule('.kairos-type-time');
  assert.equal(time['font-family'], 'var(--kairos-mono)');
  assert.equal(time['text-transform'], 'none');
  for (const [part, prop] of [['size', 'font-size'], ['weight', 'font-weight'], ['leading', 'line-height'], ['tracking', 'letter-spacing']]) {
    assert.equal(time[prop], `var(--kairos-type-time-${part})`, `.kairos-type-time ${prop} reads the time ${part}`);
  }
  assert.deepEqual(['size', 'weight', 'leading', 'tracking'].map((part) => brandValue(`--kairos-type-time-${part}`)), ['16px', '400', '1.6', '0']);
  assert.deepEqual(
    ['size', 'weight', 'leading', 'tracking'].map((part) => productValue(`--kairos-type-time-${part}`)),
    [productValue('--kairos-text-md'), '400', '1.5', '0'],
  );

  // Documented: the manifest names the two classes the class-block check skips (they contain `--`).
  const manifest = read('docs', 'kairos-ui.md');
  for (const cls of ['kairos-type-title--compact', 'kairos-type-card', 'kairos-type-card--sm', 'kairos-type-time']) {
    assert.ok(manifest.includes(`\`${cls}\``), `docs/kairos-ui.md names ${cls}`);
  }
  assert.doesNotMatch(manifest.split('\n').find((line) => line.startsWith('| `kairos-type-display`')) ?? '', /\bwidth\b/, 'the type-rank row says nothing of width');
});
