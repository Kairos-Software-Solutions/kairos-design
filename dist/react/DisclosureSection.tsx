'use client';

import { type ReactNode, useId } from 'react';
import { useRememberedOpen } from './remember';

export interface DisclosureSectionProps {
  /** The section's name: `Invoices`, `Payment link`, `Tax`. */
  heading: ReactNode;
  /**
   * What is inside, readable without opening it: `3 unpaid · TTD 536.72
   * outstanding`, `No tax`, `Paid · 16 Oct 2026 · Cash`. The line is what
   * lets a closed section stay closed; one that says nothing has to be opened
   * to find out whether it mattered.
   */
  summary?: ReactNode;
  /** How many records it holds. Shown at the end of the row. */
  count?: ReactNode;
  /**
   * Remembers the section's open state on this device under this id. Name the
   * section, not the record: `customer.invoices`, so a person who keeps a
   * customer's invoices open finds them open on every customer.
   */
  id?: string;
  /**
   * Open until the person closes it. Essentials and anything needing
   * attention start open; related lists and rare things start closed, which
   * is the point of the component.
   */
  defaultOpen?: boolean;
  /** The heading's level in the screen's outline. A record's sections are 2. */
  level?: 2 | 3 | 4;
  children: ReactNode;
}

/**
 * A section of a screen that stays closed until it is wanted.
 *
 * Closed, it is one row: the caret, the heading, a line saying what is inside,
 * and the count. A record screen built from these reads as a list of what the
 * record holds, rather than as every list it holds, open, one after another —
 * which was a customer at five and a half phone screens.
 *
 * Built on `<details>` like `CollapsibleCard`, so it opens before hydration,
 * prints, and is found by in-page search; the closed body stays in the
 * document. Standing alone it is a panel. Several in a `DisclosureGroup` share
 * one panel and are ruled apart.
 *
 * Its open state is remembered per device when it has an `id`. The toggle
 * event also fires when React sets `open` itself, so only a change the person
 * made — one where the element and the state disagree — is written down.
 */
export default function DisclosureSection({
  heading,
  summary,
  count,
  id,
  defaultOpen = false,
  level = 2,
  children,
}: DisclosureSectionProps) {
  const [open, setOpen] = useRememberedOpen(id, defaultOpen);
  const bodyId = useId();
  const Heading = `h${level}` as const;

  return (
    <details
      className="kairos-disclosure"
      open={open}
      onToggle={(event) => {
        const next = (event.currentTarget as HTMLDetailsElement).open;
        if (next !== open) setOpen(next);
      }}
    >
      <summary className="kairos-disclosure-summary" aria-expanded={open} aria-controls={bodyId}>
        <svg
          className="kairos-disclosure-caret"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <span className="kairos-disclosure-heading">
          <Heading className="kairos-disclosure-title">{heading}</Heading>
          {summary ? <span className="kairos-disclosure-meta">{summary}</span> : null}
        </span>
        {count !== undefined && count !== null ? (
          <span className="kairos-disclosure-count">{count}</span>
        ) : null}
      </summary>
      <div className="kairos-disclosure-body" id={bodyId}>
        {children}
      </div>
    </details>
  );
}

export interface DisclosureGroupProps {
  /** Names the group for assistive technology: `Related to this customer`. */
  label?: string;
  children: ReactNode;
}

/**
 * Several `DisclosureSection`s in one panel, ruled apart. One stamp for the
 * group rather than one per section, which is what a record's related lists
 * should look like: one list of what is there.
 */
export function DisclosureGroup({ label, children }: DisclosureGroupProps) {
  return (
    <div className="kairos-disclosure-group" role={label ? 'group' : undefined} aria-label={label}>
      {children}
    </div>
  );
}
