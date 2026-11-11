# REPORT: framework-update-2026-11 (kairos-design, job-056)

Branch `update/2026-11-security`, from `f565e34`. Node v24.22.2, npm 11.19.1, in the builder's Cloudflare sandbox. Commits are local and not pushed.

## Tasks, checks, results

| Task | Check run | Result |
| --- | --- | --- |
| 1.1 Baseline | `npm ci`, `npx playwright install --with-deps chromium`, `npm test`, `npx vitest run --project stories … --outputFile=checks/stories-before.json` | all exit 0. `npm test` 112 pass / 0 fail. Stories `numTotalTests` 67, failed 0, pending 0 (`checks/ci-commands.md` › Before). No story failed on the old code |
| 1.2 Advisory scan | `node checks/scripts/advisory-scan.mjs` on the f565e34 lock | exit 1, names all 8 packages (`checks/audit-before.txt`). `npm audit` totals: critical 2, high 3, moderate 8 |
| 1.3 Release-surface scripts | `node checks/scripts/compare-pack.mjs`, `node checks/scripts/release-prepare.mjs` on f565e34 | both exit 0. Negative test: an appended byte in `dist/tokens.css` made compare-pack exit 1 with `DIFFERENT`; the file was restored with `git checkout` |
| 2.1 Upgrade | `npm ls --depth=0`; `node checks/scripts/advisory-scan.mjs` | all 19 direct packages at target; scan exit 0 |
| 3.1 Typecheck | `npm run typecheck` (tsc 6.0.3); `git diff f565e34 --name-only -- dist bin docs` | exit 0, no error; diff empty. No fix needed |
| 3.2 Workshop + stories | `npm run build-storybook`, `npx playwright install --with-deps chromium`, `npm run test-stories` | all exit 0; 67/67 stories. No config change needed; no `.vitest/` folder appeared |
| 4.1 Fresh install + CI order | `rm -rf node_modules storybook-static && npm ci` … stories JSON run | every command exit 0; lockfile not rewritten. `npm test` 112 = 112, stories 67 = 67, 0 failed, 0 pending (`checks/install.txt`, `checks/ci-commands.md` › After, `checks/stories-after.json`) |
| 4.2 Versions + advisories | `npm ls --depth=0`, `npm ls typescript --depth=0`, `npm ls glob minimatch brace-expansion source-map-js @vitest/mocker --all`, the scan, `npm audit --json` | scan exit 0; audit all 0 (`checks/versions.txt`, `checks/overrides.txt`, `checks/audit-after.md`). See "Open point" for the `overridden` marker |
| 4.3 Release surface | `node checks/scripts/compare-pack.mjs`, `node checks/scripts/release-prepare.mjs` | both exit 0: 42 = 42 paths, 41 files sha256 `same`, only `package/package.json` differs. `manifest: same (ignored devDependencies, overrides)`. Output `publish=false`, `create_tag=false`, summary "v0.14.0 already exists. Nothing to release."; both git diffs empty (`checks/pack-compare.txt`, `checks/release-prepare.txt`) |
| 4.4 Validate | `OPENSPEC_TELEMETRY=0 npx -y @fission-ai/openspec@1.16.0 validate framework-update-2026-11 --strict` in the repository root | exit 0, "Change 'framework-update-2026-11' is valid". The CLI warned that `config.yaml`'s `store 'kairos-plans'` "is ignored" in a real OpenSpec root, so it did not stop and the `$TMPDIR` copy was not needed |

## Versions table against `checks/versions.txt`

