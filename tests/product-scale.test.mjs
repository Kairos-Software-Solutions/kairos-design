/**
 * Product Scale renders as 0.14.0, 0.17.0 and 0.18.0 did.
 *
 * The promise every app relies on when it bumps: with no `data-scale`
 * attribute on the root, every class 0.14.0 shipped draws the same thing in
 * 0.19, light and dark, apart from a short list of intentional changes. The
 * comparison is against byte copies of the published 0.14.0, 0.17.0 and
 * 0.18.0 stylesheets in `tests/fixtures/kairos-design-<version>/`, not
 * against git history, so it keeps meaning the same thing after the history
 * moves on.
 *
 * Values are compared resolved: a rule that read `2px` and now reads a knob
 * whose default is `2px` passes, and a knob default that differs by a hair
 * fails, in either theme.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { classesIn, parse, resolve, splitTop, tokenMaps } from './helpers/css.mjs';

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = join(ROOT, 'tests', 'fixtures', 'kairos-design-0.14.0');
const FIXTURE_0_17 = join(ROOT, 'tests', 'fixtures', 'kairos-design-0.17.0');
const FIXTURE_0_18 = join(ROOT, 'tests', 'fixtures', 'kairos-design-0.18.0');
const read = (...parts) => readFileSync(join(...parts), 'utf8');

const THEMES = ['light', 'dark'];

/**
 * The whole list of intentional Product Scale changes, applied to 0.14's
 * tokens before comparing: the three font stacks (both themes) and the light
 * primary hover fill.
 */
const INTENTIONAL = [
  { theme: 'both', token: '--kairos-display', value: "'Epilogue', ui-sans-serif, system-ui, sans-serif" },
  { theme: 'both', token: '--kairos-body', value: "'Epilogue', ui-sans-serif, system-ui, sans-serif" },
  { theme: 'both', token: '--kairos-mono', value: "'Courier Prime', 'Courier New', ui-monospace, monospace" },
  { theme: 'light', token: '--kairos-accent-hover', value: '#ffb627' },
  // 0.17.0: the tracking that went with capital buttons and tabs.
  { theme: 'both', token: '--kairos-track-button', value: '0.01em' },
];

/**
 * New declarations on a class 0.14 already defined that are neither in a new
 * part nor Brand-scoped. Each one names the value it resolves to at Product
 * Scale, in both themes, and that value must leave the part as 0.14 drew it.
 */
const ALLOWED_NEW = [
  // The Field error badge. A `::before` with no content draws nothing, and the
  // knob keeps it out of the layout too; the Brand Scale shows it.
  { file: 'kairos.css', context: '', selector: '.kairos-field-error::before', prop: 'display', productValue: 'none' },
];

/**
 * 0.17.0 moves the Product Scale onto the brief's type on purpose: sentence
 * case buttons, labels and tabs, and the tracking that went with capitals
 * comes down. Each 0.14 declaration that changes is listed with the value it
 * now resolves to (both themes unless a theme is named).
 */
const CHANGED_0_17 = [
  { selector: '.kairos-button', prop: 'font-weight', value: '700' },
  { selector: '.kairos-button', prop: 'letter-spacing', value: '0.01em' },
  { selector: '.kairos-button', prop: 'text-transform', value: 'none' },
  { selector: '.kairos-button--sm', prop: 'letter-spacing', value: '0.01em' },
  { selector: '.kairos-input-label', prop: 'color', value: { light: '#16110b', dark: '#f5f1e8' } },
  { selector: '.kairos-input-label', prop: 'font-size', value: '13px' },
  { selector: '.kairos-input-label', prop: 'letter-spacing', value: '0' },
  { selector: '.kairos-input-label', prop: 'text-transform', value: 'none' },
  ...['.kairos-kicker', '.kairos-nav-group', '.kairos-section-tag > :first-child', '.kairos-segmented-link', '.kairos-segmented-option', '.kairos-step', '.kairos-subnav-link', '.kairos-tab'].map(
    (selector) => ({ selector, prop: 'letter-spacing', value: '0.01em' }),
  ),
];

/**
 * New 0.17.0 declarations on existing classes. The type layer is one block
 * whose every rule begins `:root:not([data-scale='brand'])`, so it reaches the
 * apps and never the Brand Scale; it is accepted by that prefix. The rest are
 * layout fixes, listed one by one.
 */
