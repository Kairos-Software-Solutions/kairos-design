import { type ButtonHTMLAttributes, type MouseEvent, type ReactNode, forwardRef } from 'react';

/**
 * Rank carries meaning, and it is carried by fill, border, and stamp rather
 * than by size.
 *
 * `primary` is amber with a stamp and there is exactly one per screen.
 * `secondary` is the outline, and it stays flat in every state: a hover-only
 * stamp would make the two ranks identical for anyone on touch, where hover
 * does not exist. `tertiary` and `ghost` are borderless, for the actions that
 * should not compete at all.
 *
 * `dangerSolid` is rank 1 in the destructive palette, reserved for the confirm
 * button of a `ConfirmDialog`. It needs rank-1 weight because it is the button
 * that commits, and rank 1 in amber would tell the user that the irreversible
 * option is the safe way forward.
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'danger'
  | 'dangerSolid';

const MODIFIER: Record<ButtonVariant, string> = {
  primary: 'kairos-button--primary',
  secondary: 'kairos-button--secondary',
  tertiary: 'kairos-button--tertiary',
  ghost: 'kairos-button--ghost',
  danger: 'kairos-button--danger',
  dangerSolid: 'kairos-button--danger-solid',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  /**
   * The action is in flight. The button keeps its rank and its box, shows a
   * turning ring, announces itself busy, and swallows every further press.
   *
   * Pass it as a live boolean rather than toggling the label yourself:
   * `loading={isSaving}`. Passing the prop at all — even `false` — is what
   * reserves room for the pending label, so a button that can load is one
   * width for its whole life.
   */
  loading?: boolean;
  /**
   * What the button says while it is working: `Saving…`, `Sending invoice…`.
   *
   * Name the work. This is the one part of the state a screen reader gets and
   * the only part that survives `prefers-reduced-motion`, where the ring stops
   * turning and a bare glyph says nothing at all. It defaults to the resting
   * label, which is legible but tells the user nothing they did not know.
   */
  loadingLabel?: ReactNode;
}

/**
 * Every variant is a class, not an inline style object. The styles used to
 * live here as `style={{ '--button-bg': ... }}`, which meant the CSS shipped a
 * button with no ranks at all and the apps without React had to invent their
 * own set. A modifier reaches all five surfaces.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading,
    loadingLabel,
    className,
    children,
    type = 'button',
    onClick,
    ...props
  },
  ref
) {
  const classes = ['kairos-button', MODIFIER[variant], size === 'sm' && 'kairos-button--sm', className]
    .filter(Boolean)
    .join(' ');

  // Naming the prop is the opt-in, not setting it. A button handed
  // `loading={false}` can load, so it reserves the pending cell now and holds
  // one width for its whole life; a button handed neither renders exactly the
  // markup it did before this prop existed, which is what keeps an app rule
  // about `.kairos-button > svg` working.
  const canLoad = loading !== undefined || loadingLabel !== undefined;
  const busy = loading === true;

  /**
   * `aria-disabled` rather than `disabled`, which is the opposite of what every
   * other control in this package does, and the exception is the point.
   *
   * Elsewhere `disabled` means "unavailable, and still unavailable after you
   * look away", so losing focus to the body costs nothing. A button waiting on
   * a response is available, mid-flight, and about to come back — and it is
   * usually the control the user just pressed Enter on. Setting `disabled`
   * moves their focus to nowhere and drops them out of the form at the moment
   * the answer arrives.
   *
   * So the press is refused here instead. Both a click and Enter fire this
   * handler, including the implicit submission a browser routes through the
   * default button, and `preventDefault` is what stops a second submit from a
   * `type="submit"` — which on this brand's surfaces means a second invoice
   * sent to a customer.
   */
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (busy) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  }

  const label = canLoad ? (
    <span className="kairos-button-stack">
      <span className="kairos-button-label">{children}</span>
      <span className="kairos-button-pending">
        {/* The ring and the animation are both already in the vocabulary and
            neither had a caller. `currentColor` means it takes the rank's own
            label colour and needs no variant of its own. */}
        <span className="kairos-progress-dot kairos-spin" aria-hidden="true" />
        {loadingLabel ?? children}
      </span>
    </span>
  ) : (
    children
  );

  return (
    // Defaulting to `type="button"`: an untyped button inside a form is a
    // submit button, so a Cancel that forgot the attribute submits the form it
    // was meant to abandon.
    // `props` spreads first so the busy attributes below cannot be overwritten
    // by a call site passing its own `aria-busy`. The component owns that state.
    <button
      {...props}
      ref={ref}
      type={type}
      className={classes}
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      onClick={handleClick}
    >
      {label}
    </button>
  );
});

export default Button;
