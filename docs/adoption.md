# Adopting the registry

One `kairos-design.json` per app, then `kairos-design sync`. The config names
where each artifact lands; nothing else in the app changes until you start
replacing hand-rolled classes with the vocabulary.

Adopt in this order. Each step is independently shippable.

1. **Tokens only.** Sync `tokens.css`, add the `--k-*` or `--color-*` alias
   block described in [decisions.md](decisions.md), and delete the app's own
   token definitions. Nothing renders differently; the app now has one source
   for colour.
2. **The vocabulary.** Sync `kairos.css` and start deleting the app's local
   copies of classes it now provides. Rename per the decisions table as you go.
3. **Base.** Sync `base.css` last, once the app no longer depends on its own
   element defaults.

Run `kairos-design check` in CI from step 1.

## Paykit

Next 16, Tailwind v4, imports through `globals.css`.

```json
{
  "targets": [
    { "artifact": "tokens.css", "path": "src/app/kairos-tokens.css" },
    { "artifact": "kairos.css", "path": "src/app/kairos.css" }
  ]
}
```

Then in `globals.css`, above the `@theme inline` block:

```css
@import "./kairos-tokens.css";
@import "./kairos.css";
```

Keep the `@theme inline` block: it is what maps Tailwind's utilities onto the
tokens, and it should point at `--kairos-*` instead of `--k-*`. Paykit's 420
inline `style={{}}` blocks are a separate cleanup and are not blocked by this.

## Mailkit

Next 15, same shape as Paykit.

```json
{
  "targets": [
    { "artifact": "tokens.css", "path": "src/app/kairos-tokens.css" },
    { "artifact": "kairos.css", "path": "src/app/kairos.css" }
  ]
}
```

Mailkit's `globals.css` is two design systems stacked — a pre-Kairos `@theme`
layer for roughly 470 lines, then a Kairos block that overrides it with
`!important`. Adopting tokens is the moment to delete the first layer rather
than add a third. The `!important` is the thing to watch: once the lower layer
is gone, every one of them should come out too, and any rule that still needs
one is a specificity bug worth finding.

## Uptime

Cloudflare Workers, static `public/`, no bundler.

```json
{
  "targets": [
    { "artifact": "tokens.css", "path": "public/kairos-tokens.css" },
    { "artifact": "kairos.css", "path": "public/kairos.css" }
  ]
}
```

```html
<link rel="stylesheet" href="/kairos-tokens.css">
<link rel="stylesheet" href="/kairos.css">
<link rel="stylesheet" href="/styles.css">
```

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

`sync` replaces only what sits between them and leaves the rest of the file
alone. Card is Brand Scale, so it takes the tokens and not `kairos.css`, which
is Product Scale geometry.

## Mailclient

The Roundcube skin. Same shape as Uptime, into the skin's styles directory.
Remember that an upgrade there is a tag bump **and** a skin rebuild.

## CI

```yaml
- name: Check the design system has not drifted
  run: |
    git clone --depth 1 git@github.com:Kairos-Software-Solutions/kairos-design.git /tmp/kairos-design
    node /tmp/kairos-design/bin/kairos-design.mjs check --registry /tmp/kairos-design
```

A private registry needs a deploy key or a PAT here, because `GITHUB_TOKEN` is
scoped to the repository running the job. This is the one place the private
choice costs something — and it costs it in CI, not in the Docker build, which
is the trade worth making.

`check` reports two failures differently on purpose. A vendored file edited in
place is lost work waiting to happen: the next sync overwrites it and the
change never reaches the other apps. A copy that has merely fallen behind is
just a re-sync.
