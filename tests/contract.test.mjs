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
    if (/style=\{\{/.test(stripped)) offenders.push(`${name}: inline style object`);
  }
  assert.deepEqual(offenders, [], 'these belong in the token or CSS layer');
});

test('every component is vendorable by the CLI', () => {
  const cli = readFileSync(join(ROOT, 'bin', 'kairos-design.mjs'), 'utf8');
  const artifacts = new Set([...cli.matchAll(/'(react\/[A-Za-z]+\.tsx?)'/g)].map((m) => m[1]));

  const onDisk = readdirSync(join(ROOT, 'dist', 'react')).map((f) => `react/${f}`);
  const unreachable = onDisk.filter((f) => !artifacts.has(f));

  // A component the CLI cannot copy does not exist for a consuming app, which
  // is the same failure as one missing from the manifest.
  assert.deepEqual(unreachable, [], 'add these to ARTIFACTS in bin/kairos-design.mjs');
});

test('the index exports every component', () => {
  const index = readFileSync(join(ROOT, 'dist', 'react', 'index.ts'), 'utf8');
  const files = readdirSync(join(ROOT, 'dist', 'react'))
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => f.replace(/\.tsx$/, ''));

  const unexported = files.filter((f) => !index.includes(`'./${f}'`));
  assert.deepEqual(unexported, [], 'not reachable from the package entry point');
});
