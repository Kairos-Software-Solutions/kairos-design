'use client';

import { type ReactNode, useRef, useState } from 'react';
import Button, { type ButtonVariant } from './Button';
import ConfirmDialog, { type ConfirmDetails } from './ConfirmDialog';
import OverflowMenu, { type OverflowItem } from './OverflowMenu';

/**
 * A screen's actions, declared by role.
 *
 * The types are the point of this component. The branding skill's Action
 * Hierarchy is five ranks, a budget for each, and eight rules under it, and it
 * did not hold: following it means four or five judgements at every call site,
 * and rules that need judgement at every call site fail at some of them. Most
 * of those rules were also written as prohibitions, which puts the forbidden
 * arrangement into the reader's head rather than out of it.
 *
 * So the arrangement is not described here, it is the only one expressible. A
 * surface declares what each action *is* and this component decides the rank,
 * the placement, the order and the confirmation. Exactly one judgement is left
 * with the author, because no component can take it: which action is primary
 * on this screen.
 *
 * `ColumnRole` in `DataTable` is the precedent. Declare the role once, and the
 * table and the mobile card become two renderings of one description.
 *
 * ADR 0008 is the authority for the shape below.
 */

/**
 * One thing a surface can do.
 *
 * There is no `rank` field, and that is deliberate: rank is decided by which
 * slot an action is passed in, so an action cannot claim one.
 */
interface ActionBase {
  label: string;
  /**
   * Renders the action unavailable rather than hiding it, which is the
   * treatment every other disabled control in this package takes: the ground
   * drops to the page and the label drops to muted, per ADR 0004. An action
   * that vanishes when it cannot be used leaves a person looking for
   * something they remember being there, with no way to find out why it went.
   */
  disabled?: boolean;
}

/**
 * What a destructive action has to say before it can run.
 *
 * A string rather than a boolean, because a flag would let a call site mark
 * an action destructive and leave the confirmation to a later pass that never
 * comes.
 */
export interface Destructive {
  /**
   * The confirmation's body. It must name the specific record and the
   * consequence: `Delete INV-2026-0184? The invoice is removed for everyone
   * and the payments recorded against it are not.`
   *
   * `Are you sure?` type-checks and fails the skill. This is the one rule in
   * this file a type cannot carry, which is why it is written where an agent
   * about to write the wrong string is already reading.
   */
  confirm: string;
  /**
   * Overrides the confirmation's heading, which is otherwise the action and
   * the record: `Delete` on a set labelled `INV-0042` gives
   * `Delete INV-0042?`. Set it where that reads badly.
   */
  title?: string;
  /**
   * The string the person has to type before this will run, for a consequence
   * that reaches past the screen: a public object deleted for every reader, a
   * key every application is using.
   *
   * Passed straight to `ConfirmDialog`, where the reasoning and the limits
   * are written. Leave it out on an action whose consequence is one record on
   * one screen — a gate that asks for typing on everything gets typed through
   * on everything.
   */
  typeToConfirm?: string;
  /**
   * The action lands in an audit trail and the trail needs to say why. The
   * written reason arrives at `onSelect`.
   */
  requireReason?: boolean;
  /** What the reason is for, in the field's hint row. */
  reasonHint?: string;
}

/**
 * An action that runs and can be taken back.
 *
 * Split from `DestructiveAction` rather than carrying an optional flag, so
 * that a slot which cannot hold a destructive action says so by taking this
 * type. A union of two named interfaces also reports what it rejected —
 * `Type 'DestructiveAction' is not assignable to type 'RankedAction'` — where
 * an optional property could only report that some object was not
 * `undefined`.
 */
