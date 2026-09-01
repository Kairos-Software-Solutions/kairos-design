/**
 * The contract between the layers.
 *
 * A design system's characteristic failure is not a component that looks
 * wrong, it is a component that emits a class the stylesheet no longer has —
 * silently, because an unmatched class renders as unstyled rather than as an
 * error. These tests are cheap and catch exactly that.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(ROOT, 'dist', 'kairos.css'), 'utf8');
const tokens = readFileSync(join(ROOT, 'dist', 'tokens.css'), 'utf8');

/** Every class the stylesheet defines a rule for. */
const defined = new Set([...css.matchAll(/\.(kairos-[a-z0-9-]+)/g)].map((m) => m[1]));

const reactFiles = readdirSync(join(ROOT, 'dist', 'react'))
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => ({ name: f, source: readFileSync(join(ROOT, 'dist', 'react', f), 'utf8') }));

test('every class a component emits exists in kairos.css', () => {
  const missing = [];

  for (const { name, source } of reactFiles) {
    // Only look inside className values, so a class named in a doc comment is
    // not mistaken for one the component actually renders.
    const values = [
      ...source.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{'([^']*)'\}|\{\[([\s\S]*?)\])/g),
    ].map((m) => m[1] ?? m[2] ?? m[3] ?? m[4] ?? '');

    for (const value of values) {
      for (const match of value.matchAll(/kairos-[a-z0-9-]*/g)) {
        const cls = match[0];
        // `kairos-state-chip--${canonical}`: the interpolation is a closed set
        // enumerated in the component, so assert the family exists rather than
        // trying to evaluate it. The variant-specific tests below cover the
        // members.
        const isPrefix = value.slice(match.index + cls.length).startsWith('${');
        const ok = isPrefix ? [...defined].some((d) => d.startsWith(cls)) : defined.has(cls);
        if (!ok) missing.push(`${name}: ${cls}${isPrefix ? '${...}' : ''}`);
      }
    }
  }

  assert.deepEqual(missing, [], 'components emit classes the stylesheet does not define');
});

test('every state-chip variant has a rule', () => {
  const source = readFileSync(join(ROOT, 'dist', 'react', 'StateChip.tsx'), 'utf8');
  const canonical = [...source.matchAll(/^\s{2}\w+: '(\w+)',$/gm)].map((m) => m[1]);

  assert.ok(canonical.length > 0, 'the alias map was found');
  for (const variant of new Set(canonical)) {
    assert.ok(
      defined.has(`kairos-state-chip--${variant}`),
      `kairos-state-chip--${variant} has no rule, so that status renders unstyled`
    );
  }
});

test('every deprecated state alias maps to a canonical variant', () => {
  const source = readFileSync(join(ROOT, 'dist', 'react', 'StateChip.tsx'), 'utf8');
  const canonical = new Set(['settled', 'overdue', 'awaiting', 'draft', 'neutral']);
  const pairs = [...source.matchAll(/^\s{2}(\w+): '(\w+)',$/gm)];

  // Every app's old spelling has to keep working through one release, or
  // adopting the registry means changing every call site in one commit.
  for (const [, from, to] of pairs) {
    assert.ok(canonical.has(to), `${from} maps to '${to}', which is not one of the four states`);
  }
  for (const alias of ['success', 'danger', 'warning', 'complete', 'failed', 'progress']) {
    assert.ok(pairs.some(([, from]) => from === alias), `the ${alias} alias is missing`);
  }
});

test('every button variant the component maps has a rule', () => {
  const source = readFileSync(join(ROOT, 'dist', 'react', 'Button.tsx'), 'utf8');
  const modifiers = [...source.matchAll(/'(kairos-button--[a-z-]+)'/g)].map((m) => m[1]);

  assert.ok(modifiers.length >= 6, 'all six ranks are mapped');
  for (const modifier of modifiers) {
    assert.ok(defined.has(modifier), `${modifier} has no rule`);
  }
});

test('no custom property is referenced without a definition or a fallback', () => {
  const all = css + tokens;
  const definitions = new Set([...all.matchAll(/^\s*(--[a-zA-Z0-9-]+)\s*:/gm)].map((m) => m[1]));

  const broken = [];
  for (const m of all.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)\s*(,?)/g)) {
    const [, name, hasFallback] = m;
    if (!hasFallback && !definitions.has(name)) broken.push(name);
  }

  // This is how `--button-height` shipped dead: Paykit defined it in
  // Tailwind's `@theme`, the port dropped that block, and every button
  // silently lost its height, because an invalid value is not an error.
  assert.deepEqual([...new Set(broken)], [], 'referenced with no definition and no fallback');
});

