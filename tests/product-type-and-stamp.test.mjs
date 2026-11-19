/**
 * 0.19.0 at the Product Scale: body text and button labels on phones, and the
 * ink stamp kept for rank-1 buttons.
 *
 * Reads `dist/` as text with the small CSS reader in `helpers/css.mjs`; the
 * guard against the published 0.18.0 is in `product-scale.test.mjs`.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, resolve, tokenMaps } from './helpers/css.mjs';

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');
const tokens = read('dist', 'tokens.css');
const brand = read('dist', 'brand.css');

const PHONE_QUERY = '@media screen and (max-width: 899px)';
const SIZE_TOKENS = ['--kairos-text-body', '--kairos-text-button', '--kairos-text-button-sm'];
const TOKEN_RULES = parse(tokens);
const MAPS = tokenMaps(tokens);

/** The phone rule's declarations, and the light map with them applied over `:root`. */
const phone = TOKEN_RULES.filter((d) => d.context.join(' | ') === PHONE_QUERY);
function phoneMap(theme) {
  const map = new Map(MAPS[theme]);
  for (const d of phone) if (d.selector === ':root') map.set(d.prop, d.value);
  return map;
}

test('below 900px body text is 16px and button labels 14px and 13px', () => {
  // The query names `screen`, so paper keeps 14px (a printed A4 page is
  // narrower than 900px).
  assert.deepEqual(
    phone.map((d) => [d.selector, d.prop, d.value]),
    [
      [':root', '--kairos-text-body', '1rem'],
      [':root', '--kairos-text-button', '0.875rem'],
      [':root', '--kairos-text-button-sm', 'var(--kairos-text-md)'],
    ],
  );
  const map = phoneMap('light');
  assert.deepEqual(
    SIZE_TOKENS.map((name) => resolve(`var(${name})`, map)),
    ['1rem', '0.875rem', '13px'],
  );
  // The roles built from them follow with no edit of their own.
  assert.equal(resolve('var(--kairos-type-body-size)', map), '1rem');
  assert.equal(resolve('var(--kairos-type-button-size)', map), '0.875rem');
  // No other width query sets any of the three.
  const others = TOKEN_RULES.filter((d) => SIZE_TOKENS.includes(d.prop) && d.context.length && d.context.join(' | ') !== PHONE_QUERY);
  assert.deepEqual(others, []);
});

test('from 900px body text and button labels keep their 0.18.0 sizes', () => {
  for (const theme of ['light', 'dark']) {
    assert.deepEqual(
      SIZE_TOKENS.map((name) => resolve(`var(${name})`, MAPS[theme])),
      ['0.875rem', '12px', '11px'],
      theme,
    );
  }
  const widened = TOKEN_RULES.filter((d) => SIZE_TOKENS.includes(d.prop) && d.context.some((c) => /\bmin-width\b/.test(c)));
  assert.deepEqual(widened, [], 'no min-width query sets a body or button size');
  assert.ok(!/@media[^{]*\bmin-width\b[^{]*\{[^}]*--kairos-text-(body|button)/.test(tokens), 'no min-width rule in the source text either');
});

test('the Brand Scale keeps its body and button sizes on phones', () => {
  // `:root[data-scale='brand']` is (0,2,0) and the phone rule's `:root` is
  // (0,1,0), so the brand rule wins at every width.
  const rules = parse(brand);
  assert.deepEqual([...new Set(rules.map((d) => d.selector))], [":root[data-scale='brand']"]);
  assert.ok(rules.every((d) => d.context.length === 0), 'the Brand rule sits outside every at-rule');
  const brandValue = (name) => rules.filter((d) => d.prop === name).map((d) => d.value);
  assert.deepEqual(brandValue('--kairos-text-body'), ['17px']);
  assert.deepEqual(brandValue('--kairos-text-button'), ['16px']);
  assert.deepEqual(brandValue('--kairos-text-button-sm'), ['16px']);
  assert.ok(phone.length > 0 && phone.every((d) => d.selector === ':root'), "the phone rule's selector is exactly :root");
});
