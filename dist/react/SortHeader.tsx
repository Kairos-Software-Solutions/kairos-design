'use client';

import type { ReactNode } from 'react';

export type SortDirection = 'ascending' | 'descending';

export interface SortHeaderProps {
  label: ReactNode;
  /** `null` when this is not the sorted column. */
  direction: SortDirection | null;
  onSort: () => void;
  align?: 'left' | 'right';
  className?: string;
}

/**
 * A sortable table header cell.
 *
 * The whole cell is the target, so the button fills it and inherits the header
 * treatment rather than sitting beside the label as a separate icon. The caret
 * is drawn in CSS: nothing at rest on an unsorted column, a muted caret on
 * hover and focus, and a solid one on the sorted column. A resting glyph on
 * every column turns the header row into a row of arrows.
 */
export default function SortHeader({
  label,
  direction,
  onSort,
  align = 'left',
  className,
}: SortHeaderProps) {
  return (
    <th aria-sort={direction ?? 'none'} className={className} data-align={align === 'right' ? 'right' : undefined}>
      <button type="button" className="kairos-sort-header" onClick={onSort}>
        {label}
      </button>
    </th>
  );
}

/**
 * Announces the current sort.
 *
 * A sort that exists only as a redrawn table is invisible to a screen reader,
 * so the change is spoken as well as shown.
 */
export function SortAnnouncer({
  sort,
  labels,
}: {
  sort: { key: string; direction: SortDirection } | null;
  labels: Record<string, string>;
}) {
  const message = sort
    ? `Sorted by ${labels[sort.key] ?? sort.key}, ${sort.direction === 'ascending' ? 'ascending' : 'descending'}.`
    : 'Sorted in the default order.';

  return (
    <p role="status" aria-live="polite" className="kairos-visually-hidden">
      {message}
    </p>
  );
}
