/**
 * Product Scale renders as 0.14.0 did.
 *
 * The promise every app relies on when it bumps: with no `data-scale`
 * attribute on the root, every class 0.14.0 shipped draws the same thing in
 * 0.16, light and dark, apart from a short list of intentional changes. The
 * comparison is against byte copies of the published 0.14.0 stylesheets in
 * `tests/fixtures/kairos-design-0.14.0/`, not against git history, so it
 * keeps meaning the same thing after the history moves on.
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
import { classesIn, parse, resolve, tokenMaps } from './helpers/css.mjs';

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = join(ROOT, 'tests', 'fixtures', 'kairos-design-0.14.0');
const read = (...parts) => readFileSync(join(...parts), 'utf8');

const THEMES = ['light', 'dark'];

/**
 * The whole list of intentional Product Scale changes, applied to 0.14's
 * tokens before comparing: the three font stacks (both themes) and the light
 * primary hover fill.
 */
const INTENTIONAL = [
  { theme: 'both', token: '--kairos-display', value: "'Archivo', ui-sans-serif, system-ui, sans-serif" },
  { theme: 'both', token: '--kairos-body', value: "'Archivo', ui-sans-serif, system-ui, sans-serif" },
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
      const expected = resolve(value, before[theme]);
      const actual = resolve(after[theme].get(name), after[theme]);
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
      for (const theme of THEMES) {
        const actual = resolve(now.value, after[theme]);
        if (changed) {
          const want = typeof changed.value === 'string' ? changed.value : changed.value[theme];
          if (actual !== want) failures.push(`${file}.css ${theme}: ${key} is ${actual}, CHANGED_0_17 says ${want}`);
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
