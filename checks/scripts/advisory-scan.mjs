#!/usr/bin/env node
// Scan package-lock.json for the eight packages on the stack-watch advisory
// list of 11 Nov 2026. Plain Node, no dependency. Exits 1 and names every
// lockfile path inside a vulnerable range; exits 0 when none remains.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const lockPath = resolve(process.argv[2] ?? 'package-lock.json');

// Each rule: package name, lower bound (inclusive), upper bound and whether
// the upper bound is inclusive. Ranges as written in tasks.md 1.2.
const RULES = [
  { name: 'storybook', range: '>=10.0.0 <10.6.2', min: '10.0.0', max: '10.6.2', maxInclusive: false },
  { name: '@storybook/addon-vitest', range: '>=10.0.0 <10.6.2', min: '10.0.0', max: '10.6.2', maxInclusive: false },
  { name: 'vite', range: '>=7.0.0 <=7.3.6', min: '7.0.0', max: '7.3.6', maxInclusive: true },
  { name: 'brace-expansion', range: '>=4.0.0 <5.0.12', min: '4.0.0', max: '5.0.12', maxInclusive: false },
  { name: 'source-map-js', range: '>=1.0.0 <1.2.2', min: '1.0.0', max: '1.2.2', maxInclusive: false },
  { name: '@vitest/mocker', range: '>=2.1.0-beta.7 <4.1.12', min: '2.1.0-beta.7', max: '4.1.12', maxInclusive: false },
  { name: 'glob', range: '>=9.0.0 <=14.0.1', min: '9.0.0', max: '14.0.1', maxInclusive: true },
  { name: 'minimatch', range: '>=7.0.0 <11.0.1', min: '7.0.0', max: '11.0.1', maxInclusive: false },
];

// Minimal semver compare: major.minor.patch, then prerelease (a version with a
// prerelease sorts before the same version without one).
function parse(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?/.exec(v);
  if (!m) throw new Error(`not a semver version: ${v}`);
  return { nums: [Number(m[1]), Number(m[2]), Number(m[3])], pre: m[4] ? m[4].split('.') : [] };
}
function cmp(a, b) {
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) if (pa.nums[i] !== pb.nums[i]) return pa.nums[i] < pb.nums[i] ? -1 : 1;
  if (!pa.pre.length && !pb.pre.length) return 0;
  if (!pa.pre.length) return 1;
  if (!pb.pre.length) return -1;
  for (let i = 0; i < Math.max(pa.pre.length, pb.pre.length); i++) {
    const x = pa.pre[i];
    const y = pb.pre[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    const nx = /^\d+$/.test(x);
    const ny = /^\d+$/.test(y);
    if (nx && ny && Number(x) !== Number(y)) return Number(x) < Number(y) ? -1 : 1;
    if (nx !== ny) return nx ? -1 : 1;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}
function inRange(version, rule) {
  if (cmp(version, rule.min) < 0) return false;
  const c = cmp(version, rule.max);
  return rule.maxInclusive ? c <= 0 : c < 0;
}

const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
const packages = lock.packages ?? {};
const hits = [];
const seen = new Map(RULES.map((r) => [r.name, []]));

for (const [path, entry] of Object.entries(packages)) {
  if (!path) continue; // the root project
  const idx = path.lastIndexOf('node_modules/');
  if (idx === -1) continue; // workspace links etc.
  const name = entry.name ?? path.slice(idx + 'node_modules/'.length);
  const rule = RULES.find((r) => r.name === name);
  if (!rule || !entry.version) continue;
  seen.get(name).push(`${path}@${entry.version}`);
  if (inRange(entry.version, rule)) hits.push({ path, name, version: entry.version, range: rule.range });
}

console.log(`advisory-scan: ${lockPath}`);
for (const rule of RULES) {
  const copies = seen.get(rule.name);
  console.log(`  ${rule.name} (vulnerable ${rule.range}): ${copies.length ? copies.join(', ') : 'not installed'}`);
}
if (hits.length) {
  console.log(`\nFAIL: ${hits.length} lockfile entr${hits.length === 1 ? 'y' : 'ies'} in a vulnerable range`);
  for (const h of hits) console.log(`  ${h.path} ${h.version} (vulnerable ${h.range})`);
  const names = [...new Set(hits.map((h) => h.name))];
  console.log(`packages: ${names.length} — ${names.join(', ')}`);
  process.exit(1);
}
console.log('\nOK: no lockfile entry in a vulnerable range');
