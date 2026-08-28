# Kairos UI — the registry

The canonical component manifest. Every Kairos app reads this one, rather than
keeping its own list, so a fix lands once and reaches every surface.

Read this before building any UI. If you add a component, add its row here in
the same change: a component that is not in the manifest does not exist for the
next agent.

```
Tokens      dist/tokens.css        --kairos-*, light and dark
Base        dist/base.css          element defaults, optional
Components  dist/kairos.css        the kairos-* class vocabulary
Money       dist/format/money.ts   TTD 8,500.00
Dates       dist/format/dates.ts   24 Aug 2026
React       dist/react/            components emitting the classes above
Preview     docs/preview.html      every component, both themes
Emit        kairos-design emit     writes the CSS into a surface with no bundler
```

Everything above is reachable as `kairos-design/<name>` once the package is
installed. Import order is tokens, base, components.

`base.css` sets the page: ground, ink, body type, the 320px floor, and the
`[hidden]` reset. Import it and an app needs no stylesheet of its own to render
a Kairos page — what stays in the app is composition wired to its own data.

## Shell

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-app-shell` | App frame: sidebar or bottom nav plus main region | Brand Scale pages | — |
| `kairos-sidebar` | 220px desktop nav | Mobile; use `kairos-bottom-nav` | — |
| `kairos-sidebar-brand` | The lockup block at the top of the sidebar | A second logo anywhere else on the screen | — |
| `kairos-bottom-nav` | Five-item mobile tab bar | More than five destinations | — |
| `kairos-topbar` | Mobile brand row | Desktop | `--switcher` |
| `kairos-page-header` | 56px row: title left, actions right | A second header inside a panel | — |
| `kairos-page-title` | The one Bebas element on the screen, 24px | Any other heading | — |
| `kairos-page-header-description` | One line of supporting copy under the title. `PageHeader` renders it from its `description` prop | A paragraph; keep it to a sentence | — |
| `kairos-view` | The centred content column inside `kairos-main` | A tile dashboard that wants the full width | — |
| `kairos-filter-bar` | 40px row: segmented filter plus search | Sorting; the table header does that | — |
| `kairos-theme-toggle` | System / Light / Dark | Any other setting | `--inline` |
| `kairos-skip-link` | First focusable element on every page | — | — |

## Data

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-table` | Repeating records, desktop | Fewer than 3 records; heterogeneous summaries | — |
| `kairos-table-wrap` | The scroll container around a table | A panel that should swap to cards instead | — |
| `kairos-sort-header` | Header-cell sort button, carries `aria-sort` | Headers with no natural order | — |
| `kairos-record-card` | The same records below 768px | Desktop lists | `--inert` |
| `kairos-collapsible-card` | Detail-heavy cards, collapsed by default | Cards of 3 fields or fewer | — |
| `kairos-state-chip` | Status of a record | Counts, labels, categories | `--settled` `--overdue` `--awaiting` `--draft` `--neutral` |
| `kairos-panel` | Bordered container, no shadow. Ground and border only — pair it with `kairos-pad` | A shadowed featured panel; that is Brand Scale | — |
| `kairos-pad` | The padding inside a panel or card | Spacing between blocks; that is `kairos-stack` | `--xs` `--sm` `--lg` |
| `kairos-empty-state` | A list or table with no records | Errors; use `kairos-banner` | — |
| `kairos-metric` | A single figure with its label | A figure inside a table cell | — |
| `kairos-skeleton` | Loading placeholder shaped like its content | Empty states | `--line` `--heading` `--label` `--row` `--control` `--summary` |
| `kairos-figure` | Money and any figure that must not break across lines | Text | — |

`kairos-panel` paints the border and the ground and nothing else; the padding
is `kairos-pad`, a separate class. A panel written by hand takes both. The
`Panel` component applies `kairos-pad` for you and drops it when you pass
`flush`, so a table can supply its own — which is the whole meaning of that
prop, and it was inert for as long as the component applied no padding to
remove.

Columns run in the order the user reads a record by: the human-readable
identifier, then the secondary identifiers that separate two similar names,
then dates and statuses, then figures, then actions. `DataTable` takes the
order from its `columns` array. Tables written before this rule lead with the
status chip; that is the superseded order, not a local choice to preserve.
Where the hierarchy leaves the order open, ask rather than guess.

