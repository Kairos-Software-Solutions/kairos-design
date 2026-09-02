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


## Guardrails, 0.3.2

### Six tokens nothing read, and what happened to each

The docblock on `tests/scale.test.mjs` opens by saying a token nothing reads is
a comment, and then the test below it checked a different property — that no
literal sits off the scale. Related, not the same. So the failure the file was
written to catch was never caught, and six tokens shipped unread.

The test now checks the property its own docblock describes: every token in
`tokens.css` is referenced by `kairos.css`, `base.css`, or a React module. The
old test was narrowed to geometry, type and motion, exempting colour because "a
colour token is legitimately read by an app rather than by this stylesheet."
That exemption was covering for a search surface that only read one file. Three
of the six dead tokens were colour.

| Token | Outcome |
| --- | --- |
| `--kairos-text-input` | `.kairos-input-field` and `.kairos-select` now read it |
| `--kairos-text-chip` | `.kairos-state-chip` now reads it |
| `--kairos-text-meta` | `.kairos-meta`, `.kairos-section-meta` and `.kairos-record-card-meta` now read it |
| `--kairos-text-on-dark` | Removed |
| `--kairos-accent-dim` | Removed |
| `--kairos-row-stripe` | Removed |

The three that were pointed at rules render identically, because each role token
is an alias of the exact scale step the rule already held. Nothing moved a
pixel. What changed is that the reason is now written where the value is:
`--kairos-text-input` is 16px because Safari zooms the page when a control under
16px takes focus, and a later pass tightening the type scale would have taken
`--kairos-text-lg` down without ever seeing that.

The three removals, each with the case for keeping it and why it lost:

**`--kairos-text-on-dark`** held `#fff7e8` in both themes — it does not invert.
The token that does is `--kairos-invert-fg`, and it is what every dark-ground
rule in the stylesheet reads. This was already flagged above as two names for
one value, waiting to drift the first time somebody moved one on purpose. The
role it could have named is text on a ground that stays dark in both themes, and
the system has no such ground carrying text.

**`--kairos-accent-dim`** was a 20%-opacity amber wash. The comment three lines
above it says full-saturation amber is a fill for actions and active
navigation, and `.kairos-nav-link[aria-current='page']` takes the full value.
A translucent variant is a second amber signal, and it would have been the
fifth thing on a table row that says "this one" — after hover, selection, the
separator and focus.

**`--kairos-row-stripe`** named a zebra stripe with no rule anywhere. Striping
answers the same question `--kairos-border-subtle` already answers on every row,
and after that token lifted to clear 3:1 it answers it more strongly than
before. Two answers is worse than one: a striped row under hover and a plain row
not under hover would land at similar weights, so the state that matters gets
harder to see, not easier. Bringing it back is a design decision with a story
attached, not a token restored quietly.

### The a11y gate was configured, not running

`.storybook/preview.tsx` has set `a11y: { test: 'error' }` since the workshop
was built. The addon draws a panel; only a runner turns a violation into a
failed build, and nothing installed ran one. So the strictest setting the
parameter has was on, and a story with an unlabelled image would have shipped.

`@storybook/addon-vitest` runs it now, under `npm run test-stories`. Chosen
over `@storybook/test-runner` because Storybook 10's own documentation treats
the Vitest addon as the path and the test-runner as what to use "if you cannot
use the Vitest addon", and because the addon also runs play functions — which
is the rendered-component testing this repo still lists as unbuilt. Proved by
adding a story with an unlabelled image: `image-alt`, one failed test, exit 1.

It is a separate script from `npm test` on purpose. The Node suite runs in
under a second with no browser, and making every commit wait on Chromium would
cost the fast loop that catches most of what gets caught.