export interface RunAction extends ActionBase {
  onSelect: () => void;
  /**
   * The action is in flight.
   *
   * Only a ranked slot can show this, and that is the whole of the rule: a
   * ranked action is a button, and a button that has been pressed shows that
   * it was pressed. A menu item cannot, because choosing one closes the menu
   * it was in, so there is nothing left on the screen to put the state on.
   *
   * Passing it at all — even `false` — reserves the room for the pending
   * label, so the control is one width for its whole life. See `Button`.
   */
  pending?: boolean;
  /** What it says while working: `Refreshing…`, `Sending invoice…`. Name the work. */
  pendingLabel?: ReactNode;
  href?: never;
  external?: never;
  destructive?: never;
}

/**
 * An action that destroys something, or that cannot be taken back.
 *
 * Destructive is a property here and not a rank. Given a slot beside primary
 * and secondary it would produce a red Delete next to Save, which is the
 * arrangement the skill forbids most firmly. Carried on the action instead, it
 * forces the action into the menu, sorts it to the bottom behind a rule, and
 * gates it behind a confirmation — so the rule is not a rule, it is the only
 * thing this type permits.
 *
 * It runs rather than navigates, because a link cannot be gated: following an
 * `href` leaves the page, so the confirmation would have nothing to sit in
 * front of.
 */
export interface DestructiveAction extends ActionBase {
  /**
   * Runs once the gate is satisfied, with whatever the gate collected. A
   * handler ignoring the argument still assigns, so an action with no
   * `typeToConfirm` and no `requireReason` is written exactly as before.
   */
  onSelect: (details: ConfirmDetails) => void;
  href?: never;
  external?: never;
  destructive: Destructive;
}

/**
 * An action that navigates.
 *
 * Here because the alternative is worse. Without it, a screen with one link
 * action — `Open in Paykit`, `View in bank portal` — has to assemble its
 * actions by hand and go around this component, and a call site that has gone
 * around it is a call site none of these types reach. That is the standing
 * risk in ADR 0008, and this is the cheapest place to narrow it.
 */
export interface LinkAction extends ActionBase {
  href: string;
  /** Opens in a new tab. */
  external?: boolean;
  onSelect?: never;
  destructive?: never;
}

/**
 * An action that can take a ranked slot: a primary, a secondary, or the
 * tertiary a lone menu entry collapses into.
 *
 * **A ranked slot never takes a destructive action.** The whole point of
 * destructive being a property is that it decides placement, and the placement
 * it decides is the menu. Put it in `more`, where it sorts to the bottom
 * behind a rule and picks up its confirmation.
 */
export type RankedAction = RunAction | LinkAction;

/** Anything a surface can do, which is a ranked action or a destructive one. */
export type Action = RankedAction | DestructiveAction;

/**
 * Nought to two, as a tuple rather than a `RankedAction[]` with a length
 * check.
 *
 * A tuple produces a worse error message than a runtime check and produces it
 * at author time, which is where this defect needs catching. A runtime check
 * moves the failure to where nobody sees it.
 */
export type SecondaryActions = [] | [RankedAction] | [RankedAction, RankedAction];

/**
 * Where the actions are rendering, which decides what slots exist.
 *
 * A union rather than an enum with optional props throughout. An enum would
 * let a call site pass `primary` alongside `context: 'row'` and have it
 * silently ignored; the union removes the slot, so a row that declares a
 * primary action does not compile.
 *
 * `page` is the page header: primary right, secondary beside it, the rest in
 * the menu. `dialog` is a dialog footer. `row` is a table row and `card` is
 * the same record below 768px — neither has a ranked slot at all, because a
 * record's primary action is its own linked identifier and everything else
 * belongs in the record's menu. That is the branding skill's row contract,
 * carried by the type instead of remembered.
 */
export type ActionContext = 'page' | 'dialog' | 'row' | 'card';

