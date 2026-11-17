'use client';

import { type ElementType } from 'react';
import { DropdownMenu } from 'radix-ui';

export interface AccountMenuProps {
  /** The signed-in person's display name. Their email stands in when there is none. */
  name?: string | null;
  email: string;
  /** The Kairos account's own page: `https://account.kairossolutionstt.com/`. */
  accountHref: string;
  /**
   * The app's switch-account route, which ends the app's session and opens
   * the Kairos account picker. Leave it out where an app cannot switch.
   */
  switchHref?: string;
  /** Sign out: a link to the app's sign-out route, or a handler that posts it. */
  signOut: { href: string } | { onSelect: () => void };
  /**
   * Where the menu opens from. `sidebar` (the default) for the desktop
   * sidebar's footer, which opens upwards; `topbar` for the phone's top bar,
   * which opens downwards and shows only the initials.
   */
  placement?: 'sidebar' | 'topbar';
  /** The router's link, for items with an `href` that stay inside the app. */
  linkAs?: ElementType;
}

/** Up to two initials from the name, else the first letter of the email. */
export function accountInitials(name: string | null | undefined, email: string): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length) return words.slice(0, 2).map((word) => word[0]!.toUpperCase()).join('');
  return (email.trim()[0] ?? '?').toUpperCase();
}

const SIDE_OFFSET = 6;
const VIEWPORT_PADDING = 8;

/**
 * Who is signed in, in every Kairos app, and the three things a person does
 * with that: open their Kairos account, switch to another account signed in
 * on this browser, or sign out. One component so the menu reads and behaves
 * the same in Paykit, Mailkit, KCommerce and the account app.
 *
 * The trigger names the person in words, not only an avatar: an avatar alone
 * cannot tell two accounts with the same initials apart, which is the moment
 * someone with two accounts needs to know which one this is.
 *
 * Behaviour is Radix `DropdownMenu`, as `OverflowMenu`'s is, and the items use
 * the overflow menu's classes so the two menus are one vocabulary.
 */
export default function AccountMenu({ name, email, accountHref, switchHref, signOut, placement = 'sidebar', linkAs }: AccountMenuProps) {
  const Link: ElementType = linkAs ?? 'a';
  const display = name?.trim() || email;
  const initials = accountInitials(name, email);

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={['kairos-account-trigger', placement === 'topbar' && 'kairos-account-trigger--compact'].filter(Boolean).join(' ')}
          aria-label={`Account: ${display}`}
        >
          <span className="kairos-account-avatar" aria-hidden="true">
            {initials}
          </span>
          {placement === 'topbar' ? null : (
            <span className="kairos-account-who">
              <span className="kairos-account-name">{display}</span>
              {name?.trim() ? <span className="kairos-account-email">{email}</span> : null}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="kairos-overflow-menu kairos-account-menu"
          side={placement === 'topbar' ? 'bottom' : 'top'}
          align={placement === 'topbar' ? 'end' : 'start'}
          sideOffset={SIDE_OFFSET}
          collisionPadding={VIEWPORT_PADDING}
          loop
        >
          <DropdownMenu.Label className="kairos-account-menu-label">
            <span className="kairos-account-name">{display}</span>
            {name?.trim() ? <span className="kairos-account-email">{email}</span> : null}
          </DropdownMenu.Label>
          <DropdownMenu.Item asChild className="kairos-overflow-item">
            <a href={accountHref}>Your Kairos account</a>
          </DropdownMenu.Item>
          {switchHref ? (
            <DropdownMenu.Item asChild className="kairos-overflow-item">
              <Link href={switchHref}>Switch account</Link>
            </DropdownMenu.Item>
          ) : null}
          {'href' in signOut ? (
            <DropdownMenu.Item asChild className="kairos-overflow-item kairos-overflow-item--divided">
              <Link href={signOut.href}>Sign out</Link>
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item className="kairos-overflow-item kairos-overflow-item--divided" onSelect={signOut.onSelect}>
              Sign out
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