Two Vite notes, both the same shape. `aria-query`, `lz-string`, `dequal` and
`pretty-format` are CommonJS and reach the browser through the a11y addon's
annotations; unbundled, the browser asks each for a named export a CJS module
cannot give and every story file fails to import before a test runs. They are
in `optimizeDeps.include` on the project rather than the root config, because
the project is what serves the browser. And there is no `vitest.setup.ts`:
since Storybook 10.3 the plugin provisions preview annotations itself, and a
hand-written `setProjectAnnotations` makes it skip that in favour of a list
that goes stale the first time an addon is added.

### `landmark-one-main` and `region` were never going to fire

The plan for this change assumed both rules fire on every component story as
fragment-rendering artifacts, and called for either a `<main>` in the decorator
or a written suppression. Neither is needed, and the reason is worth writing
down because the assumption is a reasonable one.

`region` is in the a11y addon's own `DISABLED_RULES`, with its own comment: in
component testing landmarks are not always present and the check causes false
positives. `landmark-one-main` matches `html:not(html *)` — the `html` element
and nothing else — and the addon runs axe with `include: document.body`, so the
only node the rule can match is outside the context.

A `<main>` decorator was written and measured: 30 tests passed before it and 30
after, in both directions. It was reverted. A fix that changes no result is a
fix for a problem you do not have, and it would have left the next reader
believing the landmark gate was live.

### What the a11y gate does not cover

Recorded in `preview.tsx` beside the parameter, and it is the reason
`tests/contrast.test.mjs` exists rather than being redundant with it.

axe ships exactly one enabled contrast rule, `color-contrast`, and it is WCAG
1.4.3: text against its background. There is no axe rule for 1.4.11 non-text
contrast. A border, a control edge, a focus ring and a chip outline are
invisible to it at any ratio — which is exactly how `--kairos-border-subtle`
drew the only boundary on two live controls at 1.73:1 through three releases
with a green workshop.

### Contrast is computed, not commented

Every contrast figure in `tokens.css` was correct and unchecked. A comment is
correct on the day it is written and silent every day after.

`tests/contrast.test.mjs` computes WCAG ratios from the token file and asserts
text at 4.5:1 and non-text at 3:1, in both themes, against all three grounds.
It resolves `var()` aliases and falls back to the light value for anything the
dark block does not redeclare, which is how the cascade delivers it and the
case a naive per-block lookup gets wrong.

Not sampled from a rendering. Sampling catches composition failures a token
pair cannot predict and needs a browser; computing from the file is cheap,
deterministic, and catches the class of failure that actually happened. Where a
composition is reachable and no story builds it, the pair is named by hand.

Every figure the comments assert was recomputed and every one matched: amber at
1.52 on cream and 11.67 on ink, `--kairos-border-subtle` at 3.52/3.72/3.04 in
light and 3.77/3.41/3.04 in dark, the disabled primary's label at 13.17 and
6.26. Nothing in this file was found to be lying.

**Floors compare against the unrounded ratio.** The first candidate written for
the fix below measured 4.4988 and displays as 4.50 — a value that fails WCAG
and passes a test that rounds first. Rounding is for a person to read.

### `--kairos-accent-on-light` lifted from #96690e to #8a600d

The one real failure the new test found. `.kairos-button--tertiary` takes this
token for its label and `.kairos-card` sets an elevated ground, so a tertiary
button inside a card is a composition all three apps can build. It measured
3.97:1 against a 4.5:1 requirement.

The alternative was forbidding the composition. Rejected: a rule that a card
may not contain a tertiary button is unenforceable across three repositories
and would be broken by the first person who had not read this file. The token
is one value in one place.

At #96690e the page read 4.60 and surface 4.86 — it passed everywhere a
reviewer would think to look, and failed on the one ground nothing rendered.
Same method as `--kairos-border-subtle`: hue 40deg and saturation 83% unchanged,
lightness alone moved, stopped at the lightest step that clears. Now 5.31 on the
page, 5.61 on surface, 4.56 on elevated. Amber-toned text and icons in all three
apps read slightly darker.

### Landing order

