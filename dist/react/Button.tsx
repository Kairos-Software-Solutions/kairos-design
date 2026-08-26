import { type ButtonHTMLAttributes, forwardRef } from 'react';

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
}

/**
 * Every variant is a class, not an inline style object. The styles used to
 * live here as `style={{ '--button-bg': ... }}`, which meant the CSS shipped a
 * button with no ranks at all and the apps without React had to invent their
 * own set. A modifier reaches all five surfaces.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', className, children, type = 'button', ...props },
  ref
) {
  const classes = ['kairos-button', MODIFIER[variant], size === 'sm' && 'kairos-button--sm', className]
    .filter(Boolean)
    .join(' ');

  return (
    // Defaulting to `type="button"`: an untyped button inside a form is a
    // submit button, so a Cancel that forgot the attribute submits the form it
    // was meant to abandon.
    <button ref={ref} type={type} className={classes} {...props}>
      {children}
    </button>
  );
});

export default Button;
