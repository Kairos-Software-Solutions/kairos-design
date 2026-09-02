'use client';

import { useMemo, useState } from 'react';
import { Select as RadixSelect } from 'radix-ui';

/**
 * The number of options past which a list stops being scannable and starts
 * needing a search box.
 *
 * It is a number rather than a judgement for the reason `ActionSet` exists: a
 * rule that needs a decision at every call site fails at some call sites. Ten
 * is where a list stops fitting on a phone screen without scrolling, which is
 * the same place a person stops being able to see whether what they want is in
 * it.
 *
 * The same number decides the other question, and that is deliberate — one
 * boundary, not two. At ten or fewer, use the native `<select>` with
 * `kairos-select`: on a phone it opens the platform picker, which is a better
 * control than anything in this package and is the one the person already
 * knows. Past ten, use this.
 */
export const FILTER_THRESHOLD = 10;

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** The chosen option's `value`, or `undefined` for none. */
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  /** What the trigger reads before anything is chosen. */
  placeholder?: string;
  /**
   * Names the control for assistive technology. Required unless the control is
   * already named by a visible `<label>` — pass that label's `id` as
   * `labelledBy` instead. One of the two has to be there: a combobox whose
   * only label is the value currently inside it announces as whatever happens
   * to be chosen, which changes every time somebody uses it.
   */
  label?: string;
  labelledBy?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  /** What the filter box shows when it has narrowed the list to nothing. */
  emptyMessage?: string;
}

/**
 * A chooser for a set of options too long for the native control.
 *
 * **This does not replace `<select>`.** For ten options or fewer the native
 * control is better and stays: on a phone it opens the platform picker, it
 * works before hydration, and it costs nothing. `Field` renders one today and
 * goes on doing so. Reach for this only past `FILTER_THRESHOLD`, where a
 * person can no longer see the whole list and needs to type to find an entry.
 *
 * Which is what the filter box is for, and it is the reason this is built at
 * all. Radix `Select` has typeahead — type `bar` and it jumps to the first
 * option starting with `bar` — but jumping inside a list of two hundred
 * tenants is not the same as narrowing it to the four that match, and a person
 * who cannot remember how an entry starts is no better off. The box appears on
 * its own past the threshold rather than behind a prop, so the decision is not
 * one more thing to get right at a call site.
 *
 * Behaviour is Radix's: focus, dismissal, typeahead, and a list placed by a
 * wrapper Radix owns so no app stylesheet rule about `.kairos-combobox-menu`
 * can clip it. Every class is this package's.
 */
export default function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Choose…',
  label,
  labelledBy,
  id,
  name,
  disabled,
  emptyMessage = 'Nothing matches.',
}: SelectProps) {
  const [query, setQuery] = useState('');

  const filtering = options.length > FILTER_THRESHOLD;

  const shown = useMemo(() => {
    if (!filtering || query.trim() === '') return options;
    const needle = query.trim().toLowerCase();
    // Anywhere in the label, not just the start. A person looking for
    // "Bright Ideas Ltd" types "bright" as readily as "ideas", and a
    // starts-with match would find nothing for the second.
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [filtering, options, query]);

  return (
    <RadixSelect.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
      // Reset the filter on the way out rather than in an effect, so a list
      // reopened after a search never opens already narrowed to a word the
      // person has forgotten typing.
      onOpenChange={(open) => !open && setQuery('')}
    >
      <RadixSelect.Trigger
        id={id}
        className="kairos-select kairos-combobox"
        aria-label={labelledBy ? undefined : label}
        aria-labelledby={labelledBy}
      >
        <RadixSelect.Value className="kairos-combobox-value" placeholder={placeholder} />
        {/* A plain span rather than `Select.Icon`, which renders a `▼`
            character when it is given no children — and that glyph then sits
            under the caret this package draws. The caret is a rotated border
            for the reason `.kairos-select-wrap::after` is one: it follows
            `--kairos-text-muted` through both themes instead of baking a
            colour into a character or a data URI. */}
        <span className="kairos-combobox-caret" aria-hidden="true" />
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          className="kairos-combobox-menu"
          // Over the trigger rather than beside it, which is what a native
          // select does and what makes the list read as the same control.
          position="popper"
          sideOffset={4}
          collisionPadding={8}
        >
          {filtering ? (
            <input
              className="kairos-combobox-filter"
              type="text"
              value={query}
              placeholder="Type to narrow"
              // Radix's typeahead listens on the content and would eat every
              // keystroke meant for this box, so the keys stop here. Not
              // `preventDefault` — the input still needs them.
              onKeyDown={(event) => event.stopPropagation()}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Filter options"
            />
          ) : null}

          <RadixSelect.Viewport className="kairos-combobox-list">
            {shown.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="kairos-combobox-item"
              >
                {/* The tick holds its space whether or not it is drawn, so the
                    labels do not shift sideways as the selection moves. */}
                <span className="kairos-combobox-tick" aria-hidden="true">
                  <RadixSelect.ItemIndicator>
                    <svg width="14" height="14" viewBox="0 0 16 16" focusable="false">
                      <path
                        d="M3 8.5l3.2 3.2L13 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </RadixSelect.ItemIndicator>
                </span>
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>

          {/* A list that empties with no explanation reads as a control that
              broke. `role="status"` so the emptiness is announced rather than
              only drawn. */}
          {shown.length === 0 ? (
            <p className="kairos-combobox-empty" role="status">
              {emptyMessage}
            </p>
          ) : null}
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
