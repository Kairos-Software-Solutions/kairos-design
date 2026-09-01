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

## Distribution

**0.2.0 replaced vendoring with a published package, and the repo went
public.** Recorded here rather than left to a commit message, because the
reasoning against it is written down in `0.1.0`'s README and a later reader
will otherwise reinstate it.

`0.1.0` copied the artifacts into each app, committed the copies, and ran
`kairos-design check` in CI to catch one that had been edited or had fallen
behind. Its two stated reasons:

**"Tokens have to apply before first paint."** This held against a CDN
stylesheet in the critical path, but a CDN was never the alternative. An app
that depends on the package and writes `@import "kairos-design/tokens.css"`
gets those bytes inlined into its own stylesheet by the bundler, with no
request and no flash — the same first paint the copy produced.

**"`npm ci` runs with no GitHub credentials."** This one was real. Paykit and
Mailkit build with `build: .` and `COPY . .`, so a private dependency cannot
resolve inside the image without a build secret. But it was a consequence of
the repo being private, and nothing here is confidential: a colour palette, 220
class names, and a Button. Public, it resolves with nothing added to any
Dockerfile.

Three things were wrong with the vendored scheme beyond the cost of running it:

- `check` compared each app against whatever commit the local registry checkout
  was on, and the CI snippet cloned the default branch unpinned. Merging
  anything to the registry turned every app's CI red at once, and the
  prescribed fix — re-run `sync` — pulled in whatever else had landed.
- `sync` warned but still wrote when the registry checkout was dirty, so an app
  could commit bytes that existed in no commit of the registry anywhere.
- Copying components into an app is the shadcn model, which works because the
  app owns and edits the copies. This copied them and then failed the build if
  you edited one — the duplication without the ownership.

`sync` and `check` are gone. `emit` remains for Uptime, Card, and Mailclient,
which have no bundler and so cannot import anything; what it writes is a build
artifact and is gitignored, which is why nothing checks it. `ARTIFACTS` is
derived from `dist/` rather than hand-listed, so adding a component no longer
means editing the CLI.

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

### Section tag, 0.2.7

Card drew a label-plus-rule section opener in its own stylesheet, and the
website draws the same pattern on every page. Neither Paykit, Mailkit, nor
Uptime had a class for it, because it is Brand Scale and all three are tools.
It is in the registry now as `kairos-section-tag`.

The name collides visually with the `kairos-section` family, whose elements are
`-lede`, `-glyph`, `-title`, `-body`, and `-meta`. Rule 1 settles it: the
branding skill calls this the section tag, so the skill's name wins outright.
The manifest's "Do not use for" cell carries the distinction, which is where an
agent about to make the mistake is actually reading.

The block styles its own label rather than taking a type class from the call
site. A rule paired with the wrong type rank is the only way to get this
pattern visibly wrong, and Card had already paired it with `kairos-label-caps`,
which is the muted metadata rank rather than the section rank. Making the
pairing a decision a screen gets to make is how that happens twice.

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


## The workshop, 0.3.0

Everything below was found by rendering the registry for the first time. None
of it could have been found any other way, and all of it had shipped.

`docs/preview.html` was 239 hand-written lines checked by hand, and this file's
own "Not yet built" table said so: *"The preview is checked by hand. A
screenshot diff per commit would catch what a reviewer will not."* The five
Node test files parse CSS as text and grep TSX as strings. They are good tests
and they caught real things, but a class that exists and paints nothing is
invisible to all of them, because an unmatched class and an empty rule look the
same to a parser and completely different to a person.

`npm run storybook` is now the answer. Every component, every class, both
themes, four viewports, and — the part that matters most — whole screens.

### What rendering found

**`kairos-table-panel` painted nothing.** No border, no ground, no radius, no
shadow. `DataTable` used it as its only wrapper, so every table in every
consuming app rendered with no container. Paykit's own call sites wrote
`kairos-panel kairos-table-panel kairos-desktop-table`, three classes, and the
extraction into `DataTable` kept two. This is the defect that started the
review: Uptime, a well-behaved consumer with an 85-line stylesheet doing
everything right, had a naked table on its Monitors screen and no way to see
why.

**Five heading classes rendered in Bebas outside the app shell.** The only rule
dropping Bebas for `h2`–`h6` was scoped to `.kairos-app-shell`, so a dialog, a
sign-in page, a hosted invoice, and a toast all drew uppercase condensed
section headings. `.kairos-dialog-title` set `font-family` on itself, which is
somebody hitting this once and patching one class; the other five were never
found. Every named heading class sets its own family now.