const PRODUCT_TYPE_PREFIX = ":root:not([data-scale='brand'])";
const NEW_0_17 = [
  { selector: '.kairos-metric-row > div', prop: 'align-content' },
  { selector: '.kairos-panel--flow > :not(.kairos-panel-heading, .kairos-panel-heading-row) + *', prop: 'margin-top' },
  { selector: '.kairos-stack', prop: 'grid-template-columns' },
  { selector: '.kairos-table td :is(.kairos-mono, .kairos-code, code)', prop: 'overflow-wrap' },
  { selector: '.kairos-app-shell:has(.kairos-sidebar) .kairos-topbar--switcher .kairos-topbar-brand', prop: 'display' },
  { selector: '.kairos-app-shell:has(.kairos-sidebar) .kairos-topbar:not(:has(> :not(.kairos-topbar-brand, .kairos-account-trigger--compact)))', prop: 'display' },
];

/**
 * 0.18.0 against the published 0.17.0 (`tests/fixtures/kairos-design-0.17.0/`).
 *
 * `GONE_0_18` is every 0.17.0 key that 0.18.0 does not have: lock revision 3
 * takes the width out of the brand layer, so the 16 width tokens and every
 * `font-stretch` declaration that read one are gone, and the marker's
 * `transform` becomes `rotate` (the website wipes it in with a transform).
 * Declarations are keyed by selector and property at the top level.
 */
const STRETCH_TOKENS_0_17 = [
  '--kairos-button-stretch',
  '--kairos-input-label-stretch',
  ...['display', 'title', 'h2', 'h3', 'quote', 'lead', 'statement', 'body', 'small', 'legal', 'label', 'price', 'button', 'nav'].map(
    (rank) => `--kairos-type-${rank}-stretch`,
  ),
];
const GONE_0_18 = {
  tokens: [...STRETCH_TOKENS_0_17],
  declarations: [
    { selector: '.kairos-menu-link', prop: 'font-stretch' },
    { selector: '.kairos-tick-list-value', prop: 'font-stretch' },
    { selector: '.kairos-step-line-title', prop: 'font-stretch' },
    { selector: '.kairos-site-menu-row', prop: 'font-stretch' },
    ...['display', 'title', 'h2', 'h3', 'quote', 'lead', 'statement', 'body', 'small', 'legal', 'label', 'price', 'button', 'nav'].map(
      (rank) => ({ selector: `.kairos-type-${rank}`, prop: 'font-stretch' }),
    ),
    { selector: ":root[data-scale='brand'] .kairos-button", prop: 'font-stretch' },
    { selector: ":root[data-scale='brand'] .kairos-input-label", prop: 'font-stretch' },
    // P2: the marker tilts through `rotate`.
    { selector: '.kairos-marker::after', prop: 'transform' },
    // 0.18.0 takes the width out of 0.17.0's apps type block too: headings,
    // section headings and the product name. Every other declaration stays.
    { selector: ":root:not([data-scale='brand']) :where(h1, h2, h3, h4, h5, h6)", prop: 'font-stretch' },
    {
      selector:
        ":root:not([data-scale='brand']) :where(.kairos-app-shell) :where(h2, h3, h4, h5, h6), :root:not([data-scale='brand']) :is(.kairos-panel-heading, .kairos-panel-subheading, .kairos-section-title, .kairos-record-row-title, .kairos-tile-heading, .kairos-disclosure-title, .kairos-dialog-title)",
      prop: 'font-stretch',
    },
    { selector: ":root:not([data-scale='brand']) :is(.kairos-product-name, .kairos-wordmark, .kairos-print-header-business)", prop: 'font-stretch' },
  ],
};

/**
 * 0.17.0 keys whose value changes on purpose. A `token` entry is applied to
 * 0.17.0's token map before its declarations are resolved (as INTENTIONAL is
 * for 0.14); a declaration entry names the value the key now resolves to.
 */
const CHANGED_0_18 = [
  // The apps move from Archivo to Epilogue. The 14 declarations that read
  // these two tokens (13 in kairos.css, 1 in base.css) resolve equal.
  { token: '--kairos-display', value: "'Epilogue', ui-sans-serif, system-ui, sans-serif" },
  { token: '--kairos-body', value: "'Epilogue', ui-sans-serif, system-ui, sans-serif" },
  // Lock revision 3: phone menu rows from 26px to 23px.
  { token: '--kairos-site-menu-row-size', value: '23px' },
  { selector: '.kairos-site-menu-row', prop: 'font-size', value: '23px' },
];

