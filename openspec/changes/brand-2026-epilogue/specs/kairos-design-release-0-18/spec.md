## Purpose
Define what kairos-design 0.18.0 publishes (version, entry points, packed files), what its docs tell a host about loading Epilogue and Courier Prime, and the check that every name the website reads survives the release, so its first consumer pins it without a surprise.

## ADDED Requirements

### Requirement: The package is 0.18.0 and keeps its entry points
`package.json` SHALL carry version 0.18.0 and SHALL export the same entry points as 0.17.0, `./brand.css` included. Every other manifest field SHALL equal its value at `d36d95c` (0.17.0).

#### Scenario: Version and exports
- **WHEN** `package.json` is read
- **THEN** `version` is `0.18.0`, `exports['./brand.css']` is `./dist/brand.css`, and every 0.14 export is unchanged
- **CHECK** `tests/release.test.mjs` › "brand.css is exported and every 0.14 export is unchanged"; `node -p "require('./package.json').version"` prints `0.18.0` in `checks/REPORT.md` (task 7.2; no test pins the version, so a 0.18.1 fix still passes)

#### Scenario: Manifest otherwise unchanged
- **WHEN** `package.json` is compared with `git show d36d95c:package.json`, ignoring `version`
- **THEN** every other field is deep-equal (exports, files, peers, engines, scripts, devDependencies, overrides, publishConfig)
- **CHECK** `checks/REPORT.md` holds the comparison output from task 7.2, saying `manifest: same (ignored version)`

### Requirement: The packed files stay 0.17.0's
The tarball SHALL hold exactly 0.17.0's 44 files: no test fixture, story, workshop file, plan or font file.

#### Scenario: Pack list
- **WHEN** `npm pack --dry-run --json --ignore-scripts` lists the files
- **THEN** the list equals 0.14.0's 42 files plus `dist/react/AccountMenu.tsx` and `dist/brand.css`, 44 in all, with none under `tests/`, `stories/`, `.storybook/`, `openspec/` or `docs/adr/` and none ending in a font extension
- **CHECK** `tests/release.test.mjs` › "the packed files are 0.14's plus AccountMenu (0.15.0) and brand.css"; `checks/pack-after.json` holds the dry-run output, 44 entries, with its size beside the 159,992 bytes before

### Requirement: The website's names still resolve
Every class and token the Kairos website reads from the package, recorded in `tests/fixtures/website-reads.txt`, SHALL still be declared in 0.18.0, and the website's own package test SHALL pass against the packed release before the website pins it.

#### Scenario: Names still declared
- **WHEN** each line of `tests/fixtures/website-reads.txt` is checked: a class against the classes `dist/kairos.css` defines, a token against the custom properties `dist/tokens.css` and `dist/brand.css` declare
- **THEN** every name is found
- **CHECK** `tests/release.test.mjs` › "every name the website reads is still declared"

#### Scenario: The website's own check
- **WHEN** the planner packs the built release into the website's job with `pack_prerelease.sh` and runs the website's `tests/kairos-design.test.ts` against it
- **THEN** "kairos design › every kairos class the site uses exists in kairos.css" and "kairos design › website geometry and motion come from brand.css" pass, and the script lists no name the website's plan expects that the release lacks
- **CHECK** planner, before the website card starts (Workflow follow-up)

### Requirement: The docs describe 0.18.0
The adoption guide SHALL have an "Upgrading to 0.18.0" section naming Epilogue, Courier Prime, `next/font`, the font tokens, the removed width tokens and the new classes; `docs/decisions.md` SHALL record 0.18.0; the `tokens.css` and `brand.css` headers SHALL name Kairos design brief v3; the brand stylesheet SHALL name no Archivo and no width, and the Brand stories no Archivo.

#### Scenario: Docs present
- **WHEN** `docs/adoption.md`, `docs/decisions.md`, `README.md`, `dist/tokens.css` and `dist/brand.css` are read
- **THEN** the "Upgrading to 0.18.0" section names Epilogue, Courier Prime, `next/font`, `--kairos-display`, `--kairos-body`, `--kairos-mono`, `-stretch`, `kairos-type-title--compact`, `kairos-type-card`, `kairos-type-time` and `kairos-text-link-text`; decisions.md has a heading containing "0.18.0"; README's Fonts section names Epilogue; both stylesheet headers name "Kairos design brief v3" and not "brief v1"
- **CHECK** `tests/release.test.mjs` › "the docs describe 0.18.0"

#### Scenario: Brand files name no Archivo
- **WHEN** `dist/brand.css` and `stories/brand/` are searched without regard to case
- **THEN** `brand.css` names neither Archivo nor a width (`stretch`), and no Brand story names Archivo
- **CHECK** `grep -niE "archivo|stretch" dist/brand.css` and `grep -rni "archivo" stories/brand` print nothing, recorded in `checks/REPORT.md`

### Requirement: The release publishes, then tags 0.18.0
Merging the reviewed change to `main` SHALL publish 0.18.0 to npm and then push the tag `v0.18.0`, with the release workflow as 0.16.0 left it, and SHALL leave apps on `^0.17.0` and earlier ranges where they are.

#### Scenario: Published, then tagged
- **WHEN** the pull request is merged to `main` and the Release package run finishes
- **THEN** the run is green, its Publish step ran before its tag step, npm lists 0.18.0 as `latest` with 44 files in its tarball and no font file, the tag `v0.18.0` points at the merge commit, and `npm view kairos-design@^0.17.0 version` still prints 0.17.0
- **CHECK** planner, after the merge: `gh run view <id> --log`, `npm view kairos-design dist-tags.latest`, `curl -sL <tarball> | tar -tz | wc -l`, `git ls-remote --tags origin v0.18.0` (Workflow follow-up)
