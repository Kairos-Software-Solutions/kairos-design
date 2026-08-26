import { type InputHTMLAttributes, type ReactNode, forwardRef, useId } from 'react';

export interface FieldProps {
  label: string;
  /** What the field expects. Not the error. */
  hint?: ReactNode;
  /** Plain language saying what to do next, not a validator's output. */
  error?: ReactNode;
  children: (ids: { id: string; describedBy: string | undefined }) => ReactNode;
}

/**
 * Label, control, hint, and error as one unit.
 *
 * The hint and error rows are always rendered, even when empty. Geometry comes
 * from the slot and not from the content in it: a field that grows a row when
 * validation fails moves every control below it, which on a phone moves the
 * submit button out from under the thumb that is reaching for it.
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