/**
 * New 0.18.0 declarations whose selector names a class 0.17.0 defined and
 * that are not Brand-scoped. Each names its reason.
 */
const NEW_0_18 = [
  // P1: inert at the Product Scale unless an app puts a type label inside an
  // uppercase typed label (`text-transform` is inherited).
  { selector: '.kairos-type-label, .kairos-type-price', props: ['text-transform'] },
  // P1: a Brand part.
  { selector: '.kairos-site-footer-heading', props: ['line-height', 'letter-spacing', 'text-transform'] },
  // P2: Brand parts.
  { selector: '.kairos-title-bar::after', props: ['rotate'] },
  { selector: '.kairos-marker::after', props: ['rotate'] },
  // P6: resolves to what it was.
  { selector: '.kairos-tick-list--statement .kairos-tick-list-value', props: ['font-size', 'line-height'] },
  // P6: resolves to the statement size at the Product Scale.
  { context: '@media (max-width: 520px)', selector: '.kairos-tick-list-value', props: ['font-size'] },
  // P9: a Brand part.
  { selector: ".kairos-site-menu-row[aria-current='page']", props: ['text-decoration-line', 'text-underline-offset'] },
  // P10: the ring is hidden while idle, so nothing visible changes.
  { selector: ".kairos-button:not([aria-busy='true']) .kairos-button-pending .kairos-spin", props: ['animation'] },
];
const newEntry0_18 = (context, selector, prop) =>
  NEW_0_18.find((n) => (n.context ?? '') === context && n.selector === selector && n.props.includes(prop));

/**
 * 0.19.0 against the published 0.18.0 (`tests/fixtures/kairos-design-0.18.0/`).
 *
 * `CHANGED_0_19` is every 0.18.0 key whose value changes on purpose: the three
 * surface shadow tokens take the brief's soft card shadow, and so do the ten
 * surfaces that read them. A listed token or declaration is compared with its
 * listed value; everything else, the buttons and the page header's primary
 * included, must resolve as before. The entries are not applied to the old
 * token map, which would make every button reader resolve soft on the old side.
 * `PHONE_0_19` is the one new rule in a width query (`tokenMaps()` skips them).
 * `NEW_0_19` lists new declarations on 0.18.0 classes that are not
 * Brand-scoped; it is empty.
 */
const SOFT_0_19 = { light: '0 14px 30px -20px rgba(71, 55, 40, 0.32)', dark: '0 14px 30px -20px rgba(0, 0, 0, 0.5)' };
const CHANGED_0_19 = {
  // The three surface tokens take the brief's soft card shadow (decision 6).
  tokens: ['--kairos-shadow', '--kairos-shadow-card', '--kairos-shadow-lg'].map((token) => ({ token, value: SOFT_0_19 })),
  // The ten surfaces that read them, top-level kairos.css rules.
  declarations: [
    '.kairos-skip-link', '.kairos-disclosure', '.kairos-disclosure-group', '.kairos-panel', '.kairos-card',
    '.kairos-dialog-content', '.kairos-overflow-menu', '.kairos-combobox-menu', '.kairos-popover', '.kairos-toast',
  ].map((selector) => ({ selector, prop: 'box-shadow', value: SOFT_0_19 })),
};
const PHONE_0_19 = [
  { context: '@media screen and (max-width: 899px)', selector: ':root', prop: '--kairos-text-body', value: '1rem' },
  { context: '@media screen and (max-width: 899px)', selector: ':root', prop: '--kairos-text-button', value: '0.875rem' },
  { context: '@media screen and (max-width: 899px)', selector: ':root', prop: '--kairos-text-button-sm', value: 'var(--kairos-text-md)' },
];
const NEW_0_19 = [];
const newEntry0_19 = (context, selector, prop) =>
  NEW_0_19.find((n) => (n.context ?? '') === context && n.selector === selector && n.props.includes(prop));
const valueFor = (entry, theme) => (typeof entry.value === 'string' ? entry.value : entry.value[theme]);

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

