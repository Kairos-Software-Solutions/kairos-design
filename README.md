# Kairos Design

The shared implementation of the Kairos design system: one set of tokens, one
component vocabulary, one money and date formatter, consumed by every Kairos
surface instead of hand-rolled per app.

The `kairos-branding` skill describes intent. This repo is what is callable
today, and where the two disagree, this repo wins.

## What is here

| Artifact | Reaches | Contents |
| --- | --- | --- |
| `dist/tokens.css` | every surface | The `--kairos-*` custom properties, light and dark. The only file with raw hex in it. |
| `dist/kairos.css` | every surface | The `kairos-*` class vocabulary. Consumes tokens only, no framework. |
| `packages/ui` | React apps | Thin React components emitting the classes above. |
| `packages/format` | any JS runtime | `TTD 8,500.00` and `24 Aug 2026`. One formatter, not five. |
| `registry/` | external apps | shadcn-compatible JSON for `npx shadcn add`. |
| `docs/kairos-ui.md` | agents and people | The canonical component manifest. |

CSS first, React second, on purpose. Of the five Kairos surfaces, two run React
(Paykit, Mailkit) and three do not (Uptime ships hand-written CSS with no
bundler, Card is a single static HTML file, Mailclient is a Roundcube skin). A
React package would reach two of five. The CSS reaches all five.

## Consuming it

### Tokens are vendored, not linked

```sh
npx kairos-design sync --app ./deploy/apps/paykit
```

This writes `tokens.css` into the app and records the version in
`kairos.lock`. It is deliberately not a CDN `<link>`: tokens have to apply
before first paint, and a third-party request in that path buys a flash of the
wrong theme in exchange for saving a file copy. CI runs `kairos-design check`,
which fails if a vendored copy has drifted from its pinned tag.

### React components are a dependency

```json
{ "dependencies": { "@kairos/ui": "github:Kairos-Software-Solutions/kairos-design#v0.1.0" } }
```

A git URL rather than GitHub Packages: the GitHub npm registry requires a token
even to install a public package, which defeats the point of publishing one.

### Apps outside this org

```sh
npx shadcn@latest add https://kairos-software-solutions.github.io/kairos-design/r/button.json
```

Components are copied into the consuming repo rather than linked, which is also
the right shape for an agent building a new Kairos app: it can read the source
it just installed.

## Why the Docker note matters

Paykit and Mailkit both build with `build: .` and `COPY . .`, so the Docker
build context is the app directory. A workspace package elsewhere in the
monorepo is not reachable from inside those builds without rewriting the
compose contexts and Dockerfiles. That constraint is the reason tokens are
vendored by a sync script rather than resolved through a package manager, and
the reason this repo is separate rather than a `packages/` folder inside
`internal-tools`.

## Contributing a component

1. Read `docs/kairos-ui.md`. If the role is already there, extend it with a
   variant rather than adding a second component.
2. Values come from tokens. A hex, a shadow offset, or a row height written
   into a component is a token in the wrong place.
3. Add the manifest row in the same change. A component that is not in the
   manifest does not exist for the next agent.
4. If the change renames or retires a class, record it in
   `docs/decisions.md` with the reasoning.
