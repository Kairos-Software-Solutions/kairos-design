# Spec Delta: kairos-design-release-0-15

## Purpose

Define what kairos-design 0.15.0 publishes (version, entry points, packed files) and make the release workflow publish before it tags, so a failed publish can be rerun and no app on the 0.14 range receives the brand change by accident.

## ADDED Requirements

### Requirement: The package is 0.15.0 with a brand.css entry
`package.json` SHALL carry version 0.15.0 and export `./brand.css` as `./dist/brand.css`. Every other manifest field SHALL stay as at `09dbce8` apart from the version and the new export.

#### Scenario: Version and export
- **WHEN** `package.json` is read
- **THEN** `version` is `0.15.0`, `exports['./brand.css']` is `./dist/brand.css`, and the existing exports are unchanged
- **CHECK** `tests/release.test.mjs` › "the version is 0.15.0 and brand.css is exported"; `tests/contract.test.mjs` › "every artifact is reachable through the package exports"

#### Scenario: Manifest otherwise unchanged
- **WHEN** `package.json` is compared with `git show 09dbce8:package.json`, ignoring `version` and the new export
- **THEN** every other field is equal (files, peers, engines, scripts, devDependencies, overrides, publishConfig)
- **CHECK** `checks/REPORT.md` holds the comparison output from task 6.1, saying `manifest: same (ignored version, exports['./brand.css'])`

### Requirement: The packed files are 0.14's plus brand.css
The tarball SHALL hold exactly the 0.14.0 file list plus `dist/brand.css`: no test fixture, story, workshop file, plan or font.

#### Scenario: Pack list
- **WHEN** `npm pack --dry-run --json --ignore-scripts` lists the files
- **THEN** the list equals the 42 files of 0.14.0 plus `dist/brand.css`, 43 in all, with none under `tests/`, `stories/`, `.storybook/`, `openspec/` or `docs/adr/`
- **CHECK** `tests/release.test.mjs` › "the packed files are 0.14's plus brand.css"; `checks/pack-after.json` holds the dry-run output with its size

### Requirement: The release publishes before it tags
The release workflow SHALL push the version tag only after `npm publish` succeeds, and SHALL otherwise behave as in 0.14.0.

#### Scenario: Step order
- **WHEN** `.github/workflows/publish.yml` is read
- **THEN** the "Publish" step comes before "Create and push the version tag", and the tag step still runs only when `create_tag` is true
- **CHECK** `tests/release.test.mjs` › "the tag is pushed only after the publish step"

#### Scenario: Nothing else in the workflow moves
- **WHEN** the workflow is compared with the 0.14.0 copy in `tests/fixtures/kairos-design-0.14.0/publish.yml`
- **THEN** the two hold the same steps with the same content, and only the position of the tag step differs
- **CHECK** `tests/release.test.mjs` › "the release workflow differs from 0.14's only in step order"

#### Scenario: Published, then tagged
- **WHEN** the pull request is merged to `main` and the Release package run finishes
- **THEN** the run is green, its Publish step ran before its tag step, npm lists 0.15.0 as `latest` with `dist/brand.css` in its tarball, the tag `v0.15.0` points at the merge commit, and `npm view kairos-design@^0.14.0 version` still prints 0.14.0
- **CHECK** planner, after the merge: `gh run view <id> --log`, `npm view kairos-design dist-tags.latest`, `curl -sL <tarball> | tar -tz | grep dist/brand.css`, `git ls-remote --tags origin v0.15.0` (Workflow follow-up)

### Requirement: The docs describe the release
The adoption guide SHALL have an "Upgrading to 0.15.0" section naming the font families an app must load, the Brand Scale switch and the renamed tokens; `docs/decisions.md` SHALL record 0.15.0; `tokens.css` SHALL name the brief as its source.

#### Scenario: Docs present
- **WHEN** `docs/adoption.md`, `docs/decisions.md` and `dist/tokens.css` are read
- **THEN** the adoption guide has a heading "Upgrading to 0.15.0" whose section names Archivo, Courier Prime, `brand.css` and `data-scale="brand"`; decisions.md has a heading containing "0.15.0"; the tokens.css header names "Kairos design brief v1" and no longer names `visual-spec.md`
- **CHECK** `tests/release.test.mjs` › "the docs describe 0.15.0"