The plan noted this change would be red on arrival, since the unread-token
assertion and the `--kairos-border-subtle` assertion both describe failures that
existed when it was written, and asked for a choice between landing after
remediation or landing with those two skipped behind a pointer.

It landed after remediation, so neither is skipped. No assertion in this change
is skipped for any reason.

### `Foundations/Type` existed in the menu and nowhere else

The workshop's `storySort` has listed Introduction, Colour, Type, Geometry,
Elevation and Motion since the workshop was built. Two of the six existed.
Space, which did exist, was not in the list, so it sorted last by accident
rather than by decision.

Type is now built, and it reads its values out of `tokens.css` through custom
properties the way Colour and Space do, so a token change moves the page and
the page cannot drift from what it documents. All eight sizes are set in one
column — seven from the type scale block plus `--kairos-text-title`, which
sits with the roles because it is the Bebas size, and which is a step whether
or not it is filed as one. Five of the eight had never been rendered beside
each other, which is the only arrangement in which "is this a rank or a guess"
is a question you can answer by looking.

A second story shows the rule that gets broken rather than stating it: two
identical panels, Bebas on the page title in one and Bebas on everything in the
other. That second panel is not a caricature — it is what every heading class
rendered outside `.kairos-app-shell` until `0.3.0`, because the rule dropping
Bebas was scoped to the shell and a dialog is not inside one. A specimen that
only shows the correct case cannot teach anyone to spot the wrong one.

Introduction and Motion were removed from the sort order rather than stubbed.
Elevation is the stamp, and the stamp is a section of Geometry. An empty page
named in a menu is the same defect one line further along.

Two ledes on the Colour page had gone stale in the same commit that deleted the
tokens under them: the Text section promised "the value that survives an
inverted surface" and the Rows section promised "the optional stripe". The
swatches vanished on their own, because that page parses the token file. The
sentences did not, because prose is the part no parser reads.

### Breakpoints are constants, and all seven are load-bearing

**Constants referenced by convention, written at the foot of `tokens.css`.**
Forced rather than chosen: a CSS custom property cannot be used in a media
query, because the query is evaluated before the cascade resolves one. The
alternative is `@custom-media`, which needs a PostCSS build, and this package
has deliberately never had one — `dist/` is hand-edited source and the export
map points straight at it. A whole toolchain to name seven numbers is not a
trade worth making. The cost of the choice is that nothing enforces the list;
it is a register to check, not a guarantee.

There are seven boundaries, not nine widths. `max-width: 767px` against
`min-width: 768px`, and `max-width: 899px` against `min-width: 900px`, are each
one boundary written as its two sides, which is correct rather than duplicated.
Thirteen width queries across those seven, plus `pointer: coarse`,
`prefers-reduced-motion` and `print`.

**Five classes had no story, not seven.** An earlier pass counted by grepping
`stories/` for CSS class names, which misses every class a React component
emits: `.kairos-dialog-actions` comes from `ConfirmDialog` and
`.kairos-toast-region` from `Toast`, and both are rendered by
`Components/Feedback`. The five genuinely uncovered were
`.kairos-filter-bar-search`, `.kairos-filter-bar-action`, `.kairos-login-grid`,
`.kairos-kicker` and `.kairos-desktop-only`. `Screens/Record list/Filtered` and
`Screens/Sign in` cover them now, and every breakpoint rule in the stylesheet
has something that renders it.

**The collapse was measured and there is nothing to collapse.** Each boundary
was probed either side in a real browser — Chromium against the built workshop,
reading computed style and geometry rather than reading the CSS:

| Boundary | What changes across it, measured |
| --- | --- |
| 420 | Dialog actions `row` → `column-reverse`, height 36px → 84px |
| 520 | Filter search `grid-column: auto` → `span 2`, width 221px → 455px |
| 640 | Equal action row 1 column → 2, height 84px → 36px |
| 768 | Main padding `20/16/96` → `28/28/104`; kicker `none` → `inline-block`; filter action gains its 23px label offset and stops being full-width |
| 900 | `desktop-only` `none` → `block`; the sidebar appears and main narrows from 899px to 656px |
| 980 | Login grid 1 column → 2 |
| 1200 | Main padding `32/48/48` → `48` |

