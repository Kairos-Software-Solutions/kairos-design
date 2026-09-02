'use client';

import { useEffect, useRef, useState } from 'react';

export interface CopyFieldProps {
  /** The value itself: a DKIM record, an object key, a webhook URL, a digest. */
  value: string;
  /** What it is. Omit only where the surrounding row already says. */
  label?: string;
  /**
   * The value has meaningful line breaks and is read as a block rather than as
   * one string — a response body, a public key. It scrolls instead of
   * wrapping, because a key wrapped at the panel's width is a key that cannot
   * be checked character by character against the DNS record beside it.
   */
  multiline?: boolean;
  /**
   * There is nothing to copy: a fixed value the operator reads but never
   * pastes, like the `TXT` in a DNS record's type column.
   */
  readOnlyValue?: boolean;
}

/**
 * A technical value an operator reads back or pastes somewhere else.
 *
 * The role this fills is not "a disabled input". An operator putting a DKIM
 * record into a registrar's control panel needs the whole value, unwrapped,
 * selectable, and copyable in one press — and an `<input readonly>` gives them
 * a box that scrolls one line at a time and looks like a field they should be
 * typing in. So it is a `<code>` block with a control beside it, which is what
 * every Kairos app that shows a key had already built for itself.
 *
 * The copy button is a real control at rest, not a hover affordance. Hover
 * does not exist on touch, does not appear in a screenshot, and cannot be
 * described to somebody over the phone.
 */
export default function CopyField({ value, label, multiline = false, readOnlyValue = false }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setFailed(false);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), CONFIRMATION_MS);
    } catch {
      // The clipboard is refused outright on an insecure origin and by some
      // policies, and there is nothing to retry. Saying so beats a button that
      // appears to do nothing — the value is on the screen and can still be
      // selected by hand.
      setCopied(false);
      setFailed(true);
    }
  }

  const Value = multiline ? 'pre' : 'code';

  return (
    <div className="kairos-copy-field">
      {label ? <span className="kairos-input-label">{label}</span> : null}
      <div className="kairos-copy-field-body">
        {/* The value scrolls, so it has to be reachable by keyboard: a region a
            mouse can scroll and a keyboard cannot is WCAG 2.1.1, and axe fails
            it by name. `tabIndex` is the whole fix — the global `:focus-visible`
            rule gives it the same ring as every other stop, and a screen reader
            reads the value out when it lands there, which is what somebody
            checking a DKIM record over the phone actually needs. */}
        <Value tabIndex={0} className={multiline ? 'kairos-code-block' : 'kairos-copy-field-value'}>{value}</Value>
        {readOnlyValue ? null : (
          <button
            type="button"
            className="kairos-icon-action"
            // Names the value, not the verb, so a column of these says which
            // one each belongs to. `title` gives a pointer user the same words.
            aria-label={label ? `Copy ${label}` : 'Copy value'}
            title={label ? `Copy ${label}` : 'Copy'}
            onClick={copy}
          >
            {copied ? <Tick /> : <Clipboard />}
          </button>
        )}
      </div>
      {/* The confirmation is a live region rather than a label swap, because
          the icon changing is not something a screen reader announces and the
          person who most needs telling is the one who cannot see the tick. It
          holds its row, so a value's box does not move when a copy lands. */}
      <span className="kairos-copy-field-status" role="status">
        {failed ? 'Copying is blocked here. Select the value and copy it by hand.' : copied ? 'Copied' : ''}
      </span>
    </div>
  );
}

/**
 * How long the tick stays.
 *
 * Long enough to be seen after the eye has moved to where the value is going,
 * short enough that a second copy of a different value is not read as the
 * first one's confirmation.
 */
const CONFIRMATION_MS = 1600;

/* Inline glyphs. An icon package for two shapes would land in every app that
   imports a single component from this one; `Dialog`'s close cross is inline
   for the same reason. */

function Clipboard() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <rect x="5.5" y="1.5" width="9" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 14.5h-8a1 1 0 0 1-1-1v-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Tick() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M2.5 8.5l3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
