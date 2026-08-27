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
| `kairos-panel` | Bordered container, no shadow | A shadowed featured panel; that is Brand Scale | `--flush` |
| `kairos-empty-state` | A list or table with no records | Errors; use `kairos-banner` | — |
| `kairos-metric` | A single figure with its label | A figure inside a table cell | — |
| `kairos-skeleton` | Loading placeholder shaped like its content | Empty states | `--line` `--heading` `--label` `--row` `--control` `--summary` |
| `kairos-figure` | Money and any figure that must not break across lines | Text | — |

Columns run in the order the user reads a record by: the human-readable
identifier, then the secondary identifiers that separate two similar names,
then dates and statuses, then figures, then actions. `DataTable` takes the
order from its `columns` array. Tables written before this rule lead with the
status chip; that is the superseded order, not a local choice to preserve.
Where the hierarchy leaves the order open, ask rather than guess.

## Actions

| Class | Use for | Do not use for | Modifiers |
| --- | --- | --- | --- |
| `kairos-button` | Any action | Navigation between pages; use a link | `--sm` |
| `kairos-page-header-primary` | The one primary action on the screen | A second amber claim | — |
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
into a repo. Ship both variants and let the ground pick.

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
| `Panel`, `PageHeader`, `Metric`, `MetricRow`, `Skeleton`, `SkeletonStack` | Layout and loading |
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
