import type { Meta, StoryObj } from '@storybook/react-vite';
import DataTable, { type Column } from '../../dist/react/DataTable';
import Button from '../../dist/react/Button';
import StateChip from '../../dist/react/StateChip';
import EmptyState from '../../dist/react/EmptyState';
import OverflowMenu from '../../dist/react/OverflowMenu';
import { formatMoney } from '../../dist/format/money';
import { formatDate } from '../../dist/format/dates';
import { accounts, invoices, type Account, type Invoice } from '../fixtures';

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
        label={`Actions for ${row.reference}`}
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
