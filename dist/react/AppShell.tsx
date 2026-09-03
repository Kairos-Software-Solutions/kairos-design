'use client';

import type { ElementType, ReactNode } from 'react';
import BrandLockup from './BrandLockup';
import ThemeToggle, { ThemeSetting } from './theme';

/**
 * The app frame every Kairos tool renders inside.
 *
 * This shipped as a Storybook helper for four versions while both React apps
 * kept their own copy of it, and the copies drifted exactly where a story
 * cannot fail: one sidebar rendered a single lockup variant and went invisible
 * against its own plaque in one theme, one had no theme control at all and
 * grew a global floating one to compensate, and one `<main>` dropped the
 * centred column so its pages measured wider than the other's. None of that is
 * catchable by a component story, because looking alike is a property of the
 * composition rather than of the parts.
 *
 * What stays a slot is what genuinely differs: which destinations exist, what
 * sits in the top bar, and what a phone does with the destinations that do not
 * fit. What does not stay a slot is the frame, the brand, and where the theme
 * control lives.
 */

export interface AppShellProps {
  /** `<Sidebar>`. Hidden below 900px, where `bottomNav` takes over. */
  sidebar?: ReactNode;
  /** `<TopBar>`. Mobile only, and it sits inside the body column. */
  topbar?: ReactNode;
  /**
   * A full-width notice between the top bar and the content — offline, a
   * degraded backend, a maintenance window. Above `<main>` because it is about
   * the whole screen rather than about what is on it.
   */
  banner?: ReactNode;
  /** `<BottomNav>`. The phone's primary navigation, below 900px. */
  bottomNav?: ReactNode;
  /**
   * The floating theme control, mobile only.
   *
   * Above 900px the sidebar's own `ThemeSetting` is visible, and two theme
   * controls on one screen is worse than none — so this is wrapped in
   * `.kairos-mobile-only` rather than rendered on every screen. Turn it off
   * where the app already gives a phone a settings screen to carry
   * `ThemeSetting`, because that is the placement the pattern asks for first
   * and a floating toggle beside it is the same control twice.
   */
  mobileThemeToggle?: boolean;
  /**
   * Wrap the content in `.kairos-view`, the centred column. On by default.
   *
   * Turn it off only for a screen that genuinely wants the full width, such as
   * a tile dashboard — not for a whole app, which is how one of the two apps
   * ended up measuring wider than the other on every page.
   */
  view?: boolean;
  /** Extra classes on `<main>`, for a page transition the app owns. */
  mainClassName?: string;
  children: ReactNode;
}

export default function AppShell({
  sidebar,
  topbar,
  banner,
  bottomNav,
  mobileThemeToggle = true,
  view = true,
  mainClassName,
  children,
}: AppShellProps) {
  return (
    <div className="kairos-app-shell">
      {sidebar}

      {/* The top bar goes inside the body column, not beside the sidebar:
          `.kairos-app-shell` is a flex row, so a top bar placed as its direct
          child becomes a third column and squeezes the view into what is
          left. */}
      <div className="kairos-shell-body">
        {topbar}
        {banner}
        <main
          id="main-content"
          tabIndex={-1}
          className={['kairos-main', mainClassName].filter(Boolean).join(' ')}
        >
          {view ? <div className="kairos-view">{children}</div> : children}
        </main>
      </div>

      {mobileThemeToggle ? (
        <div className="kairos-mobile-only">
          <ThemeToggle />
        </div>
      ) : null}

      {bottomNav}
    </div>
  );
}

export interface SidebarProps {
  /** The product name on the brand plaque, under the Kairos lockup. */
  product: ReactNode;
  /**
   * The accessible name for the navigation region. `Primary` unless the app
   * has a second one — a control plane beside a tenant app — in which case
   * name both, because two regions called `Primary` are two the same.
   */
  label?: string;
  /**
   * The three-state theme control in the sidebar footer. On by default.
   *
   * This is the desktop half of the theme pattern and the reason the floating
   * toggle is mobile-only. An app that turns this off has to put
   * `ThemeSetting` somewhere else a desktop user can reach, or it has no theme
   * control above 900px at all.
   */
  themeSetting?: boolean;
  /** Sign out, and anything else that belongs at the bottom rather than in the nav. */
  footer?: ReactNode;
  /** `<NavGroup>`s. */
  children: ReactNode;
}