Every one fires, and no two fire on the same thing. So the smallest set that
keeps every layout correct is the set that is there.

The obvious candidate was folding 420 and 640 into 520, since three phone-range
boundaries within 220px of each other is the shape of eleven tracking values
before they were a scale. Both were tested by injecting the collapsed rules into
the running workshop and measuring, and both were rejected on the numbers:

- **420 → 520 is a regression.** The dialog's two buttons measure 87px and
  161px. With the 12px gap that is 260px, and they sit in a row with 170px to
  spare at 430px wide. Collapsing to 520 stacks them from 421px to 520px and
  doubles the row's height from 36px to 84px, on exactly the screens with the
  least height to spend.
- **640 → 520 is not a regression, it is a different design.** Between 521px
  and 640px it would put two 219–274px buttons side by side where there is now
  one full-width column. Nothing breaks at that size. But the current rule is a
  decision — an equal-width action row is one column on a phone — and swapping
  it is choosing a different layout, not preserving the one that is there. The
  task is to reduce the set while every layout stays correct, and this does not
  meet that.

Worth noting what the filter bar does instead, because it is the alternative to
all of this: `grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px),
1fr))` reflows it from one column to four across seven different widths without
a single media query. Its one breakpoint at 520 exists only to undo a
`grid-column: span 2` that has nothing to span in a one-column grid. A system
built that way needs fewer named widths because the content decides. That is a
larger change than this one and it is not started here.

**The workshop viewports were replaced.** 320, 720, 1024 and 1440 were the
widths the system makes promises about, which is not the list of widths it
behaves differently at. 720 sits between 640 and 767, so it renders three
boundaries identically to 660 or 700, and nothing in the set landed either side
of 420, 520, 900 or 980 — four boundaries could have moved and no viewport would
have shown it. The eight now sit one pixel under a boundary or just over it, so
stepping between neighbours is the boundary crossing and nothing else.

### Release note, 0.3.2

**No runtime behaviour changes and no class renamed.** Three things a consuming
app will see:

Amber-toned text and icons read slightly darker in light theme.
`--kairos-accent-on-light` moved from `#96690e` to `#8a600d` so a tertiary
button inside a card clears 4.5:1 rather than 3.97:1.

Three tokens are gone: `--kairos-text-on-dark`, `--kairos-accent-dim` and
`--kairos-row-stripe`. Nothing in this package read any of them, and nothing in
Paykit, Mailkit or Uptime is known to — but an app that did will get an
unresolved `var()` rather than a build error, so it is worth a grep. Each has a
replacement or a reason above.

Nothing else moves. `--kairos-text-input`, `--kairos-text-chip` and
`--kairos-text-meta` are now read by the rules that were holding their values
literally, and each role token is an alias of the exact step the rule already
had, so every one of those renders identically.

For anyone working on this repo rather than consuming it, the change is that
four rules it states about itself are now checked by something that runs, and
they run on a pull request rather than after the merge.

## Table behaviour, 0.4.0

[ADR 0006](adr/0006-take-table-behaviour-from-tanstack-table.md) is the
authority for the dependency, under the principle in
[ADR 0005](adr/0005-buy-behaviour-and-build-appearance.md): buy behaviour,
build appearance.

### What was bought

`DataTable` runs on TanStack Table. `@tanstack/react-table` is an optional peer
dependency, so an app importing `Button` installs nothing and an app importing
`DataTable` installs one package.

The library was adopted on one condition, checked rather than assumed: no
`kairos-*` class had to change to accommodate it. None did. Every element and
every class in the rendered table is still this package's — the library holds
the row model and the state and emits no markup and no CSS. A required class
change would have been the signal that it is not headless and that this was the
wrong change.

