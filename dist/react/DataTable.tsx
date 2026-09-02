'use client';

import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnVisibilityState,
  type IdentifiedColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortFn,
  type SortingState,
  type Updater,
} from '@tanstack/react-table';
import Button from './Button';
import EmptyState from './EmptyState';
import OverflowMenu from './OverflowMenu';
import SortHeader, { type SortDirection, SortAnnouncer } from './SortHeader';
import { compare, nextSort, type Sortable } from './sort';

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

/**
 * The table engine.
 *
 * TanStack Table is headless: it holds the row model and the state and emits no
 * markup and no CSS, so every `kairos-*` class survives it. See
 * `docs/adr/0006-take-table-behaviour-from-tanstack-table.md`. Features are
 * opted into one at a time, so a screen that only sorts carries only sorting.
 *
 * `compare` is registered here rather than replaced. Its blanks-last rule is a
 * defect this repo already found and fixed in Paykit, where a descending sort
 * on a column with blanks put a block of dashes at the top, and the library's
 * default comparator would reintroduce it.
 */
const kairosSortFn: SortFn<any, any> = (rowA, rowB, columnId) =>
  compare(rowA.getValue(columnId) as Sortable, rowB.getValue(columnId) as Sortable);

const kairosFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { kairos: kairosSortFn },
  // Global filtering is built on the per-column machinery, so the column
  // feature comes with it even though no Kairos table filters one column yet.
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  columnVisibilityFeature,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
});

/**
 * How many records a page holds when a screen does not say.
 *
 * Twenty-five is what fits a laptop viewport without the header scrolling out
 * of sight, and it is small enough that the count in the sentence below the
 * list stays a number a person can hold.
 */
const DEFAULT_PAGE_SIZE = 25;

type KairosFeatures = typeof kairosFeatures;

/**
 * The engine's view of a row, which is opaque.
 *
 * TanStack constrains a row to `Record<string, any>`, and a TypeScript
 * interface — the shape every Kairos screen declares its rows with — does not
 * satisfy that without an index signature. Constraining `Row` here would push
 * that requirement out to every call site for no benefit, because the engine
 * never reads a row itself: `accessorFn`, `getRowId` and `cell` below are the
 * only things that touch one, and each is the caller's own function. So the
 * rows go in under this view and come back out as `Row` at those four points,
 * which are the only casts in the file.
 */
type RowView = Record<string, unknown>;

/**
 * The column options this component decides, which a call site cannot.
 *
 * `sortFn` and `sortUndefined` carry the comparator and the blanks-last rule.
 * `enableSorting` follows from `sortValue` and is not a separate flag, because
 * a header advertising a sort the column cannot perform is the bug that pairing
 * prevents. The rest of `ColumnDef` — `size`, `filterFn`, `enableHiding` and
 * the others — passes straight through.
 */
type ReservedColumnOptions =
  | 'id'
  | 'header'
  | 'cell'
  | 'accessorFn'
  | 'enableSorting'
  | 'sortFn'
  | 'sortUndefined';

export interface Column<Row>
  extends Omit<IdentifiedColumnDef<KairosFeatures, RowView, unknown>, ReservedColumnOptions> {
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
  /**
   * Hidden on the mobile card. The table still shows it.
   *
   * This is the only way a column leaves a card. The card wraps every meta
   * value it is given and never drops one on its own, because dropping means
   * choosing which values matter, and the component cannot know — the guess is
   * wrong exactly when the reader is looking for the value it dropped. Before
   * `0.3.1` the card truncated instead, and on the Paykit list at 390px three
   * of five cards lost their due date to the width of the customer name ahead
   * of it.
   *
   * The cost is height. Two meta columns fit one line; four run to five or six
   * lines and a card grows from 80px to 184px, so a phone screen holds four
   * records instead of six. See `Components/DataTable/Four meta columns`.
   *
   * That is the intended failure mode. A card that has grown tall is visible in
   * the workshop and fixed by one flag here; a card that has silently dropped
   * its third and fourth values looks correct and is not. Reach for this when
   * the card gets tall, and reach for it deliberately.
   */
  hideOnCard?: boolean;
}

/**
 * A count a person reads. Four figures is where `1250` stops looking like a
 * count and starts looking like a reference, and a list of that size is
 * exactly the one this pager exists for.
 */
function count(value: number): string {
  return value.toLocaleString('en');
}