/** Each theme's Product Scale token map, with INTENTIONAL applied when asked. */
function maps(source, intentional) {
  const out = tokenMaps(source);
  if (intentional) {
    for (const { theme, token, value } of intentional) {
      for (const t of theme === 'both' ? THEMES : [theme]) out[t].set(token, value);
    }
  }
  return out;
}

const OLD_0_17 = {
  tokens: read(FIXTURE_0_17, 'tokens.css'),
  base: read(FIXTURE_0_17, 'base.css'),
  kairos: read(FIXTURE_0_17, 'kairos.css'),
};
const OLD_0_18 = {
  tokens: read(FIXTURE_0_18, 'tokens.css'),
  base: read(FIXTURE_0_18, 'base.css'),
  kairos: read(FIXTURE_0_18, 'kairos.css'),
};
const OLD = { tokens: read(FIXTURE, 'tokens.css'), base: read(FIXTURE, 'base.css'), kairos: read(FIXTURE, 'kairos.css') };
const NEW = {
  tokens: read(ROOT, 'dist', 'tokens.css'),
  base: read(ROOT, 'dist', 'base.css'),
  kairos: read(ROOT, 'dist', 'kairos.css'),
};

/** Declarations keyed by at-rule context, selector and property, with an occurrence index. */
function keyed(source) {
  const out = new Map();
  const seen = new Map();
  for (const d of parse(source)) {
    const stem = `${d.context.join(' | ')} :: ${d.selector} :: ${d.prop}${d.important ? ' !important' : ''}`;
    const n = seen.get(stem) ?? 0;
    seen.set(stem, n + 1);
    out.set(`${stem} #${n}`, d);
  }
  return out;
}

test('the 0.14.0 fixture is the published 0.14.0', () => {
  assert.equal(sha256(join(FIXTURE, 'tokens.css')), '336b55c1038a1ca160d945f93243058ee7ba44ae1fa66ae4aafb6a6fd5d8311d');
  assert.equal(sha256(join(FIXTURE, 'base.css')), '6f0ad07bc2fb1e3ecdcf877d35673fe3c0ae479be0e50544d708dd02961b79a5');
  assert.equal(sha256(join(FIXTURE, 'kairos.css')), '5c6557c6fbb9cbec9a9059283e6c60562be82f60b9b5e7c6e717549380e26590');
});

test('every 0.14 declaration resolves the same at Product Scale, light and dark', () => {
  const before = maps(OLD.tokens, INTENTIONAL);
  const after = maps(NEW.tokens);
  const failures = [];

  // tokens.css by token name and theme: the nine renamed roles moved into the
  // alias block, so their selector keys go away by design.
  for (const theme of THEMES) {
    for (const [name, value] of before[theme]) {
      if (!after[theme].has(name)) {
        failures.push(`tokens.css ${theme}: ${name} is no longer declared`);
        continue;
      }
      const actual = resolve(after[theme].get(name), after[theme]);
      const soft = CHANGED_0_19.tokens.find((c) => c.token === name);
      if (soft) {
        if (actual !== soft.value[theme]) failures.push(`tokens.css ${theme}: ${name} is ${actual}, CHANGED_0_19 says ${soft.value[theme]}`);
        continue;
      }
      const expected = resolve(value, before[theme]);
      if (expected !== actual) failures.push(`tokens.css ${theme}: ${name} was ${expected}, is ${actual}`);
    }
  }

  // kairos.css and base.css by at-rule context, selector and property.
  for (const file of ['kairos', 'base']) {
    const oldKeys = keyed(OLD[file]);
    const newKeys = keyed(NEW[file]);
    for (const [key, d] of oldKeys) {
      const now = newKeys.get(key);
      if (!now) {
        failures.push(`${file}.css: ${key} is gone`);
        continue;
      }
      const changed = file === 'kairos' && !d.context.length ? CHANGED_0_17.find((c) => c.selector === d.selector && c.prop === d.prop) : null;
      const soft = file === 'kairos' && !d.context.length ? CHANGED_0_19.declarations.find((c) => c.selector === d.selector && c.prop === d.prop) : null;
      for (const theme of THEMES) {
        const actual = resolve(now.value, after[theme]);
        if (changed) {
          const want = typeof changed.value === 'string' ? changed.value : changed.value[theme];
          if (actual !== want) failures.push(`${file}.css ${theme}: ${key} is ${actual}, CHANGED_0_17 says ${want}`);
          continue;
        }
        if (soft) {
          if (actual !== soft.value[theme]) failures.push(`${file}.css ${theme}: ${key} is ${actual}, CHANGED_0_19 says ${soft.value[theme]}`);
          continue;
        }
        const expected = resolve(d.value, before[theme]);
        if (expected !== actual) failures.push(`${file}.css ${theme}: ${key} was ${expected}, is ${actual}`);
      }
    }
  }

  assert.deepEqual(failures, [], `Product Scale moved:\n${failures.join('\n')}`);
});

