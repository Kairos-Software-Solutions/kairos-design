'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * A section's open state, remembered per device.
 *
 * A device preference, like the theme: nothing is stored on a server, and a
 * section opened on the phone is not opened on the laptop. Only a choice that
 * differs from the section's default is written, so a person who never touched
 * a section keeps following its default if the screen later changes it.
 *
 * Keys are `<prefix><id>`. The id names the section, not the record — the
 * invoices on a customer, not this customer's invoices — so a person who keeps
 * one section open keeps it open on every record.
 */
let prefix = 'kairos.open.';

/**
 * Call once at startup to keep an app's keys beside its other preferences:
 * Paykit's theme is `paykit.theme`, so its sections are `paykit.open.<id>`.
 */
export function setDisclosureStoragePrefix(next: string): void {
  prefix = next;
}

function read(id: string): boolean | null {
  try {
    const value = window.localStorage.getItem(prefix + id);
    return value === 'open' ? true : value === 'closed' ? false : null;
  } catch {
    // Storage refused (private mode, a full quota, a blocked origin). The
    // section falls back to its default, which is what it would show anyway.
    return null;
  }
}

function write(id: string, open: boolean, defaultOpen: boolean): void {
  try {
    if (open === defaultOpen) window.localStorage.removeItem(prefix + id);
    else window.localStorage.setItem(prefix + id, open ? 'open' : 'closed');
  } catch {
    // As above: a preference that cannot be stored is a preference forgotten,
    // not a failure the person needs to hear about.
  }
}

/**
 * `[open, setOpen]` for a section that remembers itself under `id`.
 *
 * The first render is the default, on the server and in the browser alike, so
 * hydration matches; a remembered choice applies straight after. With no `id`
 * this is plain state.
 */
export function useRememberedOpen(
  id: string | undefined,
  defaultOpen: boolean
): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!id) return;
    const stored = read(id);
    if (stored !== null) setOpen(stored);
  }, [id]);

  const update = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (id) write(id, next, defaultOpen);
    },
    [id, defaultOpen]
  );

  return [open, update];
}