/**
 * A blank is absent, not small.
 *
 * The engine's `sortUndefined: 'last'` keeps `undefined` at the bottom in both
 * directions, which is the behaviour this repo settled on, and it recognises
 * only `undefined`. Mapping `null` and the empty string onto it here is what
 * makes an empty due date and a missing one sort the same way.
 */
function sortableValue(value: Sortable): Sortable {
  return value === null || value === undefined || value === '' ? undefined : value;
}

function toColumnDef<Row>(column: Column<Row>): ColumnDef<KairosFeatures, RowView, unknown> {
  const { key, label, role, cell, sortValue, hideOnCard, ...passthrough } = column;

  return {
    // An identifier cannot be hidden and neither can the actions column: one
    // is the link that opens the record and the other is everything else the
    // row can do, so a table with either hidden is a list you cannot use. A
    // call site can still turn hiding off for any other column by passing
    // `enableHiding: false`, which is why this sits before the spread.
    enableHiding: role !== 'identifier' && role !== 'actions',
    ...passthrough,
    id: key,
    header: label,
    ...(sortValue
      ? {
          accessorFn: (view: RowView) => sortableValue(sortValue(view as Row)),
          enableSorting: true,
          sortFn: 'kairos' as const,
          sortUndefined: 'last' as const,
        }
      : { enableSorting: false }),
  };
}

/**
 * A native checkbox that can also be indeterminate.
 *
 * `indeterminate` is a DOM property and not an attribute, so React cannot set
 * it from JSX and a ref is the only way to reach it. The dash it draws is the
 * difference between "none of these rows" and "some of these rows", and
 * without it a half-selected page looks identical to an empty one.
 */
function SelectionCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  label: string;
}) {
  const ref = useCallback(
    (node: HTMLInputElement | null) => {
      if (node) node.indeterminate = Boolean(indeterminate);
    },
    [indeterminate]
  );

  return (
    <input ref={ref} type="checkbox" checked={checked} onChange={onChange} aria-label={label} />
  );
}

/**
 * What a screen is handed when records are selected.
 *
 * `rows` is the caller's own rows, not the engine's view of them, and it holds
 * every selected record rather than the selected part of the page in view.
 */
