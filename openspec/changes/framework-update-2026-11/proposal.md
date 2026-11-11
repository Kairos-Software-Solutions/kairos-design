# Proposal: framework-update-2026-11

## Why

On 11 Nov 2026 stack-watch listed eight open advisories against `package-lock.json`: two critical (`storybook`, `@storybook/addon-vitest` 10.5.10: a malicious website can inject code into a running workshop), three high (`brace-expansion`, `source-map-js`, `vite`) and three moderate (`@vitest/mocker`, `glob`, `minimatch`). The reviewer asked: "Let's get all repos to the latest and squash every vulnerability that was posted to discord last night. Do everything as 1 single PR on the respective repos."

All eight are development-only: the package has no `dependencies`, so an app installing kairos-design 0.14.x gets none of them. They run on developer machines and in CI, including `publish.yml`, which holds the npm publishing identity.

## What Changes

- The development toolchain moves to the newest stable releases read from the npm registry on 11 Nov 2026 (`design.md` › Versions): Storybook and its five addons/framework 10.5.10 → 10.6.7, Playwright 1.62.1 → 1.65.0, React and its types to 19.3.x, Radix 1.8.1 and TanStack Table 9.3.1 for the workshop, `@types/node` 26.6.6.
- **BREAKING (dev-tool majors):** Vite 7 → 8 (Rolldown and Oxc replace esbuild and Rollup), Vitest 4 → 5 with `@vitest/browser-playwright` 5, `@vitejs/plugin-react` 5 → 6, TypeScript 5.9 → 6.0. Each is listed with the task that handles it in `design.md` › Breaking changes. TypeScript 7.0 is held back, with the evidence in `design.md` › Holds.
- One npm `overrides` entry moves `glob` under Storybook's docgen plugin from 13.0.6 to 14.0.4 (the plugin's declared range has no fixed release), which also brings `minimatch` 11 and `brace-expansion` 5.0.13.
- **Nothing that ships changes.** `dist/`, `bin/`, `docs/kairos-ui.md`, the exports map, the peer ranges, `engines` and the version (0.14.0) stay as they are, so a merge to `main` publishes nothing: `publish.yml` finds tag `v0.14.0` and skips the release.

## Capabilities

### New Capabilities
- `kairos-design-dev-toolchain`: the workshop, story runner and type checker install reproducibly from the lockfile at the planned versions, the workshop checks pass on them, no listed advisory remains, and held versions are recorded with their reason.
- `kairos-design-release-surface`: what consumers get from npm stays byte-identical to 0.14.0, and a merge that changes only the development toolchain publishes nothing.

### Modified Capabilities
None. The design-system specs in the `kairos-plans` store (`button`, `field`, `data-table`, `accessibility`, `record-card`) describe component behaviour, which this change does not touch, and none of them names a tool or version this change moves. The capability names carry the `kairos-design-` prefix because the store is shared by every Kairos repository and other repositories' batch changes add their own dependency capabilities.

## Impact

- Code: `package.json` (`devDependencies`, a new `overrides` field) and `package-lock.json`. Workshop configuration (`vitest.config.ts`, `.storybook/*`, `tsconfig.json`, `.gitignore`) only where an upgrade requires it, per `design.md` › Breaking changes. No file under `dist/`, `bin/` or `docs/` changes.
- Consumers: none. The Kairos website, the other sites and internal-tools keep `kairos-design` 0.14.x; nothing for them to update.
- Release: the merge to `main` runs `publish.yml`, which skips because `v0.14.0` already exists. No npm publish, no new tag (`design.md` › Release).
- Branches: the repository has only `main` (no `qa`), so there is no merge back to `qa`.
- Out of scope: GitHub Actions versions in the workflows, the Node version CI uses, and the component code. None has an advisory in the list.