**The same rule outranked the classes it was a default for.**
`.kairos-app-shell :is(h2…)` scores (0,1,1) and `.kairos-panel-heading` scores
(0,1,0), so inside the shell — which is to say on every screen — a panel
heading rendered at 13px while its own class asked for 1.05rem. `:where()`
drops it to zero specificity. A default has to lose to the thing it is a
default for.

**`.kairos-nav-link` keyed off `.active` alone.** An app marking its current
destination with `aria-current="page"`, which is what the rest of this
stylesheet reads on `.kairos-view-toggle` and `.kairos-segmented`, got no
active state at all. Uptime writes both and looked right. Both work now, and
the attribute is the canonical one.

**A disabled field was indistinguishable from an enabled one.** No rule
existed. `.kairos-button:disabled` had its reasoning worked out three versions
ago and the input never got the same treatment.

### The token layer was documentary

The headline finding, and the answer to why two apps that both use this package
look different.

Of the 29 geometry and type tokens, **17 were referenced zero times** by the
stylesheet they were written for. `tokens.css` says the geometry values are
tokens "because they are exactly what drifted between the four apps" — and then
`--kairos-sidebar-w: 220px` and `.kairos-sidebar { width: 244px }` shipped in
the same release, in the same package.

Measured on `kairos.css` before this change:

| | Distinct values | Tokens that named them | Times a token was read |
| --- | --- | --- | --- |
| `padding` | 38 | `panel-pad`, `section-pad` | 0 |
| `gap` | 13 | `gap` | 1 |
| `font-size` | 33 | 7 | 3 |
| `letter-spacing` | 11 | 3 | 1 |
| border width | 3 | 2 | 1 |
| duration | 4 | 1 | 0 |

The spacing values included `7px 11px`, `10px 10px 4px`, and gaps of 5, 7, and
9px. The font sizes included 0.8, 0.8125, 0.82, 0.84, 0.85, and 0.86rem — six
ranks inside one pixel of each other, which is six guesses at the same rank and
six values a later screen can copy.

Worst of all, `.kairos-stack--*` and `.kairos-pad--*` — the spacing classes an
app writes on every screen — ran on a private scale of 6/10/14/18/20px through
their own custom properties, so the most-used spacing utility in the system was
the one place the tokens never reached.

Nine space steps, eight type steps, four tracking ranks, four stamp ranks. 171
declarations converted in the first pass, 48 border widths, 58 font sizes, and
every utility scale after that.

### The mechanism

Documentation was doing a job only a test can do. `tests/scale.test.mjs` fails
on:

- a padding, margin, or gap that is not a step
- a font size that is not a step
- a hand-written tracking, radius, border width, duration, easing, or stamp
- a geometry or type token that nothing reads
- a `kairos-table-panel` with no `kairos-panel`
- a heading class outside the Product Scale rank
- the shell heading default carrying specificity

The last three are regression guards for the specific defects above. The first
four are what stop the next one.

A token that nothing reads is a comment. That is the whole of it.

### Two things to fix at the source

**`dist/` holds hand-edited source.** The package has no build step and the
export map points there, so a directory named `dist` contains the files a
person edits. Vite's dev server does not watch it, which meant every stylesheet
edit needed a server restart before it reached the browser — the workshop had
to add a `node:fs.watch` plugin to work at all. This is the second thing the
naming has broken and it will keep tripping tools that assume the conventional
meaning. `src/` with an unchanged export map costs one commit.

**`--kairos-elevated` and `--kairos-sidebar` hold the same value in both
themes**, as do `--kairos-text-on-dark` and `--kairos-invert-fg` in light. Two
names for one value is a value that will drift the first time somebody moves
one of them on purpose. Either the roles are genuinely different, in which case
say so in the token comment, or one of them goes.


## Remediation, 0.3.1

### `:has()` is safe, and the one engine that is not clears the bar anyway

The field fix hangs on `.kairos-field:has(.kairos-field-error:not(:empty))`,
which is the only `:has()` in the package. Support, from `caniuse-lite`:

