import type { ReactNode } from 'react';
import ShippedAppShell, {
  Sidebar,
  NavGroup,
  NavLink,
  TopBar,
  BottomNav,
  BottomNavLink,
} from '../../dist/react/AppShell';
import Button from '../../dist/react/Button';

/**
 * The app frame every Kairos tool renders inside.
 *
 * Screen stories are the ones that catch what component stories cannot. Two
 * apps can pass every component story and still look nothing alike, because
 * looking alike is a property of the composition: what the page header sits
 * against, how far the first panel is from it, whether the sidebar's active
 * row is the same weight as the primary button. That is what these render.
 *
 * This used to *be* the frame — a helper that lived only in the workshop while
 * both React apps kept their own copy. That is exactly the arrangement a
 * screen story exists to catch, and it could not catch it, because the story
 * and the apps were different code. So the frame moved into `dist/react` and
 * this is now a thin convenience over it: `nav` as a flat list is a shorthand
 * worth having in a story and not worth shipping. Everything structural below
 * comes from the package, so a story that renders is a package that works.
 */
export interface NavItem {
  label: string;
  group?: string;
  current?: boolean;
}

export function AppShell({
  product,
  nav,
  children,
}: {
  product: string;
  nav: NavItem[];
  children: ReactNode;
}) {
  const groups: Array<{ name: string | null; items: NavItem[] }> = [];
  for (const item of nav) {
    const name = item.group ?? null;
    const last = groups.at(-1);
    if (last && last.name === name) last.items.push(item);
    else groups.push({ name, items: [item] });
  }

  /* The bottom nav holds four destinations, not twelve. Mailkit's sidebar has
     twelve and a phone has room for four, so this is a choice about which four
     rather than a smaller sidebar. The current destination is always one of
     them: an active state nothing can be active in is the defect this story
     exists to catch. */
  const BOTTOM_SLOTS = 4;
  const bottom = nav.slice(0, BOTTOM_SLOTS);
  const current = nav.find((item) => item.current);
  if (current && !bottom.includes(current)) bottom[BOTTOM_SLOTS - 1] = current;

  return (
    <ShippedAppShell
      sidebar={
        <Sidebar product={product} footer={<Button variant="secondary">Sign out</Button>}>
          {groups.map((group, index) => (
            <NavGroup label={group.name} key={group.name ?? index}>
              {group.items.map((item) => (
                <NavLink key={item.label} href="#" current={item.current}>
                  {item.label}
                </NavLink>
              ))}
            </NavGroup>
          ))}
        </Sidebar>
      }
      topbar={<TopBar product={product} />}
      bottomNav={
        <BottomNav>
          {bottom.map((item) => (
            <BottomNavLink key={item.label} href="#" current={item.current}>
              {item.label}
            </BottomNavLink>
          ))}
        </BottomNav>
      }
    >
      {children}
    </ShippedAppShell>
  );
}

export const MAILKIT_NAV: NavItem[] = [
  { label: 'Dashboard' },
  { label: 'Accounts', group: 'Mail', current: true },
  { label: 'Aliases', group: 'Mail' },
  { label: 'Domains', group: 'Mail' },
  { label: 'Templates', group: 'Managed email' },
  { label: 'Layouts', group: 'Managed email' },
  { label: 'Brands', group: 'Managed email' },
  { label: 'Assets', group: 'Managed email' },
  { label: 'Issues', group: 'System' },
  { label: 'Audit', group: 'System' },
  { label: 'Logs', group: 'System' },
  { label: 'API Keys', group: 'System' },
];

export const PAYKIT_NAV: NavItem[] = [
  { label: 'Dashboard' },
  { label: 'Invoices', group: 'Money', current: true },
  { label: 'Payments', group: 'Money' },
  { label: 'Expenses', group: 'Money' },
  { label: 'Customers', group: 'CRM' },
  { label: 'Products', group: 'CRM' },
  { label: 'Reports', group: 'System' },
];

export const UPTIME_NAV: NavItem[] = [
  { label: 'Monitors', current: true },
  { label: 'Settings' },
  { label: 'Admin' },
];
