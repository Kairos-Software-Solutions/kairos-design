# Build report: brand-2026-light (kairos-design 0.15.0)

Built on `change/brand-2026-light` from `09dbce8`. Node v24.22.3, npm 11.19.1, in the build sandbox. Nothing pushed; the change is not archived.

## Tasks

| Task | Check | Result |
| --- | --- | --- |
| 1.1 | baseline: `npm ci`, playwright, `npm test`, stories JSON, pack JSON | all exit 0; 112/112 tests; 67 stories in 16 files pass; 42 files, 140,564 bytes (`checks/ci-commands.md` › Before) |
| 1.2 | `product-scale` passes 0.14 against itself with INTENTIONAL emptied; fails on a hand-changed value | 3 pass; 1 fail on the changed `gap`; reverted (`checks/task-1.2.md`) |
| 2.1 | `node --test` brand-tokens, contrast, product-scale, contract, emit | pass |
| 3.1 | `node --test` product-scale, contract, contrast, geometry; `scale` except "every token is read by something" | pass |
| 3.2 | `node --test` brand-scale, contract, product-scale, emit | pass |
| 4.1, 4.2 | `node --test` contract, product-scale; `scale` except the token-read test | pass |
| 4.3 | full `npm test`; `npm run typecheck` | pass; exit 0 |
| 5.1 | `npm run typecheck`; `NODE_OPTIONS=--max-old-space-size=4096 npm run build-storybook` | exit 0; exit 0 |
| 5.2 | `npx vitest run --project stories stories/brand stories/foundations`; `node --test tests/brand-tokens.test.mjs` | 18/18 pass, 0 skipped (13 Brand + 5 Foundations; `checks/stories-task-5.2.json`); 9/9 pass |
| 6.1 | `node --test tests/release.test.mjs` | 5 pass, "the docs describe 0.15.0" failing until 6.2 as expected |
| 6.2 | `node --test` release, contract, scale; the Bebas/Epilogue grep | 45/45 pass; grep prints nothing |
| 7.1 | CI commands in order on a fresh install | all exit 0; `npm test` 147/147; stories 80/80, 0 pending; 43 packed files (`checks/ci-commands.md` › After) |
| 7.2 | diff audit below | each prints what the task says |
| 7.3 | `openspec validate brand-2026-light --strict` in a store-less copy | "Change 'brand-2026-light' is valid" |

## Diff audit (task 7.2)

$ git diff --stat 09dbce8
```
 .github/workflows/publish.yml                      |    8 +-
 .storybook/preview-head.html                       |    5 +-
 .storybook/preview.tsx                             |   17 +-
 README.md                                          |   24 +
 checks/ci-commands.md                              |   29 +
 checks/pack-after.json                             |  231 +
 checks/pack-before.json                            |  226 +
 checks/stories-after.json                          |    1 +
 checks/stories-before.json                         |    1 +
 checks/stories-task-5.2.json                       |    1 +
 checks/task-1.2.md                                 |    5 +
 dist/brand.css                                     |  182 +
 dist/kairos.css                                    | 1160 ++++-
 dist/react/Field.tsx                               |   25 +-
 dist/tokens.css                                    |  378 +-
 docs/adoption.md                                   |  112 +
 .../0012-switch-the-brand-scale-on-at-the-root.md  |   55 +
 ...13-give-decorative-hairlines-their-own-token.md |   37 +
 .../0014-rename-a-role-and-keep-its-old-name.md    |   42 +
 docs/decisions.md                                  |  121 +
 docs/kairos-ui.md                                  |   57 +-
 docs/preview.html                                  |    2 +-
 openspec/changes/brand-2026-light/.openspec.yaml   |    2 +
 openspec/changes/brand-2026-light/design.md        |  224 +
 openspec/changes/brand-2026-light/proposal.md      |   36 +
 .../specs/kairos-design-brand-parts/spec.md        |  134 +
 .../specs/kairos-design-brand-scale/spec.md        |  113 +
 .../specs/kairos-design-brand-tokens/spec.md       |  118 +
 .../specs/kairos-design-release-0-15/spec.md       |   64 +
 openspec/changes/brand-2026-light/tasks.md         |   50 +
 package-lock.json                                  |    4 +-
 package.json                                       |    3 +-
 stories/brand/Actions.stories.tsx                  |  162 +
 stories/brand/Form.stories.tsx                     |  262 ++
 stories/brand/Foundations.stories.tsx              |  121 +
 stories/brand/Shell.stories.tsx                    |  161 +
 stories/brand/Surfaces.stories.tsx                 |  162 +
 stories/brand/computed.ts                          |   93 +
 stories/foundations/Colour.stories.tsx             |   35 +-
 stories/foundations/Type.stories.tsx               |   14 +-
 tests/brand-parts.test.mjs                         |  170 +
 tests/brand-scale.test.mjs                         |  201 +
 tests/brand-tokens.test.mjs                        |  235 +
 tests/contract.test.mjs                            |    2 +-
 tests/contrast.test.mjs                            |   87 +
 tests/emit.test.mjs                                |    2 +-
 tests/fixtures/kairos-design-0.14.0/base.css       |   89 +
 tests/fixtures/kairos-design-0.14.0/files.txt      |   42 +
 tests/fixtures/kairos-design-0.14.0/kairos.css     | 4926 ++++++++++++++++++++
 tests/fixtures/kairos-design-0.14.0/publish.yml    |  106 +
 tests/fixtures/kairos-design-0.14.0/tokens.css     |  434 ++
 tests/helpers/css.mjs                              |  243 +
 tests/product-scale.test.mjs                       |  182 +
 tests/release.test.mjs                             |  157 +
 tests/scale.test.mjs                               |    4 +-
 55 files changed, 11248 insertions(+), 109 deletions(-)
[exit 0]
```