| Engine | `:has()` shipped | Declared floor | Clears |
| --- | --- | --- | --- |
| Chrome | 105 | 111 | yes |
| Edge | 105 | 111 | yes |
| Safari | 15.4 | 16.4 | yes |
| iOS Safari | 15.4 | 16.4 | yes |
| Firefox | 121 | 114 | **no, by seven versions** |

The floor is Vite 8's `baseline-widely-available` default, which is what Uptime
builds against: it declares no `browserslist` and sets no `build.target`, so it
inherits `chrome111, edge111, firefox114, safari16.4, ios16.4`. Paykit and
Mailkit are not in this working tree and their floors were not read. Neither
declares one as far as this repo knows, and a Next app that declares none
inherits a far older list, so assume both are at least as loose as Uptime's.

Firefox 114 to 120 is a real gap and it does not matter, because the rule
degrades to the behaviour it replaces. Measured by deleting the rule from the
rendered page:

| Field | With `:has()` | Without |
| --- | --- | --- |
| Neither hint nor error | 83.4px | 83.4px |
| Hint only | 83.4px | 83.4px |
| Error only | 83.4px | 106.8px |
| Hint and error | 83.4px | 106.8px |

106.8px is `0.3.0`'s height to within a rounding step. An engine without
`:has()` puts the error one row lower on the fields that carry one, which is
exactly what every engine did before this change, and still gets the shorter
field everywhere else — the `:empty` rule that collapses the error row carries
that on its own and is supported everywhere. The failure mode is the current
state, not a broken one, so no fallback is warranted.

### The disabled primary desaturates rather than dropping

`--kairos-accent-disabled` is new: amber carried 70% of the way to the page in
each theme, `#ffd278` on light and `#ba8e36` on dark. Every other rank drops its
ground to the page and its border to `--kairos-border-subtle`, which is the
treatment `.kairos-input-field:disabled` has had since it was written and whose
comment has claimed the button shared it ever since. It did not. The button had
`opacity: 0.7`, which is one signal, and on the borderless ranks close to none.

The primary cannot drop its ground, because a disabled rank 1 that repaints
itself cream is a disabled rank 2, and the screen then shows no primary at the
moment somebody is looking for the way forward. It desaturates and keeps its ink
label, which reads at 13.17:1 on the light fill and 6.26:1 on the dark one.

70% rather than 50% or 80% because the value is pulled two ways: more
desaturation separates it from an *enabled* primary, less keeps it ahead of an
*enabled* secondary. At 70% both hold, and the other two signals — the ink
border dropping to subtle, and the stamp coming off — carry the first
comparison, so the fill only has to win the second. Light is the tighter of the
two themes; on dark the filled amber against an outlined secondary is not close.

The value is a hex per theme rather than a `color-mix()` of `--kairos-accent`
and `--kairos-bg`, which would say the relationship in one line. `color-mix()`
landed in Chrome 111 and the declared floor is Chrome 111, so there is no
margin, and its failure mode is worse than `:has()`: an unsupported value makes
the declaration invalid at computed-value time and the disabled primary renders
with no fill at all. Two hex values in the file that already holds every other
hex value cost nothing and cannot fail.

`opacity` is no longer the mechanism on any rank. It stays available on a label
alone where a rank needs more separation, never on a whole control.

### `--kairos-border-subtle` lifts to clear 3:1, in both themes

`#d2be90` → `#9d8140` on light, `#6e6152` → `#7f6f5e` on dark. Hue and
saturation are unchanged in both; only lightness moved.

The token draws the only boundary two live controls have — the overflow menu
trigger and the divisions in a segmented control — so it is a non-text contrast
surface owing 3:1, not a decorative tint. It measured:

| Ground | Light before | Light after | Dark before | Dark after |
| --- | --- | --- | --- | --- |
| `--kairos-bg` | 1.73 | 3.52 | 3.04 | 3.77 |
| `--kairos-surface` | 1.82 | 3.72 | 2.75 | 3.41 |
| `--kairos-elevated` | 1.49 | 3.04 | 2.45 | 3.04 |

Both values are the *lightest* on their existing hue that still clear 3:1
against `--kairos-elevated`, the tightest of the three grounds. Sixteen rules
read this token, most of them separators rather than control edges, so anything
darker than the floor is a cost paid on every list screen in every app for no
requirement. The floor is what is owed.

One token rather than a control-specific fork. Two tokens for one role is how a
vocabulary drifts, and the second one is always the one nobody updates.

