# Adopting the design system

```sh
npm install kairos-design
```

Then import it. Nothing else in the app changes until you start replacing
hand-rolled classes with the vocabulary.

Adopt in this order. Each step is independently shippable.

1. **Tokens only.** Import `tokens.css`, add the `--k-*` or `--color-*` alias
   block described in [decisions.md](decisions.md), and delete the app's own
   token definitions. Nothing renders differently; the app now has one source
   for colour.
2. **The vocabulary.** Import `kairos.css` and start deleting the app's local
   copies of classes it now provides. Rename per the decisions table as you go.
3. **Base.** Import `base.css` last, once the app no longer depends on its own
   element defaults.

## Upgrading to 0.19.0

The phone text and stamp release. At the Product Scale, body text is 16px on
phones and the hard ink stamp stays on rank-1 buttons only. See "Phone text and
the main action's stamp, 0.19.0" in [decisions.md](decisions.md). Minor: under
0.x, `^0.18.0` and earlier ranges stop below it, so an app or site gets it only
when its own plan bumps it.

**Phone sizes.** Below 900px (`@media screen and (max-width: 899px)`, the
boundary where the bottom bar replaces the sidebar) `--kairos-text-body` is
`1rem` (16px), `--kairos-text-button` is 14px and `--kairos-text-button-sm` is
13px. From 900px nothing moves: 14px, 12px and 11px. Paper keeps 14px, because
the query names `screen`. The Brand Scale is unchanged: it sets its own body
and button sizes, which outrank the phone rule at every width. Everything that
reads those tokens follows with no edit: page text, table cells, banners,
choice rows, page header descriptions and `kairos-type-body`. Field labels,
hints, chips, table headers and nav rows keep their sizes.

Check an app's own dense tables between 768px and 899px. They are still tables
there, now at 16px, and may scroll sideways sooner.

**The stamp.** Only rank-1 buttons wear it: `kairos-button--primary`,
`kairos-button--danger-solid` and the page header's primary. It comes from
`--kairos-shadow-stamp` (4px, at rest), `--kairos-shadow-stamp-hover` (6px,
under the cursor) and `--kairos-shadow-pressed` (2px, held), read through the
`--kairos-button-shadow-rest`, `-hover` and `-active` knobs. An app's own button
that wants the stamp reads `--kairos-shadow-stamp`.

**Soft surfaces.** `--kairos-shadow`, `--kairos-shadow-card` and
`--kairos-shadow-lg` are now `--kairos-shadow-soft-card`, the brief's soft card
shadow, so panels, cards, disclosures, dialogs, popovers, menus, toasts and the
skip link go soft. An app's own card that reads one of the three goes soft too.
A panel or card nested in a panel stays flat.

**Delete local overrides.** An app that carried its own override for a 16px
phone body or for soft panels deletes it on this repin.

## Upgrading to 0.18.0

The brand type release. Kairos design brief v3 (lock revision 3) sets every
sans part in Epilogue at its normal width, so the Brand Scale names Epilogue
and carries no width at all. See "Brand type on Epilogue, 0.18.0" in
[decisions.md](decisions.md). Minor: under 0.x, `^0.17.0` stops below it, so
an app gets it only when its own plan bumps it.

**Load Epilogue and Courier Prime.** The package ships no font. A host that
sets the Brand Scale loads:

- Epilogue, variable, weight 100-900, normal width only (no width axis). With
  `next/font/local`, `weight: '100 900'`, the upright file preloaded and the
  italic not, and no `font-stretch` declaration.
- Courier Prime at 400 and 700.

```tsx
const epilogue = localFont({
  src: [
    { path: './fonts/epilogue.woff2', style: 'normal' },
    { path: './fonts/epilogue-italic.woff2', style: 'italic', preload: false },
  ],
  weight: '100 900',
  variable: '--font-epilogue',
  display: 'swap',
});
```

With a link:
`family=Epilogue:ital,wght@0,100..900;1,100..900&family=Courier+Prime:wght@400;700`.

**The font tokens.** `--kairos-display` and `--kairos-body` are
`'Epilogue', ui-sans-serif, system-ui, sans-serif` at both scales, and
`--kairos-mono` stays `'Courier Prime', 'Courier New', ui-monospace, monospace`.
`brand.css` sets no family, so a host re-points the tokens on `:root`, at
either scale, with the `next/font` variable first:

