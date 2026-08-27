'use client';

import { type ReactNode, useMemo, useState } from 'react';
import SortHeader, { type SortDirection, SortAnnouncer } from './SortHeader';
import { nextSort, sortRows, type Sortable } from './sort';

/**
 * What a column is for, which is what lets the mobile card build itself.
 *
 * Paykit's list screens were six near-identical blocks of card markup, one per
 * screen, which is why the same defect — a card holding every field plus an
 * Open button — had to be fixed in six places. Declaring the role once means
 * the table and the card are two renderings of one description.
 *
 *   identifier  the record's name, and the link that opens it. Exactly one.
 *   status      the state chip. At most one.
 *   figure      money or a count. Right-aligned, tabular, never wrapped.
 *   meta        supporting detail: a reference, a date.
 *   actions     the overflow menu. Never a rail of buttons.
 *
 * The array's order is the table's order, and it runs down the hierarchy the
 * user reads by: the identifier, then the secondary identifiers that separate
 * two similar names, then dates and statuses, then figures, then actions. The
 * left edge answers which record this is; the right edge answers what to do
 * about it. Kairos tables used to lead with the status chip, which spends the
 * strongest column on the one field the State Palette makes findable anywhere.
 *
 * Where that leaves the order open, ask rather than guess: a column belonging
 * to no rung, or two tied on one rung with no leader. The default sort and the
 * mobile card both follow the array, so the order is expensive to revisit.
 */
export type ColumnRole = 'identifier' | 'status' | 'figure' | 'meta' | 'actions';

export interface Column<Row> {
  key: string;
  label: string;
  role?: ColumnRole;
  cell: (row: Row) => ReactNode;
  /**
   * The value to sort on. Its absence is what makes a column unsortable —
   * there is no separate flag, because a sortable column with no comparable
   * value is the bug this prevents.
   */
  sortValue?: (row: Row) => Sortable;
  /** Hidden on the mobile card. The table still shows it. */
  hideOnCard?: boolean;
}

export interface DataTableProps<Row> {
  rows: Row[];
  columns: Array<Column<Row>>;
  getKey: (row: Row) => string;
  /** One plain sentence plus the screen's primary action. */
  empty: ReactNode;
  /** The column sorted on first load, and its direction. */
  defaultSort?: { key: string; direction: SortDirection };
  /** Names the table for a screen reader: "Invoices". */
  label: string;
}

/**
 * Repeating records: a table on desktop, record cards below 768px.
 *
 * Both are rendered and CSS chooses between them. Deciding in JavaScript would
 * mean measuring the viewport in an effect, which renders the desktop table
 * first on a phone and swaps it a frame later, and mismatches on the server.
 */
export default function DataTable<Row>({
  rows,
  columns,
  getKey,
  empty,
  defaultSort,
  label,
}: DataTableProps<Row>) {
  // The user's override, separate from the screen's default, so the third
  // press on a header can drop back to the default rather than to no sort.
  const [override, setOverride] = useState<{ key: string; direction: SortDirection } | null>(null);
  const sort = override ?? defaultSort ?? null;

  const sorted = useMemo(
    () => sortRows(rows, sort, (key) => columns.find((c) => c.key === key)?.sortValue),
    [rows, columns, sort]
  );

  function toggle(key: string) {
    setOverride((current) => nextSort(current ?? defaultSort ?? null, key, defaultSort ?? null));
  }

  if (rows.length === 0) return <>{empty}</>;

  const labels = Object.fromEntries(columns.map((c) => [c.key, c.label]));
  const identifier = columns.find((c) => c.role === 'identifier');
  const status = columns.find((c) => c.role === 'status');
  const actions = columns.find((c) => c.role === 'actions');
  const cardMeta = columns.filter(
    (c) => !c.hideOnCard && (c.role === 'meta' || c.role === undefined)
  );
  const cardFigure = columns.find((c) => c.role === 'figure' && !c.hideOnCard);

  return (
    <>
      <SortAnnouncer sort={sort} labels={labels} />

      <div className="kairos-table-panel kairos-desktop-table">
        <div className="kairos-table-wrap">
          <table className="kairos-table" aria-label={label}>
            <thead>
              <tr>
                {columns.map((column) =>
                  column.sortValue ? (
                    <SortHeader
                      key={column.key}
                      label={column.label}
                      direction={sort?.key === column.key ? sort.direction : null}
                      onSort={() => toggle(column.key)}
                      align={column.role === 'figure' ? 'right' : 'left'}
                    />
                  ) : (
                    <th
                      key={column.key}
                      scope="col"
                      data-align={column.role === 'figure' ? 'right' : undefined}
                    >
                      {/* An actions column needs no visible heading, but the
                          column still needs a name for a screen reader reading
                          the row. */}
                      {column.role === 'actions' ? (
                        <span className="kairos-visually-hidden">{column.label}</span>
                      ) : (
                        column.label
                      )}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={getKey(row)}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={column.role === 'figure' ? 'kairos-align-right kairos-figure' : undefined}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Below 768px. Condensed on purpose: scanning is what the list is for,
          and reading is what the detail screen is for. */}
      <div className="kairos-record-list">
        {sorted.map((row) => (
          <div className="kairos-record-card" key={getKey(row)}>
            <span className="kairos-record-card-top">
              <span className="kairos-record-card-identifier">
                {identifier ? identifier.cell(row) : null}
              </span>
              {status ? status.cell(row) : null}
            </span>
            <span className="kairos-record-card-bottom">
              <span className="kairos-record-card-meta">
                {cardMeta.map((column) => (
                  <span key={column.key}>{column.cell(row)}</span>
                ))}
              </span>
              {cardFigure ? (
                <span className="kairos-record-card-figure kairos-figure">{cardFigure.cell(row)}</span>
              ) : null}
            </span>
            {actions ? actions.cell(row) : null}
          </div>
        ))}
      </div>
    </>
  );
}