export interface Selection<Row> {
  rows: Row[];
  count: number;
  clear: () => void;
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
  /** Records per page. 25 unless a screen has a reason. */
  pageSize?: number;
  /**
   * The rows are one page fetched from somewhere else, and this component is
   * not to slice them.
   *
   * Reachable rather than specified. Every Kairos table today fits in memory,
   * so a server-side contract would be a guess: the app also needs a way to
   * hear that the page changed and to refetch, and what that looks like is the
   * decision the first app with a large table gets to make. Turning this on
   * without `rowCount` leaves the sentence counting the page it can see.
   */
  manualPagination?: boolean;
  /** The total behind a `manualPagination` table, which it alone knows. */
  rowCount?: number;
  /**
   * Records can be picked out and acted on together.
   *
   * A prop and not a column. A call site that can declare a selection column
   * can declare two of them, or put one last, and both have happened. The
   * column this renders is always first and always the same width.
   *
   * Selection is a table affordance. Below 768px the list renders as record
   * cards, and what a card renders is settled by `record-card`, so a card
   * carries no checkbox and this prop does nothing there.
   */
  selectable?: boolean;
  /** Called with the whole selection whenever it changes. */
  onSelectionChange?: (selection: Selection<Row>) => void;
  /**
   * What the screen does with a selection, rendered into the bar above the
   * list. A slot, not a set of props: this component states the count and
   * ranks nothing, so the arrangement of the actions stays one decision made
   * in one place rather than a second one made here.
   */
  selectionActions?: (selection: Selection<Row>) => ReactNode;
  /**
   * A search term narrowing the list.
   *
   * Controlled from outside, because the control that collects it —
   * `FilterBar` — sits above the table and usually beside a segmented filter
   * and a date range the table knows nothing about. A column is searched if
   * it declares a `sortValue`, on the same rule that decides whether it can be
   * sorted: that value is the only thing a column says about a row other than
   * how to draw it.
   */
  globalFilter?: string;
  /** Clearing the term from inside the narrowed-to-nothing state. */
  onGlobalFilterChange?: (value: string) => void;
  /**
   * Something outside this component is narrowing the list too — a segmented
   * filter, a date range — so an empty result is a filtered result even when
   * `globalFilter` is blank.
   *
   * A narrowed list with nothing in it and a list with nothing in it are
   * different outcomes, and the way out of each is different: one clears a
   * filter, the other creates the first record. They must not share a
   * sentence, and the easy implementation gives them one.
   */
  filterActive?: boolean;
  /** What the narrowed-to-nothing state's clear control does. */
  onClearFilters?: () => void;
  /**
   * The reader can hide columns they do not need, from a menu in the last
   * header cell.
   *
   * A menu and not a new control: the header cell of an actions column is
   * already blank, so this is the one place on a table where something can be
   * added without taking room from the data. Every column can be hidden except
   * the identifier and the actions.
   */
  hideableColumns?: boolean;
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
  pageSize = DEFAULT_PAGE_SIZE,
  manualPagination,
  rowCount,
  selectable,
  onSelectionChange,
  selectionActions,
  globalFilter,
  onGlobalFilterChange,
  filterActive,
  onClearFilters,
  hideableColumns,
}: DataTableProps<Row>) {
  // The user's override, separate from the screen's default, so the third
  // press on a header can drop back to the default rather than to no sort.
  // The cycle is ours: the library's own toggle is a two-state flip, which
  // leaves a user who sorted by mistake no way back short of reloading.
  const [override, setOverride] = useState<{ key: string; direction: SortDirection } | null>(null);
  const sort = override ?? defaultSort ?? null;

  // The page is ours and the size is the screen's, so a screen that changes
  // its page size does not have to remount the table to be believed.
  const [pageIndex, setPageIndex] = useState(0);

  // Keyed by the caller's own row id, which is what makes the selection
  // survive a sort and a page change: the rows move, their ids do not.
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Which columns the reader has hidden. Theirs, not the screen's: the screen
  // says which columns exist and in what order, and this says which of them
  // this person is looking at right now.
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});

  const columnDefs = useMemo(() => columns.map(toColumnDef), [columns]);
  const sorting: SortingState = useMemo(
    () => (sort ? [{ id: sort.key, desc: sort.direction === 'descending' }] : []),
    [sort]
  );

  // A page holds at least one record. `pageSize={rows.length}` is the
  // documented way to render every row and show no pager, and on an empty
  // list that reads as zero, which the engine divides by.
  const pagination = useMemo(
    () => ({ pageIndex, pageSize: Math.max(1, pageSize) }),
    [pageIndex, pageSize]
  );

  const table = useTable<KairosFeatures, RowView>({
    features: kairosFeatures,
    data: rows as unknown as RowView[],
    columns: columnDefs,
    // The row's identity is the caller's, so a row keeps its key across a sort.
    getRowId: (view: RowView) => getKey(view as Row),
    state: { sorting, pagination, rowSelection, columnVisibility, globalFilter },
    // The engine resets the page itself when the list under it changes — a
    // re-sort or a narrower filter — and it does that through this handler, so
    // holding the state out here without it would swallow the reset and leave
    // a reader on page 4 of a list that now has two.
    onPaginationChange: (updater: Updater<PaginationState>) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      setPageIndex(next.pageIndex);
    },
    manualPagination,
    rowCount,
    // Off unless the screen asked, so a table that does not select cannot be
    // read as holding an empty selection.
    enableRowSelection: Boolean(selectable),
    onRowSelectionChange: (updater: Updater<RowSelectionState>) => {
      setRowSelection((current) => (typeof updater === 'function' ? updater(current) : updater));
    },
    onColumnVisibilityChange: (updater: Updater<ColumnVisibilityState>) => {
      setColumnVisibility((current) => (typeof updater === 'function' ? updater(current) : updater));
    },
    // A substring, case-insensitively, across every column that states a
    // comparable value. Not the library's fuzzy default: a fuzzy match on a
    // list of invoice references returns rows a person did not ask for and
    // cannot see the reason for.
    globalFilterFn: filterFn_includesString,
    onGlobalFilterChange: (updater: Updater<string>) => {
      const next = typeof updater === 'function' ? updater(globalFilter ?? '') : updater;
      onGlobalFilterChange?.(next);
    },
  });

  function toggle(key: string) {
    setOverride((current) => nextSort(current ?? defaultSort ?? null, key, defaultSort ?? null));
  }

  // The whole selection, not the part of it on the page in view. A reader who
  // ticks three invoices on page 1 and pages on is still holding three.
  const selectedRows = table.getSelectedRowModel().rows.map((modelRow) => modelRow.original as Row);
  const clearSelection = useCallback(() => setRowSelection({}), []);
  const selection: Selection<Row> = {
    rows: selectedRows,
    count: selectedRows.length,
    clear: clearSelection,
  };

  // The callback is reached through a ref rather than named as a dependency.
  // Every call site will write an inline arrow, which is a new function on
  // every render, and depending on it would turn "the selection changed" into
  // "this component rendered" and fire the callback on both.
  const latest = useRef({ onSelectionChange, selection });
  latest.current = { onSelectionChange, selection };
  useEffect(() => {
    latest.current.onSelectionChange?.(latest.current.selection);
  }, [rowSelection]);

  // No records at all: the screen's own empty state, which offers the way to
  // make the first one.
  if (rows.length === 0) return <>{empty}</>;

  // Narrowed to nothing, which is a different outcome. Different words, and
  // the way out is to widen the filter rather than to create a record. The
  // easy implementation renders `empty` here too, and then a reader who
  // mistyped a search is invited to create an invoice.
  const clearFilters =
    onClearFilters ?? (onGlobalFilterChange ? () => onGlobalFilterChange('') : undefined);
  const narrowed = Boolean(globalFilter) || Boolean(filterActive);

  if (narrowed && table.getFilteredRowModel().rows.length === 0) {
    return (
      <EmptyState
        message={`No ${label.toLowerCase()} match the current filter.`}
        action={
          clearFilters ? (
            <Button variant="secondary" onClick={clearFilters}>
              Clear filter
            </Button>
          ) : null
        }
      />
    );
  }

  const byKey = new Map(columns.map((column) => [column.key, column]));
  // The engine's leaf columns, in the order the array declared them. Reading
  // the order from here rather than from `columns` is what lets a hidden column
  // drop out without the remaining ones moving.
  const leafColumns = table
    .getVisibleLeafColumns()
    .map((leaf) => byKey.get(leaf.id))
    .filter((column): column is Column<Row> => column !== undefined);
  const modelRows = table.getRowModel().rows;

  const labels = Object.fromEntries(columns.map((c) => [c.key, c.label]));
  const identifier = columns.find((c) => c.role === 'identifier');
  const status = columns.find((c) => c.role === 'status');
  const actions = columns.find((c) => c.role === 'actions');
  const cardMeta = columns.filter(
    (c) => !c.hideOnCard && (c.role === 'meta' || c.role === undefined)
  );
  const cardFigure = columns.find((c) => c.role === 'figure' && !c.hideOnCard);

  // What a row's checkbox is called. The identifier column already renders the
  // record's name, but it renders it as a link and not as a string, so the
  // name comes from that column's `sortValue` — the one place a column states
  // its value as something comparable. A row whose identifier has no sort
  // value falls back to its key, which is at worst the id the URL uses.
  // The columns a reader may hide, in declared order, with the label saying
  // what pressing it does rather than what the current state is. `Hide
  // Customer` / `Show Customer` reads as an action and needs no tick beside
  // it; when the menu moves to Radix these become checkbox items and the
  // labels lose the verb.
  const columnItems = table
    .getAllLeafColumns()
    .filter((leaf) => leaf.getCanHide())
    .map((leaf) => ({
      label: `${leaf.getIsVisible() ? 'Hide' : 'Show'} ${byKey.get(leaf.id)?.label ?? leaf.id}`,
      onSelect: () => leaf.toggleVisibility(),
    }));

  const rowName = (row: Row): string => {
    const value = identifier?.sortValue?.(row);
    return typeof value === 'string' || typeof value === 'number' ? String(value) : getKey(row);
  };

  const total = table.getRowCount();
  const pageCount = table.getPageCount();
  // `-1` is the engine saying a server holds the total and has not said what
  // it is, which only happens on the manual path. One page needs no control:
  // a pager that cannot go anywhere still takes a row of the screen and still
  // reads as something to press.
  const paged = pageCount > 1 || pageCount === -1;
  const firstShown = pageIndex * pagination.pageSize + 1;
  const lastShown = firstShown + modelRows.length - 1;

  return (
    <>
      <SortAnnouncer sort={sort} labels={labels} />

      {/* The bar over a list with a selection.

          It states the count and holds a slot. It does not rank the actions
          inside that slot and does not arrange them, because action
          composition is one decision made in one place and this is not that
          place. When `ActionSet` lands it renders here.

          Clear sits with the count rather than with the actions: it acts on
          the selection this bar is about, the way a dialog's close button acts
          on the dialog, and it is not one of the things the screen does with
          the records. */}
      {selectable && selection.count > 0 ? (
        <div className="kairos-bulk-bar">
          <span className="kairos-bulk-bar-count" role="status">
            {`${count(selection.count)} selected`}
          </span>
          <div className="kairos-bulk-bar-actions">
            {selectionActions ? selectionActions(selection) : null}
            <Button variant="tertiary" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      {/* Three classes, not two. `kairos-panel` paints the border, the ground,
          the radius, and the stamp; `kairos-table-panel` removes the padding
          and clips the header band to the radius; `kairos-desktop-table` hides
          the whole thing below 768px in favour of the cards. Dropping the
          first is what left every table in the registry with no container. */}
      <div className="kairos-panel kairos-table-panel kairos-desktop-table">
        <div className="kairos-table-wrap">
          <table className="kairos-table" aria-label={label}>
            <thead>
              <tr>
                {selectable ? (
                  <th className="kairos-selection-cell">
                    <SelectionCheckbox
                      checked={table.getIsAllPageRowsSelected()}
                      // Some but not all: the dash that tells a half-selected
                      // page apart from an empty one. The library's `some`
                      // includes `all`, so the difference is taken here.
                      indeterminate={
                        table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
                      }
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                      // What it selects, said plainly: this page, not the
                      // whole list, which is a different promise.
                      label={`Select all ${label.toLowerCase()} on this page`}
                    />
                  </th>
                ) : null}
                {leafColumns.map((column) =>
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
                {hideableColumns ? (
                  <th className="kairos-columns-cell" scope="col">
                    <span className="kairos-visually-hidden">Columns</span>
                    <OverflowMenu label={`${label} columns`} items={columnItems} />
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {modelRows.map((modelRow) => (
                // The stylesheet already reads this attribute; nothing set it
                // until now, which is why the selected-row ground shipped for
                // three releases and never painted.
                <tr key={modelRow.id} aria-selected={selectable ? modelRow.getIsSelected() : undefined}>
                  {selectable ? (
                    <td className="kairos-selection-cell">
                      <SelectionCheckbox
                        checked={modelRow.getIsSelected()}
                        onChange={modelRow.getToggleSelectedHandler()}
                        label={`Select ${rowName(modelRow.original as Row)}`}
                      />
                    </td>
                  ) : null}
                  {leafColumns.map((column) => (
                    <td
                      key={column.key}
                      className={column.role === 'figure' ? 'kairos-align-right kairos-figure' : undefined}
                    >
                      {column.cell(modelRow.original as Row)}
                    </td>
                  ))}
                  {/* The rail under the columns menu. Empty because the menu
                      is about the table, not about the row. */}
                  {hideableColumns ? <td className="kairos-columns-cell" /> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Below 768px. Condensed on purpose: scanning is what the list is for,
          and reading is what the detail screen is for. */}
      <div className="kairos-record-list">
        {modelRows.map((modelRow) => (
          <div className="kairos-record-card" key={modelRow.id}>
            <span className="kairos-record-card-top">
              <span className="kairos-record-card-identifier">
                {identifier ? identifier.cell(modelRow.original as Row) : null}
              </span>
              {status ? status.cell(modelRow.original as Row) : null}
            </span>
            <span className="kairos-record-card-bottom">
              <span className="kairos-record-card-meta">
                {cardMeta.map((column) => (
                  <span key={column.key}>{column.cell(modelRow.original as Row)}</span>
                ))}
              </span>
              {cardFigure ? (
                <span className="kairos-record-card-figure kairos-figure">
                  {cardFigure.cell(modelRow.original as Row)}
                </span>
              ) : null}
            </span>
            {actions ? actions.cell(modelRow.original as Row) : null}
          </div>
        ))}
      </div>

      {/* One pager for both renderings, under both of them.

          The sentence is the live region rather than a hidden twin of itself.
          Sorting needs `SortAnnouncer` because a re-ordered table says nothing
          a screen reader can read; a page change already writes its new
          position on the screen, so the region that carries it is the sentence
          a sighted reader is looking at. A second, hidden copy would put the
          same words in the accessibility tree twice. */}
      {paged ? (
        <nav className="kairos-pagination" aria-label={`${label} pages`}>
          <p className="kairos-muted" role="status" aria-live="polite">
            {`Showing ${count(firstShown)} to ${count(lastShown)} of ${count(total)}`}
          </p>
          <div className="kairos-pagination-controls">
            <Button
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </nav>
      ) : null}
    </>
  );
}