$ git diff --exit-code 09dbce8 -- dist/base.css dist/format bin
```
[exit 0]
```

$ git diff --name-only 09dbce8 -- dist/react
```
dist/react/Field.tsx
[exit 0]
```

$ git diff --numstat 09dbce8 -- tests/contrast.test.mjs   # added, removed: additions only
```
87	0	tests/contrast.test.mjs
[exit 0]
```

$ git diff 09dbce8 -- tests/scale.test.mjs tests/contract.test.mjs tests/emit.test.mjs
```
diff --git a/tests/contract.test.mjs b/tests/contract.test.mjs
index 5ecfe7f..4c08daa 100644
--- a/tests/contract.test.mjs
+++ b/tests/contract.test.mjs
@@ -113,7 +113,7 @@ test('every button variant the component maps has a rule', () => {
 });
 
 test('no custom property is referenced without a definition or a fallback', () => {
-  const all = css + tokens;
+  const all = css + tokens + readFileSync(join(ROOT, 'dist', 'brand.css'), 'utf8');
   const definitions = new Set([...all.matchAll(/^\s*(--[a-zA-Z0-9-]+)\s*:/gm)].map((m) => m[1]));
 
   const broken = [];
diff --git a/tests/emit.test.mjs b/tests/emit.test.mjs
index af0b2bb..0a46427 100644
--- a/tests/emit.test.mjs
+++ b/tests/emit.test.mjs
@@ -99,7 +99,7 @@ test('an inline target replaces only the marked region', () => {
   const html = readFileSync(join(dir, 'index.html'), 'utf8');
   assert.match(html, /^<style>/, 'content before the marker survives');
   assert.match(html, /<\/style>\n$/, 'content after the marker survives');
-  assert.match(html, /--kairos-bg: #fff8eb/, 'the tokens landed');
+  assert.match(html, /--kairos-page: #fff8eb/, 'the tokens landed');
   assert.equal(html.match(/kairos-design:tokens begin/g).length, 1, 'markers are not duplicated');
 
   run(['emit'], dir);
diff --git a/tests/scale.test.mjs b/tests/scale.test.mjs
index d203acb..749cb29 100644
--- a/tests/scale.test.mjs
+++ b/tests/scale.test.mjs
@@ -33,6 +33,7 @@ const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');
 const surfaces = [
   css,
   readFileSync(join(ROOT, 'dist', 'base.css'), 'utf8'),
+  readFileSync(join(ROOT, 'dist', 'brand.css'), 'utf8'),
   ...readdirSync(join(ROOT, 'dist', 'react'))
     .filter((name) => /\.tsx?$/.test(name))
     .map((name) => readFileSync(join(ROOT, 'dist', 'react', name), 'utf8')),
@@ -175,7 +176,8 @@ test('every token is read by something', () => {
   // A consuming app may still be the only reader of a token, and that is
   // fine — the token has to be read HERE by whatever demonstrates it. If the
   // package cannot show its own token in use, the token is a document.
-  const declared = [...new Set([...tokens.matchAll(/(--kairos-[a-z0-9-]+)\s*:/g)].map((m) => m[1]))];
+  const brand = readFileSync(join(ROOT, 'dist', 'brand.css'), 'utf8');
+  const declared = [...new Set([...(tokens + brand).matchAll(/(--kairos-[a-z0-9-]+)\s*:/g)].map((m) => m[1]))];
   const unread = declared.filter((name) => {
     const reference = new RegExp(`var\\(${name}[,)]`);
     // `--kairos-shadow-color` is read by the four stamp tokens inside
[exit 0]
```

