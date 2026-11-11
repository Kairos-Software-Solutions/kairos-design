#!/usr/bin/env node
// Run the "Prepare the release" step of .github/workflows/publish.yml locally,
// as a push to main would, and check it decides not to publish or tag.
// The `run: |` block is extracted by indentation (no YAML library), run with
// bash in this repository (with its tags) using temporary GITHUB_OUTPUT and
// GITHUB_STEP_SUMMARY files. Writes checks/release-prepare.txt, ending with
// `git diff f565e34 --name-only -- .github` and its (expected empty) output.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';

const BASE = 'f565e34';
const STEP = 'Prepare the release';
const root = resolve(import.meta.dirname, '..', '..');
const workflow = join(root, '.github', 'workflows', 'publish.yml');
const outFile = join(root, 'checks', 'release-prepare.txt');
const lines = [];
const log = (s = '') => {
  lines.push(s);
  console.log(s);
};
const indent = (s) => s.length - s.trimStart().length;

function extractRun(text, stepName) {
  const src = text.split('\n');
  const start = src.findIndex((l) => l.trim() === `- name: ${stepName}`);
  if (start === -1) throw new Error(`step "${stepName}" not found`);
  const stepIndent = indent(src[start]);
  for (let i = start + 1; i < src.length; i++) {
    const l = src[i];
    if (l.trim() === '') continue;
    // Next step (same "- " indent) or anything shallower ends this step.
    if (indent(l) <= stepIndent) break;
    if (/^\s*run:\s*\|\s*$/.test(l)) {
      const keyIndent = indent(l);
      const body = [];
      for (let j = i + 1; j < src.length; j++) {
        const b = src[j];
        if (b.trim() !== '' && indent(b) <= keyIndent) break;
        body.push(b);
      }
      while (body.length && body[body.length - 1].trim() === '') body.pop();
      const blockIndent = Math.min(...body.filter((b) => b.trim()).map(indent));
      return body.map((b) => b.slice(blockIndent)).join('\n') + '\n';
    }
  }
  throw new Error(`step "${stepName}" has no "run: |" block`);
}

const script = extractRun(readFileSync(workflow, 'utf8'), STEP);
const scratch = mkdtempSync(join(tmpdir(), 'kairos-release-'));
let ok = true;
try {
  const output = join(scratch, 'github_output');
  const summary = join(scratch, 'github_step_summary');
  writeFileSync(output, '');
  writeFileSync(summary, '');
  const env = { ...process.env, GITHUB_REF_TYPE: 'branch', GITHUB_REF_NAME: 'main', GITHUB_OUTPUT: output, GITHUB_STEP_SUMMARY: summary };
  const res = spawnSync('bash', ['-c', script], { cwd: root, env, encoding: 'utf8' });

  log(`# "${STEP}" from .github/workflows/publish.yml, run with GITHUB_REF_TYPE=branch GITHUB_REF_NAME=main`);
  log(`# ${new Date().toISOString()}`);
  log('');
  log('--- extracted script ---');
  log(script.trimEnd());
  log('--- end script ---');
  log('');
  log(`exit code: ${res.status}`);
  if (res.stdout) log(`stdout: ${res.stdout.trimEnd()}`);
  if (res.stderr) log(`stderr: ${res.stderr.trimEnd()}`);
  const outText = readFileSync(output, 'utf8');
  const sumText = readFileSync(summary, 'utf8');
  log('');
  log('--- GITHUB_OUTPUT ---');
  log(outText.trimEnd());
  log('--- GITHUB_STEP_SUMMARY ---');
  log(sumText.trimEnd());
  log('');

  const outLines = outText.split('\n').filter(Boolean);
  const checks = [
    ['step exits 0', res.status === 0],
    ['GITHUB_OUTPUT has publish=false', outLines.includes('publish=false')],
    ['GITHUB_OUTPUT has create_tag=false', outLines.includes('create_tag=false')],
    ['GITHUB_OUTPUT has no publish=true / create_tag=true', !outLines.some((l) => l === 'publish=true' || l === 'create_tag=true')],
    ['summary says "v0.14.0 already exists. Nothing to release."', sumText.includes('v0.14.0 already exists. Nothing to release.')],
  ];

  const tags = execFileSync('git', ['tag', '--list', 'v0.14.0'], { cwd: root, encoding: 'utf8' });
  log('$ git tag --list v0.14.0');
  log(tags.trimEnd() || '(empty output)');
  checks.push(['git tag --list v0.14.0 prints v0.14.0', tags.trim() === 'v0.14.0']);
  log('');
  for (const [name, pass] of checks) {
    log(`${pass ? 'PASS' : 'FAIL'}: ${name}`);
    if (!pass) ok = false;
  }
  log('');

  const cmd = ['diff', BASE, '--name-only', '--', '.github'];
  const diff = execFileSync('git', cmd, { cwd: root, encoding: 'utf8' });
  log(`$ git ${cmd.join(' ')}`);
  log(diff.trimEnd() === '' ? '(empty output)' : diff.trimEnd());
  if (diff.trim() !== '') ok = false;
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

writeFileSync(outFile, lines.join('\n') + '\n');
console.log(`\n${ok ? 'OK' : 'FAIL'}: wrote ${relative(root, outFile)}`);
process.exit(ok ? 0 : 1);
