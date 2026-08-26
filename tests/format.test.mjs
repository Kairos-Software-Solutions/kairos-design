/**
 * The formatters ship as TypeScript, so the test strips the type annotations
 * rather than adding a build step to a repo whose whole point is not needing
 * one. Everything under test is plain runtime logic; the types are for the
 * consuming app's compiler, not for these assertions.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Load a .ts module by stripping types with Node's own type-stripping. */
async function load(name) {
  const source = readFileSync(join(ROOT, 'dist', 'format', `${name}.ts`), 'utf8');
  const dir = mkdtempSync(join(tmpdir(), 'kairos-fmt-'));
  const path = join(dir, `${name}.mts`);
  writeFileSync(path, source);
  return import(path);
}

test('money', async (t) => {
  const m = await load('money');

  await t.test('formats with the currency code, never a bare dollar sign', () => {
    assert.equal(m.formatMoney(8500).replace(/ /g, ' '), 'TTD 8,500.00');
    assert.equal(m.formatMoney(41800.5).replace(/ /g, ' '), 'TTD 41,800.50');
    assert.equal(m.formatMoney(1000, 'USD').replace(/ /g, ' '), 'USD 1,000.00');
  });

  await t.test('separates the code with a non-breaking space', () => {
    assert.match(m.formatMoney(8500), /^TTD 8,500\.00$/);
  });

  await t.test('holds exact amounts in minor units', () => {
    assert.equal(m.toMinor('8500.00'), 850000);
    assert.equal(m.toMinor('0.01'), 1);
    assert.equal(m.toMinor(0.1) + m.toMinor(0.2), m.toMinor('0.30'), 'no float drift');
    assert.equal(m.fromMinor(850000), 8500);
  });

  await t.test('respects a currency with no minor units', () => {
    assert.equal(m.toMinor('500', 'JPY'), 500);
    assert.throws(() => m.toMinor('500.50', 'JPY'), /more than 0 decimal places/);
  });

  await t.test('refuses a currency it has no minor-unit entry for', () => {
    assert.throws(() => m.toMinor('10', 'XYZ'), /no minor-unit entry/);
    assert.throws(() => m.toMinor('10', 'TT'), /three-letter ISO code/);
  });

  await t.test('refuses more precision than the currency has', () => {
    assert.throws(() => m.toMinor('1.005'), /more than 2 decimal places/);
  });

  await t.test('toMinorOrNull refuses without throwing at a boundary', () => {
    assert.equal(m.toMinorOrNull('1,000'), null, 'the thousands format the app displays');
    assert.equal(m.toMinorOrNull('abc'), null);
    assert.equal(m.toMinorOrNull(null), null);
    assert.equal(m.toMinorOrNull('250'), 25000);
  });

  await t.test('a filter bound reports its own error rather than vanishing', () => {
    assert.deepEqual(m.parseAmountFilter(''), { value: null, error: null });
    assert.deepEqual(m.parseAmountFilter('250'), { value: 250, error: null });

    const bad = m.parseAmountFilter('m');
    assert.equal(bad.value, null);
    assert.match(bad.error, /Enter an amount/, 'the field can say this');
  });

  await t.test('formatMinor goes straight from storage to screen', () => {
    assert.equal(m.formatMinor(850000).replace(/ /g, ' '), 'TTD 8,500.00');
  });
});

test('dates', async (t) => {
  const d = await load('dates');

  await t.test('names the month, so no reader can transpose it', () => {
    assert.equal(d.formatDate('2026-08-01'), '01 Aug 2026');
    assert.equal(d.formatDate('2026-01-08'), '08 Jan 2026');
  });

  await t.test('abbreviates September to three letters like every other month', () => {
    assert.equal(d.formatDate('2026-09-15'), '15 Sep 2026');
  });

  await t.test('renders a naive timestamp as the wall clock it states', () => {
    // Parsed as UTC and shifted, 2027-02-13 00:00:00 renders as the evening of
    // the 12th — a day earlier than the schedule it describes.
    assert.equal(d.formatDate('2027-02-13 00:00:00'), '13 Feb 2027');
  });

  await t.test('renders a zoned timestamp in the business time zone', () => {
    // 01:30 UTC is still the previous evening in Port of Spain.
    assert.equal(d.formatDate('2026-08-02T01:30:00Z'), '01 Aug 2026');
  });

  await t.test('formats a time and a date-and-time', () => {
    assert.equal(d.formatDateTime('2026-08-24T18:03:00Z'), '24 Aug 2026, 2:03 pm');
    assert.equal(d.formatTime('2026-08-24T18:03:00Z'), '2:03 pm');
  });

  await t.test('epoch seconds must say so', () => {
    assert.equal(d.formatDate(d.fromSeconds(1787788800)), d.formatDate(1787788800 * 1000));
  });

  await t.test('a range collapses when both ends are the same day', () => {
    assert.equal(d.formatDateRange('2026-08-24', '2026-08-31'), '24 Aug 2026 – 31 Aug 2026');
    assert.equal(d.formatDateRange('2026-08-24', '2026-08-24'), '24 Aug 2026');
  });

  await t.test('returns null rather than a plausible wrong date', () => {
    assert.equal(d.formatDate('not a date'), null);
    assert.equal(d.formatDate(''), null);
    assert.equal(d.formatDate(Number.NaN), null);
  });

  await t.test('the date-input hint restates what the native picker holds', () => {
    assert.equal(d.dateInputHint('2026-08-01'), '01 Aug 2026');
    assert.equal(d.dateInputHint(''), '', 'an unfilled filter has nothing to restate');
    assert.equal(d.dateInputHint(null), '');
  });
});
