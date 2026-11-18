/**
 * What 0.16.0 publishes, and how the release workflow publishes it.
 *
 * The package is the export map and the tarball, so both are pinned against
 * the 0.14.0 release: the same exports plus `./brand.css`, the same packed
 * files plus `dist/brand.css`, and no font in either. The version literal is
 * deliberately not pinned here, so a 0.16.1 fix passes the release
 * workflow's `npm test` unchanged.
 *
 * The workflow used to push the version tag before `npm publish`. A publish
 * that failed then left the tag behind, the rerun found it and said "Nothing
 * to release", and the version never shipped without a hand-deleted tag. The
 * tag now follows the publish; nothing else in the workflow moved.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, stripComments } from './helpers/css.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');
const FIXTURE = join('tests', 'fixtures', 'kairos-design-0.14.0');

/** The export map of 0.14.0, as published. */
const EXPORTS_0_14 = {
  './tokens.css': './dist/tokens.css',
  './base.css': './dist/base.css',
  './kairos.css': './dist/kairos.css',
  './format/money': './dist/format/money.ts',
  './format/dates': './dist/format/dates.ts',
  './react': './dist/react/index.ts',
  './package.json': './package.json',
};

let packed;
/** The files `npm pack` would publish, sorted. Run once. */
function packedFiles() {
  if (!packed) {
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const out = execFileSync(npm, ['pack', '--dry-run', '--json', '--ignore-scripts'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      shell: process.platform === 'win32',
    });
    const [result] = JSON.parse(out);
    packed = result.files.map((f) => f.path).sort();
  }
  return packed;
}

