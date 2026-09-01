import type { ReactNode } from 'react';
import ThemeToggle, { ThemeSetting } from '../../dist/react/theme';
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
        {/* Inside the body column, not beside the sidebar: `.kairos-app-shell`
            is a flex row, so a topbar placed as its direct child becomes a
            third column and squeezes the view into what is left. It is
            `position: sticky; top: 0` against this column.

            Below 900px the sidebar is gone and this and the bottom nav replace
            it. Neither had ever been rendered by a story, which is why a record
            list on a phone was a screen with no way off it. */}
        <header className="kairos-topbar">
          <div className="kairos-topbar-brand">
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
            <span>{product}</span>
          </div>
        </header>
        <main className="kairos-main">
          <div className="kairos-view">{children}</div>
        </main>
      </div>

      {/* The floating theme control, which no story had ever rendered — so the
          `env(safe-area-inset-bottom) + 68px` offset it parks at, written to
          clear the bottom nav, had never been checked against a bottom nav.
          Mobile only: above 900px the sidebar's own `ThemeSetting` is visible
          and two theme controls on one screen is worse than none. */}
      <div className="kairos-mobile-only">
        <ThemeToggle />
      </div>

      {/* `aria-current="page"`, which is the signal the rest of this stylesheet
          reads. `.active` also works and is not what an app should write. */}
      <nav className="kairos-bottom-nav" aria-label="Primary, compact">
        {bottom.map((item) => (
          <a
            key={item.label}
            href="#"
            className="kairos-bottom-nav-link"
            aria-current={item.current ? 'page' : undefined}
          >
            <span className="kairos-bottom-nav-label">{item.label}</span>
          </a>
        ))}
      </nav>
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
