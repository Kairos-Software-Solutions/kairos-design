## Purpose
Define what kairos-design 0.19.0 publishes (version, entry points, packed files), what its docs tell an app about the phone sizes and the stamp kept for rank-1 buttons, the check that every name the website reads survives, and that merging it publishes before it tags.

## ADDED Requirements

### Requirement: The package is 0.19.0 and keeps its entry points
`package.json` SHALL carry version 0.19.0 and SHALL export the same entry points as 0.18.0. Every other manifest field SHALL equal its value at `725c182` (0.18.0). The lockfile's two top `version` fields SHALL match.

#### Scenario: Version and exports
- **WHEN** `package.json` and the top of `package-lock.json` are read
- **THEN** `version` is `0.19.0` in all three places, `exports['./brand.css']` is `./dist/brand.css`, and every 0.14 export is unchanged
- **CHECK** `tests/release.test.mjs` › "brand.css is exported and every 0.14 export is unchanged"; `node -p "require('./package.json').version"` and `node -p "const l=require('./package-lock.json'); l.version+' '+l.packages[''].version"` print `0.19.0` and `0.19.0 0.19.0` in `checks/REPORT.md` (task 6.2; no test pins the version, so a 0.19.1 fix still passes)

#### Scenario: Manifest otherwise unchanged
- **WHEN** `package.json` is compared with `git show 725c182:package.json`, ignoring `version`
- **THEN** every other field is deep-equal (exports, files, peers, engines, scripts, devDependencies, overrides, publishConfig)
- **CHECK** `checks/REPORT.md` holds the comparison output from task 6.2, saying `manifest: same (ignored version)`

### Requirement: The packed files stay 0.18.0's
The tarball SHALL hold exactly 0.18.0's 44 files: no test fixture, story, workshop file, plan or font file.

#### Scenario: Pack list
- **WHEN** `npm pack --dry-run --json --ignore-scripts` lists the files
- **THEN** the list equals 0.14.0's 42 files plus `dist/react/AccountMenu.tsx` and `dist/brand.css`, 44 in all, with none under `tests/`, `stories/`, `.storybook/`, `openspec/` or `docs/adr/`
- **CHECK** `tests/release.test.mjs` › "the packed files are 0.14's plus AccountMenu (0.15.0) and brand.css"; `checks/pack-after.json` holds the dry-run output, 44 entries, with its size beside the 160,785 bytes before

### Requirement: The website's names still resolve
Every class and token the Kairos website reads from the package, recorded in `tests/fixtures/website-reads.txt`, SHALL still be declared in 0.19.0.

#### Scenario: Names still declared
- **WHEN** each line of `tests/fixtures/website-reads.txt` is checked against the classes `dist/kairos.css` defines and the custom properties `dist/tokens.css` and `dist/brand.css` declare
- **THEN** every name is found
- **CHECK** `tests/release.test.mjs` › "every name the website reads is still declared"

### Requirement: The docs describe 0.19.0
The adoption guide SHALL have an "Upgrading to 0.19.0" section naming the phone sizes, the 899px boundary, the stamp tokens and the soft surface tokens; `docs/decisions.md` SHALL record 0.19.0; the manifest SHALL give the phone sizes and the stamp's new home, and its panel row SHALL no longer promise a 6px stamp.

#### Scenario: Docs present
- **WHEN** `docs/adoption.md`, `docs/decisions.md` and `docs/kairos-ui.md` are read
- **THEN** the "Upgrading to 0.19.0" section names `--kairos-text-body`, `1rem`, `899px`, `--kairos-text-button`, `--kairos-text-button-sm`, `--kairos-shadow-stamp`, `--kairos-shadow-stamp-hover`, `--kairos-shadow-pressed`, `--kairos-shadow-card` and `--kairos-shadow-soft-card`; decisions.md has a heading containing "0.19.0"; `docs/kairos-ui.md` names `--kairos-shadow-stamp` and `--kairos-shadow-stamp-hover`, says "below 900px", and its `kairos-panel` manifest row does not contain "6px"
- **CHECK** `tests/release.test.mjs` › "the docs describe 0.19.0"

### Requirement: The release publishes, then tags 0.19.0
Merging the reviewed change to `main` SHALL publish 0.19.0 to npm and then push the tag `v0.19.0`, with the release workflow as 0.18.0 left it, and SHALL leave apps on `^0.18.0` and earlier ranges where they are.

#### Scenario: Published, then tagged
- **WHEN** the pull request is merged to `main` and the Release package run finishes
- **THEN** the run is green, its Publish step ran before its tag step, npm lists 0.19.0 as `latest` with 44 files in its tarball, the tag `v0.19.0` points at the merge commit, and `npm view kairos-design@^0.18.0 version` still prints 0.18.0
- **CHECK** planner, after the merge: `gh run view <id> --log`, `npm view kairos-design dist-tags.latest`, `curl -sL <tarball> | tar -tz | wc -l`, `git ls-remote --tags origin v0.19.0` (Workflow follow-up)