/** A workflow's steps as text blocks, each with the comment lines above it. */
function steps(workflow) {
  const body = workflow.slice(workflow.indexOf('    steps:\n') + '    steps:\n'.length);
  return body
    .split(/\n(?=(?: {6}#[^\n]*\n)* {6}- )/)
    .map((block) => block.replace(/\s+$/, ''))
    .filter(Boolean);
}

const header = (workflow) => workflow.slice(0, workflow.indexOf('    steps:\n'));
const stepName = (block) => block.match(/^ {6}- name: (.+)$/m)?.[1];
const TAG_STEP = 'Create and push the version tag';

test('brand.css is exported and every 0.14 export is unchanged', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.exports['./brand.css'], './dist/brand.css');
  for (const [key, target] of Object.entries(EXPORTS_0_14)) {
    assert.equal(pkg.exports[key], target, `export ${key} is unchanged`);
  }
  assert.deepEqual(
    Object.keys(pkg.exports).sort(),
    [...Object.keys(EXPORTS_0_14), './brand.css'].sort(),
    'the exports are 0.14\'s plus ./brand.css'
  );
});

test("the packed files are 0.14's plus AccountMenu (0.15.0) and brand.css", () => {
  const before = read(FIXTURE, 'files.txt').split('\n').map((l) => l.trim()).filter(Boolean);
  assert.equal(before.length, 42, 'the 0.14.0 fixture lists its 42 packed files');
  const expected = [...before, 'dist/brand.css', 'dist/react/AccountMenu.tsx'].sort();
  const actual = packedFiles();
  assert.deepEqual(actual, expected);
  assert.equal(actual.length, 44);
  const strays = actual.filter((path) => /^(tests|stories|\.storybook|openspec|docs\/adr)\//.test(path));
  assert.deepEqual(strays, [], 'no test, story, workshop, plan or ADR file ships');
});

test('no font file, @font-face or font URL ships', () => {
  const fonts = packedFiles().filter((path) => /\.(woff2?|ttf|otf|eot)$/i.test(path));
  assert.deepEqual(fonts, [], 'no font file in the tarball');

  const stylesheets = [];
  const walk = (dir) => {
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.css')) stylesheets.push(path);
    }
  };
  walk('dist');
  assert.ok(stylesheets.includes(join('dist', 'brand.css')), 'brand.css is among the stylesheets read');
  for (const path of stylesheets) {
    const source = read(path);
    assert.doesNotMatch(source, /@font-face/i, `${path} holds no @font-face`);
    assert.doesNotMatch(source, /url\(/i, `${path} holds no url(`);
  }
});

test('the tag is pushed only after the publish step', () => {
  const blocks = steps(read('.github', 'workflows', 'publish.yml'));
  const names = blocks.map(stepName);
  const publish = names.indexOf('Publish');
  const tag = names.indexOf(TAG_STEP);
  assert.ok(publish !== -1 && tag !== -1, 'both steps exist');
  assert.ok(publish < tag, 'Publish runs before the tag is pushed');
  assert.match(blocks[tag], /^ {8}if: steps\.release\.outputs\.create_tag == 'true'$/m, 'the tag step still runs only when create_tag is true');
  assert.match(blocks[publish], /^ {8}run: npm publish --access public$/m);
});

test("the release workflow differs from 0.14's only in step order", () => {
  const now = read('.github', 'workflows', 'publish.yml');
  const then = read(FIXTURE, 'publish.yml');
  assert.equal(header(now), header(then), 'everything above the steps is unchanged');

  const a = steps(now);
  const b = steps(then);
  assert.deepEqual([...a].sort(), [...b].sort(), 'the same steps with the same content');

  // Take the tag step out of both and the order is identical: it is the only
  // step that moved.
  const without = (list) => list.filter((block) => stepName(block) !== TAG_STEP);
  assert.deepEqual(without(a), without(b));
  assert.notDeepEqual(a.map(stepName), b.map(stepName), 'the tag step did move');
});

test('the docs describe 0.16.0', () => {
  const adoption = read('docs', 'adoption.md');
  const start = adoption.search(/^#+ .*Upgrading to 0\.16\.0.*$/m);
  assert.notEqual(start, -1, 'docs/adoption.md has an "Upgrading to 0.16.0" heading');
  const level = adoption.slice(start).match(/^#+/)[0].length;
  const rest = adoption.slice(start).split('\n').slice(1).join('\n');
  const end = rest.search(new RegExp(`^#{1,${level}} `, 'm'));
  const section = end === -1 ? rest : rest.slice(0, end);
  for (const needle of ['Archivo', 'Courier Prime', 'brand.css', 'data-scale="brand"', '--kairos-display', '--kairos-body', '--kairos-mono']) {
    assert.ok(section.includes(needle), `the upgrade section names ${needle}`);
  }

  assert.match(read('docs', 'decisions.md'), /^#+ .*0\.16\.0.*$/m, 'docs/decisions.md has a 0.16.0 heading');

});

test('every name the website reads is still declared', () => {
  const names = read('tests', 'fixtures', 'website-reads.txt')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  assert.ok(names.length > 100, 'the fixture lists the names the website reads');

  const classes = new Set([...stripComments(read('dist', 'kairos.css')).matchAll(/\.(kairos-[a-z0-9_-]+)/g)].map((m) => m[1]));
  const tokens = new Set(
    [...parse(read('dist', 'tokens.css')), ...parse(read('dist', 'brand.css'))].filter((d) => d.prop.startsWith('--')).map((d) => d.prop),
  );
  const missing = names.filter((name) => (name.startsWith('--') ? !tokens.has(name) : !classes.has(name)));
  assert.deepEqual(missing, [], `the website reads names the package no longer declares: ${missing.join(', ')}`);
});

test('the docs describe 0.18.0', () => {
  const adoption = read('docs', 'adoption.md');
  const start = adoption.search(/^#+ .*Upgrading to 0\.18\.0.*$/m);
  assert.notEqual(start, -1, 'docs/adoption.md has an "Upgrading to 0.18.0" heading');
  const level = adoption.slice(start).match(/^#+/)[0].length;
  const rest = adoption.slice(start).split('\n').slice(1).join('\n');
  const end = rest.search(new RegExp(`^#{1,${level}} `, 'm'));
  const section = end === -1 ? rest : rest.slice(0, end);
  for (const needle of [
    'Epilogue',
    'Courier Prime',
    'next/font',
    '--kairos-display',
    '--kairos-body',
    '--kairos-mono',
    '-stretch',
    'kairos-type-title--compact',
    'kairos-type-card',
    'kairos-type-time',
    'kairos-text-link-text',
  ]) {
    assert.ok(section.includes(needle), `the upgrade section names ${needle}`);
  }

  assert.match(read('docs', 'decisions.md'), /^#+ .*0\.18\.0.*$/m, 'docs/decisions.md has a 0.18.0 heading');

  const readme = read('README.md');
  const fonts = readme.slice(readme.search(/^#+ Fonts$/m));
  assert.match(fonts.slice(0, fonts.search(/\n#+ (?!Fonts)/)), /Epilogue/, "README's Fonts section names Epilogue");

  // Both stylesheet headers name the brief's version, and not the first one.
  for (const file of ['tokens.css', 'brand.css']) {
    const source = read('dist', file);
    const header = source.slice(0, source.indexOf('*/') + 2).replace(/\s+/g, ' ');
    assert.match(header, /Kairos design brief v3/, `${file} header names brief v3`);
    assert.doesNotMatch(header, /brief v1/, `${file} header does not name brief v1`);
    assert.doesNotMatch(header, /visual-spec\.md/, `${file} header does not name the old visual spec`);
  }
});

test('the docs tell apps to load Epilogue', () => {
  const adoption = read('docs', 'adoption.md');
  const start = adoption.search(/^#+ .*Upgrading to 0\.18\.0.*$/m);
  assert.notEqual(start, -1, 'docs/adoption.md has an "Upgrading to 0.18.0" heading');
  const level = adoption.slice(start).match(/^#+/)[0].length;
  const rest = adoption.slice(start).split('\n').slice(1).join('\n');
  const end = rest.search(new RegExp(`^#{1,${level}} `, 'm'));
  const section = end === -1 ? rest : rest.slice(0, end);
  for (const needle of ['Epilogue', '100 900', 'Courier Prime', ':root', 'Archivo']) {
    assert.ok(section.includes(needle), `the upgrade section names ${needle}`);
  }

  const decisions = read('docs', 'decisions.md');
  const heading = decisions.search(/^#+ .*0\.18\.0.*$/m);
  assert.notEqual(heading, -1, 'docs/decisions.md has a 0.18.0 heading');
  const entry = decisions.slice(heading).split('\n').slice(1).join('\n');
  const next = entry.search(/^## /m);
  const text = next === -1 ? entry : entry.slice(0, next);
  assert.ok(text.includes('font-stretch'), 'the entry names font-stretch');
  assert.ok(text.includes('Epilogue'), 'the entry names Epilogue');
});