test('no bare element selector decides what a lockup shows', () => {
  // How the double logo shipped: `.kairos-sidebar-brand img { display: block }`
  // is (0,1,1) and `.kairos-lockup--dark { display: none }` is (0,1,0), so the
  // sizing rule outranked the hide and both variants rendered, one stacked on
  // the other's cream tile. The lockup pair is decided by single-class rules,
  // which any `.kairos-thing img` rule beats without naming a lockup at all.
  // So `display` on a bare element descendant is the shape to keep out.
  const body = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const offenders = [];

  for (const [, selector, declarations] of body.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const rule = selector.trim();
    if (rule.startsWith('@') || !rule.includes('.kairos-')) continue;
    // Only the last compound matters: it is what the declaration lands on,
    // and only an image can be a lockup.
    if (!/(?:^|[\s>+~])(?:img|picture|svg)$/.test(rule)) continue;
    if (/(?:^|[;{\s])display\s*:/.test(declarations)) offenders.push(rule);
  }

  assert.deepEqual(offenders, [], 'name the class, or the rule decides a lockup by accident');
});

test('no raw hex outside the token layer', () => {
  const body = css.slice(css.indexOf('*/') + 2);
  const hex = [...body.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
  assert.deepEqual(hex, [], 'colour belongs in tokens.css');
});

test('components hold no styling decisions', () => {
  const offenders = [];

  for (const { name, source } of reactFiles) {
    const body = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    // An icon's own geometry is markup, not styling, so the SVG is not counted.
    const stripped = body.replace(/<svg[\s\S]*?<\/svg>/g, '');

    if (/#[0-9a-fA-F]{3,8}\b/.test(stripped)) offenders.push(`${name}: raw hex`);
    if (/\b\d+px\b/.test(stripped)) offenders.push(`${name}: pixel value`);

    /**
     * An inline style is banned for carrying a design value, not for existing.
     * `OverflowMenu` positions a portalled menu from live measurements, which
     * no stylesheet can express; those values are expressions, not literals.
     * So the rule is about what is inside the object.
     */
    for (const match of stripped.matchAll(/style=\{\{([\s\S]*?)\}\}/g)) {
      const literals = match[1].match(/(['"])[^'"]*\1/g) ?? [];
      const design = literals.filter((l) =>
        /(^|[^a-z])(\d+(\.\d+)?(px|rem|em|%|vh|vw)|#[0-9a-fA-F]{3,8})/.test(l)
      );
      if (design.length) offenders.push(`${name}: design value in a style prop — ${design.join(', ')}`);
    }
  }

  assert.deepEqual(offenders, [], 'these belong in the token or CSS layer');
});

test('every artifact is reachable through the package exports', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const exported = new Set(Object.values(pkg.exports).map((p) => p.replace(/^\.\//, '')));

  const entries = [
    ...readdirSync(join(ROOT, 'dist'))
      .filter((f) => f.endsWith('.css'))
      .map((f) => `dist/${f}`),
    ...readdirSync(join(ROOT, 'dist', 'format'))
      .filter((f) => f.endsWith('.ts'))
      .map((f) => `dist/format/${f}`),
    'dist/react/index.ts',
  ];

  // An artifact missing from `exports` cannot be imported under any specifier,
  // so it does not exist for a consuming app. This replaces the check on the
  // old CLI's hardcoded artifact list: the failure is the same, but the list
  // that can now be wrong is the one npm actually reads.
  assert.deepEqual(
    entries.filter((f) => !exported.has(f)),
    [],
    'add these to "exports" in package.json'
  );

  assert.ok(pkg.files.includes('dist'), 'dist ships in the published tarball');
  assert.ok(!pkg.private, 'a private package cannot be installed by an app');
});

/**
 * Planning material stays out of the tarball.
 *
 * `docs/adr/` and `openspec/` are written for whoever works on this repo, not
 * for an app installing it. They are excluded today because `files` is an
 * allowlist naming three entries, which is the strictest form and needs nothing
 * else to hold. This test exists because that is a property of one line in
 * `package.json`: widening `files` to `docs` to ship one more manifest page
 * would quietly publish every proposal and every decision with it.
 */
test('planning material does not ship in the package', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

  // An allowlist, not an ignore list. Anything not named here is already out.
  assert.ok(Array.isArray(pkg.files) && pkg.files.length > 0, '"files" must be an allowlist');

  const shipped = pkg.files.map((f) => f.replace(/^\.?\//, ''));
  const withheld = ['docs/adr', 'openspec', 'stories', 'tests', '.storybook', '.claude'];

  const leaked = withheld.filter((dir) =>
    shipped.some((entry) => entry === dir || entry.startsWith(`${dir}/`) || dir.startsWith(`${entry}/`))
  );

  assert.deepEqual(leaked, [], 'these are for this repo, not for a consuming app');

  // `docs` as a bare entry would sweep `docs/adr` in with the manifest.
  assert.ok(
    !shipped.includes('docs'),
    'name docs/kairos-ui.md rather than docs, or the ADRs ship with it'
  );
});

test('the index exports every component', () => {
  const index = readFileSync(join(ROOT, 'dist', 'react', 'index.ts'), 'utf8');
  const files = readdirSync(join(ROOT, 'dist', 'react'))
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => f.replace(/\.tsx$/, ''));

  const unexported = files.filter((f) => !index.includes(`'./${f}'`));
  assert.deepEqual(unexported, [], 'not reachable from the package entry point');
});

/**
 * A bordered box whose content touches the border is the failure that shipped:
 * `.kairos-panel` paints ground and border only, and the padding lives in
 * `.kairos-pad`. The class-exists test above could not catch it, because both
 * classes exist — the component simply emitted the wrong one, and an
 * unpadded panel renders as a styled box rather than as an unstyled one.
 */
test('Panel carries padding by default and drops it when flush', () => {
  const source = readFileSync(join(ROOT, 'dist', 'react', 'Panel.tsx'), 'utf8');
  const section = source.match(/<section className=\{([^}]+)\}/)?.[1];

  assert.ok(section, 'Panel still renders a <section> with a computed className');
  assert.match(section, /kairos-pad/, 'Panel applies the padding class');
  assert.match(section, /!flush && 'kairos-pad'/, 'flush is what removes it');
  assert.doesNotMatch(
    section,
    /'kairos-flush'/,
    "`kairos-flush` is a margin reset, not a padding one — flush must drop `kairos-pad`"
  );
});

/**
 * The manifest is the only list an app reads. A class that carries a rule but
 * no row does not exist for the next agent, which is how four Uptime screens
 * were built out of `<Panel>` with no padding on any of them.
 */
test('the padding utility is documented', () => {
  const manifest = readFileSync(join(ROOT, 'docs', 'kairos-ui.md'), 'utf8');
  assert.match(manifest, /\| `kairos-pad` \|/, 'kairos-pad has a manifest row');
});

/**
 * The manifest sends page navigation to a link, and the only way to make a
 * link look like a button is to put the button class on an `<a>`. If the
 * class does not clear the UA underline, every navigation-primary in every
 * Kairos app is underlined.
 */
test('kairos-button clears the user-agent underline', () => {
  const rule = css.match(/\n\.kairos-button \{([\s\S]*?)\n\}/)?.[1];

  assert.ok(rule, '.kairos-button has a base rule');
  assert.match(rule, /text-decoration:\s*none/, 'a link wearing this class is not underlined');

  // The one rank that wants it must still set it back on itself.
  const tertiary = css.match(/\n\.kairos-button--tertiary \{([\s\S]*?)\n\}/)?.[1];
  assert.match(tertiary ?? '', /text-decoration:\s*underline/, 'tertiary reads as a link');
});

/**
 * `.kairos-panel-heading` resets the UA margin so the panel owns the spacing.
 * For three versions nothing then owned it, and a headed panel rendered its
 * title flush against its first field.
 */
test('a panel heading is separated from the content under it', () => {
  const scoped = css.match(/\.kairos-panel-heading:not\(:last-child\) \{([\s\S]*?)\n\}/)?.[1];
  assert.ok(scoped, '.kairos-panel-heading has a rule for when content follows');
  assert.match(scoped, /margin-bottom:\s*var\(--kairos-space-/, 'it pushes that content away, by a step on the scale');
});

/**
 * `kairos-page-header-description` sat in the stylesheet unrendered while every
 * app grew its own subtitle class. A styled element the component layer cannot
 * produce is an element that does not exist.
 */
test('PageHeader renders the description the stylesheet styles', () => {
  const source = readFileSync(join(ROOT, 'dist', 'react', 'Panel.tsx'), 'utf8');
  const header = source.slice(source.indexOf('export function PageHeader'));

  assert.match(header, /kairos-page-header-body/, 'title and description share a body wrapper');
  assert.match(header, /kairos-page-header-description/, 'the description element is rendered');
  assert.match(header, /description \?/, 'and is omitted when there is nothing to say');
});

/**
 * The manifest is the only list an app reads, so a class it does not name is a
 * class the next app writes for itself. These are the ones Uptime had already
 * forked as `.uptime-muted`, `.uptime-grow`, `.uptime-screen-stack` and friends
 * before they were documented.
 */
test('the layout and utility vocabulary is documented', () => {
  const manifest = readFileSync(join(ROOT, 'docs', 'kairos-ui.md'), 'utf8');

  const undocumented = [
    'kairos-stack', 'kairos-split', 'kairos-form-stack', 'kairos-grow',
    'kairos-measure', 'kairos-code', 'kairos-code-block', 'kairos-muted',
    'kairos-chip-row', 'kairos-checkbox-row', 'kairos-choice-row',
    'kairos-visually-hidden', 'kairos-align-right', 'kairos-nowrap',
    'kairos-view', 'kairos-action-row',
  ].filter((name) => !manifest.includes(`\`${name}\``));

  assert.deepEqual(undocumented, [], 'these carry a rule but no manifest row');
});

/**
 * A rule that sets `display` on something matching BOTH lockup variants
 * outranks their own light/dark selectors and paints the pair, one on the
 * other's cream tile. `.kairos-sidebar-brand img { display: block }` is exactly
 * that, and it shipped in 0.2.2. Rules that name a single variant are making a
 * deliberate choice and are fine; container rules size the artwork only.
 */
test('no rule forces display on both lockup variants at once', () => {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

  const offenders = [...withoutComments.matchAll(/([^\n{}]+)\{([^}]*)\}/g)]
    .filter(([, , body]) => /display\s*:/.test(body))
    .map(([, selector]) => selector.trim())
    // Only rules that can match a lockup at all.
    .filter((selector) => /\.kairos-lockup|\.kairos-(sidebar-brand|auth-header|topbar-brand)[^,]*\bimg\b/.test(selector))
    // A selector naming one variant is choosing, not clobbering.
    .filter((selector) =>
      selector.split(',').some((part) => !/--light|--dark/.test(part) && /\.kairos-lockup|\bimg\b/.test(part)))
    // The base rule is the default the variant selectors are written against:
    // same specificity, and they come after it. Anything heavier is the bug.
    .filter((selector) => selector !== '.kairos-lockup');

  assert.deepEqual(offenders, [], 'these outrank the variant selectors and show both lockups');
});

/**
 * If base.css does not set the page, every app writes the same four
 * declarations against the same four tokens, and the one that gets a token
 * name wrong renders a white page under a dark theme.
 */
test('base.css sets the page so an app does not have to', () => {
  const base = readFileSync(join(ROOT, 'dist', 'base.css'), 'utf8');

  assert.match(base, /background:\s*var\(--kairos-bg\)/, 'the ground comes from the token');
  assert.match(base, /color:\s*var\(--kairos-text\)/, 'and so does the ink');
  assert.match(base, /min-width:\s*320px/, 'the 320px floor is the systems own');
  assert.match(base, /font:\s*var\(--kairos-text-body\)/, 'body type is set once');
  assert.match(base, /\[hidden\]\s*\{[^}]*display:\s*none\s*!important/, 'hidden beats a components display');
});

/**
 * A modifier and its block are both one class, so at equal specificity the one
 * written later wins. `.kairos-action-row--equal { display: grid }` placed
 * above `.kairos-action-row { display: flex }` set grid-template-columns on a
 * flex container: valid CSS, inert, and invisible until someone counts the
 * buttons on a sign-in form.
 */
test('a modifier that changes display comes after the block it modifies', () => {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [...withoutComments.matchAll(/(?:^|\n)\s*\.(kairos-[a-z0-9-]+)\s*\{([^}]*)\}/g)];

  const firstIndex = new Map();
  for (const rule of rules) {
    if (!firstIndex.has(rule[1])) firstIndex.set(rule[1], rule.index);
  }

  const misordered = [];
  for (const [, name, body] of rules) {
    const split = name.indexOf('--');
    if (split === -1 || !/display\s*:/.test(body)) continue;

    const block = name.slice(0, split);
    const blockAt = firstIndex.get(block);
    if (blockAt !== undefined && blockAt > firstIndex.get(name)) {
      misordered.push(`.${name} is declared before .${block}`);
    }
  }

  assert.deepEqual(misordered, [], 'the block will override the modifier');
});