test('a new rule on an existing class is Brand-scoped, or listed and inert at Product Scale', () => {
  const after = maps(NEW.tokens);
  const failures = [];
  const used = new Set();

  for (const file of ['kairos', 'base']) {
    const oldKeys = keyed(OLD[file]);
    const oldClasses = new Set([...OLD[file].matchAll(/\.(kairos-[a-z0-9-]+)/g)].map((m) => m[1]));
    const oldKeyframes = new Set([...OLD[file].matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));

    for (const [key, d] of keyed(NEW[file])) {
      if (oldKeys.has(key)) continue;

      // A step of a keyframes block 0.14 did not have belongs to a new part.
      const frames = d.context.map((c) => c.match(/^@keyframes\s+([\w-]+)/)?.[1]).find(Boolean);
      if (frames && !oldKeyframes.has(frames)) continue;

      if (d.selector.startsWith(PRODUCT_TYPE_PREFIX)) continue;
      if (file === 'kairos' && NEW_0_17.some((n) => n.selector === d.selector && n.prop === d.prop)) continue;
      if (file === 'kairos' && newEntry0_18(d.context.join(' | '), d.selector, d.prop)) continue;

      const parts = d.selector.split(', ');
      const free = parts.every(
        (part) =>
          part.startsWith(":root[data-scale='brand']") ||
          classesIn(part).some((cls) => !oldClasses.has(cls)),
      );
      if (free) continue;

      const listed = ALLOWED_NEW.find(
        (entry) =>
          entry.file === `${file}.css` &&
          entry.context === d.context.join(' | ') &&
          entry.selector === d.selector &&
          entry.prop === d.prop,
      );
      if (!listed) {
        failures.push(`${file}.css: ${key} is new on an existing class and not Brand-scoped`);
        continue;
      }
      used.add(listed);
      for (const theme of THEMES) {
        const actual = resolve(d.value, after[theme]);
        if (actual !== listed.productValue) {
          failures.push(`${file}.css ${theme}: ${key} resolves to ${actual}, ALLOWED_NEW says ${listed.productValue}`);
        }
      }
    }
  }

  const stale = ALLOWED_NEW.filter((entry) => !used.has(entry)).map((e) => `${e.selector} ${e.prop}`);
  assert.deepEqual(failures, [], failures.join('\n'));
  assert.deepEqual(stale, [], 'ALLOWED_NEW lists a declaration that no longer exists');
});

test('the 0.17.0 fixture is the published 0.17.0', () => {
  assert.equal(sha256(join(FIXTURE_0_17, 'tokens.css')), '648bc07eb14caa3621600b23cc14855387aa4f1dcacb621ebc38bd74691bd5d8');
  assert.equal(sha256(join(FIXTURE_0_17, 'base.css')), '6f0ad07bc2fb1e3ecdcf877d35673fe3c0ae479be0e50544d708dd02961b79a5');
  assert.equal(sha256(join(FIXTURE_0_17, 'kairos.css')), 'c0e6be31d027d1aac119d9a0c1f987937599424510bc59302f488e5e7ff28752');
  assert.equal(sha256(join(FIXTURE_0_17, 'brand.css')), '6354771efc709df7e7959f59b82256714f5a77447ec4be8428f914a40fc8250f');
});

