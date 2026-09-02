/**
 * The gate in front of an irreversible action.
 *
 * Type annotations are stripped the way `sort.test.mjs` strips them: this is
 * plain runtime logic, and it is the part of `ConfirmDialog` most worth a test,
 * because what it decides is whether something that cannot be taken back
 * happens.
 */
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = mkdtempSync(join(tmpdir(), 'kairos-confirm-'));
const path = join(dir, 'confirm.mts');
writeFileSync(path, readFileSync(join(ROOT, 'dist', 'react', 'confirm.ts'), 'utf8'));
const { confirmationMatches, confirmGateOpen } = await import(path);

test('a typed confirmation is proof the right record was read', () => {
  // The expected string is on the screen, so the person is copying it. A copy
  // that fails on letter case or a trailing space is a requirement the prompt
  // never stated, and the thing being checked is which record they read.
  assert.equal(confirmationMatches('PURGE cf2a', 'purge cf2a'), true);
  assert.equal(confirmationMatches('  Bright Ideas Ltd  ', 'Bright Ideas Ltd'), true);

  // And it is still a gate: a different record does not pass it.
  assert.equal(confirmationMatches('Bright Ideas Ltd', 'Caribbean Freight Co'), false);
  assert.equal(confirmationMatches('', 'Bright Ideas Ltd'), false);
});

test('nothing asked for is nothing to answer', () => {
  // Every existing call site passes no gate at all, so the empty gate has to
  // be open — otherwise adding these props turns every plain confirmation in
  // every app into one that can never be confirmed.
  assert.equal(confirmationMatches('', undefined), true);
  assert.equal(confirmGateOpen({ typed: '', reason: '' }), true);
});

test('a gate asking for both is open only when both are answered', () => {
  const gate = { typeToConfirm: 'PURGE', requireReason: true };

  assert.equal(confirmGateOpen({ ...gate, typed: 'PURGE', reason: 'Client closed the account' }), true);
  assert.equal(confirmGateOpen({ ...gate, typed: 'PURGE', reason: '' }), false);
  assert.equal(confirmGateOpen({ ...gate, typed: '', reason: 'Client closed the account' }), false);
});

test('whitespace is not a reason', () => {
  // A required reason exists to put words in an audit record. A space
  // satisfies `value.length` and satisfies nobody reading the trail later.
  assert.equal(
    confirmGateOpen({ requireReason: true, typed: '', reason: '   \n  ' }),
    false,
  );
});
