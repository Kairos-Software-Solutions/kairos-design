import type { ReactNode } from 'react';

/**
 * A record's status, from the Kairos State Palette.
 *
 * Four states cover every status a Kairos tool needs; map a new one onto the
 * closest rather than adding a fifth colour. Each carries a glyph and a border
 * style as well as a tint, so the status survives greyscale, colour blindness,
 * and a printed invoice.
 *
 * Full-saturation amber is deliberately unavailable here. It belongs to
 * actions and active navigation, and a status that claims it is competing with
 * the one thing on the screen the user is meant to do next.
 */
export type StateVariant =
  | 'settled'
  | 'overdue'
  | 'awaiting'
  | 'draft'
  | 'neutral'
  /** @deprecated Use `settled`. */
  | 'success'
  /** @deprecated Use `overdue`. */
  | 'danger'
  /** @deprecated Use `awaiting`. */
  | 'warning'
  /** @deprecated Amber is not a state colour. Pick the state the record is in. */
  | 'accent'
  /** @deprecated Uptime's name for `settled`. */
  | 'complete'
  /** @deprecated Uptime's name for `overdue`. */
  | 'failed'
  /** @deprecated Uptime's name for `awaiting`. */
  | 'progress';

type Canonical = 'settled' | 'overdue' | 'awaiting' | 'draft' | 'neutral';

/**
 * The deprecated names stay mapped rather than removed so an app can adopt the
 * registry without changing every call site in the same commit. Delete a row
 * once its app is migrated.
 */
const CANONICAL: Record<StateVariant, Canonical> = {
  settled: 'settled',
  overdue: 'overdue',
  awaiting: 'awaiting',
  draft: 'draft',
  neutral: 'neutral',
  success: 'settled',
  danger: 'overdue',
  warning: 'awaiting',
  accent: 'awaiting',
  complete: 'settled',
  failed: 'overdue',
  progress: 'awaiting',
};

const GLYPH: Record<Canonical, string | null> = {
  settled: '✓',
  overdue: '!',
  awaiting: '→',
  draft: null,
  neutral: null,
};

export interface StateChipProps {
  variant?: StateVariant;
  children: ReactNode;
}

export default function StateChip({ variant = 'neutral', children }: StateChipProps) {
  const canonical = CANONICAL[variant];
  const glyph = GLYPH[canonical];

  return (
    <span className={`kairos-state-chip kairos-state-chip--${canonical}`}>
      {glyph ? (
        // The chip's own label already names the state, so the glyph is a
        // second visual channel rather than a second announcement.
        <span className="kairos-state-chip-glyph" aria-hidden="true">
          {glyph}
        </span>
      ) : null}
      {children}
    </span>
  );
}
