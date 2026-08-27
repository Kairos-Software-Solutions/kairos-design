/**
 * The table comparator. Type annotations are stripped the same way the
 * formatters are; everything here is plain runtime logic.
 */
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = mkdtempSync(join(tmpdir(), 'kairos-sort-'));
const path = join(dir, 'sort.mts');
writeFileSync(path, readFileSync(join(ROOT, 'dist', 'react', 'sort.ts'), 'utf8'));
const { compare, sortRows, nextSort } = await import(path);

const by = (key) => (k) => (k === key ? (row) => row[key] : undefined);

test('references sort the way a person reads them', () => {
  const rows = [{ ref: 'INV-10' }, { ref: 'INV-9' }, { ref: 'INV-100' }];
  const sorted = sortRows(rows, { key: 'ref', direction: 'ascending' }, by('ref'));
  // A plain string comparison puts INV-10 before INV-9, which is wrong on
  // every reference column in the product.
  assert.deepEqual(sorted.map((r) => r.ref), ['INV-9', 'INV-10', 'INV-100']);
});

test('numbers compare as numbers, not as text', () => {
  const rows = [{ n: 100 }, { n: 9 }, { n: 41800.5 }];
  const sorted = sortRows(rows, { key: 'n', direction: 'ascending' }, by('n'));
  assert.deepEqual(sorted.map((r) => r.n), [9, 100, 41800.5]);
});

test('dates compare as dates', () => {
  const rows = [
    { d: new Date('2026-08-19') },
    { d: new Date('2026-08-02') },
    { d: new Date('2026-09-01') },
  ];
  const sorted = sortRows(rows, { key: 'd', direction: 'ascending' }, by('d'));
  assert.deepEqual(sorted.map((r) => r.d.toISOString().slice(0, 10)), [
    '2026-08-02',
    '2026-08-19',
    '2026-09-01',
  ]);
});

test('empty values sort last in both directions', () => {
  const rows = [{ due: null }, { due: '2026-08-19' }, { due: '' }, { due: '2026-08-02' }];

  const asc = sortRows(rows, { key: 'due', direction: 'ascending' }, by('due'));
  assert.deepEqual(asc.slice(0, 2).map((r) => r.due), ['2026-08-02', '2026-08-19']);
  assert.deepEqual(asc.slice(2).map((r) => r.due === null || r.due === ''), [true, true]);

  // A missing due date is not "latest" either. Reversing the array would float
  // every blank to the top, which puts the rows carrying no information where
  // the eye lands first.
  const desc = sortRows(rows, { key: 'due', direction: 'descending' }, by('due'));
  assert.deepEqual(desc.slice(0, 2).map((r) => r.due), ['2026-08-19', '2026-08-02']);
  assert.deepEqual(desc.slice(2).map((r) => r.due === null || r.due === ''), [true, true]);
});

test('descending is a reversed comparator, not a reversed array', () => {
  // Equal keys, distinguishable rows. A reversed array shuffles tied rows on
  // every toggle, which reads as the table rearranging itself for no reason.
  const rows = [
    { k: 'a', id: 1 },
    { k: 'a', id: 2 },
    { k: 'a', id: 3 },
  ];
  const desc = sortRows(rows, { key: 'k', direction: 'descending' }, by('k'));
  assert.deepEqual(desc.map((r) => r.id), [1, 2, 3], 'ties keep their original order');
});

test('sorting does not mutate the rows it was given', () => {
  const rows = [{ n: 3 }, { n: 1 }, { n: 2 }];
  const before = rows.map((r) => r.n);
  sortRows(rows, { key: 'n', direction: 'ascending' }, by('n'));
  assert.deepEqual(rows.map((r) => r.n), before, 'the caller still owns its array');
});

test('an unsortable or unknown column leaves the order alone', () => {
  const rows = [{ n: 3 }, { n: 1 }];
  assert.deepEqual(sortRows(rows, { key: 'nope', direction: 'ascending' }, by('n')), rows);
  assert.deepEqual(sortRows(rows, null, by('n')), rows);
});

test('pressing a header cycles the way a person expects', () => {
  const first = nextSort(null, 'amount');
  assert.deepEqual(first, { key: 'amount', direction: 'ascending' });

  const flipped = nextSort(first, 'amount');
  assert.deepEqual(flipped, { key: 'amount', direction: 'descending' });

  // A different column starts fresh rather than inheriting the last direction.
  assert.deepEqual(nextSort(flipped, 'customer'), { key: 'customer', direction: 'ascending' });
});

test('compare is case-insensitive, so a name does not sort by capitalisation', () => {
  assert.ok(compare('apple', 'Banana') < 0);
  assert.equal(compare('Ramdass', 'ramdass'), 0);
});

test('a third press returns to the screen default', () => {
  const fallback = { key: 'due', direction: 'descending' };

  const first = nextSort(null, 'amount', fallback);
  assert.deepEqual(first, { key: 'amount', direction: 'ascending' });

  const second = nextSort(first, 'amount', fallback);
  assert.deepEqual(second, { key: 'amount', direction: 'descending' });

  // Somewhere to go back to. Without this a mis-click can only be undone by
  // reloading the page.
  assert.equal(nextSort(second, 'amount', fallback), null);
});

test('pressing the default column first goes somewhere visible', () => {
  const fallback = { key: 'customer', direction: 'ascending' };
  // Starting at ascending here would leave the table exactly as it was, so the
  // press reads as broken.
  assert.deepEqual(nextSort(null, 'customer', fallback), {
    key: 'customer',
    direction: 'descending',
  });
});
