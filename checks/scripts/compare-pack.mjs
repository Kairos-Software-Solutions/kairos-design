#!/usr/bin/env node
// Prove the release surface is unchanged:
//  1. `npm pack` the working tree and `npm pack kairos-design@0.14.0` from the
//     registry, unpack both with tar, and compare the path lists and the
//     sha256 of every file except package/package.json.
//  2. Compare package.json with `git show f565e34:package.json`, ignoring only
//     devDependencies and overrides; dependencies must be absent in both.
//  3. Append `git diff f565e34 --name-only -- dist bin docs README.md` and its
//     output (must be empty).
// Writes checks/pack-compare.txt and exits 0 only when all three hold.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';

const BASE = 'f565e34';
const PUBLISHED = 'kairos-design@0.14.0';
const root = resolve(import.meta.dirname, '..', '..');
const outFile = join(root, 'checks', 'pack-compare.txt');
const lines = [];
const log = (s = '') => {
  lines.push(s);
  console.log(s);
};
let ok = true;

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: root, encoding: 'utf8', ...opts });

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}
function digest(dir) {
  const map = new Map();
  for (const file of walk(dir)) {
    map.set(relative(dir, file).split('\\').join('/'), createHash('sha256').update(readFileSync(file)).digest('hex'));
  }
  return map;
}
function packInto(spec, dest) {
  mkdirSync(dest, { recursive: true });
  const json = JSON.parse(run('npm', ['pack', spec, '--pack-destination', dest, '--json', '--ignore-scripts']));
  const tarball = join(dest, json[0].filename);
  const unpacked = join(dest, 'unpacked');
  mkdirSync(unpacked);
  run('tar', ['-xzf', tarball, '-C', unpacked]);
  return { tarball: json[0].filename, dir: unpacked };
}

const scratch = mkdtempSync(join(tmpdir(), 'kairos-pack-'));
try {
  // 1. packed contents
  const branch = packInto('.', join(scratch, 'branch'));
  const registry = packInto(PUBLISHED, join(scratch, 'registry'));
  log(`# Pack compare: working tree (${branch.tarball}) vs registry ${PUBLISHED} (${registry.tarball})`);
  log(`# ${new Date().toISOString()}`);
  log('');
  const a = digest(branch.dir);
  const b = digest(registry.dir);
  const paths = [...new Set([...a.keys(), ...b.keys()])].sort();
  for (const p of paths) {
    const ha = a.get(p);
    const hb = b.get(p);
    let verdict;
    if (!ha) verdict = 'ONLY IN REGISTRY';
    else if (!hb) verdict = 'ONLY IN BRANCH';
    else if (ha === hb) verdict = 'same';
    else if (p === 'package/package.json') verdict = 'differs (allowed: package.json, see manifest)';
    else verdict = 'DIFFERENT';
    if (verdict === 'ONLY IN REGISTRY' || verdict === 'ONLY IN BRANCH' || verdict === 'DIFFERENT') ok = false;
    log(`${p}  branch=${ha ?? '-'}  registry=${hb ?? '-'}  ${verdict}`);
  }
  log('');
  log(`files: branch ${a.size}, registry ${b.size}; path lists ${isDeepStrictEqual([...a.keys()].sort(), [...b.keys()].sort()) ? 'same' : 'DIFFERENT'}`);
  log('');

  // 2. manifest compare
  const ignored = ['devDependencies', 'overrides'];
  const strip = (m) => Object.fromEntries(Object.entries(m).filter(([k]) => !ignored.includes(k)));
  const now = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const then = JSON.parse(run('git', ['show', `${BASE}:package.json`]));
  const diffKeys = [...new Set([...Object.keys(strip(now)), ...Object.keys(strip(then))])].filter(
    (k) => !isDeepStrictEqual(now[k], then[k]),
  );
  if (now.dependencies !== undefined || then.dependencies !== undefined) {
    ok = false;
    log('manifest: DIFFERENT (dependencies is defined)');
  } else if (diffKeys.length) {
    ok = false;
    log(`manifest: DIFFERENT in ${diffKeys.join(', ')} (ignored ${ignored.join(', ')})`);
  } else {
    log(`manifest: same (ignored ${ignored.join(', ')})`);
  }
  log('');

  // 3. shipped sources untouched in git
  const cmd = ['diff', BASE, '--name-only', '--', 'dist', 'bin', 'docs', 'README.md'];
  const diff = run('git', cmd);
  log(`$ git ${cmd.join(' ')}`);
  log(diff.trimEnd() === '' ? '(empty output)' : diff.trimEnd());
  if (diff.trim() !== '') ok = false;
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

writeFileSync(outFile, lines.join('\n') + '\n');
console.log(`\n${ok ? 'OK' : 'FAIL'}: wrote ${relative(root, outFile)}`);
process.exit(ok ? 0 : 1);
