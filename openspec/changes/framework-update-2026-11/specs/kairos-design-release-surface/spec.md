# Spec Delta: kairos-design-release-surface

## Purpose

Guarantee that what consumers install from npm as kairos-design stays byte-identical to the published 0.14.0 when only the development toolchain changes, and that merging such a change to main publishes nothing and creates no tag.

## ADDED Requirements

### Requirement: Shipped files stay identical to the published 0.14.0
Every file that `npm pack` puts in the package, except `package.json`, SHALL be byte-identical to the same file in the registry's `kairos-design@0.14.0` tarball, and the two file lists SHALL be the same. No file under `dist/`, `bin/` or `docs/` SHALL change.

#### Scenario: Packed contents match the registry tarball
- **WHEN** `node checks/scripts/compare-pack.mjs` packs the branch (`npm pack --pack-destination`) and fetches `kairos-design@0.14.0` (`npm pack kairos-design@0.14.0`), unpacks both and compares them
- **THEN** both list the same paths, and every file but `package/package.json` has the same sha256
- **CHECK** the script exits 0 and `checks/pack-compare.txt` lists each path with its sha256 and `same`

#### Scenario: Source of the shipped files untouched in git
- **WHEN** `git diff f565e34 --name-only -- dist bin docs README.md` runs on the final commit
- **THEN** it prints nothing
- **CHECK** `checks/pack-compare.txt` ends with that command and its empty output

### Requirement: The consumer-facing manifest is unchanged
In `package.json`, every field except `devDependencies` and the new `overrides` SHALL equal the value at `f565e34`: name, version 0.14.0, description, type, license, engines, exports, bin, files, sideEffects, peerDependencies, peerDependenciesMeta, scripts, repository and publishConfig. `dependencies` SHALL stay absent, so installing the package brings in no package from this change.

#### Scenario: Manifest compare
- **WHEN** `checks/scripts/compare-pack.mjs` compares the branch's `package.json` with `git show f565e34:package.json`, ignoring only `devDependencies` and `overrides`
- **THEN** every other field is deep-equal, and `dependencies` is undefined in both
- **CHECK** the script exits 0 and `checks/pack-compare.txt` prints `manifest: same (ignored devDependencies, overrides)`

### Requirement: Merging to main publishes nothing
With `version` still 0.14.0 and the tag `v0.14.0` present, the release workflow SHALL decide not to publish and not to tag on a push to `main`, and the workflow files SHALL be unchanged.

#### Scenario: Release step skips an existing version
- **WHEN** `node checks/scripts/release-prepare.mjs` extracts the `run:` script of the "Prepare the release" step from `.github/workflows/publish.yml` and runs it with bash, `GITHUB_REF_TYPE=branch`, `GITHUB_REF_NAME=main` and temporary `GITHUB_OUTPUT` and `GITHUB_STEP_SUMMARY` files, in this repository with its tags
- **THEN** the output file holds `publish=false` and `create_tag=false`, and the summary holds "v0.14.0 already exists. Nothing to release."
- **CHECK** the script exits 0 and `checks/release-prepare.txt` shows both files and `git tag --list v0.14.0` printing `v0.14.0`

#### Scenario: Workflows untouched
- **WHEN** `git diff f565e34 --name-only -- .github` runs on the final commit
- **THEN** it prints nothing
- **CHECK** `checks/release-prepare.txt` ends with that command and its empty output

#### Scenario: Registry unchanged after the merge
- **WHEN** the pull request has been merged to `main` and the Release package run has finished
- **THEN** the run is green with the summary "v0.14.0 already exists. Nothing to release.", npm's `latest` is still 0.14.0 with no new version, and no new tag exists on the remote
- **CHECK** planner, after the merge: `gh run view <id> --log` shows the summary line and every later step skipped; `npm view kairos-design dist-tags.latest` prints 0.14.0 and `npm view kairos-design versions --json` ends at 0.14.0; `git ls-remote --tags origin` lists no tag newer than v0.14.0