test('every 0.17.0 declaration resolves the same at Product Scale, light and dark, apart from the 0.18 lists', () => {
  const before = maps(OLD_0_17.tokens, CHANGED_0_18.filter((c) => c.token).map((c) => ({ theme: 'both', ...c })));
  const after = maps(NEW.tokens);
  const failures = [];

  // tokens.css by token name and theme.
  for (const theme of THEMES) {
    for (const [name, value] of before[theme]) {
      if (GONE_0_18.tokens.includes(name)) {
        if (after[theme].has(name)) failures.push(`tokens.css ${theme}: ${name} is in GONE_0_18 but still declared`);
        continue;
      }
      if (!after[theme].has(name)) {
        failures.push(`tokens.css ${theme}: ${name} is no longer declared`);
        continue;
      }
      const actual = resolve(after[theme].get(name), after[theme]);
      const soft = CHANGED_0_19.tokens.find((c) => c.token === name);
      if (soft) {
        if (actual !== soft.value[theme]) failures.push(`tokens.css ${theme}: ${name} is ${actual}, CHANGED_0_19 says ${soft.value[theme]}`);
        continue;
      }
      const expected = resolve(value, before[theme]);
      if (expected !== actual) failures.push(`tokens.css ${theme}: ${name} was ${expected}, is ${actual}`);
    }
  }

  // kairos.css and base.css by at-rule context, selector and property.
  const goneUsed = new Set();
  const changedUsed = new Set();
  for (const file of ['kairos', 'base']) {
    const newKeys = keyed(NEW[file]);
    for (const [key, d] of keyed(OLD_0_17[file])) {
      const top = file === 'kairos' && !d.context.length;
      const gone = top ? GONE_0_18.declarations.find((g) => g.selector === d.selector && g.prop === d.prop) : null;
      if (gone) {
        goneUsed.add(gone);
        if (newKeys.has(key)) failures.push(`${file}.css: ${key} is in GONE_0_18 but still declared`);
        continue;
      }
      const now = newKeys.get(key);
      if (!now) {
        failures.push(`${file}.css: ${key} is gone`);
        continue;
      }
      const changed = top ? CHANGED_0_18.find((c) => c.selector === d.selector && c.prop === d.prop) : null;
      if (changed) changedUsed.add(changed);
      const soft = top ? CHANGED_0_19.declarations.find((c) => c.selector === d.selector && c.prop === d.prop) : null;
      for (const theme of THEMES) {
        const actual = resolve(now.value, after[theme]);
        if (changed) {
          if (actual !== changed.value) failures.push(`${file}.css ${theme}: ${key} is ${actual}, CHANGED_0_18 says ${changed.value}`);
          continue;
        }
        if (soft) {
          if (actual !== soft.value[theme]) failures.push(`${file}.css ${theme}: ${key} is ${actual}, CHANGED_0_19 says ${soft.value[theme]}`);
          continue;
        }
        const expected = resolve(d.value, before[theme]);
        if (expected !== actual) failures.push(`${file}.css ${theme}: ${key} was ${expected}, is ${actual}`);
      }
    }
  }

  // Every list entry must still point at something real.
  const oldLight = tokenMaps(OLD_0_17.tokens).light;
  for (const name of GONE_0_18.tokens) if (!oldLight.has(name)) failures.push(`GONE_0_18 lists ${name}, which 0.17.0 does not declare`);
  for (const g of GONE_0_18.declarations) if (!goneUsed.has(g)) failures.push(`GONE_0_18 lists ${g.selector} ${g.prop}, which 0.17.0 does not declare`);
  for (const c of CHANGED_0_18) {
    if (c.token && oldLight.get(c.token) === c.value) failures.push(`CHANGED_0_18 lists ${c.token}, which does not change`);
    if (c.token && !oldLight.has(c.token)) failures.push(`CHANGED_0_18 lists ${c.token}, which 0.17.0 does not declare`);
    if (c.selector && !changedUsed.has(c)) failures.push(`CHANGED_0_18 lists ${c.selector} ${c.prop}, which 0.17.0 does not declare`);
  }

  assert.deepEqual(failures, [], `Product Scale moved since 0.17.0:\n${failures.join('\n')}`);
});

