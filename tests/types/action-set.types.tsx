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
import type {
  Action,
  ActionSetProps,
  DestructiveAction,
  RankedAction,
} from '../../dist/react/ActionSet';

const act: RankedAction = { label: 'Send', onSelect: () => {} };

const wipe: DestructiveAction = {
  label: 'Delete',
  onSelect: () => {},
  destructive: { confirm: 'Delete INV-2026-0184? The invoice is removed for everyone.' },
};

// A `RankedAction` is an `Action`; the reverse is what the ranked slots
// refuse. Asserting it here means the widening is checked rather than assumed.
export const anyAction: Action = act;

/* Allowed. */

export const pageFull: ActionSetProps = {
  context: 'page',
  label: 'Invoices',
  primary: act,
  secondary: [act, act],
  more: [act, act, act],
};

export const pageBare: ActionSetProps = { context: 'page', label: 'Invoices' };
export const dialogPair: ActionSetProps = { context: 'dialog', primary: act, secondary: [act] };
export const secondaryEmpty: ActionSetProps = { context: 'page', label: 'Invoices', secondary: [] };
export const rowMenu: ActionSetProps = { context: 'row', label: 'INV-0042', more: [act, act] };
export const cardMenu: ActionSetProps = { context: 'card', label: 'INV-0042', more: [act] };

export const destructive: ActionSetProps = {
  context: 'page',
  label: 'Invoices',
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
  label: 'INV-0042',
  // @ts-expect-error a row has no primary slot
  primary: act,
};

export const cardWithSecondary: ActionSetProps = {
  context: 'card',
  label: 'INV-0042',
  // @ts-expect-error a card has no secondary slot
  secondary: [act],
};

// The secondary budget is two.
export const threeSecondary: ActionSetProps = {
  context: 'page',
  label: 'Invoices',
  // @ts-expect-error a third secondary action is past the budget
  secondary: [act, act, act],
};

// Exactly one action can claim the primary rank, so the slot is one action and
// not a list of them.
export const twoPrimary: ActionSetProps = {
  context: 'page',
  label: 'Invoices',
  // @ts-expect-error primary is one action, not a list
  primary: [act, act],
};

// A destructive action carries its confirmation. Marking one destructive
// without saying what the confirmation reads is the state this component
// exists to make unreachable.
export const destructiveWithoutConfirm: ActionSetProps = {
  context: 'page',
  label: 'Invoices',
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
  label: 'Invoices',
  // @ts-expect-error an action does not carry its own rank
  primary: { label: 'Send', onSelect: () => {}, rank: 'primary' },
};

// A context nothing renders.
export const unknownContext: ActionSetProps = {
  // @ts-expect-error there are four contexts
  context: 'sidebar',
};

/* Links, allowed. */

export const linkAction: ActionSetProps = {
  context: 'row',
  label: 'INV-0042',
  more: [{ label: 'Open in Paykit', href: '#paykit' }],
};

export const externalLink: ActionSetProps = {
  context: 'row',
  label: 'INV-0042',
  more: [{ label: 'View in bank portal', href: 'https://example.com', external: true }],
};

export const disabledLink: ActionSetProps = {
  context: 'page',
  label: 'Invoices',
  more: [{ label: 'Open in Paykit', href: '#paykit', disabled: true }],
};

/* Links, forbidden. */

// An action either runs or navigates. Both is two actions wearing one label,
// and nothing could decide which one a press means.
export const bothKinds: ActionSetProps = {
  context: 'row',
  label: 'INV-0042',
  // @ts-expect-error an action runs or navigates, never both
  more: [{ label: 'Open', href: '#x', onSelect: () => {} }],
};

// A destructive link would leave the page, so the confirmation it is supposed
// to be gated behind would have nothing to stand in front of.
export const destructiveLink: ActionSetProps = {
  context: 'row',
  label: 'INV-0042',
  // @ts-expect-error a link cannot be destructive
  more: [{ label: 'Delete', href: '/delete', destructive: { confirm: 'Delete it?' } }],
};

// `external` describes a destination, so it means nothing without one.
export const externalWithoutHref: ActionSetProps = {
  context: 'row',
  label: 'INV-0042',
  // @ts-expect-error external needs an href
  more: [{ label: 'Open', onSelect: () => {}, external: true }],
};

/* A dialog footer has no menu. */

export const dialogRanked: ActionSetProps = { context: 'dialog', primary: act, secondary: [act] };

export const dialogWithMenu: ActionSetProps = {
  context: 'dialog',
  primary: act,
  // @ts-expect-error a dialog footer has no menu
  more: [act],
};

/* A destructive action never takes a ranked slot. */

// Destructive is a property that decides placement, and the placement it
// decides is the menu. A red Delete beside a routine Save is the arrangement
// with the worst consequences of any this component can be asked for.
export const destructivePrimary: ActionSetProps = {
  context: 'page',
  label: 'Invoices',
  // @ts-expect-error a ranked slot takes no destructive action
  primary: wipe,
};

export const destructiveSecondary: ActionSetProps = {
  context: 'page',
  label: 'Invoices',
  // @ts-expect-error a ranked slot takes no destructive action
  secondary: [wipe],
};

// A dialog footer has no destructive slot either. The dialog that confirms a
// destructive action is `ConfirmDialog`, and it renders its own footer.
export const destructiveDialog: ActionSetProps = {
  context: 'dialog',
  // @ts-expect-error a dialog footer takes no destructive action
  primary: wipe,
};

// A destructive action in `more` is the one place it belongs, and it is
// allowed there in every context that has a menu.
export const destructiveRow: ActionSetProps = {
  context: 'row',
  label: 'INV-0042',
  more: [act, wipe],
};

/* A menu has to say what it acts on. */

// The trigger reads "Actions for INV-0042", so the same three dots repeated
// down a table say which record they belong to. Without the label they would
// all read alike, which is the defect `OverflowMenu` took a required prop to
// prevent — and a component that takes actions and drops that requirement
// would have reintroduced it one layer up.
// @ts-expect-error a row names the record its actions act on
export const rowWithoutLabel: ActionSetProps = { context: 'row', more: [act] };

// @ts-expect-error a page header names the screen its actions act on
export const pageWithoutLabel: ActionSetProps = { context: 'page', primary: act };

// A dialog footer has no menu, so it names nothing.
export const dialogWithLabel: ActionSetProps = {
  context: 'dialog',
  // @ts-expect-error a dialog footer takes no label
  label: 'Edit invoice',
  primary: act,
};
