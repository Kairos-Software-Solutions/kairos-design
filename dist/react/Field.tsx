import {
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
  useId,
} from 'react';

export interface FieldProps {
  label: string;
  /** What the field expects. Not the error. */
  hint?: ReactNode;
  /** Plain language saying what to do next, not a validator's output. */
  error?: ReactNode;
  children: (ids: { id: string; describedBy: string | undefined }) => ReactNode;
}

/**
 * Label, control, and one message slot.
 *
 * Both `<p>` elements are always in the DOM, because `aria-describedby` needs
 * something stable to point at, but they share a single row. The hint holds it
 * whether or not it carries content, and an error replaces the hint rather than
 * stacking below it.
 *
 * Geometry comes from the slot and not from the content in it: a field that
 * grows a row when validation fails moves every control below it, which on a
 * phone moves the submit button out from under the thumb that is reaching for
 * it. Reserving a second row bought that guarantee and cost 24px on every field
 * in the system, most of them showing nothing.
 *
 * The hint holds the slot rather than the error because the hint is the row
 * that exists more often. Hand the error the slot instead and a field with no
 * hint grows the moment validation fails, which is the thing being prevented.
 *
 * A call site needing the hint visible alongside an error composes both into
 * the error content. There is no arrangement where they stack.
 */
export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  // Point at whichever rows have content. A `aria-describedby` naming an empty
  // node makes a screen reader announce nothing after the label, which reads
  // as the control having failed to load.
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="kairos-field">
      <label className="kairos-input-label" htmlFor={id}>
        {label}
      </label>
      {children({ id, describedBy })}
      <p className="kairos-field-hint" id={hintId}>
        {hint}
      </p>
      <p className="kairos-field-error" id={errorId} role={error ? 'alert' : undefined}>
        {error}
      </p>
    </div>
  );
}

export interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
}

/**
 * The common case: a labelled text input. Reach for `Field` directly when the
 * control is something else.
 */
const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  { label, hint, error, className, ...props },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy }) => (
        <input
          ref={ref}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={['kairos-input-field', className].filter(Boolean).join(' ')}
          {...props}
        />
      )}
    </Field>
  );
});

export default InputField;

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  hint?: ReactNode;
  /** Why this value was refused. Empty or absent means it was not. */
  error?: ReactNode;
}

/**
 * A labelled `<textarea>`.
 *
 * `kairos-input-field` has styled a textarea since the port — its own height,
 * its padding, and `resize: vertical` — and `Field` has taken one through its
 * render prop for as long as it has had one, so what was missing here was only
 * the name. This sat under "Not yet built" for three versions on the grounds
 * that it is not an overlay and claiming it would have grown a component for
 * no reason; the reason arrived when a consuming app wrote it, because the app
 * that writes it is the app whose textarea will eventually disagree with
 * everyone else's.
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, ...props },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy }) => (
        <textarea
          ref={ref}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={['kairos-input-field', className].filter(Boolean).join(' ')}
          {...props}
        />
      )}
    </Field>
  );
});

export { Textarea };

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  hint?: ReactNode;
  /** Why this choice was refused. Empty or absent means it was not. */
  error?: ReactNode;
}

/**
 * A labelled native `<select>`, in its caret wrapper.
 *
 * This is the short chooser, and it is the one the manifest has always told
 * people to reach for without giving them anything to call. `Select` is the
 * other one: the combobox for a list past ten options, which grows a filter
 * box because past ten a person can no longer see whether what they want is in
 * the list. Ten or fewer, the native control wins on merit — it opens the
 * platform picker on a phone, it works before hydration, and it costs nothing.
 *
 * With a row for the long list and no row for the short one, every app was
 * hand-assembling `Field` around `kairos-select-wrap` around `kairos-select`,
 * and the wrapper is the part that gets left out — without it the caret is
 * gone and the box is a native select painted over.
 */
const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, hint, error, className, children, ...props },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy }) => (
        <span className="kairos-select-wrap">
          <select
            ref={ref}
            id={id}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            className={['kairos-select', className].filter(Boolean).join(' ')}
            {...props}
          >
            {children}
          </select>
        </span>
      )}
    </Field>
  );
});

export { SelectField };
