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
| `dist/kairos.css` | every surface | The `kairos-*` class vocabulary, 220 classes. Consumes tokens only, no framework. |
| `dist/base.css` | opt-in | Element-level defaults. Separate because a library that restyles a host app's bare `table` and `input` is invasive. |
| `bin/kairos-design.mjs` | every surface | The CLI that vendors the above into an app and checks it has not drifted. |
| `docs/kairos-ui.md` | agents and people | The canonical component manifest. Read it before building UI. |
| `docs/preview.html` | review | Every component, both themes, verified at 320px. |

CSS first, React second, on purpose. Of the five Kairos surfaces, two run React
(Paykit, Mailkit) and three do not: Uptime ships hand-written CSS with no
bundler, Card is a single static HTML file, Mailclient is a Roundcube skin. A
React package would reach two of five. The CSS reaches all five.

## Consuming it

Everything is vendored by copying. Nothing is resolved at build time.

```sh
git clone git@github.com:Kairos-Software-Solutions/kairos-design.git   # once, beside your apps
cd ../paykit && kairos-design sync
```

`sync` copies each artifact to the path the app's `kairos-design.json` names
and records a hash in `kairos-design.lock.json`. `check` fails if a copy was
edited in place or has fallen behind, and belongs in CI. See
[docs/adoption.md](docs/adoption.md) for the config each surface needs.

### Why copies rather than a package

Two reasons, and both are load-bearing.

**Tokens have to apply before first paint.** A stylesheet fetched from a CDN in
the critical path buys a flash of the wrong theme in exchange for saving a file
copy.

**Paykit and Mailkit build with `build: .` and `COPY . .`**, so the Docker
build context is the app directory and `npm ci` runs with no GitHub
credentials. Anything resolved at build time would need BuildKit SSH forwarding
or a build secret in every Dockerfile. Copies need nothing, which is also what
lets this repo stay private: a developer clones it once over SSH, and no build
anywhere has to authenticate.

The cost of copying is that a copy goes stale silently. That is what `check`
is for, and why it should run in CI rather than on someone's laptop.

## Why this is a separate repo

`internal-tools` is private and holds deploy config, and npm cannot install a
subdirectory of a git repo, so a `packages/kairos-design` folder inside it
could not be consumed by an app in another repo even within the organisation.

## Contributing a component

1. Read `docs/kairos-ui.md`. If the role is already there, extend it with a
   variant rather than adding a second component.
2. Values come from tokens. A hex, a shadow offset, or a row height written
   into a component is a token in the wrong place.
3. Add the manifest row in the same change. A component that is not in the
   manifest does not exist for the next agent.
4. If the change renames or retires a class, record it in
   `docs/decisions.md` with the reasoning.
