'use client';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string> {
  /** Names what is being filtered or chosen, e.g. "Filter payments". */
  label: string;
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
}

/**
 * Filters, wizard steps, and the theme choice on a settings screen.
 *
 * A filter is not an action, so it must not look like the buttons in the page
 * header. The segments share borders and read as one control, and the active
 * one carries the amber active-navigation treatment rather than the primary
 * button's border and stamp.
 *
 * The active segment is also stated in `aria-pressed` and marked by weight, so
 * it survives greyscale and colour blindness.
 */
export default function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div className="kairos-segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="kairos-segmented-option"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
