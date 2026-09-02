/**
 * The constraints `ActionSet` claims, checked by the compiler.
 *
 * `ActionSetProps` exists to make an arrangement the branding skill forbids
 * fail to compile. A type that is believed to forbid something and does not is
 * worse than no type, because the review it replaced is no longer happening.
 * So every `@ts-expect-error` below is a claim, and `npm run typecheck` fails
 * if any of them stops being an error.
 *
 * Not published: `files` in package.json is `dist`, `bin` and the manifest.
 */
import type { Action, ActionSetProps } from '../../dist/react/ActionSet';

const act: Action = { label: 'Send', onSelect: () => {} };

/* Allowed. */

export const pageFull: ActionSetProps = {
  context: 'page',
  primary: act,
  secondary: [act, act],
  more: [act, act, act],
};

export const pageBare: ActionSetProps = { context: 'page' };
export const dialogPair: ActionSetProps = { context: 'dialog', primary: act, secondary: [act] };
export const secondaryEmpty: ActionSetProps = { context: 'page', secondary: [] };
export const rowMenu: ActionSetProps = { context: 'row', more: [act, act] };
export const cardMenu: ActionSetProps = { context: 'card', more: [act] };

export const destructive: ActionSetProps = {
  context: 'page',
  more: [
    {
      label: 'Delete',
      onSelect: () => {},
      destructive: { confirm: 'Delete INV-2026-0184? The invoice is removed for everyone.' },
    },
  ],
};

/* Forbidden. */

// A row carries no ranked buttons. This is the skill's row contract, and the
// reason the context is a union rather than an enum.
export const rowWithPrimary: ActionSetProps = {
  context: 'row',
  // @ts-expect-error a row has no primary slot
  primary: act,
};

export const cardWithSecondary: ActionSetProps = {
  context: 'card',
  // @ts-expect-error a card has no secondary slot
  secondary: [act],
};

// The secondary budget is two.
export const threeSecondary: ActionSetProps = {
  context: 'page',
  // @ts-expect-error a third secondary action is past the budget
  secondary: [act, act, act],
};

// Exactly one action can claim the primary rank, so the slot is one action and
// not a list of them.
export const twoPrimary: ActionSetProps = {
  context: 'page',
  // @ts-expect-error primary is one action, not a list
  primary: [act, act],
};

// A destructive action carries its confirmation. Marking one destructive
// without saying what the confirmation reads is the state this component
// exists to make unreachable.
export const destructiveWithoutConfirm: ActionSetProps = {
  context: 'page',
  more: [
    {
      label: 'Delete',
      onSelect: () => {},
      // @ts-expect-error a destructive action has to name its confirmation
      destructive: true,
    },
  ],
};

// Rank is decided by the slot an action sits in, so an action cannot declare
// one of its own.
export const actionClaimingRank: ActionSetProps = {
  context: 'page',
  // @ts-expect-error an action does not carry its own rank
  primary: { label: 'Send', onSelect: () => {}, rank: 'primary' },
};

// A context nothing renders.
export const unknownContext: ActionSetProps = {
  // @ts-expect-error there are four contexts
  context: 'sidebar',
};
