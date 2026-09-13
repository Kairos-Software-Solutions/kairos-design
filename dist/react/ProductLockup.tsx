import type { ElementType, ReactNode } from 'react';
import BrandLockup from './BrandLockup';

/**
 * The Kairos mark, an ink rule, and the product name: one object that says
 * which app this is and whose it is, in one read.
 *
 * It replaces three different assemblies of the same two ingredients. The
 * sign-in stacked a 190px `ICON + WORDMARK` over a 24px title, the sidebar
 * plaque stacked a 150px one over 11px tracked caps, and the top bar put a
 * 32px icon beside 11px tracked caps. Nothing held those three together, so
 * every app picked whichever one it saw first and no two Kairos tools opened
 * the same way.
 *
 * Two rules are doing the work, and both are worth knowing before changing
 * this:
 *
 * The mark here is the icon, never the full lockup. `ICON + WORDMARK` already
 * contains the word KAIROS, so pairing it with a product name set in Bebas
 * puts two display wordmarks on one screen with nothing relating them. The
 * full lockup belongs to Brand Scale surfaces — a site, an email header, a
 * PDF — where the reader may not know who Kairos is. Inside a tool they
 * already do, and the icon carries it.
 *
 * The product name is type, never artwork. A new Kairos app ships its identity
 * by passing a string. Nothing is drawn, exported, or added to the CDN, which
 * is the property that keeps four apps from drifting into four logos.
 *
 * There is no size prop, for the reason `BrandLockup` has none: size belongs
 * to the context, and `kairos.css` sets it per context through
 * `--kairos-product-*`. `.kairos-auth-header` is the 44px mark,
 * `.kairos-sidebar-brand` and `.kairos-topbar` the 28px one. A call site that
 * writes a width overrides the stylesheet from a place the stylesheet cannot
 * answer, and two surfaces stop matching for a reason nobody can find later.
 */

export interface ProductLockupProps {
  /**
   * The product name: `Paykit`, `Mailkit`, `Uptime`.
   *
   * Pass it in prose case. Bebas is an uppercase face, so the rendering is
   * caps either way, and the prose form is what the rest of the app writes.
   *
   * One word, ten characters or fewer. That is not a style preference — the
   * sidebar plaque has 196px of usable width at `--kairos-sidebar-w`, and a
   * name that overruns it has nowhere to go, because a brand name that
   * truncates is a different brand name.
   */
  product: ReactNode;
  /**
   * The element the name renders as. `span` by default.
   *
   * The sign-in passes `h1`: the lockup above the form is the page's heading,
   * and without it a screen reader opens the sign-in with nothing to announce.
   * The sidebar and the top bar leave it a `span`, because the heading on
   * those screens is the page title, not the app's name repeated in the
   * chrome.
   */
  as?: ElementType;
}

export default function ProductLockup({ product, as }: ProductLockupProps) {
  const Name: ElementType = as ?? 'span';

  return (
    <span className="kairos-product-lockup">
      <BrandLockup variant="icon" />
      {/* Decorative. The mark and the name are both announced; the thing
          joining them is not something to read out. It takes `currentColor`
          so it follows the name onto the inverted sidebar plaque without the
          plaque having to say so. */}
      <span className="kairos-product-lockup-rule" aria-hidden="true" />
      <Name className="kairos-product-name">{product}</Name>
    </span>
  );
}