## Actions

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-button` | Any action, on a `<button>` or on an `<a>` that navigates | — | `--sm` |
| `kairos-page-header-primary` | The one primary action on the screen | A second amber claim | — |
| `kairos-action-row` | A row of buttons | A single button | `--equal` `--end` `--top` |
| `kairos-overflow-menu` | Secondary and destructive row actions | The primary action | — |
| `kairos-overflow-item` | One row inside the menu | — | `--destructive` `--divided` |
| `kairos-dialog-content` | Modal surface | Page-level notices | — |
| `kairos-segmented` | Filters and wizard steps | Anything styled as a button row | `--links` |
| `kairos-icon-action` | An icon-only control that has an `aria-label` naming its record | A rail of three per table row | `--accent` `--danger` |

Destructive actions live in `kairos-overflow-item--destructive` and are gated by
a dialog that names the record. The confirm button takes the destructive
treatment, never amber.

## Forms

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-field` | Label, control, hint, and error as one unit | Read-only display of a value | — |
| `kairos-input-field` | Text, number, textarea; 16px minimum | — | — |
| `kairos-select` | Native select, styled; wrap in `kairos-select-wrap` for the caret | — | — |
| `kairos-input-label` | The field label, uppercase and tracked | A heading | — |
| `kairos-field-hint` | What the field expects | Error text | — |
| `kairos-field-error` | Plain language saying what to do next | A generic failure string | — |
| `kairos-wizard-steps` | Multi-step progress | A button row | — |

A field holds its label, hint, and error rows whether or not they carry
content, so validating a form does not move the layout.

## Feedback

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-banner` | Page-level notice, one per screen | Field-level errors | `--danger` `--warning` `--success` `--inline` |
| `kairos-toast` | Transient confirmation of a completed action | Anything the user must act on | — |
| `kairos-toast-region` | The fixed container, `role="status"` | — | — |

There is no accent banner. Amber is the action colour, and a banner is not an
action.

## Brand

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-lockup` | The CDN wordmark, theme-switched | A redrawn or recoloured logo | `--light` `--dark` |
| `kairos-wordmark` | Text wordmark where the image will not fit | Replacing the lockup on a login screen | — |

Logos are linked from `https://cdn.kairossolutionstt.com` by URL, never copied
into a repo. Ship both variants, with the same `alt` on each, and let the
ground pick. The ground is `[data-theme]` — the same signal the tokens read,
and the only one, so the artwork cannot end up on a surface it was not drawn
for.

`kairos-sidebar-brand` is the exception worth knowing. It is an inverted
plaque, ink under a light page and bone under a dark one, so the lockup on it
is whichever variant the rest of the page is hiding. The markup is the same
two images; the stylesheet flips them. Do not set `display` on a lockup from
an app rule — a selector like `.my-brand img` outranks the lockup's own and
renders both at once, one stacked on the other's cream tile.

## Layout and utilities

