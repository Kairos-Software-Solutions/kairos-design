import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import DataTable, { type Column } from '../../dist/react/DataTable';
import Button from '../../dist/react/Button';
import StateChip from '../../dist/react/StateChip';
import EmptyState from '../../dist/react/EmptyState';
import ConfirmDialog from '../../dist/react/ConfirmDialog';
import FilterBar, { type FilterState } from '../../dist/react/FilterBar';
import OverflowMenu from '../../dist/react/OverflowMenu';
import { formatMoney } from '../../dist/format/money';
import { formatDate } from '../../dist/format/dates';
import { accounts, invoices, manyInvoices, type Account, type Invoice } from '../fixtures';

/**
 * Repeating records: a table on desktop, record cards below 768px.
 *
 * This is the component the whole registry is measured by, because a list
 * screen is what a Kairos tool mostly is. Resize to the Card viewport in the
 * toolbar to see the table swap; both renderings are in the DOM at once and
 * CSS chooses, so there is no frame where the wrong one is showing.
 */
const meta = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>;

export default meta;

const invoiceColumns: Array<Column<Invoice>> = [
  {
    key: 'reference',
    label: 'Reference',
    role: 'identifier',
    cell: (row) => <a className="kairos-record-link" href="#">{row.reference}</a>,
    sortValue: (row) => row.reference,
  },
  { key: 'customer', label: 'Customer', role: 'meta', cell: (row) => row.customer, sortValue: (row) => row.customer.toLowerCase() },
  { key: 'due', label: 'Due', role: 'meta', cell: (row) => formatDate(row.due), sortValue: (row) => row.due },
  { key: 'state', label: 'Status', role: 'status', cell: (row) => <StateChip variant={row.state}>{row.state}</StateChip>, sortValue: (row) => row.state },
  { key: 'total', label: 'Total', role: 'figure', cell: (row) => formatMoney(row.total, 'TTD'), sortValue: (row) => row.total },
  {
    key: 'actions',
    label: 'Actions',
    role: 'actions',
    cell: (row) => (
      <OverflowMenu
        label={row.reference}
        items={[
          { label: 'Record payment', onSelect: () => {} },
          { label: 'Duplicate', onSelect: () => {} },
          { label: 'Delete', destructive: true, onSelect: () => {} },
        ]}
      />
    ),
  },
];

const accountColumns: Array<Column<Account>> = [
  { key: 'email', label: 'Email', role: 'identifier', cell: (row) => <a className="kairos-record-link" href="#">{row.email}</a>, sortValue: (row) => row.email },
  { key: 'domain', label: 'Domain', role: 'meta', cell: (row) => row.domain, sortValue: (row) => row.domain },
  { key: 'usage', label: 'Usage', role: 'figure', cell: (row) => row.usage },
  { key: 'quota', label: 'Quota', role: 'figure', cell: (row) => row.quota },
];

/**
 * The full width of the component: an identifier that links, a status chip, a
 * date, a right-aligned figure, and an overflow menu.
 */
export const Invoices: StoryObj = {
  render: () => (
    <DataTable
      label="Invoices"
      rows={invoices}
      columns={invoiceColumns}
      getKey={(row) => row.id}
      defaultSort={{ key: 'due', direction: 'descending' }}
      empty={<EmptyState message="No invoices yet." action={<Button variant="primary">New invoice</Button>} />}
    />
  ),
};

/** The Mailkit accounts screen, which is the table this workshop was built to compare against. */
export const Accounts: StoryObj = {
  render: () => (
    <DataTable
      label="Accounts"
      rows={accounts}
      columns={accountColumns}
      getKey={(row) => row.id}
      defaultSort={{ key: 'email', direction: 'ascending' }}
      empty={<EmptyState message="No accounts yet." />}
    />
  ),
};

/** One row. The table still has to hold its own edges. */
export const SingleRow: StoryObj = {
  render: () => (
    <DataTable
      label="Invoices"
      rows={invoices.slice(0, 1)}
      columns={invoiceColumns}
      getKey={(row) => row.id}
      empty={<EmptyState message="No invoices yet." />}
    />
  ),
};