```css
:root {
  --kairos-display: var(--font-epilogue), 'Epilogue', ui-sans-serif, system-ui, sans-serif;
  --kairos-body: var(--font-epilogue), 'Epilogue', ui-sans-serif, system-ui, sans-serif;
  --kairos-mono: var(--font-courier-prime), 'Courier Prime', 'Courier New', ui-monospace, monospace;
}
```

**Apps move to Epilogue too.** An app that bumps to 0.18.0 loads Epilogue
(variable, weight 100-900, no width axis) and Courier Prime, drops Archivo from
its loader, keeps re-pointing the font tokens on `:root`, and expects
normal-width headings: the three `font-stretch` declarations of 0.17.0's apps
type block are gone, and every other declaration there stays (sentence case,
weights, tracking, Courier Prime labels, the product name's capitals).
Epilogue runs about 12% wider than Archivo at body sizes, so check long lines.

**Removed: every width token.** Lock revision 3 says never to set
`font-stretch`, so the 16 `-stretch` tokens are gone from `tokens.css` and
`brand.css`: `--kairos-button-stretch`, `--kairos-input-label-stretch` and
`--kairos-type-<rank>-stretch` for the 14 ranks (display, title, h2, h3,
quote, lead, statement, body, small, legal, label, price, button, nav). No rule
in the brand layer reads one. An app that read one stops getting a value.

**New classes and tokens.**

- `kairos-type-title--compact`: the form page title (Contact, Reschedule,
  Cancel), `--kairos-type-title-compact-size`.
- `kairos-type-card` and `kairos-type-card--sm`: card headings, 20px and 19px
  at the Brand Scale.
- `kairos-type-time`: a typed time line, Courier Prime 16px at 400.
- `kairos-text-link-text`: the text link now wraps its label and arrow in one
  span, so the underline runs under the words only:
  `<a class="kairos-text-link"><span class="kairos-text-link-text">Words <span class="kairos-text-link-arrow">→</span></span></a>`.
- `--kairos-tick-list-value-size`, `--kairos-tick-list-value-phone-size` and
  `--kairos-tick-list-value-leading`: tick-list values sit a step under the
  statement rank.

**Changed at the Brand Scale:** the display, title, h2, h3 and quote ranks
take lock revision 3's sizes; phone menu rows are 23px and the current row is
underlined; label, price and footer headings keep their case on a heading;
the title bar and the marker tilt through `rotate`; an idle button's spinner
stands still.

## Upgrading to 0.17.0

The apps take the brief's type. See "Product type on the brief, 0.17.0" in
[decisions.md](decisions.md).

**What changes on a bump, at Product Scale only:** headings are Archivo 800,
wide and in sentence case; small labels, table headers, state chips and
figures are Courier Prime 700 (labels in capitals); buttons, tabs and switch
options are sentence case. Geometry and density do not change.

**Load both families.** An app still loading Bebas Neue and Epilogue (Paykit,
Mailkit and the account app did) changes its loader and its `:root` override
in the same change, as the 0.16.0 section below shows. Point
`--kairos-mono` at Courier Prime too: the typed labels read it.

**Check:** a heading written as a label (`h3.kairos-label-caps`) stays in
capitals; a long page title wraps sooner, because Archivo is wider than Bebas;
`Panel` now spaces its children, so a screen that wrapped a panel's children
in its own stack is unchanged and one that did not gains the spacing.

## Upgrading to 0.16.0

The brand release: Kairos design brief v1 in the token layer, an opt-in Brand
Scale for brand surfaces, and the brief's shared parts as classes. An app's
shape does not change. See the "Brand, 0.16.0" section of
[decisions.md](decisions.md).

**What an app sees on a bump.** Two things and nothing else:

- The font tokens name new families. `--kairos-display` and `--kairos-body`
  are `'Archivo', ui-sans-serif, system-ui, sans-serif`, and `--kairos-mono` is
  `'Courier Prime', 'Courier New', ui-monospace, monospace`.
- The primary button's hover fill is `#ffb627` (was `#e6a92d`).

**When the font actually changes.** The package ships no font; the app loads
the families, so the bump alone puts Archivo on no screen:

- An app that re-points `--kairos-display`, `--kairos-body` and
  `--kairos-mono` on `:root` in its own stylesheet keeps its families until it
  changes both its font loader and that override.
- An app that loads the 0.14 families by a link and overrides no font token
  falls back to the system sans (and its mono to Courier New where that is
  installed) until it loads Archivo and Courier Prime.

So change the font loading in the same change as the bump. Archivo is wider
than the old display face: check long page titles.

With `next/font/local` (the font files live in the app; the package has none),
point the tokens at the variables it creates:

```tsx
import localFont from 'next/font/local';

const archivo = localFont({
  src: './fonts/archivo.woff2',
  weight: '400 900',
  declarations: [{ prop: 'font-stretch', value: '62% 125%' }],
  variable: '--font-archivo',
  display: 'swap',
});
const courierPrime = localFont({
  src: [
    { path: './fonts/courier-prime-400.woff2', weight: '400' },
    { path: './fonts/courier-prime-700.woff2', weight: '700' },
  ],
  variable: '--font-courier-prime',
  display: 'swap',
});

// <html className={`${archivo.variable} ${courierPrime.variable}`}>
```

```css
:root {
  --kairos-display: var(--font-archivo), 'Archivo', ui-sans-serif, system-ui, sans-serif;
  --kairos-body: var(--font-archivo), 'Archivo', ui-sans-serif, system-ui, sans-serif;
  --kairos-mono: var(--font-courier-prime), 'Courier Prime', 'Courier New', ui-monospace, monospace;
}
```

With a link, the family names match the tokens and nothing else is needed:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet">
```

**Opting into the Brand Scale.** A brand surface (the website) imports
`brand.css` between base and the vocabulary and sets the switch on `<html>`:

```css
@import "kairos-design/tokens.css";
@import "kairos-design/base.css";
@import "kairos-design/brand.css";
@import "kairos-design/kairos.css";
```

```html
<html data-scale="brand">
```

The attribute goes on the root element, not lower down: tokens built from other
tokens resolve where they are declared, so a switch on a descendant leaves them
at the root's scale ([adr/0012](adr/0012-switch-the-brand-scale-on-at-the-root.md)).
Without the attribute, importing `brand.css` changes nothing.

**Renamed tokens.** Nine roles take the brief's names; the old names are
aliases and keep working, in both themes and under any `data-theme`
([adr/0014](adr/0014-rename-a-role-and-keep-its-old-name.md)):

| 0.16 name | 0.14 name, still valid |
| --- | --- |
| `--kairos-page` | `--kairos-bg` |
| `--kairos-card` | `--kairos-surface` |
| `--kairos-ink` | `--kairos-text` |
| `--kairos-ink-2` | `--kairos-text-2` |
| `--kairos-ink-3` | `--kairos-text-muted` |
| `--kairos-highlight` | `--kairos-accent` |
| `--kairos-highlight-strong` | `--kairos-accent-hover` |
| `--kairos-on-highlight` | `--kairos-accent-text` |
| `--kairos-focus-ring` | `--kairos-focus` |

An app overriding an old name on `:root` still wins for every rule that reads
that name; new parts read the new names.

**New:** the brand roles (`band`, `tint`, `picked`, `tick`, `placeholder`,
`error`, `on-error`, `rule`, `rule-frame`), the brief's shared parts as
`kairos-*` classes (see the manifest), and `required` on `Field`,
`InputField`, `Textarea` and `SelectField`, which draws an `aria-hidden`
asterisk in the label at the Brand Scale and passes `required` to the control.

## Upgrading to 0.14.0

The density release. Nothing is removed and no prop changes meaning; what
changes is what some rows look like on a phone. See
[adr/0011](adr/0011-let-the-slot-decide-a-rows-shape.md).

**Action rows and page header actions are grids at narrow widths.** Below
`640px` a `kairos-action-row` (not `--equal`), and below `768px` a page
header's actions, put the primary first at full width, every other action full
width under it, and a menu trigger in a narrow column at the end beside the
first of them. Check any screen that relied on a narrow action row staying
inline; if it should, it is `kairos-inline-actions`.

**A page header's secondary folds into its menu below 900px** when it comes
from `ActionSet`. Nothing to change. A header assembled by hand gets the same by
putting `kairos-page-header-secondary` on the secondary button and passing a
copy of it to the header's `OverflowMenu` with `folded: true`.

**`Dialog` renders `kairos-dialog-head`** instead of `kairos-split`. An app rule
reaching into the dialog's first row through `kairos-split` stops matching.

**New:** `DisclosureSection` and `DisclosureGroup` (a section closed until
wanted, remembered per device), `SubNav` (an area's pages as one row of
links), `Steps` (a sequence on one row that folds to numbers), `Field`'s
`suffix` (an amount and its unit in one box), `Panel`'s and `PageHeader`'s
`help` (the one place a section's or a screen's help goes), and `linkAs` on
`OverflowMenu` and `ActionSet` for the router's link. Call
`setDisclosureStoragePrefix()` once if the app keeps its device preferences
under its own prefix.

## Upgrading to 0.11.0

A tool names itself with one object from 0.11.0: `ProductLockup`, the icon mark
plus a rule plus the product name in Bebas. `AuthScreen`, `Sidebar` and `TopBar`
render it already, so an app using all three upgrades by bumping the version.
See [adr/0009](adr/0009-name-a-product-with-one-lockup.md) for why.

What an app has to change is anything that named itself by hand.

**A sidebar plaque built from the artwork plus a name:**

```diff
  <div className="kairos-sidebar-brand">
-   <img src="https://cdn.kairossolutionstt.com/ICON%20%2B%20WORDMARK%20-%20DARK.svg" alt="Kairos Software Solutions" />
-   <span className="kairos-sidebar-product">Paykit control</span>
+   <ProductLockup product="Paykit" />
  </div>
```

`kairos-sidebar-product` is **removed**, not deprecated. It styled a product
name that is no longer a separate element, and leaving it in would leave the
old composition buildable. Grep for it before upgrading.

**A top bar built the same way:** replace the `BrandLockup` and the bare name
with one `ProductLockup`. `kairos-topbar-brand` no longer sets type, because the
`11px` tracked caps that lived there were the top bar's own reading of the
product name.

**A screen putting the full lockup over a Bebas title:** that composition is two
wordmarks on one screen and is what this release removes. Use `ProductLockup`
and let the `h1` name the state the reader is in, which is what Mailkit's
not-found does.

**Product names are one word, ten characters or fewer.** The plaque has `196px`
of usable width. `product="Paykit control plane"` fitted nothing and is now
`product="Paykit"`, with `Control plane` in the tagline on the sign-in and as
the nav group label in the shell.

An app that only consumes the stylesheets re-emits them and gets the new rules
with nothing else to do.

## Upgrading to 0.4.0

`DataTable` runs on TanStack Table from 0.4.0. Install it beside the package:

```sh
npm install @tanstack/react-table
```

It is an optional peer dependency, so an app that imports `Button` and nothing
else installs nothing. An app that imports `DataTable` needs it.

**A table that only wants what it had:**

```diff
- <DataTable label="Invoices" rows={rows} columns={columns} getKey={...} empty={...} />
+ <DataTable label="Invoices" rows={rows} columns={columns} getKey={...} empty={...} pageSize={rows.length} />
```

That is the whole migration. `columns` arrays do not change: `key`, `label`,
`role`, `cell`, `sortValue` and `hideOnCard` are all still what they were, and
the array's order is still the column order and still what the card is built
from. The type behind them is now `ColumnDef`, so a column can also carry
`size`, `filterFn` or `enableHiding` — nothing has to.

`pageSize={rows.length}` is there because paging is on by default at 25 rows.
A screen that had its own pager, or one that renders a short list inside
something else, wants that line. A screen that was rendering three hundred
rows wants to delete its own pager instead and take the default.

Everything else arrives off by default and needs one prop each:

| Want | Prop |
| --- | --- |
| Paging at another size | `pageSize={50}` |
| Row selection | `selectable`, plus `selectionActions` for what to do with them |
| Search | `globalFilter` and `onGlobalFilterChange`, usually from `FilterBar` |
| A filter outside the table | `filterActive` and `onClearFilters`, so a narrowed-empty list does not offer to create a record |
| Hideable columns | `hideableColumns` |

Two behaviours changed without a prop. A third press on a sorted column header
now returns to the screen's default sort rather than to no sort, and a first
press on the column the screen already sorts descending now reverses instead of
appearing to do nothing. Both are fixes; a screen relying on the old cycle was
relying on a defect.

`compare`, `sortRows` and `nextSort` are unchanged and still exported. `compare`
is what the table sorts with, so blanks still sort last in both directions.

## Paykit

Next 16, Tailwind v4, imports through `globals.css`. Above the `@theme inline`
block:

```css
@import "kairos-design/tokens.css";
@import "kairos-design/kairos.css";
```

Keep the `@theme inline` block: it is what maps Tailwind's utilities onto the
tokens, and it should point at `--kairos-*` instead of `--k-*`. Paykit's 420
inline `style={{}}` blocks are a separate cleanup and are not blocked by this.

For the React layer and the formatters, add the package to `transpilePackages`
in `next.config.js` — they ship as TypeScript source.

## Mailkit

Next 15, same shape as Paykit.

Mailkit's `globals.css` is two design systems stacked — a pre-Kairos `@theme`
layer for roughly 470 lines, then a Kairos block that overrides it with
`!important`. Adopting tokens is the moment to delete the first layer rather
than add a third. The `!important` is the thing to watch: once the lower layer
is gone, every one of them should come out too, and any rule that still needs
one is a specificity bug worth finding.

## Uptime

Cloudflare Workers, static `public/`, no bundler. It cannot import, so it
emits.

```json
{
  "targets": [
    { "artifact": "tokens.css", "path": "public/kairos-tokens.css" },
    { "artifact": "kairos.css", "path": "public/kairos.css" }
  ]
}
```

```jsonc
// package.json
"scripts": { "prebuild": "kairos-design emit" }
```

```gitignore
public/kairos-tokens.css
public/kairos.css
```

```html
<link rel="stylesheet" href="/kairos-tokens.css">
<link rel="stylesheet" href="/kairos.css">
<link rel="stylesheet" href="/styles.css">
```

Gitignoring the output is the point, not a tidiness preference. A committed
copy can be edited in place and can fall behind the version in `package.json`;
one that only exists after a build cannot do either.

Uptime already uses `--kairos-*`, so it needs no alias block — it is the
cheapest of the four to move. Its remaining `styles.css` should shrink to the
handful of rules that are genuinely Uptime's: the sparkline and the response
body.

## Card

A single static file that inlines its CSS so the theme applies before first
paint. Use an inline target rather than a copy.

```json
{
  "targets": [
    { "artifact": "tokens.css", "path": "site/index.html", "inline": "tokens" }
  ]
}
```

Add both markers inside the existing `<style>` block, in order:

```html
<style>
/* kairos-design:tokens begin */
/* kairos-design:tokens end */
</style>
```

`emit` replaces only what sits between them and leaves the rest of the file
alone. Card is Brand Scale, so it takes the tokens and not `kairos.css`, which
is Product Scale geometry.

Card is the one surface where the emitted region lands in a committed file,
because the file *is* the deployable. Re-run `emit` as a predeploy step so the
markers are refilled from the installed version rather than edited by hand.

## Mailclient

The Roundcube skin. Same shape as Uptime, into the skin's styles directory —
the skin rebuild is the emit step. Remember that an upgrade there is a version
bump **and** a skin rebuild.

## Docker

Paykit and Mailkit build with `build: .` and `COPY . .`, so `npm ci` runs
inside the image with no GitHub credentials. A public package on npm resolves
there with nothing added to the Dockerfile.

Until the package is published, install it from the release tarball rather than
a `github:` specifier:

```json
"kairos-design": "https://github.com/Kairos-Software-Solutions/kairos-design/archive/refs/tags/v0.2.0.tar.gz"
```

A `github:` specifier needs `git` in the image, and `node:22-alpine` does not
ship it. The tarball URL needs only what npm already has, and pins a tag.

## CI

There is nothing to check. The version is in `package.json`, the lockfile npm
already writes pins the bytes, and anything emitted is rebuilt from that
version rather than tracked. Upgrades arrive the way every other dependency's
do — as a version bump in a pull request.