export function Sidebar({
  product,
  label = 'Primary',
  themeSetting = true,
  footer,
  children,
}: SidebarProps) {
  return (
    <aside className="kairos-sidebar">
      {/* The plaque is inverted against the page, so the lockup on it is
          whichever variant the rest of the page is hiding. `BrandLockup`
          renders both and the stylesheet picks. */}
      <div className="kairos-sidebar-brand">
        <BrandLockup />
        <span className="kairos-sidebar-product">{product}</span>
      </div>

      <nav className="kairos-sidebar-nav" aria-label={label}>
        {children}
      </nav>

      {themeSetting || footer ? (
        <div className="kairos-sidebar-footer kairos-stack kairos-stack--md">
          {themeSetting ? <ThemeSetting /> : null}
          {footer}
        </div>
      ) : null}
    </aside>
  );
}

export interface NavGroupProps {
  /**
   * The label over the group. Optional: the first group is usually the one
   * unlabelled row — a `Dashboard` under a heading that says `Overview` is a
   * heading for one item.
   */
  label?: ReactNode;
  children: ReactNode;
}

export function NavGroup({ label, children }: NavGroupProps) {
  return (
    <div className="kairos-sidebar-group">
      {label ? <span className="kairos-nav-group">{label}</span> : null}
      {children}
    </div>
  );
}

export interface NavLinkProps {
  href: string;
  /**
   * Whether this is the screen the reader is on. Rendered as
   * `aria-current="page"`, which is the only signal the stylesheet reads —
   * `.active` is a deprecated alias kept for apps that had not moved off it,
   * and setting both marks one state twice in a spelling on its way out.
   */
  current?: boolean;
  /**
   * The link component. Defaults to `<a>`, a full page load in a routed app;
   * pass `next/link` to keep the soft navigation.
   */
  as?: ElementType;
  /** A 14px glyph before the label. The registry ships no icon set. */
  icon?: ReactNode;
  children: ReactNode;
}

export function NavLink({ href, current, as, icon, children }: NavLinkProps) {
  const Link: ElementType = as ?? 'a';

  return (
    <Link href={href} className="kairos-nav-link" aria-current={current ? 'page' : undefined}>
      {icon}
      {children}
    </Link>
  );
}

export interface TopBarProps {
  product: ReactNode;
  /**
   * A control in the top bar: a company switcher, an environment selector.
   * Its presence is what applies `--switcher`, so the bar does not reserve
   * room for a control that is not there.
   */
  switcher?: ReactNode;
}

/**
 * The mobile brand row, below 900px.
 *
 * It carries the lockup as well as the product name, because below 900px the
 * sidebar is gone and this is the only Kairos mark on the screen. A bar that
 * printed the product name alone left a phone with no brand on it at all.
 */
export function TopBar({ product, switcher }: TopBarProps) {
  return (
    <header className={['kairos-topbar', switcher && 'kairos-topbar--switcher'].filter(Boolean).join(' ')}>
      <span className="kairos-topbar-brand">
        <BrandLockup variant="icon" />
        {product}
      </span>
      {switcher}
    </header>
  );
}

export interface BottomNavProps {
  /** Matches the sidebar's region name, narrowed: `Primary, compact`. */
  label?: string;
  /** `<BottomNavLink>`s. Five at the most; a phone has room for five. */
  children: ReactNode;
}

export function BottomNav({ label = 'Primary, compact', children }: BottomNavProps) {
  return (
    <nav className="kairos-bottom-nav" aria-label={label}>
      {children}
    </nav>
  );
}

export interface BottomNavLinkProps {
  /**
   * Where it goes. Omit it and pass `onClick` instead for the fifth slot that
   * opens the rest as a sheet — that one is a button, because it does not
   * navigate.
   */
  href?: string;
  current?: boolean;
  as?: ElementType;
  icon?: ReactNode;
  onClick?: () => void;
  /** For the sheet trigger: whether the sheet it opens is open. */
  expanded?: boolean;
  children: ReactNode;
}

export function BottomNavLink({
  href,
  current,
  as,
  icon,
  onClick,
  expanded,
  children,
}: BottomNavLinkProps) {
  const content = (
    <>
      {icon}
      <span className="kairos-bottom-nav-label">{children}</span>
    </>
  );

  if (href === undefined) {
    return (
      <button
        type="button"
        className="kairos-bottom-nav-link"
        onClick={onClick}
        aria-expanded={expanded}
        aria-current={current ? 'page' : undefined}
      >
        {content}
      </button>
    );
  }

  const Link: ElementType = as ?? 'a';

  return (
    <Link
      href={href}
      className="kairos-bottom-nav-link"
      onClick={onClick}
      aria-current={current ? 'page' : undefined}
    >
      {content}
    </Link>
  );
}
