/**
 * The rows every list story renders.
 *
 * Real Kairos data, not lorem: TTD amounts, Trinidad names, the domains the
 * tools actually watch. Placeholder data hides the defects that only appear at
 * real length — a customer name that wraps a column, an email that pushes a
 * table past 320px, an amount long enough to collide with the one above it.
 */

export interface Invoice {
  id: string;
  reference: string;
  customer: string;
  issued: string;
  due: string;
  state: 'settled' | 'overdue' | 'awaiting' | 'draft';
  /** Minor units. Exact amounts are never a float. */
  total: number;
}

export const invoices: Invoice[] = [
  { id: '1', reference: 'INV-2026-0184', customer: 'Angostura Holdings Limited', issued: '2026-08-02', due: '2026-09-01', state: 'awaiting', total: 1_250_000 },
  { id: '2', reference: 'INV-2026-0183', customer: 'Massy Distribution', issued: '2026-07-28', due: '2026-08-27', state: 'settled', total: 84_550 },
  { id: '3', reference: 'INV-2026-0182', customer: 'Kanhai & Sons Hardware', issued: '2026-06-15', due: '2026-07-15', state: 'overdue', total: 312_000 },
  { id: '4', reference: 'INV-2026-0181', customer: 'Ramdeen', issued: '2026-08-20', due: '2026-09-19', state: 'draft', total: 4_500 },
  { id: '5', reference: 'INV-2026-0180', customer: 'Trinidad Systems Limited', issued: '2026-08-11', due: '2026-09-10', state: 'awaiting', total: 2_780_000 },
];

export interface Account {
  id: string;
  email: string;
  domain: string;
  usage: string;
  quota: string;
}

export const accounts: Account[] = [
  { id: '1', email: 'ricardo@kairossolutionstt.com', domain: 'kairossolutionstt.com', usage: '7.3M', quota: '5.0G' },
  { id: '2', email: 'ricardo@felixfam.com', domain: 'felixfam.com', usage: '41M', quota: '5.0G' },
  { id: '3', email: 'micah@merchdentt.com', domain: 'merchdentt.com', usage: '14K', quota: '5.0G' },
  { id: '4', email: 'dev@merchdentt.com', domain: 'merchdentt.com', usage: '91K', quota: '~' },
  { id: '5', email: 'admin@kcommercett.com', domain: 'kcommercett.com', usage: '111K', quota: '1.0G' },
  { id: '6', email: 'bounces-qa@kairossolutionstt.com', domain: 'kairossolutionstt.com', usage: '0', quota: '250M' },
];

export interface Monitor {
  id: string;
  name: string;
  status: 'up' | 'down' | 'paused';
  lastChecked: string;
  uptime: number;
}

export const monitors: Monitor[] = [
  { id: '1', name: 'kairossolutionstt', status: 'up', lastChecked: '1m ago', uptime: 100 },
  { id: '2', name: 'Mailkit', status: 'up', lastChecked: '36s ago', uptime: 100 },
  { id: '3', name: 'Paykit', status: 'down', lastChecked: '12s ago', uptime: 94.2 },
  { id: '4', name: 'Merchden storefront', status: 'paused', lastChecked: '4h ago', uptime: 99.8 },
];

/**
 * A hundred invoices, which is the size the pager exists for.
 *
 * The only generated fixture in the file, and it is generated because five
 * hand-written rows are why pagination was invisible in the workshop for three
 * releases: nothing in the registry ever held more records than fit a screen.
 * It cycles the five real invoices above so the customers, amounts and states
 * stay real, and walks the reference and the dates so no two rows collide and
 * a sort has something to do.
 */
export const manyInvoices: Invoice[] = Array.from({ length: 100 }, (_, i) => {
  const source = invoices[i % invoices.length];
  const day = (i % 28) + 1;
  const month = (i % 6) + 3;
  const pad = (n: number) => String(n).padStart(2, '0');

  return {
    ...source,
    id: `many-${i + 1}`,
    reference: `INV-2026-${pad(i + 1)}`,
    issued: `2026-${pad(month)}-${pad(day)}`,
    due: `2026-${pad(month + 1)}-${pad(day)}`,
    total: source.total + i * 1_100,
  };
});
