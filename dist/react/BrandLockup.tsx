/**
 * The Kairos mark, in the two variants a themed surface needs.
 *
 * Both are always rendered and the stylesheet picks: `.kairos-lockup--dark` is
 * `display: none` until `[data-theme='dark']`, and the sidebar plaque — which
 * is inverted against the page — flips that choice back. A `<picture media>`
 * would answer what the device prefers rather than what the person chose, so a
 * `data-theme` override would leave an invisible logo behind.
 *
 * Both carry the same `alt` and neither is `aria-hidden`. Which one is visible
 * depends on the surface, so marking either one decorative leaves the visible
 * logo unnamed on half the screens — the bug this component exists to stop
 * every app rediscovering.
 *
 * There is no size prop and no `style`. Size belongs to the context the lockup
 * is in, and `kairos.css` already sets it per context:
 * `.kairos-auth-header .kairos-lockup` is `min(190px, 70%)`,
 * `.kairos-topbar-brand .kairos-lockup` is 32px. An app that writes a width
 * here overrides the stylesheet from a place the stylesheet cannot answer, and
 * two surfaces stop matching for a reason nobody can find later.
 */

/** Logos are linked from the CDN and never copied into a repo. */
const ASSETS = {
  wordmark: {
    light: 'https://cdn.kairossolutionstt.com/ICON%20%2B%20WORDMARK.svg',
    dark: 'https://cdn.kairossolutionstt.com/ICON%20%2B%20WORDMARK%20-%20DARK.svg',
  },
  icon: {
    light: 'https://cdn.kairossolutionstt.com/ICON%20ONLY.svg',
    dark: 'https://cdn.kairossolutionstt.com/ICON%20ONLY%20-%20DARK.svg',
  },
} as const;

export interface BrandLockupProps {
  /**
   * `wordmark` is the mark and the words, for a sign-in and the sidebar
   * plaque. `icon` is the mark alone, for the mobile top bar, where the
   * wordmark at 32px tall is unreadable rather than small.
   */
  variant?: 'wordmark' | 'icon';
}

export default function BrandLockup({ variant = 'wordmark' }: BrandLockupProps) {
  const asset = ASSETS[variant];
  const alt = 'Kairos Software Solutions';

  return (
    <>
      {/* eslint-disable @next/next/no-img-element */}
      <img className="kairos-lockup kairos-lockup--light" src={asset.light} alt={alt} />
      <img className="kairos-lockup kairos-lockup--dark" src={asset.dark} alt={alt} />
      {/* eslint-enable @next/next/no-img-element */}
    </>
  );
}