/** No rows. The table renders nothing and the empty state carries the screen. */
export const Empty: StoryObj = {
  render: () => (
    <DataTable
      label="Invoices"
      rows={[]}
      columns={invoiceColumns}
      getKey={(row) => row.id}
      empty={<EmptyState message="No invoices yet. The first one you send will show here." action={<Button variant="primary">New invoice</Button>} />}
    />
  ),
};

/**
 * Four meta columns, which is where the card's wrap-rather-than-truncate rule
 * is actually tested. Two values fit a line and settle the easy case; four is
 * how tall a card gets when every column insists on being kept, and it is the
 * case that decides whether `hideOnCard` is advice or a requirement.
 *
 * Compare against `Invoices` at the same width.
 */
const fourMetaColumns: Array<Column<Invoice>> = [
  {
    key: 'reference',
    label: 'Reference',
    role: 'identifier',
    cell: (row) => <a className="kairos-record-link" href="#">{row.reference}</a>,
    sortValue: (row) => row.reference,
  },
  { key: 'customer', label: 'Customer', role: 'meta', cell: (row) => row.customer, sortValue: (row) => row.customer.toLowerCase() },
  { key: 'issued', label: 'Issued', role: 'meta', cell: (row) => formatDate(row.issued), sortValue: (row) => row.issued },
  { key: 'due', label: 'Due', role: 'meta', cell: (row) => formatDate(row.due), sortValue: (row) => row.due },
  { key: 'terms', label: 'Terms', role: 'meta', cell: () => 'Net 30' },
  { key: 'state', label: 'Status', role: 'status', cell: (row) => <StateChip variant={row.state}>{row.state}</StateChip>, sortValue: (row) => row.state },
  { key: 'total', label: 'Total', role: 'figure', cell: (row) => formatMoney(row.total, 'TTD'), sortValue: (row) => row.total },
];

export const FourMetaColumns: StoryObj = {
  render: () => (
    <DataTable
      label="Invoices"
      rows={invoices}
      columns={fourMetaColumns}
      getKey={(row) => row.id}
      defaultSort={{ key: 'due', direction: 'descending' }}
      empty={<EmptyState message="No invoices yet." />}
    />
  ),
};

/**
 * The sort cycle, pressed rather than described.
 *
 * Three states on any other column — ascending, descending, back to the
 * screen's default — and two on the default column itself, where the third
 * state would be the one it is already in. The press that used to do nothing
 * is the first one on a column the screen already sorts descending, which is
 * every Paykit list screen.
 */
export const SortCycle: StoryObj = {
  render: () => (
    <DataTable
      label="Invoices"
      rows={invoices}
      columns={invoiceColumns}
      getKey={(row) => row.id}
      defaultSort={{ key: 'due', direction: 'descending' }}
      empty={<EmptyState message="No invoices yet." />}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = (name: string) =>
      canvas.getByRole('button', { name }).closest('th') as HTMLTableCellElement;
    const press = (name: string) => userEvent.click(canvas.getByRole('button', { name }));

    await expect(header('Due')).toHaveAttribute('aria-sort', 'descending');

    await press('Reference');
    await expect(header('Reference')).toHaveAttribute('aria-sort', 'ascending');
    await expect(header('Due')).toHaveAttribute('aria-sort', 'none');

    await press('Reference');
    await expect(header('Reference')).toHaveAttribute('aria-sort', 'descending');

    // The way back from a press made by mistake.
    await press('Reference');
    await expect(header('Reference')).toHaveAttribute('aria-sort', 'none');
    await expect(header('Due')).toHaveAttribute('aria-sort', 'descending');

    // The screen's own column: it reverses rather than sitting still.
    await press('Due');
    await expect(header('Due')).toHaveAttribute('aria-sort', 'ascending');

    await press('Due');
    await expect(header('Due')).toHaveAttribute('aria-sort', 'descending');
  },
};

/**
 * A hundred invoices, four pages of twenty-five.
 *
 * The story the registry did not have. Every list fixture here held five rows,
 * so pagination could be missing from 197 classes and nobody could see it, and
 * a business with three hundred invoices got three hundred rows.
 *
 * The pager sits under both renderings rather than inside the panel, so the
 * cards below 768px page the same way the table does. Resize to check it.
 */
