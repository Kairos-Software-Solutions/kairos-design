'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import InputField from './Field';
import Segmented from './Segmented';

/**
 * One segmented filter in the bar.
 *
 * `key` is where its value lands in `FilterState.segments`, and it is what the
 * screen reads to narrow its own rows. The bar does not narrow anything: it
 * collects a filter state and hands it over, because what "overdue" means is
 * the screen's business and not this component's.
 */
export interface FilterSegment {
  key: string;
  /** Names what it filters: "Filter invoices by state". */
  label: string;
  options: Array<{ value: string; label: string }>;
}

/**
 * What the bar has collected.
 *
 * One object rather than a value per control, because every app that wrote its
 * own filter bar also wrote its own way of holding the answer, and the shape
 * is the part they disagreed on. `search` has already settled: it is what the
 * reader typed once they stopped typing, not what they have typed so far.
 */
export interface FilterState {
  search: string;
  segments: Record<string, string>;
}

export interface FilterBarProps {
  /** Names the bar for assistive technology: "Filter invoices". */
  label: string;
  value: FilterState;
  onChange: (next: FilterState) => void;
  /** Omit to leave the search box out; a bar can be segments alone. */
  search?: { label?: string; placeholder?: string };
  segments?: FilterSegment[];
  /**
   * How long a burst of typing settles before the list re-filters.
   *
   * 250ms is under the threshold where a reader notices a wait and over the
   * gap between two keystrokes, so a five-letter term filters once instead of
   * five times. Filtering per keystroke on a three-hundred-row table re-sorts
   * and re-pages the whole list four times on the way to the answer.
   */
  debounceMs?: number;
  /** Anything else the screen filters by — a date range, a customer picker. */
  children?: ReactNode;
}

/**
 * The row above a record list that narrows it.
 *
 * The CSS for this shipped in 0.1.0 and every app wrote the component itself,
 * which is why the manifest listed it as built and unbuilt at the same time:
 * `kairos-filter-bar` was there and the debounce and the filter-state contract
 * were per-app. Those two are the whole of what this adds.
 *
 * It narrows as the reader types and has no Apply button. A bar that submits
 * makes the reader press something to find out whether their term was right,
 * and then press it again. `kairos-filter-bar-action` stays in the stylesheet
 * for a hand-written bar that genuinely submits — a report that runs a query
 * rather than a list that filters rows already on screen.
 *
 * Sorting is not here. The table header does that, and a bar that also sorted
 * would give one list two places to be ordered from.
 */
export default function FilterBar({
  label,
  value,
  onChange,
  search,
  segments,
  debounceMs = 250,
  children,
}: FilterBarProps) {
  // What is in the box right now, which is not yet what the list is filtered
  // by. The input has to redraw on every keystroke — it is showing the
  // character that was just typed — and the point of the debounce is that the
  // table below it does not.
  const [term, setTerm] = useState(value.search);

  // Read through a ref so a call site writing an inline arrow, which is all of
  // them, does not restart the timer on every render of the screen above.
  const latest = useRef({ value, onChange });
  latest.current = { value, onChange };

  // A term arriving from outside — the narrowed-to-nothing state's clear
  // control, or a saved view — replaces what is in the box.
  useEffect(() => {
    setTerm(value.search);
  }, [value.search]);

  useEffect(() => {
    if (term === latest.current.value.search) return;
    const timer = setTimeout(() => {
      latest.current.onChange({ ...latest.current.value, search: term });
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [term, debounceMs]);

  // A press on a segment is deliberate and there is nothing to settle, so it
  // lands immediately. Debouncing it would make a filter chip feel broken.
  function pick(key: string, next: string) {
    onChange({ ...value, segments: { ...value.segments, [key]: next } });
  }

  return (
    <form
      className="kairos-panel kairos-filter-bar"
      aria-label={label}
      // The bar narrows as it goes, so there is nothing to submit. Enter in
      // the search box flushes the pending term instead of reloading the page.
      onSubmit={(event) => {
        event.preventDefault();
        if (term !== value.search) onChange({ ...value, search: term });
      }}
    >
      {search ? (
        <div className="kairos-filter-bar-search">
          <InputField
            type="search"
            label={search.label ?? 'Search'}
            placeholder={search.placeholder}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          />
        </div>
      ) : null}

      {segments?.map((segment) => (
        <Segmented
          key={segment.key}
          label={segment.label}
          options={segment.options}
          value={value.segments[segment.key] ?? segment.options[0]?.value ?? ''}
          onChange={(next) => pick(segment.key, next)}
        />
      ))}

      {children}
    </form>
  );
}
