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
