import type { ElementType, ReactNode } from 'react';

export interface SubNavItem {
  label: string;
  href: string;
  /** The page the person is on. The caller decides, because only it knows the route. */
  current?: boolean;
  /** A count beside the label: drafts waiting, rows to review. */
  count?: ReactNode;
}

export interface SubNavProps {
  /** Names the navigation landmark: `Sales`. */
  label: string;
  items: SubNavItem[];
  /**
   * The link component. Defaults to `<a>`, which is a full page load in a
   * routed app; pass the router's own (`next/link`).
   */
  linkAs?: ElementType;
}

/**
 * The pages inside one area, as a row of links under the page header.
 *
 * It is what lets a sidebar name nine areas rather than eighteen pages: Sales
 * holds its quotes, invoices, recurring plans and products one row down, so
 * the top level is a short list a first-time user can read.
 *
 * Navigation, so these are links with `aria-current="page"` on the current one
 * — not a tab list, which switches panels inside one page, and not a
 * segmented control, which filters one list. The row scrolls sideways at
 * narrow widths and never wraps.
 *
 * No hooks, so it renders from a server component; the caller marks the
 * current item from its own route.
 */
export default function SubNav({ label, items, linkAs }: SubNavProps) {
  const Link: ElementType = linkAs ?? 'a';
  return (
    <nav className="kairos-subnav" aria-label={label}>
      <ul className="kairos-subnav-list">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              className="kairos-subnav-link"
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
            >
              {item.label}
              {item.count !== undefined && item.count !== null ? (
                <span className="kairos-subnav-count">{item.count}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
