'use client';

import { type ReactNode } from 'react';
import { Popover as RadixPopover } from 'radix-ui';

export interface PopoverProps {
  /** The control that opens it. One element, which takes the trigger. */
  trigger: ReactNode;
  children: ReactNode;
  /** Names the panel for assistive technology. */
  label: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A small panel of content or controls, anchored to what opened it.
 *
 * **Which of the three to reach for**, because they overlap and the wrong one
 * is not obviously wrong until somebody uses it:
 *
 * - `OverflowMenu` is a list of *actions*, one of which you pick, and picking
 *   one closes it. Arrow keys move between them and typeahead jumps. If what
 *   you have is a list of things to do to a record, it is a menu, and it
 *   should be `ActionSet` rather than either of these.
 * - `Popover` is *content* — a form, a filter, a colour picker, an
 *   explanation with a link in it. It can hold several controls, it does not
 *   close when one is used, and it has no notion of a chosen item. Nothing in
 *   it is a menu item, and arrow keys do not move between its contents.
 * - `Dialog` takes over the page: focus stays inside it, the rest of the page
 *   goes unavailable to assistive technology, and the person answers before
 *   doing anything else. Use it when the answer cannot wait or the content is
 *   the whole task. A popover is dismissible by clicking anywhere else, which
 *   makes it wrong for anything you need an answer to.
 *
 * The short version: a menu is for picking, a popover is for doing something
 * small beside the page, a dialog is for stopping the page.
 *
 * Not modal, for the reason `OverflowMenu` is not: a modal layer puts
 * `pointer-events: none` on the body, so the click that dismissed the popover
 * stops there instead of reaching the control it landed on.
 */
export default function Popover({
  trigger,
  children,
  label,
  side = 'bottom',
  align = 'start',
  open,
  onOpenChange,
}: PopoverProps) {
  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          className="kairos-popover"
          aria-label={label}
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={8}
          // Anchored to a trigger that has scrolled out of a panel, it is
          // pointing at nothing. Closing is the honest outcome, and it is what
          // `OverflowMenu` does for the same reason.
          hideWhenDetached
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