test('a new 0.18 rule on a 0.17.0 class is Brand-scoped or listed', () => {
  const failures = [];

  for (const file of ['kairos', 'base']) {
    const oldKeys = keyed(OLD_0_17[file]);
    const oldClasses = new Set([...OLD_0_17[file].matchAll(/\.(kairos-[a-z0-9-]+)/g)].map((m) => m[1]));
    const oldKeyframes = new Set([...OLD_0_17[file].matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));

    for (const [key, d] of keyed(NEW[file])) {
      if (oldKeys.has(key)) continue;

      // A step of a keyframes block 0.17.0 did not have belongs to a new part.
      const frames = d.context.map((c) => c.match(/^@keyframes\s+([\w-]+)/)?.[1]).find(Boolean);
      if (frames && !oldKeyframes.has(frames)) continue;

      const parts = splitTop(d.selector, ',').map((part) => part.trim());
      const free = parts.every(
        (part) => part.startsWith(":root[data-scale='brand']") || classesIn(part).some((cls) => !oldClasses.has(cls)),
      );
      if (free) continue;

      const listed = file === 'kairos' ? newEntry0_18(d.context.join(' | '), d.selector, d.prop) : null;
      if (!listed) {
        failures.push(`${file}.css: ${key} is new on a 0.17.0 class and neither Brand-scoped nor in NEW_0_18`);
        continue;
      }
    }
  }

  assert.deepEqual(failures, [], failures.join('\n'));
});

test("0.17.0's Product type block is kept apart from its widths", () => {
  const now = keyed(NEW.kairos);
  const failures = [];
  let checked = 0;
  for (const [key, d] of keyed(OLD_0_17.kairos)) {
    if (!d.selector.startsWith(PRODUCT_TYPE_PREFIX)) continue;
    checked += 1;
    const found = now.get(key);
    if (d.prop === 'font-stretch') {
      if (found) failures.push(`${key} still sets a width`);
    } else if (!found) {
      failures.push(`${key} is gone`);
    } else if (found.value !== d.value) {
      failures.push(`${key} was ${d.value}, is ${found.value}`);
    }
  }
  assert.ok(checked > 20, 'the fixture has the type block');
  for (const [key, d] of now) {
    if (d.selector.startsWith(PRODUCT_TYPE_PREFIX) && d.prop === 'font-stretch') failures.push(`${key} sets a width`);
  }
  assert.deepEqual(failures, [], failures.join('\n'));
});

test('the 0.18.0 fixture is the published 0.18.0', () => {
  assert.equal(sha256(join(FIXTURE_0_18, 'tokens.css')), '5b62f0ced3f19ab7346b2987838d8f4ddd3106ab7f17ea29c88098e8c4b6e99e');
  assert.equal(sha256(join(FIXTURE_0_18, 'base.css')), '6f0ad07bc2fb1e3ecdcf877d35673fe3c0ae479be0e50544d708dd02961b79a5');
  assert.equal(sha256(join(FIXTURE_0_18, 'kairos.css')), 'de60d565f5be8232ea932b06803be2574bd13ec546e13c469dd7eec1ecae9190');
  assert.equal(sha256(join(FIXTURE_0_18, 'brand.css')), '24bba37742a7df07cfd0c24c4ce414bbc10a905c1ac8eb528b2f46c0b334cfec');
});

test('every 0.18.0 declaration resolves the same at Product Scale, light and dark, apart from the 0.19 lists', () => {
  const before = maps(OLD_0_18.tokens);
  const after = maps(NEW.tokens);
  const failures = [];

  // tokens.css by token name and theme.
  for (const theme of THEMES) {
    for (const [name, value] of before[theme]) {
      if (!after[theme].has(name)) {
        failures.push(`tokens.css ${theme}: ${name} is no longer declared`);
        continue;
      }
      const actual = resolve(after[theme].get(name), after[theme]);
      const changed = CHANGED_0_19.tokens.find((c) => c.token === name);
      if (changed) {
        if (actual !== changed.value[theme]) failures.push(`tokens.css ${theme}: ${name} is ${actual}, CHANGED_0_19 says ${changed.value[theme]}`);
        continue;
      }
      const expected = resolve(value, before[theme]);
      if (expected !== actual) failures.push(`tokens.css ${theme}: ${name} was ${expected}, is ${actual}`);
    }
  }

  // kairos.css and base.css by at-rule context, selector and property.
  const changedUsed = new Set();
  for (const file of ['kairos', 'base']) {
    const newKeys = keyed(NEW[file]);
    for (const [key, d] of keyed(OLD_0_18[file])) {
      const now = newKeys.get(key);
      if (!now) {
        failures.push(`${file}.css: ${key} is gone`);
        continue;
      }
      const top = file === 'kairos' && !d.context.length;
      const changed = top ? CHANGED_0_19.declarations.find((c) => c.selector === d.selector && c.prop === d.prop) : null;
      if (changed) changedUsed.add(changed);
      for (const theme of THEMES) {
        const actual = resolve(now.value, after[theme]);
        if (changed) {
          if (actual !== changed.value[theme]) failures.push(`${file}.css ${theme}: ${key} is ${actual}, CHANGED_0_19 says ${changed.value[theme]}`);
          continue;
        }
        const expected = resolve(d.value, before[theme]);
        if (expected !== actual) failures.push(`${file}.css ${theme}: ${key} was ${expected}, is ${actual}`);
      }
    }
  }

  // Every list entry must still point at something real, and a token entry must change.
  for (const c of CHANGED_0_19.tokens) {
    for (const theme of THEMES) {
      if (!before[theme].has(c.token)) {
        failures.push(`CHANGED_0_19 lists ${c.token}, which 0.18.0 does not declare`);
      } else if (resolve(before[theme].get(c.token), before[theme]) === c.value[theme]) {
        failures.push(`CHANGED_0_19 lists ${c.token}, which does not change in ${theme}`);
      }
    }
  }
  for (const c of CHANGED_0_19.declarations) {
    if (!changedUsed.has(c)) failures.push(`CHANGED_0_19 lists ${c.selector} ${c.prop}, which 0.18.0 does not declare`);
  }

  assert.deepEqual(failures, [], `Product Scale moved since 0.18.0:\n${failures.join('\n')}`);
});

