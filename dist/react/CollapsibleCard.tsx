'use client';

import { type ReactNode, useId, useState } from 'react';

export interface CollapsibleCardProps {
  /** The condensed line, readable without expanding. */
  summary: ReactNode;
  children: ReactNode;
  /**
   * Collapsed by default, so several records fit on one screen and the person
   * expands the ones they want. A detail-heavy card that ships open is a
   * single record per screen and a scrollbar.
   */
  defaultOpen?: boolean;
}

/**
 * A detail-heavy card with a condensed default.
 *
 * Built on `<details>` rather than a button and a state flag, so it works
 * before hydration, is findable by in-page search when open, and prints
 * expanded. React state is still kept, because `aria-expanded` on the summary
 * has to follow the real open state and `<details>` does not maintain it.
 */
export default function CollapsibleCard({
  summary,
  children,
  defaultOpen = false,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <details
      className="kairos-collapsible-card"
      open={open}
      onToggle={(event) => setOpen((event.currentTarget as HTMLDetailsElement).open)}
    >
      <summary
        className="kairos-collapsible-card-summary"
        aria-expanded={open}
        aria-controls={bodyId}
      >
        {summary}
      </summary>
      <div className="kairos-collapsible-card-body" id={bodyId}>
        {children}
      </div>
    </details>
  );
}