/** The slot every context that can open a menu shares. */
interface Menued {
  /**
   * What these actions act on: the record in a row or a card, the screen in a
   * page header. It names the menu's trigger — `Actions for INV-0042` — so
   * the same three dots repeated down a table say which record they belong
   * to, and it names the confirmation in front of a destructive action.
   */
  label: string;
  /**
   * Everything else, in the order the call site gives. This is the only order
   * a call site controls — `primary` and `secondary` are named slots, and a
   * destructive entry sorts to the bottom regardless.
   *
   * In a page header a single non-destructive entry renders inline as a
   * tertiary button rather than as a menu holding one item. In a row or a
   * card it stays in the menu, because a row carries no buttons at all.
   */
  more?: Action[];
}

export type ActionSetProps =
  | (Menued & {
      context: 'page';
      /** The one action that can claim the accent. */
      primary?: RankedAction;
      /**
       * **Nought, one or two. Never three.** Read this rather than the
       * compiler: a third entry reports `Type 'RankedAction' is not
       * assignable to type 'undefined'`, which is the tuple's third slot
       * talking and names no budget. The budget is here because this is what
       * an author writing the third one is looking at.
       *
       * Past two, the extra actions belong in `more`.
       */
      secondary?: SecondaryActions;
    })
  | {
      /**
       * A dialog footer, which has no `more` and no `label`.
       *
       * A dialog is one question. A footer that grows a menu is a dialog
       * doing too much, and the answer is a screen rather than a third rank
       * of action inside a modal. Leaving the slot out is what makes that a
       * compile error instead of a convention.
       *
       * It has no destructive slot either, and needs none: the dialog that
       * confirms a destructive action is `ConfirmDialog`, which renders its
       * own footer. A footer that could hold a destructive action would be a
       * second answer to a question already answered.
       */
      context: 'dialog';
      primary?: RankedAction;
      secondary?: SecondaryActions;
    }
  | (Menued & {
      context: 'row' | 'card';
    });

/** Ranked slots emit these, and nothing else. */
type Rank = 'primary' | 'secondary' | 'tertiary';

/**
 * One ranked action as a control.
 *
 * A `<button>` or an `<a>` depending on what the action does, rather than
 * always a `<button>` with a handler that navigates: a link that is not a
 * link cannot be opened in a new tab, cannot be copied, and does not show its
 * destination in the status bar. `.kairos-button` is written to survive being
 * put on an anchor, which is why this can share the class rather than needing
 * a second one.
 *
 * The button branch renders `Button` rather than reassembling its markup. It
 * used to write the classes itself against a rank-to-modifier map of its own,
 * which is a fork of `Button` living inside `ActionSet` — and the cost showed
 * up the moment a declared action needed a pending state, because the state
 * was already built one file away and unreachable from here.
 */
function Ranked({ action, rank }: { action: RankedAction; rank: Rank }) {
  if (action.href !== undefined) {
    // No `href` when disabled, matching `OverflowMenu`: an anchor has no
    // `disabled` attribute, and one that keeps its href is still followable
    // by keyboard however it is painted. `aria-disabled` is what carries the
    // state to assistive technology once the href is gone.
    return (
      <a
        className={`kairos-button kairos-button--${rank}`}
        href={action.disabled ? undefined : action.href}
        aria-disabled={action.disabled || undefined}
        target={action.external && !action.disabled ? '_blank' : undefined}
        rel={action.external && !action.disabled ? 'noreferrer' : undefined}
      >
        {action.label}
      </a>
    );
  }

  return (
    <Button
      variant={rank satisfies ButtonVariant}
      disabled={action.disabled}
      // Named only when the action names it, so an action that cannot be in
      // flight renders the markup it always did. See `Button`.
      {...(action.pending !== undefined || action.pendingLabel !== undefined
        ? { loading: action.pending ?? false, loadingLabel: action.pendingLabel }
        : {})}
      onClick={action.onSelect}
    >
      {action.label}
    </Button>
  );
}

