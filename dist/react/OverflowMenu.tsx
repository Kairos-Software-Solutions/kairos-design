'use client';

import { type RefObject } from 'react';
import { DropdownMenu } from 'radix-ui';

export interface OverflowItem {
  label: string;
  onSelect?: () => void;
  href?: string;
  /** Opens in a new tab. Only meaningful with `href`. */
  external?: boolean;
  /**
   * Renders the item unavailable rather than omitting it, taking the same two
   * signals every disabled control in this package takes: the ground drops to
   * the page and the label drops to muted, per ADR 0004. An item that
   * disappears when it cannot be used leaves a person hunting for something
   * they remember being there, with no way to find out why it went.
   *
   * A disabled item that carries an `href` renders without one, because an
   * anchor with no `href` is not focusable and not clickable — there is no
   * `disabled` attribute on a link to do the job.
   */
  disabled?: boolean;
  /**
   * Marks the item as destructive or irreversible. It is separated from the
   * routine items by a rule and carries the destructive treatment, so nobody
   * reaches it by muscle memory on the way to something safe.
   *
   * A destructive item still needs a `ConfirmDialog` behind it. This only
   * controls where it sits and how it reads.
   */
  destructive?: boolean;
}

export interface OverflowMenuProps {
  items: OverflowItem[];
  /** Names the record, so the trigger reads as "Actions for INV-0042". */
  label: string;
  /** Gives a page-level menu the same visual weight as its adjacent button. */
  context?: 'row' | 'header';
  /**
   * The trigger element, for a caller that has to put focus back on it.
   *
   * Radix returns focus here on close by itself, so nothing needs this to
   * open and close a menu. It exists for the one case where that restore does
   * not land: a menu item that opens a dialog. The dialog's focus scope
   * mounts first and wins, and the dialog then has nothing outside an overlay
   * to hand focus back to when it closes — measured, and it left a person who
   * had just cancelled a deletion at the top of the page. `ActionSet` passes
   * the same ref to `ConfirmDialog`, which restores to it.
   */
  triggerRef?: RefObject<HTMLButtonElement | null>;
}

/** The gap between the trigger and the menu, and the menu and the viewport. */
const SIDE_OFFSET = 6;
const VIEWPORT_PADDING = 8;

/**
 * The end-of-row action menu.
 *
 * A row's primary action is its own identifier as a link; everything else
 * belongs here. A rail of bordered buttons down the right of a table competes
 * with the data and makes every row look urgent, and it is the reason a
 * destructive action ends up one mis-tap away from a routine one. It is also
 * why the same icon-only button repeated down six rows cannot tell a screen
 * reader user which record they are about to delete — the trigger's label
 * names the record.
 *
 * The trigger carries a visible border at rest rather than appearing on hover:
 * hover does not exist on touch, does not show up in a screenshot, and cannot
 * be described to a customer over the phone.
 *
 * Behaviour comes from Radix `DropdownMenu`; every element and every class is
 * still this package's. What that bought, and what it retired, is in
 * `docs/decisions.md`. The one thing to know when reading this file: the menu
 * is placed by a wrapper element Radix owns, not by `.kairos-overflow-menu`,
 * so an app stylesheet writing a rule about our class can no longer put the
 * clipping back.
 */
export default function OverflowMenu({ items, label, context = 'row', triggerRef }: OverflowMenuProps) {

  // A trigger that opens an empty menu is a dead control. Render nothing.
  if (items.length === 0) return null;

  // Every item disabled is a different case, and it gets a different answer:
  // the trigger renders unavailable rather than opening a menu in which
  // nothing can be chosen. "No action can be taken on this record right now"
  // is information, and a disabled control is how the rest of this package
  // says it.
  //
  // It is also the only arrangement Radix cannot open with a mouse. Measured:
  // with `modal={false}` and no item able to take focus, the menu opens on
  // pointerdown and is dismissed again inside one frame, so a click appears to
  // do nothing at all. Keyboard opening works. A control that responds to a
  // keyboard and not to a click is worse than one that says it is unavailable.
  const allDisabled = items.every((item) => item.disabled);

  // Destructive items sit last, behind a rule.
  const ordered = [...items.filter((i) => !i.destructive), ...items.filter((i) => i.destructive)];
  const firstDestructive = ordered.findIndex((i) => i.destructive);

  return (
    // Not modal. A row menu does not take over the page, and Radix's modal
    // mode puts `pointer-events: none` on the body while it is open, which
    // makes the click that dismissed the menu stop there instead of reaching
    // what it landed on. Measured: with the default, a click on a control
    // outside the menu closed it and never fired that control's handler.
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          ref={triggerRef}
          type="button"
          className={`kairos-overflow-trigger${context === 'header' ? ' kairos-overflow-trigger--header' : ''}`}
          aria-label={`Actions for ${label}`}
          disabled={allDisabled}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <circle cx="3" cy="8" r="1.4" fill="currentColor" />
            <circle cx="8" cy="8" r="1.4" fill="currentColor" />
            <circle cx="13" cy="8" r="1.4" fill="currentColor" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="kairos-overflow-menu"
          // The menu's right edge meets the trigger's, which is where it has
          // always sat: the trigger is the last thing in the row.
          align="end"
          sideOffset={SIDE_OFFSET}
          collisionPadding={VIEWPORT_PADDING}
          // Wraps from the last item to the first, which the hand-rolled
          // arrow-key handling this replaces also did.
          loop
          // A menu anchored to a trigger that has scrolled out of a panel is
          // pointing at nothing. Closing it is the honest outcome.
          hideWhenDetached
        >
          {ordered.map((item, index) => {
            const startsDestructive = firstDestructive > 0 && index === firstDestructive;
            const className = [
              'kairos-overflow-item',
              item.destructive && 'kairos-overflow-item--destructive',
              startsDestructive && 'kairos-overflow-item--divided',
            ]
              .filter(Boolean)
              .join(' ');

            if (item.href) {
              return (
                <DropdownMenu.Item asChild key={item.label} disabled={item.disabled}>
                  <a
                    className={className}
                    href={item.disabled ? undefined : item.href}
                    target={item.external && !item.disabled ? '_blank' : undefined}
                    rel={item.external && !item.disabled ? 'noreferrer' : undefined}
                  >
                    {item.label}
                  </a>
                </DropdownMenu.Item>
              );
            }

            // `asChild` rather than letting Radix render its own `div`. The
            // element is part of the contract: `.kairos-overflow-item` sets
            // `border: 0`, `background: transparent` and `font: inherit`,
            // which are declarations only a button needs. On a div they are
            // three lines of stylesheet that do nothing.
            return (
              <DropdownMenu.Item
                asChild
                key={item.label}
                disabled={item.disabled}
                onSelect={() => item.onSelect?.()}
              >
                <button type="button" className={className} disabled={item.disabled}>
                  {item.label}
                </button>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