export const Paged: StoryObj = {
  render: () => (
    <DataTable
      label="Invoices"
      rows={manyInvoices}
      columns={invoiceColumns}
      getKey={(row) => row.id}
      defaultSort={{ key: 'due', direction: 'descending' }}
      empty={<EmptyState message="No invoices yet." />}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Two polite regions on this screen: the sort announcer and the pager.
    // The position is the pager's.
    const position = () => within(canvas.getByRole('navigation')).getByRole('status');

    await expect(position()).toHaveTextContent('Showing 1 to 25 of 100');
    await expect(canvas.getAllByRole('row')).toHaveLength(26); // the header row too
    await expect(canvas.getByRole('button', { name: 'Previous' })).toBeDisabled();

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(position()).toHaveTextContent('Showing 26 to 50 of 100');
    await expect(canvas.getByRole('button', { name: 'Previous' })).toBeEnabled();

    // Four pages, and the last one ends where the records do.
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(position()).toHaveTextContent('Showing 76 to 100 of 100');
    await expect(canvas.getByRole('button', { name: 'Next' })).toBeDisabled();

    // Re-sorting a list of 100 while reading page 4 has to put the reader at
    // the top of the new order, not at rows 76 to 100 of it.
    await userEvent.click(canvas.getByRole('button', { name: 'Total' }));
    await expect(position()).toHaveTextContent('Showing 1 to 25 of 100');
  },
};

/**
 * Five invoices and no pager. A control that cannot go anywhere still takes a
 * row of the screen and still reads as something to press.
 */
export const OnePage: StoryObj = {
  render: () => (
    <DataTable
      label="Invoices"
      rows={invoices}
      columns={invoiceColumns}
      getKey={(row) => row.id}
      empty={<EmptyState message="No invoices yet." />}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('navigation')).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Next' })).toBeNull();
  },
};


/**
 * Selection, which was styled and unreachable for three releases.
 *
 * `--kairos-row-selected` and the rule that reads it both shipped in 0.1.0;
 * nothing ever set `aria-selected`, so a selected row could not exist. The
 * checkbox comes from the `selectable` prop rather than a declared column,
 * so it is always first and there is never a second one.
 *
 * The selection survives a sort and a page change, because it is keyed by the
 * row id the call site supplies. Tick two invoices, press Next, come back.
 *
 * The bar states the count and holds a slot. It ranks nothing: the buttons in
 * it are the story's, and when `ActionSet` lands it renders into the same
 * slot rather than replacing the bar.
 */
export const Selectable: StoryObj = {
  render: function Render() {
    const [confirming, setConfirming] = useState<number | null>(null);

    return (
      <>
        <DataTable
          label="Invoices"
          rows={manyInvoices}
          columns={invoiceColumns}
          getKey={(row) => row.id}
          defaultSort={{ key: 'due', direction: 'descending' }}
          empty={<EmptyState message="No invoices yet." />}
          selectable
          selectionActions={(selection) => (
            <Button variant="danger" size="sm" onClick={() => setConfirming(selection.count)}>
              Delete
            </Button>
          )}
        />
        <ConfirmDialog
          open={confirming !== null}
          // The count, not the record. "Delete invoice?" in front of twelve
          // of them is the confirmation that gets pressed without reading.
          title={`Delete ${confirming} ${confirming === 1 ? 'invoice' : 'invoices'}?`}
          message="The invoices are removed for everyone. Payments already recorded against them are not."
          confirmLabel="Delete invoices"
          onConfirm={() => setConfirming(null)}
          onClose={() => setConfirming(null)}
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rowBox = (name: string) => canvas.getByRole('checkbox', { name: `Select ${name}` });
    const allBox = () =>
      canvas.getByRole('checkbox', { name: 'Select all invoices on this page' });

    // Nothing selected: no bar, and the header box is neither on nor dashed.
    await expect(canvas.queryByText('1 selected')).toBeNull();
    await expect(allBox()).not.toBeChecked();
    await expect(allBox()).toHaveProperty('indeterminate', false);

    await userEvent.click(rowBox('INV-2026-84'));
    await expect(canvas.getByText('1 selected')).toBeVisible();
    // The rule that shipped without a setter now has one.
    await expect(rowBox('INV-2026-84').closest('tr')).toHaveAttribute('aria-selected', 'true');
    // Some but not all, which has to look different from neither.
    await expect(allBox()).toHaveProperty('indeterminate', true);

    await userEvent.click(rowBox('INV-2026-54'));
    await expect(canvas.getByText('2 selected')).toBeVisible();

    // Paging away and back: the selection is still two, and still on the same
    // two records.
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(canvas.getByText('2 selected')).toBeVisible();
    await expect(allBox()).toHaveProperty('indeterminate', false);
    await userEvent.click(canvas.getByRole('button', { name: 'Previous' }));
    await expect(rowBox('INV-2026-84')).toBeChecked();

    // Select-all takes the page it names and no more.
    await userEvent.click(allBox());
    await expect(canvas.getByText('25 selected')).toBeVisible();
    await expect(allBox()).toBeChecked();

    // A destructive action against a selection names the count. The dialog
    // portals to the body, so it is off the canvas.
    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));
    await expect(await screen.findByText('Delete 25 invoices?')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(canvas.queryByText('25 selected')).toBeNull();
    await expect(rowBox('INV-2026-84')).not.toBeChecked();
  },
};

