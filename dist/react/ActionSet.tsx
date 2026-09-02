'use client';

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
 * An action that runs.
 *
 * The only kind that can be destructive, because a destructive action is
 * gated behind a confirmation and a link cannot be — following an `href`
 * leaves the page, so the confirmation would have nothing to sit in front of.
 */
export interface RunAction extends ActionBase {
  onSelect: () => void;
  href?: never;
  external?: never;
  /**
   * Marks the action as destructive or irreversible, which is a property and
   * not a rank. Given a slot beside primary and secondary it would produce a
   * red Delete next to Save, which is the arrangement the skill forbids most
   * firmly. As a flag it forces the action into the menu, sorts it to the
   * bottom behind a rule, and gates it behind a confirmation, so the rule is
   * not a rule — it is the only thing this type permits.
   */
  destructive?: {
    /**
     * The confirmation's body. It must name the specific record and the
     * consequence: `Delete INV-2026-0184? The invoice is removed for
     * everyone and the payments recorded against it are not.`
     *
     * `Are you sure?` type-checks and fails the skill. This is the one rule
     * in this file a type cannot carry, which is why it is written where an
     * agent about to write the wrong string is already reading.
     */
    confirm: string;
  };
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

export type Action = RunAction | LinkAction;

/**
 * Nought to two, as a tuple rather than an `Action[]` with a length check.
 *
 * A tuple produces a worse error message than a runtime check and produces it
 * at author time, which is where this defect needs catching. A runtime check
 * moves the failure to where nobody sees it.
 */
export type SecondaryActions = [] | [Action] | [Action, Action];

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

export type ActionSetProps =
  | {
      context: 'page';
      /** The one action that can claim the accent. */
      primary?: Action;
      /**
       * **Nought, one or two. Never three.** Read this rather than the
       * compiler: a third entry reports `Type 'Action' is not assignable to
       * type 'undefined'`, which is the tuple's third slot talking and names
       * no budget. The budget is here because this is what an author writing
       * the third one is looking at.
       *
       * Past two, the extra actions belong in `more`.
       */
      secondary?: SecondaryActions;
      /**
       * Everything else, in the order the call site gives. This is the only
       * order a call site controls — `primary` and `secondary` are named
       * slots, and a destructive entry sorts to the bottom regardless.
       *
       * A single non-destructive entry renders inline as a tertiary button
       * rather than as a menu holding one item.
       */
      more?: Action[];
    }
  | {
      /**
       * A dialog footer, which has no `more`.
       *
       * A dialog is one question. A footer that grows a menu is a dialog
       * doing too much, and the answer is a screen rather than a third rank
       * of action inside a modal. Leaving the slot out is what makes that a
       * compile error instead of a convention.
       */
      context: 'dialog';
      primary?: Action;
      secondary?: SecondaryActions;
    }
  | {
      context: 'row' | 'card';
      more?: Action[];
    };