The visible cost is that light-theme table row separators read distinctly
heavier — a ruled table where there was an airy one. Checked on
`Screens/Record list/Paykit` at 1280px in both themes: the hue is unchanged and
the panel's ink border still leads, so it still reads as a Kairos table. Dark
barely moved. This is the one change here a person will notice without being
told, and it is worth saying in the release note rather than letting three
teams each notice it separately.

The unplanned dividend is disabled controls. `.kairos-button:disabled` and
`.kairos-input-field:disabled` both draw their border from this token, so the
two-signal treatment in the section above got a findable edge out of the same
change — the second signal is now visible rather than merely present.

### What the new arrangements make visible

`Components/Button/Edges` is three arrangements, each aimed at one defect the
existing stories rendered and hid.

**The Matrix hid a broken left edge for three versions.** It renders all six
ranks in every state, which sounds like complete coverage and is not: a grid
centres each button in its own cell, so no two boxes ever share an edge and the
only comparison the defect lives in is never drawn. `tertiary` measured 64px
against everyone else's 84px and started its label 10px inside theirs, and the
Matrix showed that as six correctly-centred cells.

*One column, one edge* stacks the six left-aligned against a dashed guide.
Reverting task 3 moves the tertiary label from 72px to 62px and the ghost to
70px, three box widths where there was one, and the ragged edge is the first
thing on the page.

**The Matrix also hid a disabled state that was not one.** It has a Disabled
column, so a disabled ghost was rendered — a column away from the enabled ghost
it needed to be compared against. `opacity: 0.7` on a rank whose text is
already muted is not visible on its own; it is only visible next to the thing
it is 0.7 of.

*Each rank, both states* puts them adjacent, rank by rank. Reverting task 4
makes the ghost and tertiary rows read as one control printed twice.

**No story ever put a disabled rank 1 beside an enabled rank 2**, which is the
pairing the branding skill actually constrains and the one the flat opacity
inverted.

*Rank 1 disabled against rank 2 enabled* is that pairing and nothing else.
Reverting task 4 washes the primary to near-cream while the secondary keeps its
ink border, and the secondary reads as the stronger of the two.

The general point, which is the one worth keeping: rendering a component is
necessary and not sufficient. A defect that lives in the relationship between
two elements is invisible in any arrangement that does not place them together,
however many states are on the page. The arrangement decides what a reviewer
can see.

The same gap applied twice more in this change and was closed the same way.
`Components/Field/States` never rendered a field carrying a hint *and* an error,
which is the case the whole message-slot fix turns on. `Components/Button/In a
row` never put a borderless rank in an equal-width track, which is the case
`kairos-action-row--equal` broke. Both now do.

### Nothing was renamed, 0.3.1

Diffing every `.kairos-*` selector in `kairos.css` against `0.3.0`: 255 classes
before, 255 after, and the two sets are identical. No class was added, retired
or renamed, so there is nothing here for a consuming app to migrate and nothing
that changed name quietly.

Four tokens were added and none removed:

| Token | Why |
| --- | --- |
| `--kairos-field-gap` | Form density, the gap inside a field |
| `--kairos-form-gap` | Form density, the gap between fields |
| `--kairos-accent-disabled` | The disabled primary's fill |
| `--kairos-duration-none` | What every duration collapses to under reduced motion |

Every one of them is read by a rule. Adding a token nothing reads is the thing
`0.3.0` spent a release removing.

### Release note, 0.3.1

**Every form in every consuming app gets shorter, by about 20%.** Measured on
`Components/Field/A Form` at 1280px, before and after:

| | 0.3.0 | 0.3.1 | Change |
| --- | --- | --- | --- |
| One text field | 106.78px | 83.39px | 21.9% shorter |
| A five-field panel | 312.36px | 265.58px | 15.0% shorter |
| The page | 959px | 932px | 2.8% shorter |

A field spent 40 of its 107 pixels on two message rows that were usually both
empty. It reserves one now. Nothing about the API changed and no class was
renamed, so nothing breaks — but every form screenshot in Paykit, Mailkit and
Uptime is now out of date, and any layout tuned against the old field height
will have slack in it. Worth knowing before three teams each discover it.

The other change a person will notice without being told is that light-theme
table row separators read distinctly heavier. See the contrast section above:
`--kairos-border-subtle` drew the only boundary on two live controls at 1.49:1,
and lifting it to clear 3:1 lifts every separator that reads through the same
token.