/**
 * The same table without `selectable`. No column, no bar, and no row carrying
 * an `aria-selected` a reader can never change.
 */
export const NotSelectable: StoryObj = {
  render: () => (
    <DataTable
      label="Invoices"
      rows={invoices}
      columns={invoiceColumns}
      getKey={(row) => row.id}
      empty={<EmptyState message="No invoices yet." />}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole('checkbox')).toHaveLength(0);
    for (const row of canvas.getAllByRole('row')) {
      await expect(row).not.toHaveAttribute('aria-selected');
    }
  },
};


/**
 * Narrowing, with the two empty results that must not read the same.
 *
 * `FilterBar` collects a filter state and hands it over; it narrows nothing
 * itself, because what "overdue" means belongs to the screen. The search term
 * goes to `DataTable`, which searches every column that declares a
 * `sortValue` — the same rule that decides whether a column can be sorted,
 * since that value is the only thing a column says about a row other than how
 * to draw it.
 *
 * Type a reference that does not exist. The copy says a filter is active and
 * offers the way out of it, which is not the same sentence as the one offering
 * to create the first invoice.
 */
export const Filtered: StoryObj = {
  render: function Render() {
    const [filters, setFilters] = useState<FilterState>({
      search: '',
      segments: { state: 'all' },
    });

    const state = filters.segments.state;
    const rows =
      state === 'all' ? manyInvoices : manyInvoices.filter((row) => row.state === state);

    return (
      <div className="kairos-stack kairos-stack--lg">
        <FilterBar
          label="Filter invoices"
          value={filters}
          onChange={setFilters}
          search={{ placeholder: 'Reference or customer' }}
          segments={[
            {
              key: 'state',
              label: 'Filter invoices by state',
              options: [
                { value: 'all', label: 'All' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'settled', label: 'Settled' },
              ],
            },
          ]}
        />
        <DataTable
          label="Invoices"
          rows={rows}
          columns={invoiceColumns}
          getKey={(row) => row.id}
          defaultSort={{ key: 'due', direction: 'descending' }}
          globalFilter={filters.search}
          onGlobalFilterChange={(search) => setFilters((f) => ({ ...f, search }))}
          // The segmented filter narrows `rows` before they arrive, so an
          // empty result is a filtered result even with the search box blank.
          filterActive={state !== 'all'}
          onClearFilters={() => setFilters({ search: '', segments: { state: 'all' } })}
          empty={
            <EmptyState
              message="No invoices yet. The first one you send will show here."
              action={<Button variant="primary">New invoice</Button>}
            />
          }
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('searchbox', { name: 'Search' });

    await expect(canvas.getByText('Showing 1 to 25 of 100')).toBeVisible();

    // A term narrows the list. Twenty of the hundred are Massy's, which fits
    // one page, so the pager goes away with them.
    await userEvent.type(search, 'Massy');
    await waitFor(() => expect(canvas.getAllByRole('row')).toHaveLength(21));
    await expect(canvas.queryByText('Ramdeen')).toBeNull();
    await expect(canvas.queryByRole('navigation')).toBeNull();

    // A term matching nothing: a filter is active, and the way out is offered.
    await userEvent.clear(search);
    await userEvent.type(search, 'INV-1900');
    await expect(
      await canvas.findByText('No invoices match the current filter.')
    ).toBeVisible();
    // Not the sentence the empty list uses.
    await expect(canvas.queryByText(/first one you send/)).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'New invoice' })).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: 'Clear filter' }));
    await waitFor(() => expect(canvas.getByText('Showing 1 to 25 of 100')).toBeVisible());
    await expect(search).toHaveValue('');

    // The segmented filter narrows without the search box at all.
    await userEvent.click(canvas.getByRole('button', { name: 'Settled' }));
    await waitFor(() => expect(canvas.getAllByRole('row')).toHaveLength(21));
  },
};

