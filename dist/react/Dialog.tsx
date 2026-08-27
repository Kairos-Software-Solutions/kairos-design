'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * A modal surface.
 *
 * Requires `@radix-ui/react-dialog` as a peer dependency. That is a deliberate
 * exception to this registry's no-dependency rule: a modal has to trap focus,
 * restore it, close on Escape, mark the rest of the page inert, and keep all
 * of that correct across React's concurrent rendering. Hand-rolling it in a
 * shared component means every Kairos app inherits the same subtle keyboard
 * trap.
 */
export default function Dialog({ open, onClose, title, children }: DialogProps) {
  const restoreTo = useRef<HTMLElement | null>(null);

  // Radix returns focus to its own `Dialog.Trigger`. Kairos apps have none:
  // every dialog is opened by a control that lives on the screen, with the
  // dialog mounted beside it, so Radix has nothing to hand focus back to and
  // drops it on `<body>` — which puts a keyboard user back at the top of the
  // page every time they close something.
  //
  // So the last thing to hold focus *outside* any dialog is remembered, and
  // that is the control that opened this one. Anything inside a dialog is
  // deliberately not remembered: while this one closes, its own content still
  // holds focus, and restoring focus to a node that is being removed lands on
  // `<body>` just the same.
  useEffect(() => {
    const remember = () => {
      const active = document.activeElement as HTMLElement | null;
      if (!active || active === document.body || active.closest('[role="dialog"]')) return;
      restoreTo.current = active;
    };
    remember();
    document.addEventListener('focusin', remember);
    return () => document.removeEventListener('focusin', remember);
  }, []);

  return (
    <RadixDialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="kairos-dialog-overlay" />
        <RadixDialog.Content
          className="kairos-dialog-content"
          onCloseAutoFocus={(event) => {
            const target = restoreTo.current;
            if (!target?.isConnected) return;
            event.preventDefault();
            target.focus();
          }}
        >
          <div className="kairos-split kairos-split--baseline">
            <RadixDialog.Title className="kairos-dialog-title">{title}</RadixDialog.Title>
            <RadixDialog.Close asChild>
              <button type="button" onClick={onClose} className="kairos-icon-action" aria-label="Close">
                {/* An inline glyph rather than an icon package: this is the one
                    icon the registry needs, and a dependency for it would land
                    in every app that imports a single component. */}
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path
                    d="M3 3l10 10M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </button>
            </RadixDialog.Close>
          </div>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