Four things the registry did not have arrive with it, each off by default and
each behind one prop: paging at 25 rows, row selection, a search term, and
hideable columns. The registry had no pagination class in 197 classes, and
every list fixture in the workshop held five rows, which is why a business with
three hundred invoices got three hundred rows and nobody could see it.

### What was kept

**`compare` is registered, not replaced.** Blanks sort last in both
directions. That is a defect this repo already found and fixed in Paykit, where
a descending sort on a column with blanks put a block of dashes at the top, and
the library's default comparator would have reintroduced it. `sortRows` and
`nextSort` are still exported and `tests/sort.test.mjs` passes unchanged.

**The three-state sort cycle is ours.** Ascending, descending, then back to the
screen's default. The library's own toggle is a two-state flip, which leaves a
reader who sorted by mistake no way back short of reloading. The default column
is the exception and has two states, because the third would be the state it is
already in — and pressing a column the screen already sorts descending now
reverses rather than appearing to do nothing, which it used to.

**`ColumnRole` is ours.** The library knows about tables and nothing about a
record card, and the card is half of what `DataTable` is for. A column still
declares its role once and that declaration still drives the table, the card,
and the order.

**Selection is a table capability, not a column.** A `selectable` prop rather
than a column the call site declares, because a call site that can declare a
selection column can also declare two, or put it last.

### What the selected-row bar is and is not

`kairos-bulk-bar` states the count and holds a slot. It ranks nothing and
arranges nothing. Action composition is `ActionSet`, arriving in 0.5.0 under
[ADR 0008](adr/0008-compose-actions-through-a-component.md), and it renders
into this slot. A bar that composed its own buttons would have been a second
action pattern beside the one the registry is about to standardise on.

`--kairos-row-selected` and `.kairos-table tbody tr[aria-selected='true'] td`
both shipped in 0.1.0. Nothing ever set that attribute, so a selected row could
not exist and the ground never painted. That rule is unchanged; it now has a
setter.

### What the workshop found

**The segmented filter never fitted the filter bar.** `.kairos-segmented` is
`inline-flex`, which sizes to its segments everywhere except inside a grid,
where a grid item stretches to its column instead. A track in
`.kairos-filter-bar` is around 190px and three segments need around 230, so the
control shipped stretched *and* squeezed: a box wide enough for six segments,
with "Settled" wrapped onto a second line inside it. `justify-self: start` stops
the stretch and `min-width: max-content` above 768px stops the squeeze. The
label-row offset that `.kairos-filter-bar-action` carried as a literal is now
`--filter-label-offset`, read by both controls that need it.

**Two stories labelled a menu twice.** `OverflowMenu` builds its trigger label
as `Actions for ${label}`, and two call sites passed `Actions for INV-0042`,
which read as "Actions for Actions for INV-0042" to a screen reader.

### Release note, 0.4.0

**Breaking: `DataTable` needs `@tanstack/react-table` installed.** One command,
and only for apps that import `DataTable`.

**Breaking: a table pages at 25 rows unless told otherwise.** A table that
wants what it had takes `pageSize={rows.length}`. The migration note in
[adoption.md](adoption.md) gives the one line.

`columns` arrays do not change. `Column<Row>` is now `ColumnDef` with the six
Kairos fields folded over it, so a column can carry `size`, `filterFn` or
`enableHiding` as well — and nothing has to.

Selection below 768px is a known gap. A record card carries no checkbox,
because what a card renders is the `record-card` contract and this change does
not touch it. A phone reader can sort, page and search a list but not select
from it.

Paykit, Mailkit and Uptime were not migrated. Each pins a version and moves on
its own schedule.

## Action composition, 0.5.0