$ node -p "require('./package.json').version"
```
0.15.0
[exit 0]
```

$ grep -rn -E "Bebas|Epilogue" docs/kairos-ui.md docs/preview.html .storybook stories | grep -v -E ':[0-9]+:\s*(//|/?\*)'
```
[exit 1]
```

$ node -e "const {execSync}=require('child_process');const a=require('./package.json');const b=JSON.parse(execSync('git show 09dbce8:package.json','utf8'));const strip=p=>{p=structuredClone(p);delete p.version;delete p.exports['./brand.css'];return JSON.stringify(p)};console.log(strip(a)===strip(b)?\"manifest: same (ignored version, exports['./brand.css'])\":'manifest: DIFFERENT')"
```
manifest: same (ignored version, exports['./brand.css'])
[exit 0]
```


## Plan validation (task 7.3)

```
$ T=$(mktemp -d); git archive HEAD openspec | tar -x -C $T; sed -i '/^store:/d' $T/openspec/config.yaml; cd $T; git init -q
$ OPENSPEC_TELEMETRY=0 npx -y @fission-ai/openspec@1.16.0 validate brand-2026-light --strict
Change 'brand-2026-light' is valid
[exit 0]
```

In place (the real repository, `openspec/config.yaml` untouched), the same command also printed "Change 'brand-2026-light' is valid", after a warning that the `store: kairos-plans` declaration is ignored because the directory is a real OpenSpec root.

## Every CHECK line

Named tests looked up by name in a `node --test` run of each test file and in `checks/stories-after.json`.