The stylesheet carries more than this manifest used to name, and an undocumented
class is one the next agent reinvents. These are the ones an app reaches for
often enough that writing them again is the likely mistake.

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-stack` | A vertical stack with one gap | Two blocks that want different gaps; nest instead | `--xs` `--sm` `--md` `--lg` `--xl` |
| `kairos-split` | Two groups pushed to opposite ends of a row, wrapping | A grid of equal columns | `--sm` `--md` `--lg` `--baseline` `--top` `--end` |
| `kairos-form-stack` | The fields inside one form section | Spacing between panels | — |
| `kairos-grow` | The flex child that takes the remaining width and can still shrink | A fixed column | — |
| `kairos-measure` | Prose at a readable width | A table | `-sm` `-lg` |
| `kairos-code` | An identifier read or copied character by character | Body text | — |
| `kairos-code-block` | Machine output shown to an operator: a response body, a log line | Prose; it is capped and scrollable | — |
| `kairos-muted` | Secondary text | The data itself; the heaviest ink is the record | — |
| `kairos-chip-row` | A wrapping row of chips. `--lg` for bare facts, which have no borders to separate them | Buttons; that is `kairos-action-row` | `--lg` |
| `kairos-checkbox-row` | A checkbox with its label on one line | A field with a hint | — |
| `kairos-choice-row` | A radio or checkbox with a label and supporting copy | A plain checkbox | — |
| `kairos-visually-hidden` | Text for a screen reader only | Hiding something from everyone; use `hidden` | — |
| `kairos-align-right` | A figure column | Text | — |
| `kairos-nowrap` | A value that must not break | A paragraph | — |

An app that writes its own `.myapp-stack`, `.myapp-muted`, or `.myapp-grow` has
forked one of these. Check this table before adding a class to an app
stylesheet: what belongs to an app is composition wired to its own state, not
spacing, measure, or muted text.

## Not yet built

Claim one by building it. Add its row above in the same change.

| Component | Needed for |
| --- | --- |
| `FilterBar` | The 40px segmented-plus-search row. The CSS is here; the debounce and the filter-state contract are still per-app. |
| `Select`, `Textarea` | Field variants. `Field` takes them today via its render prop, but neither has a named wrapper. |
| Rendered component tests | The contract tests are static. Nothing here has been rendered by a test runner, because the registry ships no build step — the first app to adopt it is what exercises the JSX. |
| Visual regression | The preview is checked by hand. A screenshot diff per commit would catch what a reviewer will not. |

## Formatters

| Module | Exports | Use for |
| --- | --- | --- |
| `format/money.ts` | `formatMoney`, `formatMinor`, `toMinor`, `fromMinor`, `toMinorOrNull`, `parseAmountFilter` | Every amount a person reads or a form accepts |
| `format/dates.ts` | `formatDate`, `formatDateTime`, `formatTime`, `formatDateRange`, `dateInputHint`, `fromSeconds` | Every date a person reads |

Exact amounts live in integer minor units, never a float. Dates name their
month, because `08/01/2026` is 8 January to a T&T reader and 1 August to a US
one. Both refuse rather than guess: `toMinorOrNull` returns null so a boundary
can turn it into a sentence, and the date formatters return null rather than a
plausible wrong date.

A raw timestamp reaching a screen is a defect. Mailkit's Logs screen printing
`2026-08-26T16:57:10.635982+00:00` to an operator in Trinidad is the case this
module exists to close.

## React

`kairos-design/react`, TypeScript source like everything else. The components emit the classes
above and hold no styling decisions — a `style` prop carrying a colour or a
pixel value into one means the value belongs in the token layer, and a test
fails on it.

| Export | Notes |
| --- | --- |
| `Button` | Six ranks: `primary`, `secondary`, `tertiary`, `ghost`, `danger`, `dangerSolid`. Defaults to `type="button"`, because an untyped button in a form is a submit button. |
| `StateChip` | The four states, plus every app's old spelling as a deprecated alias so adoption is not one enormous commit |
| `Segmented` | Filters, wizard steps, the theme choice |
| `InputField`, `Field` | Label, control, hint, and error as one unit, with the empty rows held |
| `Banner` | `alert` for a failure, `status` otherwise |
| `EmptyState` | Takes a `ReactNode` action, not an href: three of the five surfaces have no router |
| `SortHeader`, `SortAnnouncer` | `aria-sort` plus the live region, because a redrawn table announces nothing |
| `OverflowMenu` | The only other control a row carries. Portalled to `<body>` and positioned by hand, because a table panel is an overflow container and would clip it. An app stylesheet re-declaring `.kairos-overflow-menu` as `position: absolute` puts the clipping back. |
| `DataTable` | Table on desktop, record cards below 768px, sorting on the data. Columns declare a role, the card builds itself from it, and the array's order is the column order above. |
| `CollapsibleCard` | Built on `<details>`, so it works before hydration and prints expanded |
| `compare`, `sortRows`, `nextSort` | The comparator, separately importable and separately tested |
| `Dialog`, `ConfirmDialog` | The destructive gate. **Peer dependency: `@radix-ui/react-dialog`.** |
| `Toast`, `ToastRegion`, `TransientToast` | Transient confirmation |
| `Panel` | Border, ground, and `kairos-pad`. `flush` drops the padding for a table that supplies its own |
| `PageHeader` | Title, one-line `description`, and one primary action |
| `Metric`, `MetricRow`, `Skeleton`, `SkeletonStack` | Figures and loading |
| `ThemeToggle`, `ThemeSetting`, `useThemePreference`, `themeInitScript` | The theme control, in both placements |

Radix is the one dependency, and only for the dialogs. A modal has to trap
focus, restore it, close on Escape, and mark the rest of the page inert; hand
rolling that in a shared component means every Kairos app inherits the same
subtle keyboard trap. Everything else, including the three theme icons, is
inline so that importing one component does not drag a package in with it.

Call `setThemeStorageKey()` once at startup if the app already has a key in its
users' browsers. Paykit's is `paykit.theme`, and changing it silently resets
every existing preference to the device default.

## Deviations

Where the registry departs from the `kairos-branding` skill, and why.

| Deviation | Reason |
| --- | --- |
| State chips take radius `2px`, badges `0` | `SKILL.md` puts badges at `0` and the visual spec puts chips at `2px`. They are different objects: a badge is an eyebrow label, a chip is a status marker. Both values are kept. |
| Inputs take a `2px` border | The visual spec's Shadow Rank block says `1px`; Component Defaults says `2px` and the spec delegates per-component weight to it. |
| Button tracking is `0.14em` | Component Defaults' Product Scale figure. Paykit ships `0.18em` (the Brand Scale value) and Uptime `0.12em`; both are drift. |
| BEM elements use a single dash | Paykit writes both `kairos-page-header-primary` and `kairos-record-card__meta`. The skill's naming convention documents the single-dash form. |
| A form-control reset ships in `kairos.css` | The port assumed Tailwind's preflight. Without it, Chrome paints native widget chrome that only shows on the dark theme. |
