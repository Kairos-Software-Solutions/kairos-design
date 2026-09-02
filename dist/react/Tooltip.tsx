'use client';

import { type ReactNode } from 'react';
import { Tooltip as RadixTooltip } from 'radix-ui';

export interface TooltipProps {
  /** The control the tooltip explains. One element, which takes the trigger. */
  children: ReactNode;
  /**
   * The extra thing worth knowing, and only ever the extra thing.
   *
   * It is never a control's only name. Hover does not exist on touch, does not
   * survive a screenshot, and cannot be read out to a customer on the phone —
   * so anything that is the sole way to know what a control does has to be
   * somewhere a person can reach without a pointer. `Tooltip` cannot enforce
   * that on its own, which is why it takes `name` below.
   */
  content: ReactNode;
  /**
   * The control's accessible name, for an icon-only trigger.
   *
   * Pass it and this puts it on the trigger as `aria-label`, so the control is
   * named without the tooltip ever opening. Leave it out only when the trigger
   * already carries visible text, which is its own name.
   */
  name?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Milliseconds before it opens on hover. */
  delay?: number;
}

/**
 * A short explanation attached to a control.
 *
 * Enhancement, never the information itself. The requirement it exists under
 * says an overlay that appears only on hover never carries a control's sole
 * name or description, and that is not a style rule — a tooltip is unreachable
 * to anyone on a touch screen, invisible in every screenshot a support ticket
 * ever carries, and gone by the time a person reads it aloud down the phone.
 *
 * So an icon-only control keeps its own `aria-label` through `name`, and the
 * tooltip repeats it for people using a pointer. Radix would otherwise label
 * the trigger *from* the tooltip content, which reads correctly in a test and
 * leaves the control nameless the moment the content is decoration rather than
 * a name.
 *
 * `Tooltip.Provider` is mounted here rather than at the app root, so a single
 * tooltip on a screen needs no setup. Radix nests providers without complaint.
 */
export default function Tooltip({ children, content, name, side = 'top', delay = 200 }: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={delay}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild aria-label={name}>
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="kairos-tooltip"
            side={side}
            sideOffset={6}
            collisionPadding={8}
            // Radix marks its content `role="tooltip"` and points the trigger's
            // `aria-describedby` at it. Described, not named: the name is the
            // trigger's own, which is what `name` is for.
          >
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