/**
 * A screen's actions, rendered for the surface they sit on.
 *
 * The same declaration renders four ways. A page header gets ranked buttons
 * and a menu; a dialog footer gets ranked buttons; a row and a card get the
 * menu alone. Nothing about the arrangement is passed in, because everything
 * about the arrangement is the rule this component carries.
 *
 * It renders the group container only where the surface does not already own
 * one. `PageHeader` puts its `actions` inside `kairos-page-header-actions`
 * itself, so the `page` context emits the controls and nothing around them;
 * `Dialog` gives you a body and no footer, so the `dialog` context emits
 * `kairos-dialog-actions` around its own.
 */
export default function ActionSet(props: ActionSetProps) {
  // The destructive action waiting on its confirmation. One at a time: a menu
  // closes when an item is chosen, so there is never a second one pending.
  const [pending, setPending] = useState<DestructiveAction | null>(null);

  // The confirmation is opened from a menu item, and by the time it mounts
  // the item that opened it is being removed. So the trigger is handed to
  // both: the menu puts its ref on it, and the dialog puts focus back on it.
  // Without this a person who cancelled a deletion landed on `<body>`, which
  // for a keyboard user is the top of the page.
  const trigger = useRef<HTMLButtonElement>(null);

  const primary = props.context === 'page' || props.context === 'dialog' ? props.primary : undefined;
  const secondary =
    props.context === 'page' || props.context === 'dialog' ? props.secondary : undefined;
  const more = props.context === 'dialog' ? undefined : props.more;
  const label = props.context === 'dialog' ? '' : props.label;

  const ranked = (
    <>
      {secondary?.map((action, index) => (
        <Ranked key={`secondary-${index}`} action={action} rank="secondary" />
      ))}
      {primary ? <Ranked action={primary} rank="primary" /> : null}
    </>
  );

  if (props.context === 'dialog') {
    // Cancel first in the reading order and the committing button last, which
    // is where `ConfirmDialog` already puts them: the safe option is the one
    // the eye reaches on the way in.
    return <div className="kairos-dialog-actions">{ranked}</div>;
  }

  const entries = more ?? [];

  // A destructive entry's `onSelect` is not the one the call site wrote. It
  // opens the confirmation, and the confirmation runs the real one. There is
  // no path from the menu to the action that skips this, which is the whole
  // reason the confirmation lives here rather than at the call site.
  const items: OverflowItem[] = entries.map((action) => ({
    label: action.label,
    href: action.href,
    external: action.external,
    disabled: action.disabled,
    destructive: action.destructive !== undefined,
    onSelect: action.destructive
      ? () => setPending(action)
      : (action.onSelect ?? undefined),
  }));

  // A page header collapses a lone routine action into a tertiary button
  // rather than a menu holding one item. A destructive one does not collapse:
  // a button is a rank, and the rank a destructive action gets is none.
  const lone = entries.length === 1 && entries[0].destructive === undefined ? entries[0] : null;
  const collapse = props.context === 'page' && lone !== null;

  const menu = collapse ? (
    <Ranked action={lone} rank="tertiary" />
  ) : (
    <OverflowMenu
      items={items}
      label={label}
      context={props.context === 'page' ? 'header' : 'row'}
      triggerRef={trigger}
    />
  );

  const confirmation = pending ? (
    <ConfirmDialog
      open
      title={pending.destructive.title ?? `${pending.label} ${label}?`}
      message={pending.destructive.confirm}
      confirmLabel={pending.label}
      typeToConfirm={pending.destructive.typeToConfirm}
      requireReason={pending.destructive.requireReason}
      reasonHint={pending.destructive.reasonHint}
      onConfirm={pending.onSelect}
      onClose={() => setPending(null)}
      restoreFocusTo={trigger}
    />
  ) : null;

  // The menu sits furthest from the primary. It holds what did not earn a
  // button, so it has the least claim on the edge of the group the eye lands
  // on last, and the primary keeps the right-hand end.
  return (
    <>
      {entries.length > 0 ? menu : null}
      {props.context === 'page' ? ranked : null}
      {confirmation}
    </>
  );
}
