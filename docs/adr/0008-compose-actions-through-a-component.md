# Compose actions through a component

## Context

Agents building Kairos screens put every action in one row, in an order nobody
chose, and put destructive actions beside routine ones.

The rules already exist and are good. The branding skill's Action Hierarchy has
five ranks, a budget and a placement for each, and eight rules under it. It says
destructive actions live only in overflow menus and dialogs. It says never more
than three bordered buttons in one group. It says a table row carries its linked
identifier, its overflow menu and a selection checkbox, and nothing else.

Writing more prose into a document that already says the right thing will not
change the outcome. Two things explain why the rules do not hold.

Following the hierarchy correctly means four or five judgements at every call
site: which action is primary, whether this one is navigation rather than an
action, whether the count is within budget, whether the context is a page header
or a row, whether anything here is destructive. Each screen is a fresh chance to
get one wrong. Rules that need judgement at every call site fail at some call
sites, and that is arithmetic rather than carelessness.

Most of the rules are also written as prohibitions. Steering by prohibition puts
the forbidden thing into the reader's context and makes it more available, not
less. "Never more than three bordered buttons in one horizontal group" describes
four buttons in a row, which is close to a literal readback of the symptom.

`ColumnRole` already solved the same shape of problem for column order in this
repo. Declaring the role once made the table and the mobile card two renderings
of one description, and six near-identical blocks of card markup became one.

## Decision

Actions are composed through an `ActionSet` component rather than assembled from
buttons at each call site.

The props carry the rules, so an agent cannot express a screen that breaks them:

```ts
type Action = {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  /** Forces the action into the menu and behind a ConfirmDialog.
      The string names the record and the consequence. */
  destructive?: { confirm: string };
};

type ActionSetProps =
  | { context: 'page' | 'dialog';
      primary?: Action;
      secondary?: [] | [Action] | [Action, Action];
      more?: Action[] }
  | { context: 'row' | 'card';
      more?: Action[] };
```

Destructive is a property, not a rank. Giving it a slot beside primary and
secondary is what produces a red Delete next to Save, which is the arrangement
the skill forbids most firmly. As a flag it forces the action into the menu and
gates it behind `ConfirmDialog`, so the rule is not a rule, it is the only thing
the type permits.

Context is a prop. The same four actions render four ways: primary right in a
page header, no buttons at all in a table row, no buttons at all on a mobile
card, primary plus one secondary in a dialog footer. A discriminated union means
the row and card contexts have no primary slot to fill, so the rule that a row
carries no buttons is enforced by the type rather than remembered.

The secondary budget of 0 to 2 is a tuple type. It produces a worse error
message than a runtime check, and it produces it at author time, which is where
this defect needs to be caught.

Three decisions belong to the component so no call site makes them. A single
entry in `more` renders as a tertiary button rather than a menu holding one
item, unless it is destructive. Destructive entries sort to the bottom of the
menu behind `kairos-overflow-item--divided`. The order inside `more` is the only
order a call site controls, since primary and secondary are named slots.

The branding skill changes in the same release. The ranks table stays, because
it explains why, and reasoning is what an agent cannot recover from a type. The
eight rules under it are replaced by one instruction to call `ActionSet`.
Where a prohibition has to survive it is written as the positive: "a row carries
its linked identifier and its overflow menu" does the same work as "never put a
button rail in a row" without naming the button rail.

One judgement stays with the author and no component can take it: which action
is primary on this screen. That earns a sentence in the skill, and it is the
only sentence the Action Hierarchy needs to keep as an instruction.
