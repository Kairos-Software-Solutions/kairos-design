import type { ReactNode } from 'react';
import { ThemeSetting } from '../../dist/react/theme';
import Button from '../../dist/react/Button';

/**
 * The app frame every Kairos tool renders inside.
 *
 * Screen stories are the ones that catch what component stories cannot. Two
 * apps can pass every component story and still look nothing alike, because
 * looking alike is a property of the composition: what the page header sits
 * against, how far the first panel is from it, whether the sidebar's active
 * row is the same weight as the primary button. That is what these render.
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

  return (
    <div className="kairos-app-shell">
      <nav className="kairos-sidebar" aria-label="Primary">
        {/* Both variants, with the same `alt`, and the stylesheet picks. The
            plaque is inverted, so the lockup on it is whichever one the rest
            of the page is hiding. Logos are linked from the CDN by URL and
            never copied into a repo. */}
        <div className="kairos-sidebar-brand">
          <img
            className="kairos-lockup kairos-lockup--light"
            src="https://cdn.kairossolutionstt.com/ICON%20%2B%20WORDMARK.svg"
            alt="Kairos Software Solutions"
          />
          <img
            className="kairos-lockup kairos-lockup--dark"
            src="https://cdn.kairossolutionstt.com/ICON%20%2B%20WORDMARK%20-%20DARK.svg"
            alt="Kairos Software Solutions"
          />
          <span className="kairos-sidebar-product">{product}</span>
        </div>
        <div className="kairos-sidebar-nav">
          {groups.map((group, index) => (
            <div className="kairos-sidebar-group" key={group.name ?? index}>
              {group.name ? <span className="kairos-label-caps">{group.name}</span> : null}
              {group.items.map((item) => (
                <a
                  key={item.label}
                  href="#"
                  className="kairos-nav-link"
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="kairos-sidebar-footer kairos-stack kairos-stack--sm">
          <ThemeSetting />
          <Button variant="secondary">Sign out</Button>
        </div>
      </nav>
      <div className="kairos-shell-body">
        <main className="kairos-main">
          <div className="kairos-view">{children}</div>
        </main>
      </div>
    </div>
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

export const UPTIME_NAV: NavItem[] = [
  { label: 'Monitors', current: true },
  { label: 'Settings' },
  { label: 'Admin' },
];