/**
 * A search burst filters once.
 *
 * The manifest called the debounce the missing half of this component. Five
 * keystrokes on a three-hundred-row list without it re-filter, re-sort and
 * re-page the whole thing five times on the way to one answer.
 */
export const SearchDebounce: StoryObj = {
  render: function Render() {
    const [filters, setFilters] = useState<FilterState>({ search: '', segments: {} });
    const [settled, setSettled] = useState<string[]>([]);

    return (
      <div className="kairos-stack kairos-stack--lg">
        <FilterBar
          label="Filter invoices"
          value={filters}
          onChange={(next) => {
            setFilters(next);
            setSettled((seen) => [...seen, next.search]);
          }}
          search={{ placeholder: 'Reference or customer' }}
        />
        <p className="kairos-meta">
          Terms the list filtered by: <span data-testid="settled">{settled.length}</span>
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Search' }), 'Massy');
    // Five characters, one filter.
    await waitFor(() => expect(canvas.getByTestId('settled')).toHaveTextContent('1'));
    await expect(canvas.getByRole('searchbox', { name: 'Search' })).toHaveValue('Massy');
  },
};

/**
 * Hiding a column, from a menu in the header rather than a control of its own.
 *
 * The rail on the right is the menu's, at the opposite end of the header from
 * the selection column. Its body cells are empty because the menu is about the
 * table and not about any row; hanging it off the last data column's header
 * would make a menu about the whole table read as a menu about `Total`.
 *
 * The identifier and the actions cannot be hidden: one is the link that opens
 * the record and the other is everything else the row can do.
 */
export const HideableColumns: StoryObj = {
  render: () => (
    <DataTable
      label="Invoices"
      rows={invoices}
      columns={invoiceColumns}
      getKey={(row) => row.id}
      defaultSort={{ key: 'due', direction: 'descending' }}
      empty={<EmptyState message="No invoices yet." />}
      hideableColumns
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const headers = () =>
      canvas.getAllByRole('columnheader').map((cell) => cell.textContent?.trim());

    await expect(headers()).toEqual([
      'Reference',
      'Customer',
      'Due',
      'Status',
      'Total',
      'Actions',
      'Columns',
    ]);

    // The menu portals to the body, so it is off the canvas.
    await userEvent.click(canvas.getByRole('button', { name: 'Actions for Invoices columns' }));
    // Neither of the two columns a list cannot do without is offered.
    await expect(screen.queryByRole('menuitem', { name: 'Hide Reference' })).toBeNull();
    await expect(screen.queryByRole('menuitem', { name: 'Hide Actions' })).toBeNull();

    await userEvent.click(screen.getByRole('menuitem', { name: 'Hide Customer' }));

    // Customer is gone and the rest kept their declared order.
    await expect(headers()).toEqual([
      'Reference',
      'Due',
      'Status',
      'Total',
      'Actions',
      'Columns',
    ]);

    // The label states what pressing it does, so the way back is readable.
    await userEvent.click(canvas.getByRole('button', { name: 'Actions for Invoices columns' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Show Customer' }));
    await expect(headers()).toContain('Customer');
  },
};
