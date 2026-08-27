# Canonical naming decisions

The Kairos vocabulary exists three times today, under three sets of names. This
file records which name wins for each role and why, so the merge is reviewable
and so a later agent does not "fix" a deliberate choice back to its old repo's
spelling.

Measured 26 Aug 2026 against `internal-tools`: Paykit ships 242 `kairos-*`
classes, Mailkit 112, Uptime 48. Only **36 are common to Paykit and Mailkit**.
The shared layer is therefore a merge, not an extraction — Paykit contributes
the most and the best-reasoned code, but it is missing three roles the skill's
canonical component set requires, and loses two names to the majority spelling.

## Rule used

In order:

1. The name in the branding skill's Canonical Component Set wins outright.
2. Otherwise, the spelling used by two of the three tools wins.
3. Otherwise, the best-reasoned implementation wins, and the reasoning moves
   into this repo with the code.

## Tokens

Canonical prefix is `--kairos-*`: it is what the visual spec's Shipping Tokens
block specifies and what Uptime already ships.

| App | Today | Migration |
| --- | --- | --- |
| Uptime | `--kairos-*` | none needed |
| Paykit | `--k-*` plus a `--color-*` Tailwind alias | keep `--k-*` as a one-line alias block (`--k-bg: var(--kairos-bg)`). Rewriting 3,529 lines of CSS and 420 inline style blocks to chase a prefix is churn with no user-visible result. |
| Mailkit | `--color-*` | same alias approach, dropping the pre-Kairos `@theme` layer at the same time |
| Card | bare `--bg`, `--ink`, `--accent` | alias block; the file is small enough to rename outright later |

Three token roles are new here because no app had a name for them and all four
drifted on the value: `--kairos-radius-panel`, `--kairos-border-w-strong`, and
`--kairos-track-button`.

## Classes

| Role | Paykit | Mailkit | Uptime | Canonical | Rule |
| --- | --- | --- | --- | --- | --- |
| Status chip | `kairos-state-chip` | `kairos-badge` | `kairos-state-chip` | **`kairos-state-chip`** | 1, 2 |
| Sortable header cell | `kairos-table-sort` | `kairos-sort-header` | `kairos-sort-header` | **`kairos-sort-header`** | 1, 2 |
| Table scroll wrapper | `kairos-scroll-x` | `kairos-table-wrap` | `kairos-table-wrap` | **`kairos-table-wrap`** | 2 |
| Empty list or table | — | `kairos-empty-state` | `kairos-empty-state` | **`kairos-empty-state`** | 1 |
| Page-level notice | `kairos-notice`, `kairos-callout` | `kairos-banner` | `kairos-banner` | **`kairos-banner`** | 1, 2 |
| Transient confirmation | — | — | `kairos-toast` | **`kairos-toast`** | 1 |
| Row and detail overflow | `kairos-overflow-menu` | `kairos-row-actions` | `kairos-overflow-menu` | **`kairos-overflow-menu`** | 1, 2 |
| Theme control | `kairos-theme-toggle` | `kairos-theme-toggle` | `kairos-theme-control` | **`kairos-theme-toggle`** | 1, 2 |
| CDN lockup | `kairos-lockup--light/--dark` | `kairos-logo-light/-dark` | `kairos-brand-logo--light/--dark` | **`kairos-lockup--light/--dark`** | 3 — BEM modifier form, per the skill's naming convention |

Paykit is missing `kairos-empty-state`, `kairos-banner`, and `kairos-toast`
entirely. Those three come from Uptime and Mailkit.

## State variants

The same four record states carry three vocabularies today. Canonical names are
the State Palette's own rows.

| Canonical | Paykit | Uptime | Mailkit |
| --- | --- | --- | --- |
| `--settled` | `--settled` | `--complete` | `success` |
| `--overdue` | `--overdue` | `--failed` | `danger` |
| `--awaiting` | `--awaiting` | `--progress` | `warning` |
| `--draft` | `--draft` | `--draft` | — (no draft variant at all) |
| `--neutral` | `--neutral` | — | `neutral` |

Mailkit's `accent` variant does not map. Amber is the action colour and is not
available to status; call sites using it are re-pointed to the state the record
is actually in.

Each app keeps its old names as deprecated aliases through one release, the way
Paykit's `Badge.tsx` already does, so no call site has to change in the same
commit that changes the CSS.

## Button ranks

The variants lived in Paykit's React `Button` as inline `style={{}}` objects
setting `--button-*` properties. That is why `kairos.css` shipped a button with
no ranks at all, and why Uptime had to invent `--secondary`, `--tertiary`, and
`--destructive` of its own. They are modifiers now, so the three apps with no
React get the same six.

| Canonical | Paykit | Uptime | Note |
| --- | --- | --- | --- |
| `--primary` | `primary` | (base) | Amber, stamped. One per screen. |
| `--secondary` | `ghost` | `--secondary` | The outline. Paykit's `ghost` was this, not a borderless button. |
| `--tertiary` | — | `--tertiary` | Borderless, underlined |
| `--ghost` | — | — | Borderless, not underlined. New; the skill's canonical set names it. |
| `--danger` | `danger` | `--destructive` | The outline form |
| `--danger-solid` | `dangerSolid` | — | Confirm button of a confirmation dialog and nothing else |

## Sorting

`sortRows` handles empty values before it applies the direction, rather than
multiplying the comparator's result by `-1`.

Paykit's `use-table-sort` does the multiplication, and its own comment says
blanks should sort last in both directions. They do not: a descending sort on a
column with blanks returns them first, so sorting an invoices table by Due
descending puts a block of dashes at the top. The registry keeps the comment's
intent and drops the shortcut that broke it.

Paykit's three-state cycle is better than a two-state flip and is adopted here:
ascending, descending, then back to the screen's own default. A user who sorted
by mistake otherwise has no way back short of reloading. Its handling of a
first press on the already-default column is adopted too — that press starts
descending, or it appears to do nothing.

## Typography and geometry

Values where the apps disagreed and the registry settles it:

| Property | Registry | Was |
| --- | --- | --- |
| Button tracking | `0.14em` | Paykit `0.18em`, Uptime `0.12em` — Product Scale calls for `0.14em`, so all three tools were divergent, not just Uptime |
| Input border | `2px` | Uptime `1px` |
| Panel radius | `10px` | Uptime `8px` |
| Chip case and tracking | uppercase, `0.08em` | Uptime sentence case untracked, Mailkit sentence case `0.04em` |
| Form label case | uppercase, tracked | Uptime sentence case |

### Two conflicts inside the skill itself

Recorded here because the registry had to pick, and the next reader will hit
the same contradiction.

**Input border weight.** `visual-spec.md` → Shadow Rank says inputs take a
`1px` border. `component-patterns.md` → Component Defaults says `2px solid`.
The visual spec explicitly delegates per-component weight to Component
Defaults, so **2px** wins. The Shadow Rank sentence is about shadow, and its
border figure is incidental.

**Chip radius.** `SKILL.md` puts badges at radius `0`. `visual-spec.md` → State
Palette puts chips at `2px`. These are different objects: a badge is an eyebrow
label or content tag, a state chip is a status marker. The registry keeps
badges at `0` and state chips at `2px`, which is what Paykit already ships.
