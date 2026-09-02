/**
 * Table sorting, kept apart from the rendering.
 *
 * Pure functions in their own file so they can be tested without a JSX
 * toolchain, and because the comparator is where the edge cases live: a
 * missing due date, a reference like INV-9 against INV-10, a mixed column.
 */

export type SortDirection = 'ascending' | 'descending';

export interface SortState {
  key: string;
  direction: SortDirection;
}

export type Sortable = string | number | Date | null | undefined;

/**
 * Compare two cell values.
 *
 * Empty sorts last in both directions. A missing due date is not "earliest";
 * it is absent, and burying it under the rows that do have one is what a
 * person scanning for the next thing to chase actually wants. Reversing the
 * array for a descending sort would otherwise float every blank to the top.
 */
export function compare(a: Sortable, b: Sortable): number {
  const aEmpty = a === null || a === undefined || a === '';
  const bEmpty = b === null || b === undefined || b === '';
  if (aEmpty || bEmpty) return aEmpty && bEmpty ? 0 : aEmpty ? 1 : -1;

  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;

  // `numeric` so INV-9 sorts before INV-10, which a plain string comparison
  // gets backwards on every reference column in the product.
  return String(a).localeCompare(String(b), 'en', { numeric: true, sensitivity: 'base' });
}

/**
 * Sort rows on their data.
 *
 * A copy, and always by value: reordering the DOM, or filtering by hiding rows
 * with CSS, is what makes a sort stop surviving a filter.
 *
 * Descending is a reversed comparator rather than a reversed array, so the
 * empties stay at the bottom and equal rows keep their original order — a
 * reversed array shuffles every tied row on each toggle, which reads as the
 * table rearranging itself for no reason.
 */
export function sortRows<Row>(
  rows: Row[],
  sort: SortState | null,
  valueOf: (key: string) => ((row: Row) => Sortable) | undefined
): Row[] {
  if (!sort) return rows;
  const getValue = valueOf(sort.key);
  if (!getValue) return rows;

  const sign = sort.direction === 'descending' ? -1 : 1;

  return [...rows].sort((a, b) => {
    const av = getValue(a);
    const bv = getValue(b);
    const aEmpty = av === null || av === undefined || av === '';
    const bEmpty = bv === null || bv === undefined || bv === '';

    // Empties are outside the ordering, so the direction does not apply to
    // them.
    if (aEmpty || bEmpty) return aEmpty && bEmpty ? 0 : aEmpty ? 1 : -1;
    return sign * compare(av, bv);
  });
}

/**
 * The next sort state when a header is pressed.
 *
 * Ascending, then descending, then back to the screen's own default. The third
 * press matters: a user who sorted by mistake needs a way back that is not a
 * page reload, and there is nowhere else to put it.
 *
 * `null` means "no override" rather than "no sort" — the caller falls back to
 * `defaultSort`.
 *
 * The screen's own default column is the exception, and it has two states
 * rather than three, because one of the three would be the state it is already
 * in. Pressing it reverses; pressing it again returns to the default. Whether
 * the default runs ascending or descending, the first press has to move
 * something, or the header reads as broken.
 */
export function nextSort(
  current: SortState | null,
  key: string,
  defaultSort: SortState | null = null
): SortState | null {
  const isDefaultColumn = defaultSort?.key === key;
  const defaultDirection = isDefaultColumn ? defaultSort!.direction : null;

  if (!current || current.key !== key) {
    // Starting in the direction the screen already sorts this column would
    // leave the table exactly as it was, so start at the other one.
    return { key, direction: defaultDirection === 'ascending' ? 'descending' : 'ascending' };
  }

  if (isDefaultColumn) {
    // Two states, not three: reverse the default, then drop back to it.
    return current.direction === defaultDirection
      ? { key, direction: current.direction === 'ascending' ? 'descending' : 'ascending' }
      : null;
  }

  if (current.direction === 'ascending') return { key, direction: 'descending' };
  return null;
}
