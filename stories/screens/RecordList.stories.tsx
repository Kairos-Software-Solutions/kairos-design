import type { Meta, StoryObj } from '@storybook/react-vite';
import DataTable, { type Column } from '../../dist/react/DataTable';
import Button from '../../dist/react/Button';
import StateChip from '../../dist/react/StateChip';
import EmptyState from '../../dist/react/EmptyState';
import OverflowMenu from '../../dist/react/OverflowMenu';
import { PageHeader } from '../../dist/react/Panel';
import { formatMoney } from '../../dist/format/money';
import { formatDate } from '../../dist/format/dates';
import { AppShell, MAILKIT_NAV, UPTIME_NAV } from './Shell';
import { accounts, invoices, monitors, type Account, type Invoice, type Monitor } from '../fixtures';

/**
 * The same screen, three times, in three products.
 *
 * This is the story that answers the question the workshop was built for. A
 * list of records with a header, a count, one primary action, and a table is
 * what a Kairos tool mostly is, and three of them side by side is the only
 * place you can see whether they are one system or three.
 *
 * Every difference between these three should be data. If anything else
 * differs — a gap, a header weight, a chip that reads as a different rank —
 * that is drift, and it is fixed in `kairos.css`, never in the screen.
 */
const meta: Meta = {
  title: 'Screens/Record list',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

const accountColumns: Array<Column<Account>> = [
  { key: 'email', label: 'Email', role: 'identifier', cell: (row) => <a className="kairos-record-link" href="#">{row.email}</a>, sortValue: (row) => row.email },
  { key: 'domain', label: 'Domain', role: 'meta', cell: (row) => row.domain, sortValue: (row) => row.domain },
  { key: 'usage', label: 'Usage', role: 'figure', cell: (row) => row.usage },
  { key: 'quota', label: 'Quota', role: 'figure', cell: (row) => row.quota },
  {
    key: 'actions',
    label: 'Actions',
    role: 'actions',
    cell: (row) => (
      <OverflowMenu
        label={`Actions for ${row.email}`}
        items={[
          { label: 'Edit quota', onSelect: () => {} },
          { label: 'Change password', onSelect: () => {} },
          { label: 'Delete account', destructive: true, onSelect: () => {} },
        ]}
      />
    ),
  },
];

const monitorColumns: Array<Column<Monitor>> = [
  { key: 'name', label: 'Monitor', role: 'identifier', cell: (row) => <a className="kairos-record-link" href="#">{row.name}</a>, sortValue: (row) => row.name.toLowerCase() },
  {
    key: 'status',
    label: 'Status',
    role: 'status',
    cell: (row) => row.status === 'paused'
      ? <StateChip variant="draft">Paused</StateChip>
      : <StateChip variant={row.status === 'up' ? 'settled' : 'overdue'}>{row.status === 'up' ? 'Up' : 'Down'}</StateChip>,
    sortValue: (row) => row.status,
  },
  { key: 'checked', label: 'Last checked', role: 'meta', cell: (row) => row.lastChecked },
  { key: 'uptime', label: 'Uptime', role: 'figure', cell: (row) => `${row.uptime}%`, sortValue: (row) => row.uptime },
];

const invoiceColumns: Array<Column<Invoice>> = [
  { key: 'reference', label: 'Reference', role: 'identifier', cell: (row) => <a className="kairos-record-link" href="#">{row.reference}</a>, sortValue: (row) => row.reference },
  { key: 'customer', label: 'Customer', role: 'meta', cell: (row) => row.customer, sortValue: (row) => row.customer.toLowerCase() },
  { key: 'due', label: 'Due', role: 'meta', cell: (row) => formatDate(row.due), sortValue: (row) => row.due },
  { key: 'state', label: 'Status', role: 'status', cell: (row) => <StateChip variant={row.state}>{row.state}</StateChip>, sortValue: (row) => row.state },
  { key: 'total', label: 'Total', role: 'figure', cell: (row) => formatMoney(row.total, 'TTD'), sortValue: (row) => row.total },
];

/** Mailkit's accounts screen. */
export const Mailkit: Story = {
  render: () => (
    <AppShell product="Mailkit" nav={MAILKIT_NAV}>
      <div className="kairos-stack kairos-stack--xl">
        <PageHeader
          title="Accounts"
          description={`${accounts.length} mailboxes across 4 domains.`}
          actions={<Button variant="primary">Add account</Button>}
        />
        <DataTable
          label="Accounts"
          rows={accounts}
          columns={accountColumns}
          getKey={(row) => row.id}
          defaultSort={{ key: 'email', direction: 'ascending' }}
          empty={<EmptyState message="No accounts yet." action={<Button variant="primary">Add account</Button>} />}
        />
      </div>
    </AppShell>
  ),
};

/** Uptime's monitors screen. The one in the reported screenshot. */
export const Uptime: Story = {
  render: () => (
    <AppShell product="Uptime" nav={UPTIME_NAV}>
      <div className="kairos-stack kairos-stack--xl">
        <PageHeader
          title="Monitors"
          description={`${monitors.length} of 10 used · Checks run at least every 60 seconds.`}
          actions={<Button variant="primary">New monitor</Button>}
        />
        <DataTable
          label="Monitors"
          rows={monitors}
          columns={monitorColumns}
          getKey={(row) => row.id}
          defaultSort={{ key: 'name', direction: 'ascending' }}
          empty={<EmptyState message="No monitors are watching your services yet." action={<Button variant="primary">New monitor</Button>} />}
        />
      </div>
    </AppShell>
  ),
};

/** Paykit's invoices screen, the densest of the three. */
export const Paykit: Story = {
  render: () => (
    <AppShell
      product="Paykit"
      nav={[
        { label: 'Dashboard' },
        { label: 'Invoices', group: 'Money', current: true },
        { label: 'Payments', group: 'Money' },
        { label: 'Expenses', group: 'Money' },
        { label: 'Customers', group: 'CRM' },
        { label: 'Products', group: 'CRM' },
        { label: 'Reports', group: 'System' },
      ]}
    >
      <div className="kairos-stack kairos-stack--xl">
        <PageHeader
          title="Invoices"
          description="5 open · TTD 4,342,550.00 outstanding."
          actions={<Button variant="primary">New invoice</Button>}
        />
        <DataTable
          label="Invoices"
          rows={invoices}
          columns={invoiceColumns}
          getKey={(row) => row.id}
          defaultSort={{ key: 'due', direction: 'descending' }}
          empty={<EmptyState message="No invoices yet." action={<Button variant="primary">New invoice</Button>} />}
        />
      </div>
    </AppShell>
  ),
};

/** The same screen with nothing in it. Three products, one empty state. */
export const Empty: Story = {
  render: () => (
    <AppShell product="Uptime" nav={UPTIME_NAV}>
      <div className="kairos-stack kairos-stack--xl">
        <PageHeader title="Monitors" description="0 of 10 used." />
        <DataTable
          label="Monitors"
          rows={[]}
          columns={monitorColumns}
          getKey={(row) => row.id}
          empty={<EmptyState message="No monitors are watching your services yet." action={<Button variant="primary">New monitor</Button>} />}
        />
      </div>
    </AppShell>
  ),
};
