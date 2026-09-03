'use client';

import type { ElementType, FormHTMLAttributes, ReactNode } from 'react';
import BrandLockup from './BrandLockup';
import ThemeToggle from './theme';

/**
 * The signed-out screen: sign-in, password recovery, credential setup.
 *
 * It exists because two apps composing this by hand produced two different
 * screens from the same vocabulary — a different lockup size, a different
 * error treatment, the theme control in two places, and a panel on one of
 * them. Every one of those was a call site making a decision the registry had
 * not written down anywhere it could be read. This is where it is written
 * down.
 *
 * The screen is `.kairos-tool-surface`: a centred one-panel page with no app
 * shell. It sizes at Product Scale, because a website hero heading on an
 * operations sign-in reads as marketing and this screen is not selling
 * anything.
 */

export interface AuthScreenProps {
  /**
   * The product name, and the page's `h1`.
   *
   * The lockup above it is the Kairos mark, not a heading — without this a
   * screen reader opens the sign-in with nothing to announce.
   */
  product: ReactNode;
  /**
   * One line under the title. Say what the product does — `Manage email
   * delivery and mailboxes.` — rather than what the screen is. `Sign in to
   * Paykit.` under a heading that says `Paykit`, on a screen with a `Sign in`
   * button, is the third time the page has said it.
   */
  tagline?: ReactNode;
  /**
   * The cycling theme control, at the end of the screen.
   *
   * On by default and it should stay on: this screen has no shell and no
   * settings row, so it is the one placement the theme pattern allows here. An
   * app that renders its own floating `ThemeToggle` globally must turn this
   * off, or the screen carries two.
   */
  themeToggle?: boolean;
  children: ReactNode;
}

export default function AuthScreen({
  product,
  tagline,
  themeToggle = true,
  children,
}: AuthScreenProps) {
  return (
    <main id="main-content" tabIndex={-1} className="kairos-tool-surface">
      <div className="kairos-auth">
        <header className="kairos-auth-header">
          <BrandLockup />
          <h1 className="kairos-page-title">{product}</h1>
          {tagline ? <p className="kairos-body-muted">{tagline}</p> : null}
        </header>

        {children}

        {themeToggle ? <ThemeToggle inline /> : null}
      </div>
    </main>
  );
}

export interface AuthFormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'children'> {
  /**
   * The one message the form can produce, or empty.
   *
   * Pass the value rather than rendering the row yourself. The row is reserved
   * whether or not it carries a message, so a refused sign-in does not move
   * the button out from under the thumb already reaching for it — and it is
   * the reservation, not the message, that `--one-message` below depends on.
   */
  error?: ReactNode;
  /** The submit button. One per screen, and it is the primary. */
  submit: ReactNode;
  /**
   * What comes after the button: a recovery link, a note about who to ask.
   * Offer a link only where the app can actually finish what it starts.
   */
  footer?: ReactNode;
  /** The fields, in tab order. */
  children: ReactNode;
}

/**
 * The form on an auth screen, in the order the screen is read: fields, the one
 * message, the button, then anything after it.
 *
 * The order is fixed here rather than left to the call site because it is the
 * whole point — an error row rendered after the button, or omitted, breaks the
 * layout guarantee below.
 *
 * `--one-message` takes the reserved message row off each individual field,
 * and it is only allowed to because this form holds a row of its own for the
 * one message it can produce. What is wrong on a sign-in is the email and the
 * password together, not either one, so the form says it once. A call site
 * that reached for `--one-message` without reserving that row would get a
 * button that sits at two different heights depending on whether the last
 * attempt failed.
 */
export function AuthForm({ error, submit, footer, children, ...props }: AuthFormProps) {
  return (
    <form className="kairos-auth-form" {...props}>
      {/* The panel is the sign-in's own container, not the page's. This is the
          one screen where the form is a thing sitting on an empty page rather
          than a region of a composed one, so it carries the border and the
          stamp that says so. */}
      <div className="kairos-panel kairos-pad kairos-form-stack kairos-form-stack--one-message">
        {children}

        <p className="kairos-auth-error kairos-error-text" role="alert">
          {error}
        </p>

        {submit}

        {footer}
      </div>
    </form>
  );
}

export interface AuthLinkProps {
  href: string;
  /**
   * The link component to render with. Defaults to `<a>`, which is a full page
   * load in a routed app — pass the router's own link (`next/link`) to keep
   * the soft navigation. Same reasoning as `PageHeader`'s `kickerAs`: the
   * class has to go on the anchor itself, so a call site handing in a finished
   * node would be deciding that here.
   */
  as?: ElementType;
  children: ReactNode;
}

/** A link under the sign-in button: recovery, or back to the other sign-in. */
export function AuthLink({ href, as, children }: AuthLinkProps) {
  const Link: ElementType = as ?? 'a';
  return (
    <Link href={href} className="kairos-auth-link">
      {children}
    </Link>
  );
}