| Package | Target | Installed | |
| --- | --- | --- | --- |
| storybook | 10.6.7 | 10.6.7 | match |
| @storybook/addon-a11y, -docs, -themes, -vitest, @storybook/react-vite | 10.6.7 | 10.6.7 (each) | match |
| vite | 8.3.8 | 8.3.8 | match |
| vitest | 5.1.0 | 5.1.0 | match |
| @vitest/browser-playwright | 5.1.0 | 5.1.0 | match |
| @vitejs/plugin-react | 6.3.0 | 6.3.0 | match |
| playwright | 1.65.0 | 1.65.0 | match |
| typescript | 6.0.3 (held below 7.0.2) | 6.0.3 | match (planned hold, `checks/holds.md`) |
| @types/node | 26.6.6 | 26.6.6 | match |
| @types/react, @types/react-dom | 19.3.0 | 19.3.0 | match |
| react, react-dom | 19.3.1 | 19.3.1 | match |
| radix-ui | 1.8.1 | 1.8.1 | match |
| @tanstack/react-table | 9.3.1 | 9.3.1 | match |
| transitive: @vitest/mocker | 5.1.0 | 5.1.0 | match |
| transitive: source-map-js | 1.2.2 | 1.2.2 (via postcss 8.5.32) | match; `npm update` not needed |
| transitive: glob | 14.0.4 | 14.0.4 (override) | match |
| transitive: minimatch | 11.0.8 | 11.0.8 | match |
| transitive: brace-expansion | 5.0.13 | 5.0.13 | match |

Re-read with `npm view` before installing: every target was still the registry's latest (typescript `latest` 7.0.2, newest 6.x 6.0.3; storybook `next` 11.0.0-beta.1). No newer stable release had appeared.

## Holds

- **typescript 6.0.3** (latest 7.0.2): planned hold from `design.md` › Holds. The entry is in `checks/holds.md`. The fallback hold rule was not used for any package.

## Files changed since f565e34, other than package.json, package-lock.json and checks/

- `openspec/changes/framework-update-2026-11/tasks.md`: task boxes ticked (`- [x]`) after each check passed. No other line changed.
- `openspec/changes/framework-update-2026-11/{.openspec.yaml,proposal.md,design.md,specs/**}`: added by the planner's commit `67e4b9d`, not edited by the builder.
- No change to `vitest.config.ts`, `.storybook/*`, `tsconfig.json` or `.gitignore`: no check failed in a way that needed one.

## How the lockfile was updated

`npm install` against the old lockfile failed with `ERESOLVE … Conflicting peer dependency: storybook@10.6.7`, even with `node_modules` removed. The same `package.json` resolved cleanly with no lockfile, and none of the new manifests' peers actually conflict. So the old lock's entries for the upgraded packages were deleted: the direct devDependencies, `@storybook/*`, `@vitest/*`, the docgen plugin, glob, minimatch, brace-expansion and source-map-js, plus anything nested under them (58 entries). `npm install` then re-resolved only those. Every other transitive pin was kept. No `--force` or `--legacy-peer-deps` was used. `npm ci` from the result is clean (task 4.1).

## Open point (spec wording)

kairos-design-dev-toolchain › "The glob override reaches the docgen plugin" says glob 14.0.4 is "(marked overridden)". `npm ls` (npm 11.19.1) prints that marker only when the override **value** equals the installed **version**: arborist `lib/node.js` `get overridden` compares `edge.overrides.value === this.version`. The design's override value is the range `^14.0.4`, so `npm ls` shows `glob@14.0.4` without the marker. The override does apply: `npm explain glob` prints `overridden glob@"^14.0.4" (was "^13.0.1")`, and `npm ls` exits 0 with no `invalid`. Both outputs are in `checks/overrides.txt`. In a scratch copy, the exact value `"14.0.4"` made `npm ls` print `glob@14.0.4 overridden`. `package.json` keeps the design's `^14.0.4`.

## Not run in the sandbox / notes

- The "Registry unchanged after the merge" CHECK is the planner's, after the merge. Not run.
- Whether `tsc` 7.0.2 passes: not run (the design says it is not needed).
- `npm ci` prints `npm warn install-scripts … esbuild@0.28.2 (postinstall …) not yet covered by allowScripts`. It is a warning only; the workshop build, which uses esbuild, passes. Not checked whether the baseline install printed it too.
- Vitest (4 before, 5 after) prints "close timed out after 10000ms" after the report and still exits 0. The `stories/**/*.mdx` "No story files found" warning was present before the change too.