| Spec › Scenario | CHECK | Result |
| --- | --- | --- |
| brand-parts › Vocabulary present | `tests/brand-parts.test.mjs` › "every shared part from the brief has its class" | brand-parts.test.mjs › every shared part from the brief has its class: pass |
| brand-parts › Documented | `tests/contract.test.mjs` › "every class has a manifest row, or a documented block" | contract.test.mjs › every class has a manifest row, or a documented block: pass |
| brand-parts › Existing guardrails cover the new parts | `tests/contract.test.mjs` › "no raw hex outside the token layer"; `tests/scale.test.mjs` › "every spacing value is a step on the scale", "tracking, radius, and border weight come from tokens", "every font size is a step on the type scale", "every shadow comes from the stamp tokens", "no literal duration or easing", "every token is read by something" | contract.test.mjs › no raw hex outside the token layer: pass; scale.test.mjs › every spacing value is a step on the scale: pass |
| brand-parts › Links at rest | `npm run test-stories`: `stories/brand/Actions.stories.tsx` › "Links" passes | stories/brand/Actions.stories.tsx › Links: passed |
| brand-parts › Link and menu hover | planner browser check on the built workshop at 1366 and 390 against the brief's `state-nav-hover-1366.png` (Workflow follow-up) | planner (not run here) |
| brand-parts › Ticking and picking | `npm run test-stories`: `stories/brand/Form.stories.tsx` › "Choices" passes | stories/brand/Form.stories.tsx › Choices: passed |
| brand-parts › A pill position for every option count | `tests/brand-parts.test.mjs` › "a time switch pill has a position for every option count it allows" | brand-parts.test.mjs › a time switch pill has a position for every option count it allows: pass |
| brand-parts › Invalid groups | `npm run test-stories`: `stories/brand/Form.stories.tsx` › "Errors" passes | stories/brand/Form.stories.tsx › Errors: passed |
| brand-parts › Keyboard | planner browser check on the built workshop at 1366 and 390 (Workflow follow-up) | planner (not run here) |
| brand-parts › Error line | `npm run test-stories`: `stories/brand/Form.stories.tsx` › "Errors" passes | stories/brand/Form.stories.tsx › Errors: passed |
| brand-parts › Error line shakes once | `tests/brand-parts.test.mjs` › "the error line shakes once on a duration token"; planner browser check of the shake at 1366 (Workflow follow-up) | brand-parts.test.mjs › the error line shakes once on a duration token: pass |
| brand-parts › Reduced motion stills the error line | `tests/brand-parts.test.mjs` › "reduced motion stills the error line"; planner browser check with `prefers-reduced-motion: reduce` emulated (Workflow follow-up) | brand-parts.test.mjs › reduced motion stills the error line: pass |
| brand-parts › Required mark in Field | `tests/brand-parts.test.mjs` › "the required mark is hidden from assistive technology"; `npm run typecheck` exits 0 | brand-parts.test.mjs › the required mark is hidden from assistive technology: pass; `npm run typecheck` exit 0 |
| brand-parts › Cards and bands | `npm run test-stories`: `stories/brand/Surfaces.stories.tsx` › "Cards And Bands" passes | stories/brand/Surfaces.stories.tsx › Cards And Bands: passed |
| brand-parts › Tick list and step line | `npm run test-stories`: `stories/brand/Surfaces.stories.tsx` › "Lists" passes | stories/brand/Surfaces.stories.tsx › Lists: passed |
| brand-parts › Placeholder and marker | `npm run test-stories`: `stories/brand/Surfaces.stories.tsx` › "Placeholders And Marker" passes | stories/brand/Surfaces.stories.tsx › Placeholders And Marker: passed |
| brand-parts › Header and footer | `npm run test-stories`: `stories/brand/Shell.stories.tsx` › "Header And Footer" passes | stories/brand/Shell.stories.tsx › Header And Footer: passed |
| brand-parts › Phone menu toggle | `npm run test-stories`: `stories/brand/Shell.stories.tsx` › "Phone Menu" passes | stories/brand/Shell.stories.tsx › Phone Menu: passed |
| brand-parts › Nothing site-only ships | `tests/brand-parts.test.mjs` › "no site-only part ships" | brand-parts.test.mjs › no site-only part ships: pass |
| brand-parts › Workshop against the brief | planner browser check and computed-style compare on the built workshop (Workflow follow-up) | planner (not run here) |
| brand-scale › Imported, not switched on | `tests/brand-scale.test.mjs` › "brand.css applies only under data-scale=brand on the root" | brand-scale.test.mjs › brand.css applies only under data-scale=brand on the root: pass |
| brand-scale › Switched on in the workshop | `npm run test-stories`: `stories/brand/Actions.stories.tsx` › "Buttons" passes | stories/brand/Actions.stories.tsx › Buttons: passed |
| brand-scale › Switched off again | `npm run test-stories`: `stories/brand/Actions.stories.tsx` › "Without The Switch" passes | stories/brand/Actions.stories.tsx › Without The Switch: passed |
| brand-scale › Only custom properties | `tests/brand-scale.test.mjs` › "brand.css declares only custom properties" | brand-scale.test.mjs › brand.css declares only custom properties: pass |
| brand-scale › No colour value | `tests/brand-scale.test.mjs` › "brand.css holds no colour value" | brand-scale.test.mjs › brand.css holds no colour value: pass |
| brand-scale › Every override has a default | `tests/brand-scale.test.mjs` › "every token brand.css sets has a Product Scale default in tokens.css", and `tests/contract.test.mjs` › "no custom property is referenced without a definition or a fallback" with `brand.css` added to its sources | brand-scale.test.mjs › every token brand.css sets has a Product Scale default in tokens.css: pass; contract.test.mjs › no custom property is referenced without a definition or a fallback: pass |
| brand-scale › Values table | `tests/brand-scale.test.mjs` › "brand.css carries the brief's geometry, type and motion" | brand-scale.test.mjs › brand.css carries the brief's geometry, type and motion: pass |
| brand-scale › Reduced motion still wins | `tests/brand-scale.test.mjs` › "brand.css leaves reduced motion at 1ms" | brand-scale.test.mjs › brand.css leaves reduced motion at 1ms: pass |
| brand-scale › Main and outline at rest | `npm run test-stories`: `stories/brand/Actions.stories.tsx` › "Buttons" passes (its play function asserts these computed values) | stories/brand/Actions.stories.tsx › Buttons: passed |
| brand-scale › A busy button keeps its box | `npm run test-stories`: `stories/brand/Actions.stories.tsx` › "Buttons" passes | stories/brand/Actions.stories.tsx › Buttons: passed |
| brand-scale › Hover, press and focus at Brand Scale | planner browser check on the built workshop at 1366 and 390 against the brief's `state-button-hover-1366.png` and `state-outline-hover-1366.png` (Workflow follow-up) | planner (not run here) |
| brand-scale › Field at rest | `npm run test-stories`: `stories/brand/Form.stories.tsx` › "Fields" passes | stories/brand/Form.stories.tsx › Fields: passed |
| brand-scale › Required field | `npm run test-stories`: `stories/brand/Form.stories.tsx` › "Fields" passes | stories/brand/Form.stories.tsx › Fields: passed |
| brand-scale › Invalid field | `npm run test-stories`: `stories/brand/Form.stories.tsx` › "Errors" passes | stories/brand/Form.stories.tsx › Errors: passed |
| brand-scale › Ranks at Brand Scale | `npm run test-stories`: `stories/brand/Foundations.stories.tsx` › "Type Ranks" passes | stories/brand/Foundations.stories.tsx › Type Ranks: passed |
| brand-scale › Ranks at Product Scale | `tests/brand-scale.test.mjs` › "every type rank has a Product Scale size from the 0.14 type scale" | brand-scale.test.mjs › every type rank has a Product Scale size from the 0.14 type scale: pass |
| brand-scale › Soft shadows replace the stamp | `npm run test-stories`: `stories/brand/Surfaces.stories.tsx` › "Cards And Bands" passes | stories/brand/Surfaces.stories.tsx › Cards And Bands: passed |
| brand-tokens › Brief roles resolve to the brief's hex | `tests/brand-tokens.test.mjs` › "the brief's light colours are the token values" | brand-tokens.test.mjs › the brief's light colours are the token values: pass |
| brand-tokens › Solid colours are plain hex | `tests/brand-tokens.test.mjs` › "every solid colour token is plain hex" | brand-tokens.test.mjs › every solid colour token is plain hex: pass |
| brand-tokens › Old name, same value | `tests/brand-tokens.test.mjs` › "every 0.14 token name still resolves, to its 0.14 value unless listed" | brand-tokens.test.mjs › every 0.14 token name still resolves, to its 0.14 value unless listed: pass |
| brand-tokens › A renamed role keeps its old name | `tests/brand-tokens.test.mjs` › "a renamed role keeps its old name as an alias" | brand-tokens.test.mjs › a renamed role keeps its old name as an alias: pass |
| brand-tokens › A theme set below the root | `tests/brand-tokens.test.mjs` › "old names re-resolve wherever a theme is set" | brand-tokens.test.mjs › old names re-resolve wherever a theme is set: pass |
| brand-tokens › Controls never take the rule | `tests/brand-tokens.test.mjs` › "the decorative rule is never a control edge" | brand-tokens.test.mjs › the decorative rule is never a control edge: pass |
| brand-tokens › Control boundary floor kept on the new grounds | `tests/contrast.test.mjs` › "every brief non-text colour clears 3:1 on every brief ground", and the existing "a control boundary clears 3:1 on every ground it can sit on" still passes | contrast.test.mjs › every brief non-text colour clears 3:1 on every brief ground: pass |
| brand-tokens › Text on the brief's grounds | `tests/contrast.test.mjs` › "every brief text colour clears 4.5:1 on every brief ground" | contrast.test.mjs › every brief text colour clears 4.5:1 on every brief ground: pass |
| brand-tokens › Labels on the brief's fills | `tests/contrast.test.mjs` › "labels on the brief's fills clear 4.5:1" | contrast.test.mjs › labels on the brief's fills clear 4.5:1: pass |
| brand-tokens › The brief's table is the token layer's | `tests/contrast.test.mjs` › "the brief's contrast table is the token layer's" | contrast.test.mjs › the brief's contrast table is the token layer's: pass |
| brand-tokens › The existing contrast suite | `checks/ci-commands.md` records the file's pass count, 0 failed, and `git diff 09dbce8 -- tests/contrast.test.mjs` shows only added tests | 11 tests, 11 pass (`checks/ci-commands.md`); `git diff --numstat` 87 added, 0 removed: pass |
| brand-tokens › Interim dark values come from the existing palette | `tests/brand-tokens.test.mjs` › "the new colour roles take interim dark values from the 0.14 dark palette" | brand-tokens.test.mjs › the new colour roles take interim dark values from the 0.14 dark palette: pass |
| brand-tokens › Font stacks | `tests/brand-tokens.test.mjs` › "the font tokens name Archivo and Courier Prime" | brand-tokens.test.mjs › the font tokens name Archivo and Courier Prime: pass |
| brand-tokens › No font in the package | `tests/release.test.mjs` › "no font file, @font-face or font URL ships" | release.test.mjs › no font file, @font-face or font URL ships: pass |
| brand-tokens › The fixture is the published release | `tests/product-scale.test.mjs` › "the 0.14.0 fixture is the published 0.14.0" | product-scale.test.mjs › the 0.14.0 fixture is the published 0.14.0: pass |
| brand-tokens › Every 0.14 declaration resolves the same | `tests/product-scale.test.mjs` › "every 0.14 declaration resolves the same at Product Scale, light and dark" | product-scale.test.mjs › every 0.14 declaration resolves the same at Product Scale, light and dark: pass |
| brand-tokens › New rules on existing classes | `tests/product-scale.test.mjs` › "a new rule on an existing class is Brand-scoped, or listed and inert at Product Scale" | product-scale.test.mjs › a new rule on an existing class is Brand-scoped, or listed and inert at Product Scale: pass |
| brand-tokens › base.css untouched | `git diff --exit-code 09dbce8 -- dist/base.css` exits 0, recorded in `checks/REPORT.md` | `git diff --exit-code 09dbce8 -- dist/base.css dist/format bin` exit 0 (above): pass |
| release-0-15 › Version and export | `tests/release.test.mjs` › "brand.css is exported and every 0.14 export is unchanged"; `tests/contract.test.mjs` › "every artifact is reachable through the package exports"; the version by `node -p "require('./package.json').version"` printing `0.15.0` in `checks/REPORT.md` (task 7.2) and the planner's registry check after the merge (no test pins the version, so a 0.15.1 fix still passes) | release.test.mjs › brand.css is exported and every 0.14 export is unchanged: pass; contract.test.mjs › every artifact is reachable through the package exports: pass |
| release-0-15 › Manifest otherwise unchanged | `checks/REPORT.md` holds the comparison output from task 7.2, saying `manifest: same (ignored version, exports['./brand.css'])` | `manifest: same (ignored version, exports['./brand.css'])` (above): pass |
| release-0-15 › Pack list | `tests/release.test.mjs` › "the packed files are 0.14's plus brand.css"; `checks/pack-after.json` holds the dry-run output with its size | release.test.mjs › the packed files are 0.14's plus brand.css: pass |
| release-0-15 › Step order | `tests/release.test.mjs` › "the tag is pushed only after the publish step" | release.test.mjs › the tag is pushed only after the publish step: pass |
| release-0-15 › Nothing else in the workflow moves | `tests/release.test.mjs` › "the release workflow differs from 0.14's only in step order" | release.test.mjs › the release workflow differs from 0.14's only in step order: pass |
| release-0-15 › Published, then tagged | planner, after the merge: `gh run view <id> --log`, `npm view kairos-design dist-tags.latest`, `curl -sL <tarball> \| tar -tz \| grep dist/brand.css`, `git ls-remote --tags origin v0.15.0` (Workflow follow-up) | planner (not run here) |
| release-0-15 › Docs present | `tests/release.test.mjs` › "the docs describe 0.15.0" | release.test.mjs › the docs describe 0.15.0: pass |
| release-0-15 › No 0.14 family named | `grep -rn -E "Bebas\|Epilogue" docs/kairos-ui.md docs/preview.html .storybook stories \| grep -v -E ':[0-9]+:\s*(//\|/?\*)'` prints nothing, recorded in `checks/REPORT.md` | grep prints nothing (above): pass |
| release-0-15 › Every light colour token keeps its swatch | `tests/brand-tokens.test.mjs` › "the Colour page groups every light colour token" | brand-tokens.test.mjs › the Colour page groups every light colour token: pass |