[ADR 0008](adr/0008-compose-actions-through-a-component.md) is the authority
for the component and the skill edit;
[ADR 0007](adr/0007-take-menu-and-overlay-behaviour-from-radix.md) for the
dependency, under [ADR 0005](adr/0005-buy-behaviour-and-build-appearance.md).

### The dependency

`radix-ui` replaces the single `@radix-ui/react-dialog` entry as an optional
peer dependency. It is the one thing a consumer has to do by hand on the way to
this version: install `radix-ui` and drop the old package. Nothing else in the
upgrade needs a change at a call site.

It now carries five components rather than one. `Dialog` and `ConfirmDialog`
were already on it; `OverflowMenu` moved onto `DropdownMenu`, and `Select`,
`Tooltip` and `Popover` arrive on their own primitives. Three of the five
surfaces already had Radix installed for the dialog and had built nothing else
with it, which is the gap this closes.

### What was bought, and what it retired

`OverflowMenu` went from 260 lines to 147. Deleted, not kept as a fallback: the
portal, the `position: fixed`, the `getBoundingClientRect` on open and again on
scroll and resize, and the flip when the space below ran short. Two positioning
strategies in one component is how the wrong one ships.

What that bought is behaviour the hand-rolled version never had — typeahead,
arrow navigation that wraps, Home and End, and a trigger that opens on
ArrowDown onto the first item.

What it retired is a defect whose fix was a rule nobody could enforce.
`.kairos-overflow-menu` no longer declares a `position`, so an app stylesheet
re-declaring it as `absolute` styles the menu and cannot move it. The manifest
row that warned about that rule, and the branding skill's paragraph instructing
an agent to hand-roll the portal, both went with it.

The z-index stayed on our class, and that was measured rather than reasoned
about. Moving it onto Radix's wrapper computed as `z-index: auto`: Radix reads
the value off the content element and writes it inline onto the wrapper, and an
inline value beats a stylesheet rule about the wrapper. So the stylesheet stays
entirely ours, with no Radix attribute selector in it.

### What was kept

**Every class, and every element under it.** `kairos-overflow-menu`,
`kairos-overflow-trigger`, `kairos-overflow-item` and both `--destructive` and
`--divided` all still appear in the rendered output. An item is still a
`<button type="button" role="menuitem">`, or an `<a role="menuitem">` when it
carries an `href`, which needed `asChild` rather than Radix's own `div` —
`.kairos-overflow-item` sets `border: 0`, `background: transparent` and
`font: inherit`, three declarations only a button needs and which a div would
have made dead.

**The native `<select>`.** `Select` does not replace it and is not meant to.
Ten options or fewer, the native control stays: on a phone it opens the platform
picker, it works before hydration, and it costs nothing. Ten is the boundary,
exported as `FILTER_THRESHOLD` so the manifest and the component cannot drift.

**`ConfirmDialog`.** `ActionSet` gates every destructive action through it
rather than growing its own confirmation.

### The component, and the rule it replaced

`ActionSet` composes a screen's actions from named slots. The branding skill's
Action Hierarchy kept its five ranks — they explain why, and reasoning is the
thing an agent cannot recover from reading a type — and lost the eight rules
under them, in this release rather than a later one. A component enforcing a
rule and a document separately stating it are two sources of truth, and the
document goes stale first, which is exactly what had happened to the row-menu
paragraph.

Three departures from ADR 0008's shape, each taken at review rather than
assumed: a dialog footer has no menu and no destructive slot, an action can
navigate as well as run, and a disabled action renders unavailable rather than
vanishing.

`destructive` is a property rather than a rank. Given a slot beside primary and
secondary it produces a red Delete next to Save; carried on the action, it
forces the action into the menu, sorts it below a rule, and gates it behind a
confirmation. No ranked slot accepts one, in any context.

### What the render found that the review had not

**A set that can open a menu has to name what it acts on.** `OverflowMenu`
takes a required `label` so that six identical triggers down a table are six
controls a screen reader can tell apart. A component taking a screen's actions
without one would have reintroduced that defect a layer up, so `label` is
required on `page`, `row` and `card`.

