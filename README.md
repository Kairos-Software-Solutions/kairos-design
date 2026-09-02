# Kairos Design

The shared implementation of the Kairos design system: one set of tokens, one
component vocabulary, one money and date formatter, consumed by every Kairos
surface instead of hand-rolled per app.

The `kairos-branding` skill describes intent. This repo is what is callable
today, and where the two disagree, this repo wins.

## What is here

| Artifact | Specifier | Contents |
| --- | --- | --- |
| Tokens | `kairos-design/tokens.css` | The `--kairos-*` custom properties, light and dark. The only file with raw hex in it. |
| Vocabulary | `kairos-design/kairos.css` | The `kairos-*` class vocabulary, 220 classes. Consumes tokens only, no framework. |
| Base | `kairos-design/base.css` | Element-level defaults. Opt-in, because a library that restyles a host app's bare `table` and `input` is invasive. |
| Formatters | `kairos-design/format/money`, `/format/dates` | `TTD 8,500.00` and `24 Aug 2026`. One formatter, not five. |
| React | `kairos-design/react` | Components emitting the classes above. Peer dependency `@radix-ui/react-dialog`, for the dialogs only. |
| Manifest | `docs/kairos-ui.md` | The canonical component list. Read it before building UI. |
| Workshop | `npm run storybook` | Every component and every screen, both themes, four viewports. |

CSS first, React second, on purpose. Of the five Kairos surfaces, two run React
(Paykit, Mailkit) and three do not: Uptime ships hand-written CSS with no
bundler, Card is a single static HTML file, Mailclient is a Roundcube skin. A
React-only package would reach two of five. The CSS reaches all five.

## Seeing it

```sh
npm install
npm run storybook
```

Foundations first: colour, space, type, and the stamp, all read out of
`tokens.css` itself so a specimen page cannot drift from the file it documents.
Then every component. Then **Screens**, which is the part that matters — the
same record list rendered as Mailkit, as Uptime, and as Paykit, side by side.
Two apps can pass every component story and still look nothing alike, because
looking alike is a property of the composition.

Everything below was found by rendering this package for the first time, and
none of it was findable any other way:

- `kairos-table-panel` painted no border, no ground, no radius, and no shadow,
  so every table the registry rendered had no container.
- Five heading classes rendered in Bebas on any surface outside the app shell.
- A panel heading rendered at 13px inside the shell, because the default it was
  overriding outranked it.
- An app marking its current nav item with `aria-current="page"` got no active
  state.
- A disabled input looked exactly like one you can type in.

The workshop is why those are past tense. See `docs/decisions.md`.

## Consuming it

```sh
npm install kairos-design
```

Then import what you need. A bundler inlines the CSS into the app's own
stylesheet at build time, so the tokens are in the first paint with no network
request:

```css
@import "kairos-design/tokens.css";
@import "kairos-design/kairos.css";
```

```tsx
import { Button, DataTable } from 'kairos-design/react';
import { formatMoney } from 'kairos-design/format/money';
```

The React components and the formatters ship as TypeScript source, because the
package has no build step. Next apps need the package in `transpilePackages`:

```js
// next.config.js
export default { transpilePackages: ['kairos-design'] };
```

See [docs/adoption.md](docs/adoption.md) for what each surface needs.

### Surfaces with no bundler

Uptime, Card, and Mailclient cannot import anything, so they run `kairos-design
emit` from a build script and gitignore what it writes:

```sh
kairos-design emit
```

The output is a build artifact. It is not committed, which is why there is
nothing to check for drift.

## Why a package rather than copies

Until `0.2.0` the artifacts were vendored: an app copied them in, committed the
copies, and ran a `check` command in CI to catch a copy that had been edited or
had fallen behind. That existed because the repo was private, and a private
dependency cannot resolve in a Docker build that runs `npm ci` with no
credentials — Paykit and Mailkit both build with `build: .` and `COPY . .`.

Making the repo public removes the constraint that produced all of it. A public
package resolves in those builds with no secret, no BuildKit SSH forwarding,
and no deploy key in CI. Nothing about the design system was confidential: it is
a colour palette, 220 class names, and a Button.

What that bought, beyond deleting a CLI, a config file, a lockfile, and a
drift checker:

**An upgrade is a decision again.** A version in `package.json` moves when
someone bumps it. The old `check` compared each app against whatever commit the
registry checkout happened to be on, so merging anything to the registry's main
branch turned every app's CI red at once, and the prescribed fix — re-run
`sync` — pulled in whatever else had landed alongside it.

**Drift stops being possible rather than being detected.** A file produced by a
build, from a version fixed in `package.json`, cannot quietly disagree with its
source. `check` was solving a problem that only existed because the copies were
committed.

**Copying was the wrong half of the shadcn model.** Copying components into an
app works because you own and edit the copies. This repo copied them and then
failed the build if you edited one, which took on the duplication without the
ownership.

The one thing genuinely lost is that tokens no longer reach a surface with no
build step at all without running something. That is what `emit` is for, and it
is three surfaces rather than five.

## Working on this repo

Planned work is managed by [OpenSpec](https://github.com/Fission-AI/OpenSpec).
Four changes, 155 tasks:

```sh
openspec list                          # the changes and their task counts
openspec show <change>                 # proposal, specs and deltas
openspec validate --changes --strict   # before committing
```

Start at `openspec/changes/README.md` in the registered `kairos-plans` store.
It says what each change is and which order they go in. Run `openspec context`
from this repo to see the store's local path. The reasoning behind the changes
is eight ADRs in [`docs/adr/`](docs/adr/); each change names the ones it
implements.

Neither directory ships, nor does `.claude/`. `files` is an allowlist of `dist`,
`bin` and `docs/kairos-ui.md`, and a test fails if that stops being true.

## Contributing a component

1. Read `docs/kairos-ui.md`. If the role is already there, extend it with a
   variant rather than adding a second component.
2. Values come from tokens. A hex, a shadow offset, or a row height written
   into a component is a token in the wrong place.
3. Add the manifest row in the same change. A component that is not in the
   manifest does not exist for the next agent.
4. Export it from `dist/react/index.ts`. A component that is not reachable
   through the package entry point does not exist for a consuming app, and a
   test says so.
5. If the change renames or retires a class, record it in
   `docs/decisions.md` with the reasoning.

`npm test` before every commit.
