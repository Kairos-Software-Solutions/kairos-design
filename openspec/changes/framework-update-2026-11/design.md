# Design: framework-update-2026-11

## Context

`kairos-design` is the shared Kairos design system, published to public npm as an unscoped package. It has no build step: `dist/` holds hand-edited CSS and TypeScript source that consumers compile themselves, `bin/kairos-design.mjs` is a Node script (`kairos-design emit`), and `docs/kairos-ui.md` is the component manifest. `package.json` › `files` ships exactly those three plus `package.json` and `README.md`. The package has **no `dependencies`**; `react`, `radix-ui` and `@tanstack/react-table` are optional peers.

Everything else in the repository is the workshop and its checks, all development-only:

| Command | What it runs | Where |
| --- | --- | --- |
| `npm test` | `node --test tests/*.test.mjs` (CSS and source read as text, no browser) | CI, `publish.yml` |
| `npm run typecheck` | `tsc --noEmit` over `dist/`, `stories/`, `.storybook/`, `tests/types/` | CI, `publish.yml` |
| `npm run build-storybook` | Storybook 10 static build on Vite | CI, `publish.yml` |
| `npm run test-stories` | Vitest browser mode (Playwright Chromium) rendering every story with axe | CI only |

The change is planned from `origin/main` at `f565e34` (the commit npm's `kairos-design@0.14.0` was published from: its `gitHead` is `f565e3485a94…`), on the branch `update/2026-11-security`. The repository has only a `main` branch.

## Research

Sources read on 11 Nov 2026 (registry with `npm view`; packages unpacked with `npm pack` into the planner's scratch folder where the code mattered; `npm audit --package-lock-only` on a copy of the lockfile for the advisory ranges):

- **Advisory ranges (GitHub advisory database via `npm audit`):** `storybook` / `@storybook/addon-vitest` GHSA-f2ph-cmg5-wxc8 (critical) and GHSA-px85-f4q5-jh77 (high), `>=10.0.0 <10.6.2`. `vite` GHSA-587h-7wmj-h5pm (high), GHSA-698v-4r3x-3vcv, GHSA-r825-w8mm-5pxw, GHSA-rq7h-c2jc-7f22 (moderate), GHSA-9jrq-w75r-8gcw (low), all `>=7.0.0 <=7.3.6`. `brace-expansion` GHSA-6j4f-fj2g-mc7p and GHSA-qhr7-859c-m2p7 (high), GHSA-q2hr-2g5m-vwhr (moderate), fixed in 5.0.12. `source-map-js` GHSA-68fv-2mgg-jv7q (high), `<1.2.2`. `@vitest/mocker` GHSA-qxg6-89mg-rqv8 and GHSA-xp26-3454-mjgp (moderate), `<4.1.12`. `glob` GHSA-3g3m-2fjr-6pw4 (moderate), `>=9.0.0 <=14.0.1`: the 13.x backport 13.0.7 (6 Nov) is still inside the range, so only glob 14.0.2+ is fixed. `minimatch` GHSA-g3hv-75wg-m249 (moderate), `>=7.0.0 <11.0.1`. `npm audit` also lists `@vitest/browser`, `@vitest/browser-playwright`, `vitest`, `@storybook/react-vite` and `@joshwooding/vite-plugin-react-docgen-typescript` as affected only *via* those packages; they clear when the root packages do.
- **Who pulls the transitive ones in** (`package-lock.json` at `f565e34`): `@storybook/react-vite` 10.x depends on `@joshwooding/vite-plugin-react-docgen-typescript ^0.7.0` → `glob ^13.0.1` → `minimatch ^10.2.2` → `brace-expansion ^5.0.8`. `postcss` 8.5.26 (under Vite) → `source-map-js ^1.2.1`. `vitest`, `@vitest/browser` and `@vitest/browser-playwright` pin `@vitest/mocker` exactly.
- **Storybook 10.6.7** (latest; 11.0 is beta only): every Storybook package peers on `storybook ^10.6.7`; `@storybook/react-vite` and `@storybook/builder-vite` accept `vite ^5 || ^6 || ^7 || ^8`; `@storybook/addon-vitest` accepts `vitest`, `@vitest/browser` and `@vitest/browser-playwright` `^4.0.0 || ^5.0.0`. `@storybook/react-vite` still depends on the docgen plugin `^0.7.0`. Its `dist/preset.js` loads that plugin only when `typescript.reactDocgen === 'react-docgen-typescript'`, and Storybook's default (`core-server/presets/common-preset.js`) is `'react-docgen'`; this repository's `.storybook/main.ts` sets no `reactDocgen`, so the plugin and its `glob` never run here. They are still installed, so they are still fixed.
- **Docgen plugin:** 0.9.1 (latest) replaced `glob` with `tinyglobby`, but `@storybook/react-vite` 10.6.7's `^0.7.0` does not reach it. 0.7.0's only `glob` use (`dist/index.mjs`) is `globSync(pattern, { absolute, cwd, ignore, nodir })`; glob 14.0.4's `dist/esm/glob.d.ts` keeps `globSync` and all four options, and exports both ESM and CommonJS. So an override of `glob` to 14 under that plugin is API-compatible.
- **Vite 8.3.8** (latest; 7.3.8 is the newest 7.x): Migration from v7 guide (vite.dev/guide/migration): Rolldown replaces esbuild for dependency optimisation (`optimizeDeps.include` still supported; `esbuildOptions` deprecated), Oxc replaces esbuild for transforms and minification, Lightning CSS minifies CSS, CommonJS `default` interop made consistent, default browser targets raised, `build.rollupOptions` renamed `rolldownOptions`. Vite 8 depends on `postcss ^8.5.32`, whose own dependency is `source-map-js ^1.2.2`, so the Vite upgrade itself carries the `source-map-js` fix.
- **Vitest 5.1.0** (latest; 4.1.12 is the newest 4.x): Migration guide (vitest.dev/guide/migration): Node ≥ 22.12 and Vite ≥ 6.4; `vite` becomes a required peer (already a direct devDependency here); `clearMocks` on by default; inline projects inherit the root config and share its Vite server unless they change the Vite config; `vi.mock` must be top level; browser locators strict by default; reports and artifacts written under `.vitest/`. `@vitest/browser-playwright` 5.1.0 peers on `vitest` 5.1.0 exactly.
- **`@vitejs/plugin-react` 6.3.0** peers on `vite ^8.0.0` (Babel and React Compiler peers optional). Nothing in this repository imports it (`grep -rn plugin-react` finds only `package.json`), and `@storybook/react-vite` 10.6.7 does not load it either.
- **TypeScript:** 7.0.2 is `latest`, 6.0.3 the newest 6.x. TypeScript 7.0.2's `package.json` exports `"."` as `./lib/version.cjs` only (the compiler API moved under `./unstable/*`), and the docgen plugin's newest release (0.9.1) declares `typescript ">=4.3.0 <7 || >=7.1.0-0 <8"`, excluding 7.0 by name. In the lockfile, `typescript` is a peer of `@storybook/react`, `@storybook/react-vite`, the docgen plugin and `react-docgen-typescript`; Storybook core imports no TypeScript API (`grep` over `storybook@10.6.7/dist`), and `@storybook/react-vite` only resolves it to decide whether the opt-in TypeScript docgen can load. TypeScript 6.0's release notes: `types` defaults to `[]` (this repository already lists `"types": ["node", "vite/client"]`), old options such as `baseUrl` deprecated (not used here), API compatible with 5.9.
- **React 19.3.1, `@types/react`/`@types/react-dom` 19.3.0, `radix-ui` 1.8.1, `@tanstack/react-table` 9.3.1, Playwright 1.65.0, `@types/node` 26.6.6:** latest on the day. Storybook 10.6.7 accepts React 16.8–19. The package's own peer ranges (`react >=18`, `radix-ui >=1`, `@tanstack/react-table >=9`) already admit them.
- **Release workflow** (`.github/workflows/publish.yml`, read in full): on a push to `main` its "Prepare the release" step reads `package.json` › `version`, and if `refs/tags/v<version>` exists it writes `publish=false` and `create_tag=false` and the summary line "`v<version>` already exists. Nothing to release."; every later step (install, test, typecheck, workshop build, tag, `npm publish`) is guarded by those outputs. `actions/checkout` runs with `fetch-depth: 0`, so tags are present. `git ls-remote --tags origin` shows `v0.14.0` → `f565e34`, and the registry lists 0.14.0 as `latest`. A merge that keeps 0.14.0 therefore skips cleanly rather than failing on an existing npm version.
- **Repository:** no patches are carried (no `patches/`, `patch-package` or `overrides` today). `docs/decisions.md` mentions "Storybook 10.3" and "Storybook 10's own documentation", both still true on 10.6.

Picked: the documented upgrade path of each tool, to the newest stable line both Storybook 10.6.7 and the rest of the toolchain accept, and one scoped npm `overrides` entry (npm's documented mechanism) for the one transitive package whose parent's declared range has no fixed release. Rejected: overriding the docgen plugin itself to 0.9.1 (a version `@storybook/react-vite` does not declare, and a larger swap than one leaf package); a global `glob` override (it would also apply to any future package that needs an older `glob`); Storybook 11 (beta only).

## Versions

Current = the version in `package-lock.json` at `f565e34`. Target = latest stable on 11 Nov 2026 unless the row says held. Every devDependency stays a `^` range, moved to `^<target>`.

### Direct development dependencies

| Package | Current | Target | Why |
| --- | --- | --- | --- |
| storybook | 10.5.10 | 10.6.7 | critical + high advisories (fixed 10.6.2); latest 10.x, 11 is beta |
| @storybook/addon-vitest | 10.5.10 | 10.6.7 | critical + high advisories (fixed 10.6.2) |
| @storybook/addon-a11y, @storybook/addon-docs, @storybook/addon-themes, @storybook/react-vite | 10.5.10 | 10.6.7 | peer `storybook ^10.6.7` |
| vite | 7.3.6 | 8.3.8 | high advisories (fixed 7.3.7); latest major, accepted by Storybook 10.6.7 and Vitest 5.1.0. Fallback 7.3.8 (Holds) |
| vitest | 4.1.11 | 5.1.0 | moderate `@vitest/mocker` advisories (fixed 4.1.12); latest major, accepted by addon-vitest. Fallback 4.1.12 |
| @vitest/browser-playwright | 4.1.11 | 5.1.0 | exact peer of vitest 5.1.0 |
| @vitejs/plugin-react | 5.2.0 | 6.3.0 | latest; 6.x peers on Vite 8. Unused here (Decision 4). Stays 5.2.0 if Vite is held on 7 |
| playwright | 1.62.1 | 1.65.0 | latest; Chromium for `test-stories` |
| typescript | 5.9.3 | 6.0.3 | newest 6.x; held below 7.0.2 (Holds) |
| @types/node | 26.4.0 | 26.6.6 | latest |
| @types/react | 19.2.18 | 19.3.0 | latest |
| @types/react-dom | 19.2.5 | 19.3.0 | latest |
| react, react-dom | 19.2.8 | 19.3.1 | latest; the workshop renders the components against it |
| radix-ui | 1.6.7 | 1.8.1 | latest; the workshop's copy of the optional peer |
| @tanstack/react-table | 9.2.4 | 9.3.1 | latest; the workshop's copy of the optional peer |

### Transitive packages on the advisory list

| Package | Current | Target | How |
| --- | --- | --- | --- |
| @vitest/mocker | 4.1.11 | 5.1.0 | with vitest 5.1.0 (4.1.12 on the fallback) |
| source-map-js | 1.2.1 | 1.2.2 | Vite 8.3.8 → `postcss ^8.5.32` → `source-map-js ^1.2.2`; `npm update source-map-js` if anything still holds 1.2.1 |
| glob | 13.0.6 | 14.0.4 | `overrides` under the docgen plugin (Overrides) |
| minimatch | 10.2.6 | 11.0.8 | glob 14.0.4 → `minimatch ^11.0.5` |
| brace-expansion | 5.0.9 | 5.0.13 | minimatch 11.0.8 → `brace-expansion ^5.0.12` |

### Not changed

- `version` stays 0.14.0; `dependencies` stays absent; `peerDependencies`, `peerDependenciesMeta`, `exports`, `files`, `bin`, `engines` (`node >=18`, a promise to consumers running `kairos-design emit`), `sideEffects`, `type`, `license`, `publishConfig` stay as they are.
- The workflows (`actions/checkout@v6`, `actions/setup-node@v6`, Node 24) stay as they are. Node 24 meets Vitest 5's ≥ 22.12.

## Breaking changes

Each item: what the release notes say, whether it touches this repository, and the task that handles it.

1. **Vite 8: Rolldown dependency optimiser and consistent CommonJS interop.** `vitest.config.ts` pre-bundles `aria-query`, `lz-string`, `dequal` and `pretty-format` because the browser asked a CommonJS module for named exports. The `optimizeDeps.include` list is still supported and now goes through Rolldown. If a story file fails to import with a named-export or `default` error, the fix goes in `vitest.config.ts` only (adding the named package to `include`, or the documented `optimizeDeps.rolldownOptions`). Task 3.2.
2. **Vite 8: Oxc transforms, Lightning CSS minification, newer default targets.** These apply to the workshop build (`build-storybook`) only. The shipped CSS is not built by anything in this repository (`dist/*.css` is source) and consumers' bundlers process it. No action beyond the build passing. Task 3.2.
3. **Vite 8: `server.moduleGraph`.** `.storybook/main.ts`'s registry watcher already prefers `server.environments.client.moduleGraph` (the environment API, present since Vite 6) and falls back to `server.moduleGraph`. No change expected; the workshop build exercises the config. Task 3.2.
4. **Vitest 5: inline projects inherit the root config and share its Vite server.** The root config here defines nothing but `test.projects`, and the only project (`stories`) sets its own `plugins` and `optimizeDeps`, so it keeps its own server. No change expected. Task 3.2.
5. **Vitest 5: `clearMocks` default, top-level `vi.mock`, strict locators, `toHaveTextContent` strict.** No test file here uses `vi.*` or Vitest browser locators: the play functions import `expect`, `userEvent`, `within` and `waitFor` from `storybook/test`, which Storybook 10.6.7 bundles with its own `@vitest/expect` 3.2.4. No change expected; a play-function failure that comes from the runner (not the component) is fixed in the runner config, never in `dist/`. Task 3.2.
6. **Vitest 5: artifacts in `.vitest/`.** If `npm run test-stories` leaves a `.vitest/` folder, add `.vitest/` to `.gitignore` (one line). Task 3.2.
7. **Vitest 5: Node ≥ 22.12.** CI runs Node 24. Local contributors running `npm run test-stories` need Node 22.12+; `engines` is not changed because it describes what consumers need, not the workshop. README is unchanged (it names no Node version). Task 2.1.
8. **TypeScript 6.0: `types` default `[]`, deprecations.** `tsconfig.json` already lists `types` and uses none of the deprecated options. If `npm run typecheck` reports errors, they are fixed in `tsconfig.json`, `stories/`, `.storybook/` or `tests/types/` only; an error inside `dist/` triggers the hold rule (Decision 2). Task 3.1.
9. **`@types/react` 19.3, React 19.3, Radix 1.8, TanStack Table 9.3.** Minor releases; same rule as 8 for type errors, and Decision 3 for any story failure that shows a component behaving differently. Tasks 3.1, 3.2.
10. **Storybook 10.5 → 10.6.** Minor release within 10; `.storybook/main.ts` uses only `stories`, `addons`, `framework`, `typescript.check` and `viteFinal`. Task 3.2.

## Overrides

One entry in `package.json`:

```json
"overrides": {
  "@joshwooding/vite-plugin-react-docgen-typescript": {
    "glob": "^14.0.4"
  }
}
```

Reason: `@storybook/react-vite` 10.6.7 declares the docgen plugin `^0.7.0`, whose `glob ^13.0.1` has no fixed 13.x release (GHSA-3g3m-2fjr-6pw4 covers up to 14.0.1). glob 14.0.4 keeps the API the plugin calls (Research). The override also replaces `minimatch` 10.2.6 and `brace-expansion` 5.0.9 under it. Remove it once a Storybook release depends on a docgen plugin that no longer uses `glob` (0.9.x already does).

## Holds

- **TypeScript stays on 6.0.3, not 7.0.2.** Two reasons. First, the package ships `.ts`/`.tsx` source that each consumer compiles with its own TypeScript, so `npm run typecheck` here is the proof that the shipped source compiles for them; the consumers' compiler line is 6.0.3 (the same batch's internal-tools plan holds TypeScript at 6.0.3 because its lint tooling does not accept 7 yet), and a check on 7.0 would prove a compiler no consumer runs. Second, 7.0.2 exports no compiler API at `"."` (`./lib/version.cjs` only), the TypeScript docgen path Storybook installs (`react-docgen-typescript`, opt-in via `reactDocgen`, not used here today) calls that API, and the newest docgen plugin (0.9.1) declares `typescript ">=4.3.0 <7 || >=7.1.0-0 <8"`, excluding 7.0 by name. Not checked: whether `tsc` 7.0.2 passes on this repository (not needed for the decision). Revisit when the consumers move to 7.
- **Hold rule for this build** (Decision 2): if a target version makes `npm test`, `npm run typecheck`, `npm run build-storybook` or `npm run test-stories` fail and the documented fix would need an edit under `dist/`, `bin/` or `docs/`, that package stays on its newest version that passes and still clears the advisories (Vite 7.3.8 with `@vitejs/plugin-react` 5.2.0, Vitest and `@vitest/browser-playwright` 4.1.12, TypeScript 5.9.3, the previous `@types/react`/`radix-ui`/`@tanstack/react-table` line), with the failing output in `checks/holds.md`. Every listed advisory still has a fix on those lines.

## Decisions

1. **No version bump, no publish.** Nothing a consumer installs changes (Context: no `dependencies`; Research: the advisories are all in devDependencies and their trees). `version` stays 0.14.0, so the merge to `main` runs `publish.yml`, which skips because `v0.14.0` exists (Research › Release workflow). The next real release carries the new `devDependencies` and `overrides` in its `package.json`; npm ignores both fields when a consumer installs the package.
2. **Shipped files are frozen.** No edit under `dist/`, `bin/` or `docs/`, and no change to the consumer-facing `package.json` fields listed under Versions › Not changed. A tool upgrade that would need one follows the hold rule (Holds). Proven against the published 0.14.0 tarball, not only against git (`kairos-design-release-surface`).
3. **A story that fails because a component behaves differently on React 19.3 or Radix 1.8 is a finding, not a test to edit.** Consumers on those versions would see the same thing, and fixing it means changing shipped code and releasing. Block the card with the story name and output; the reviewer decides. A failure caused by the runner (Vitest 5, Storybook 10.6, Vite 8 config) is fixed in the runner config.
4. **`@vitejs/plugin-react` is bumped, not removed.** It is imported nowhere, but removing a dependency is outside an update batch; the reviewer can drop it in a later change (SUMMARY › Needs your call).
5. **Evidence goes in `checks/`**, committed with `git add -f checks`; the planner removes it from the pull request (Workflow follow-up). The scripts are plain Node (no new dependency): `checks/scripts/advisory-scan.mjs` (the eight advisory rules written into the script, so it runs without `input/`), `checks/scripts/compare-pack.mjs`, `checks/scripts/release-prepare.mjs`.
6. **Where this change lives.** `openspec/config.yaml` names the `kairos-plans` store, which is not registered on the build hosts, so the CLI cannot validate the change in place; the planner validates it in a scratch copy without the `store:` line. The change is written in the job folder because the builder's sandbox and the plan id read it there. Before the PR the planner moves it into `kairos-plans` as `kairos-design-framework-update-2026-11` (the website and internal-tools batch changes use the same id in the same store) and removes it from the branch in its own commit. `openspec/config.yaml` itself is not changed.

## Advisories and where each is fixed

All eight are development-only for consumers: none is reachable from what `npm install kairos-design` installs.

| Advisory package | Severity | Fixed by | Runs where |
| --- | --- | --- | --- |
| storybook 10.5.10 | critical (+ high) | storybook 10.6.7 | `npm run storybook` on a developer machine; workshop build in CI |
| @storybook/addon-vitest 10.5.10 | critical (+ high) | 10.6.7 | `test-stories` in CI; the workshop |
| brace-expansion 5.0.9 | high | 5.0.13 via glob 14 / minimatch 11 (override) | installed, never called here (docgen plugin unused) |
| source-map-js 1.2.1 | high | 1.2.2 via Vite 8 → postcss 8.5.32 | Vite in the workshop |
| vite 7.3.6 | high | vite 8.3.8 | workshop dev server and build, story runner |
| @vitest/mocker 4.1.11 | moderate | 5.1.0 with vitest | story runner in CI |
| glob 13.0.6 | moderate | 14.0.4 (override) | installed, never called here |
| minimatch 10.2.6 | moderate | 11.0.8 via glob 14 | installed, never called here |

**Remaining after the change:** none expected. Any advisory `npm audit` still reports (on the list or newly published) is named in `checks/audit-after.md` with its reason.

## Risks

- **No QA step:** the reviewer's instruction sends this straight to `main`. Here that costs little: the merge publishes nothing and deploys nothing, and CI (`ci.yml`) runs all four checks on the pull request before the merge.
- **Majors in the story runner** (Vite 8, Vitest 5) can fail `test-stories` in ways unrelated to the components. Fallback lines are named (Holds), each still clearing every advisory.
- **A real component difference** surfaced by React 19.3 / Radix 1.8 in the workshop stops the build for the reviewer's call (Decision 3); it is information the consuming apps need either way.

## Migration Plan

Merge to `main` (merge commit). `publish.yml` runs and skips; nothing on npm changes. Rollback is a revert commit on `main`, which again publishes nothing. Contributors run `npm ci` after pulling (and need Node 22.12+ for `test-stories`).