**A dialog opened from a menu item lost focus entirely.** Measured, not
guessed: the focus sequence ran menu item, dialog close button, and the trigger
at no point at all — Radix's own restore to the trigger loses to the dialog's
focus scope, which mounts first. `Dialog` had nothing outside an overlay left to
remember and returned focus to `<body>`, so a person who cancelled a deletion
was put back at the top of the page. `Dialog` now takes an explicit
`restoreFocusTo`, `ConfirmDialog` passes it through, and `ActionSet` fills it
with the same ref it hands `OverflowMenu`'s new `triggerRef`.

### Minor rather than major

Checked against the two apps that depend on this package rather than assumed.
Neither writes a stylesheet rule about `.kairos-overflow-menu`, and Uptime's one
call site passes `label` and `items`, both of which are unchanged. Both pin
`^0.2.x`, so neither is carried into this version by a range.

No prop was removed, no class was removed, and no element under a class
changed. The peer dependency swap is the only manual step, and it is one line in
a `package.json`.

### What did not happen here

Paykit, Mailkit and Uptime were not migrated. That was a non-goal, and it stays
one: a package that changes its consumers in the same release as itself has no
way to tell which half broke something.


## Stronger gates and the copy field, 0.7.0

Two roles Mailkit had built for itself, taken into the registry as it adopted
the package. Both were found the same way: not by reading Mailkit's stylesheet
for drift, but by trying to replace a Mailkit screen with registry components
and finding the screen could not be built.

### A confirmation is one gate at three strengths

`ConfirmDialog` asked for one click. Mailkit asked for three different things
depending on what was about to happen, and it was right to: purging a public
image, revoking a key every application is using, and releasing a usage
reservation whose SMTP outcome is unknown are not one risk with one answer.

So the gate grew two optional requirements rather than the registry growing a
second dialog.

| Prop | Asks the person to | Reach for it when |
| --- | --- | --- |
| — | read | The consequence is one record on this screen |
| `typeToConfirm` | name the record | The consequence reaches past the screen |
| `requireReason` | account for it | The action lands in an audit trail |

The strengths are about what the person does, not how loudly the dialog is
painted. A louder dialog asking for the same single click is a warning, and a
warning is what people click through. Typing the record's own name is the one
thing that is evidence the right row was read — which is the failure a list of
near-identical records actually has, and the failure a second click cannot
catch.

The gate is deliberately not free. `typeToConfirm` on everything is
`typeToConfirm` on nothing, because a person who types a name eight times a day
is copying characters rather than reading a consequence. The manifest row and
the prop's own docblock both say where the line is, because that is what an
agent about to add the prop is reading.

**Matched trimmed and case-insensitively.** The expected string is printed in
the dialog's own label, so the person is copying it off the screen; a copy that
fails on a trailing space, or on `PURGE` against `purge`, is a requirement the
prompt never stated. Mailkit had already settled this and had a test for it.
The test came with the logic.

**`confirm.ts` sits beside the component, not inside it.** Same shape as
`sort.ts` beside `DataTable`: it is the part of this component that decides
whether something irreversible happens, and it is plain string logic, so it is
testable without a renderer. `tests/confirm.test.mjs` is four assertions and
covers the empty gate — which is what every existing call site passes, and what
would have turned every plain confirmation in every app into one that can never
be confirmed.

**`onConfirm` grew an argument rather than a second callback.** A handler taking
fewer parameters assigns to one taking more, so every existing `() => void`
still type-checks and no call site changes.

**Pending and unsatisfied are different states on one button.** This is the only
component in the package that can be in either, and conflating them is the
defect the button's `loading` state was built to prevent. Unsatisfied is
unavailable and takes the two disabled signals; pending keeps the rank, the box
and the tab stop, because `disabled` at the moment the answer arrives drops
focus off the control the person just pressed Enter on. A contract test asserts
that `disabled` never carries `pending` here.