## ALLOWED_NEW (tests/product-scale.test.mjs)

| File | Selector | Property | Product Scale value | Why |
| --- | --- | --- | --- | --- |
| kairos.css | `.kairos-field-error::before` | `display` | `none` (from `--kairos-error-badge-display`) | The Field error's "!" badge. 0.14 had no `::before` here; a `::before` with no box draws nothing, and the knob keeps it out of the layout at Product Scale. The Brand Scale sets the knob to `inline-flex`, and the Brand-scoped rule supplies the content. |

## Brand-scoped rules in kairos.css (`:root[data-scale='brand'] …`)

| Selector | Declarations | Why no knob |
| --- | --- | --- |
| `.kairos-button` | `font-stretch: var(--kairos-button-stretch)` | 0.14 sets no `font-stretch`; any default would override what the host's button inherits. |
| `.kairos-button--secondary` | `--button-shadow-hover: var(--kairos-button-secondary-hover-shadow)` | The shared rank-2 rule sets the hover shadow to `none` later at the same specificity, so the outline button's hover offset needs its own rule. |
| `.kairos-input-field`, `.kairos-select` | `font-weight: var(--kairos-input-weight)` | 0.14 sets none and `base.css` makes a control inherit its font; a default would override the host's. |
| `.kairos-input-field:focus-visible`, `.kairos-select:focus-visible` | `background: var(--kairos-input-focus-bg)` | 0.14's focused field sets no ground (it keeps its hover ground); any default would take that away (design.md's own example). |
| `.kairos-input-field[aria-invalid='true']`, `.kairos-select[aria-invalid='true']` | `border-color: var(--kairos-error)` | 0.14 marks an invalid field by its message alone. |
| `.kairos-input-label` | `font-stretch: var(--kairos-input-label-stretch)` | As the button: 0.14 sets no `font-stretch`. |
| `.kairos-field-error:not(:empty)` | `display: flex; align-items; gap; font-weight: 600; animation: kairos-shake …` | Decided 17: badge and text on one line at 600, shaking once. 0.14 sets none of these; `:not(:empty)` because it outranks the rule that takes an empty error out of the grid. |
| `.kairos-field-error:not(:empty)::before` (shared with `.kairos-error-line::before`) | the badge: content "!", 20px round, error fill, on-error text | The Field error borrows the error line's badge at Brand Scale only. |

