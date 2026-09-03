import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import DataTable, { type Column } from '../../dist/react/DataTable';
import Button from '../../dist/react/Button';
import StateChip from '../../dist/react/StateChip';
import EmptyState from '../../dist/react/EmptyState';
import OverflowMenu from '../../dist/react/OverflowMenu';
import { PageHeader } from '../../dist/react/Panel';
import InputField from '../../dist/react/Field';
import Segmented from '../../dist/react/Segmented';
import { formatMoney } from '../../dist/format/money';
import { formatDate } from '../../dist/format/dates';
import { AppShell, MAILKIT_NAV, PAYKIT_NAV, UPTIME_NAV } from './Shell';
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
        label={row.email}
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
    <AppShell product="Paykit" nav={PAYKIT_NAV}>
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

/**
 * A filtered list, reached from the screen above it.
 *
 * This story exists because four breakpoint rules had nothing to act on in the
 * workshop and so could only be reasoned about: `.kairos-filter-bar-search` at
 * 520px, `.kairos-filter-bar-action` and `.kairos-kicker` at 767px, and
 * `.kairos-desktop-only` at 899px. Every one of them is on this screen.
 *
 * The two kickers are the pair the 767px rule distinguishes. The plain one is
 * chrome — it repeats what the top bar already says — and it goes on a phone.
 * The link one is the way back to the parent screen, which is navigation, and
 * it stays.
 */
export const Filtered: Story = {
  render: function FilteredStory() {
    const [state, setState] = useState<'all' | 'overdue' | 'settled'>('overdue');
    return (
      <AppShell product="Paykit" nav={PAYKIT_NAV}>
        <div className="kairos-stack kairos-stack--xl">
          {/* The kicker is `PageHeader`'s, not the screen's. Written by hand
              here until 0.8.0, and written wrong: two elements above the
              header rather than one inside `kairos-page-header-body`, and the
              anchor carried `kairos-kicker-link` without `kairos-kicker`, so
              it took the underline and missed the eyebrow rank the underline
              is supposed to be added to. That is the drift a class a call site
              has to assemble will always eventually take. */}
          <PageHeader
            kicker="All customers"
            kickerHref="#"
            title="Invoices"
            description="5 open · TTD 4,342,550.00 outstanding."
            actions={<Button variant="primary">New invoice</Button>}
          />

          <form className="kairos-panel kairos-filter-bar" onSubmit={(e) => e.preventDefault()}>
            <div className="kairos-filter-bar-search">
              <InputField label="Search" placeholder="Reference or customer" />
            </div>
            <Segmented
              label="Filter invoices"
              value={state}
              onChange={setState}
              options={[
                { value: 'all', label: 'All' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'settled', label: 'Settled' },
              ]}
            />
            <InputField label="Due before" type="date" defaultValue="2026-10-01" />
            <Button className="kairos-filter-bar-action" variant="secondary" type="submit">
              Apply
            </Button>
          </form>

          <p className="kairos-meta kairos-desktop-only">
            Showing 5 of 5. Sorting is in the table header.
          </p>

          <DataTable
            label="Invoices"
            rows={invoices}
            columns={invoiceColumns}
            getKey={(row) => row.id}
            defaultSort={{ key: 'due', direction: 'descending' }}
            empty={<EmptyState message="No invoices match these filters." />}
          />
        </div>
      </AppShell>
    );
  },
};