### The gate belongs to `ActionSet` too

A destructive action's placement, ordering and confirmation are `ActionSet`'s
decisions, so its gate has to be as well. Without the two props on
`Destructive`, an app needing a typed confirmation on a row action had to go
around `ActionSet` and assemble an `OverflowMenu` and a `ConfirmDialog` by
hand — and a call site that has gone around that component is a call site none
of its types reach, which is the standing risk its own docblock names.

`DestructiveAction.onSelect` grew the same argument `onConfirm` did, and for
the same reason: a handler taking fewer parameters assigns to one taking more.
The type tests assert both — a handler ignoring the details, and one
destructuring the reason out of them — because the claim being made is that no
existing call site changes.

### `CopyField`, because a read-only value is not a disabled input

Every Kairos app that shows a technical value had built this. Mailkit's was
`CopyableField`, 80 lines, with the geometry in a `style` prop and the copy
button absolutely positioned over the top-right corner of the value.

The overlay is the part worth recording, because it is the obvious
implementation and it costs exactly the two things the pattern is for. It
covers the end of a short value and the start of a scrolled one, and its target
has to shrink to fit inside the box it is sitting on — Mailkit's was 24px
against a 44px minimum. So the control takes its own grid column: the value
keeps its full width and the button keeps a real target.

Three smaller decisions:

- **It scrolls sideways rather than wrapping.** A DKIM value rewrapped at the
  panel's width cannot be compared character by character against the record in
  the registrar's panel beside it, which is the one task this element exists
  for. `multiline` switches to `kairos-code-block` for values with meaningful
  line breaks.
- **The scroller is focusable.** A region a mouse can scroll and a keyboard
  cannot is WCAG 2.1.1, axe fails it by name, and the story suite caught it on
  the first run. `tabIndex` is the whole fix; the global `:focus-visible` rule
  supplies the ring.
- **The copy is announced, not only drawn.** An icon changing to a tick is
  nothing a screen reader reports, and the person who most needs telling is the
  one who cannot see it. The status line holds its row either way, so
  confirming a copy moves nothing. Where the clipboard is refused outright — an
  insecure origin, a policy — it says so, because there is nothing to retry and
  the value can still be selected by hand.

The control is a control at rest. Hover does not exist on a phone, does not
appear in the screenshot attached to a support ticket, and cannot be described
to whoever is standing at the registrar's control panel.

### Minor rather than major

No prop was removed, no class was removed, no element under an existing class
changed, and `onConfirm`'s new argument is optional to receive. `ConfirmDialog`
gains the pending treatment on its confirm button, which is a behaviour change
and a fix: it previously swapped the label to `Working…`, which measures its own
content and grows the button under the pointer still on it.

### What did not happen here

Mailkit was not migrated in this release. It is the app that found both of
these, and its adoption lands in its own repository against a published
version, so there is still a way to tell which half broke something.

### `Ranked` was a fork of `Button` living inside `ActionSet`

`ActionSet` wrote the button classes itself, against a rank-to-modifier map of
its own beside `Button`'s identical one. Two copies of one mapping is a defect
waiting for a sixth rank, but it cost nothing visible until a declared action
needed to say it was in flight — at which point the pending state was already
built, one file away, and unreachable from the component every screen composes
its actions through. An app hitting that goes around `ActionSet`, which is the
one outcome its own docblock is written to prevent.

So the button branch renders `Button`, and `RunAction` grew `pending` and
`pendingLabel` to reach it. The emitted class strings are unchanged, which the
`ActionSet` stories assert exactly rather than by pattern.

**Only a ranked action can be pending, and the type says so.** A menu item
cannot: choosing one closes the menu it was in, so there is nothing left on the
screen to put the state on. That is a real constraint rather than a gap — an
action whose progress the person needs to watch has earned a button.