test('a new 0.19 rule on a 0.18.0 class is Brand-scoped or listed', () => {
  const failures = [];

  for (const file of ['kairos', 'base']) {
    const oldKeys = keyed(OLD_0_18[file]);
    const oldClasses = new Set([...OLD_0_18[file].matchAll(/\.(kairos-[a-z0-9-]+)/g)].map((m) => m[1]));
    const oldKeyframes = new Set([...OLD_0_18[file].matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));

    for (const [key, d] of keyed(NEW[file])) {
      if (oldKeys.has(key)) continue;

      // A step of a keyframes block 0.18.0 did not have belongs to a new part.
      const frames = d.context.map((c) => c.match(/^@keyframes\s+([\w-]+)/)?.[1]).find(Boolean);
      if (frames && !oldKeyframes.has(frames)) continue;

      const parts = splitTop(d.selector, ',').map((part) => part.trim());
      const free = parts.every(
        (part) => part.startsWith(":root[data-scale='brand']") || classesIn(part).some((cls) => !oldClasses.has(cls)),
      );
      if (free) continue;

      const listed = file === 'kairos' ? newEntry0_19(d.context.join(' | '), d.selector, d.prop) : null;
      if (!listed) failures.push(`${file}.css: ${key} is new on a 0.18.0 class and neither Brand-scoped nor in NEW_0_19`);
    }
  }

  assert.deepEqual(failures, [], failures.join('\n'));
});

test('tokens.css adds only the phone type rule to its width queries', () => {
  // `tokenMaps()` skips every custom property that sits inside an at-rule other
  // than `@media not print`, so the phone rule would pass every other guard unseen.
  const widthScoped = (source) => {
    const out = new Map();
    for (const d of parse(source)) {
      if (!d.prop.startsWith('--') || !d.context.length || d.context.join(' | ') === '@media not print') continue;
      out.set(`${d.context.join(' | ')} :: ${d.selector} :: ${d.prop}`, d.value);
    }
    return out;
  };
  const before = widthScoped(OLD_0_18.tokens);
  const after = widthScoped(NEW.tokens);
  const phone = new Map(PHONE_0_19.map((p) => [`${p.context} :: ${p.selector} :: ${p.prop}`, p.value]));
  const failures = [];

  assert.ok(before.size > 0, 'the 0.18.0 fixture has width-scoped custom properties');
  for (const [key, value] of before) {
    if (!after.has(key)) failures.push(`${key} is gone`);
    else if (after.get(key) !== value) failures.push(`${key} was ${value}, is ${after.get(key)}`);
  }
  for (const [key, value] of after) {
    if (before.has(key)) continue;
    if (!phone.has(key)) failures.push(`${key} is new and not in PHONE_0_19`);
    else if (phone.get(key) !== value) failures.push(`${key} is ${value}, PHONE_0_19 says ${phone.get(key)}`);
  }
  for (const key of phone.keys()) if (!after.has(key)) failures.push(`PHONE_0_19 lists ${key}, which tokens.css does not declare`);

  assert.deepEqual(failures, [], failures.join('\n'));
});
