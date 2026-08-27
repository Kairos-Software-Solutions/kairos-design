'use client';

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

export interface OverflowItem {
  label: string;
  onSelect?: () => void;
  href?: string;
  /** Opens in a new tab. Only meaningful with `href`. */
  external?: boolean;
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
}

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
 */
export default function OverflowMenu({ items, label, context = 'row' }: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | HTMLAnchorElement | null>>([]);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    // Focus the first item, so the menu is operable without a pointer.
    itemRefs.current.find(Boolean)?.focus();

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (!wrapRef.current?.contains(target) && !menuRef.current?.contains(target)) close(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        // Stop here rather than letting it reach a dialog behind the menu,
        // which would close both on one press.
        event.stopPropagation();
        close(true);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  /**
   * The menu is portalled to the document body and positioned by hand.
   *
   * A table panel is a horizontal overflow container, so a menu rendered
   * inside one becomes clipped by it — on a short table the menu is cut off
   * a few pixels below the trigger. Keeping it in the document layer means
   * nothing in the table can become its clipping parent.
   *
   * Recalculated on scroll as well as resize, so it stays anchored to its
   * trigger while the page moves under it.
   */
  useLayoutEffect(() => {
    if (!open) return;

    function positionMenu() {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;

      const triggerRect = trigger.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const gap = 6;
      const viewportPadding = 8;

      const left = Math.min(
        Math.max(viewportPadding, triggerRect.right - menuRect.width),
        Math.max(viewportPadding, window.innerWidth - menuRect.width - viewportPadding)
      );

      // Below by default, above when there is no room below and there is room
      // above. A menu that opens off the bottom of a phone is unreachable.
      const below = triggerRect.bottom + gap;
      const above = triggerRect.top - menuRect.height - gap;
      const top =
        below + menuRect.height <= window.innerHeight - viewportPadding || above < viewportPadding
          ? Math.min(below, window.innerHeight - menuRect.height - viewportPadding)
          : above;

      setMenuPosition({ top: Math.max(viewportPadding, top), left });
    }

    positionMenu();
    window.addEventListener('resize', positionMenu);
    window.addEventListener('scroll', positionMenu, true);
    return () => {
      window.removeEventListener('resize', positionMenu);
      window.removeEventListener('scroll', positionMenu, true);
    };
  }, [open]);

  function moveFocus(from: number, delta: number) {
    const usable = itemRefs.current.filter(Boolean) as HTMLElement[];
    if (usable.length === 0) return;
    usable[(from + delta + usable.length) % usable.length]?.focus();
  }

  function onItemKeyDown(event: ReactKeyboardEvent, index: number) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveFocus(index, 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(index, -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveFocus(-1, 1);
    } else if (event.key === 'End') {
      event.preventDefault();
      moveFocus(0, -1);
    }
  }

  const usable = items.filter((item) => !item.disabled);

  // A trigger that opens an empty menu is a dead control. Render nothing.
  if (usable.length === 0) return null;

  // Destructive items sit last, behind a rule.
  const ordered = [...usable.filter((i) => !i.destructive), ...usable.filter((i) => i.destructive)];
  const firstDestructive = ordered.findIndex((i) => i.destructive);

  // Trim the ref array to this render's length. It is keyed by position, so a
  // list that shrinks would otherwise leave detached nodes on the end and
  // arrow-key navigation would step into them.
  itemRefs.current.length = ordered.length;

  return (
    <div className="kairos-overflow" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`kairos-overflow-trigger${context === 'header' ? ' kairos-overflow-trigger--header' : ''}`}
        aria-label={`Actions for ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          // Clear the last position so the menu is not painted at the previous
          // trigger's coordinates for one frame before it is measured.
          setMenuPosition(null);
          setOpen((value) => !value);
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <circle cx="3" cy="8" r="1.4" fill="currentColor" />
          <circle cx="8" cy="8" r="1.4" fill="currentColor" />
          <circle cx="13" cy="8" r="1.4" fill="currentColor" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="kairos-overflow-menu"
            id={menuId}
            role="menu"
            aria-label={`Actions for ${label}`}
            style={{
              top: menuPosition?.top ?? 0,
              left: menuPosition?.left ?? 0,
              // Hidden until measured, so it never flashes at the top-left of
              // the viewport on the frame before it is placed.
              visibility: menuPosition ? 'visible' : 'hidden',
            }}
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

              const shared = {
                role: 'menuitem' as const,
                className,
                onKeyDown: (event: ReactKeyboardEvent) => onItemKeyDown(event, index),
              };

              if (item.href) {
                return (
                  <a
                    {...shared}
                    key={item.label}
                    ref={(node) => {
                      itemRefs.current[index] = node;
                    }}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noreferrer' : undefined}
                    // Navigating away, so there is nothing to return focus to.
                    onClick={() => close(false)}
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <button
                  {...shared}
                  key={item.label}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  type="button"
                  onClick={() => {
                    close(true);
                    item.onSelect?.();
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