## Knobs beyond design.md's table

None. Every token `brand.css` sets is named in design.md › Brand Scale (the `-sm`, `-stretch`, `-case`, `-hover`, `-active` and label `-case/-track/-color/-stretch` names are the table's own shorthands). New theme-independent part-size, layout and motion tokens in `tokens.css` (tick box, day cell, error badge, link underline, header height, curves, shake duration and similar) are the "New shared tokens" design.md › Token map allows; they hold the brief's values and have no 0.14 shape.

## Files changed and why

- `dist/tokens.css`: renamed roles with the alias block, new colour roles with interim dark values, font stacks, highlight-strong hover, new shared tokens, component knobs with 0.14 defaults, brief v1 as the source (tasks 2.1, 3.1).
- `dist/kairos.css`: existing button, field, label, hint, error and focus rules read the knobs; the shared parts; Brand-scoped rules; the shake keyframes (3.1, 4.1, 4.2).
- `dist/brand.css` (new): the Brand Scale (3.2).
- `dist/react/Field.tsx`: `required` on `Field`, passed by `InputField`, `Textarea`, `SelectField` (4.3).
- `package.json`: `version` 0.15.0, `exports['./brand.css']` (3.2, 6.1). `package-lock.json`: its two root `version` fields to 0.15.0 to match (what `npm version` does; no dependency change).
- `.github/workflows/publish.yml`: the tag step moved after Publish, unchanged (6.1).
- `README.md`, `docs/kairos-ui.md`, `docs/adoption.md`, `docs/decisions.md`, `docs/adr/0012…0014`, `docs/preview.html`: docs (4.1-4.3, 6.2).
- `.storybook/preview.tsx`, `.storybook/preview-head.html`: brand.css import, scale decorator, sort order, font link (5.1).
- `stories/brand/*` (new: 5 story files, 13 stories, and `computed.ts`, the play functions' readers); `stories/foundations/Colour.stories.tsx`, `Type.stories.tsx` (5.2). `stories/tokens.ts` unchanged.
- `tests/`: new `product-scale`, `brand-tokens`, `brand-scale`, `brand-parts`, `release` tests, `helpers/css.mjs` and the 0.14.0 fixture; additions to `contrast`; the edits design.md › Tests names in `scale`, `contract`, `emit`.
- `checks/`: this evidence (forced in; the planner drops it from the pull request).

## Not run in the sandbox

- Every planner CHECK (browser checks at 1366 and 390, keyboard, state shots, the computed-style compare against the brief, the publish and registry checks after the merge).
- `npm run storybook` (dev server) was not started; only the static workshop build ran.

