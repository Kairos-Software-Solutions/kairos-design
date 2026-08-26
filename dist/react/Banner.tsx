import type { ReactNode } from 'react';

/**
 * A page-level notice. One per screen.
 *
 * There is no accent variant on purpose: amber is the action colour, and a
 * banner is not an action. A banner that needs the eye more than the screen's
 * primary button is describing something that should be blocking instead.
 */
export type BannerTone = 'neutral' | 'danger' | 'warning' | 'success';

export interface BannerProps {
  tone?: BannerTone;
  /** The inline form: a note beside content rather than a box above it. */
  inline?: boolean;
  children: ReactNode;
}

export default function Banner({ tone = 'neutral', inline = false, children }: BannerProps) {
  const classes = [
    'kairos-banner',
    tone !== 'neutral' && `kairos-banner--${tone}`,
    inline && 'kairos-banner--inline',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    // `alert` interrupts, `status` waits for a pause. A failure the user has to
    // act on earns the interruption; a success confirming what they just did
    // does not.
    <div className={classes} role={tone === 'danger' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
