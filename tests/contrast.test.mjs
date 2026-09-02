/**
 * Contrast is a computed property, so compute it.
 *
 * Every contrast figure in `tokens.css` is written in a comment. A comment is
 * correct on the day it is written and silent every day after, which is how
 * `--kairos-border-subtle` drew the only boundary on two live controls at
 * 1.73:1 for three versions with the number 3:1 sitting four lines above it.
 *
 * This is deliberately not sampled from a rendering. Sampling catches
 * composition failures a token pair cannot predict and needs a browser;
 * computing from the token file is cheap, deterministic, and catches the class
 * of failure that actually happened. Sampling is the better test and the worse
 * first test. Where a composition is reachable and no story builds it, the
 * pair is named here by hand.
 *
 * What the workshop's axe gate does NOT cover, which is why this file exists
 * alongside it: axe ships exactly one enabled contrast rule, `color-contrast`,
 * and it is WCAG 1.4.3 — text on its background. There is no axe rule for
 * 1.4.11 non-text contrast, so a border, a control edge, a focus ring and a
 * chip outline are all invisible to it at any ratio. Every non-text pair below
 * is here because nothing else in this repo can see it.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = readFileSync(join(ROOT, 'dist', 'tokens.css'), 'utf8');

/**
 * The two theme blocks, read separately. A pair that clears in light and fails
 * in dark is the failure this system is most likely to produce, because dark
 * is a token swap and nothing else — so every assertion below runs twice.
 *
 * `:root` opens the light block and `[data-theme='dark']` opens the dark one.
 * The theme-independent block at the foot of the file is a second `:root` and
 * holds no colour, so light is everything before the dark selector.
 */
function themeBlocks() {
  const darkAt = tokens.search(/\[data-theme=['"]dark['"]\]/);
  assert.ok(darkAt > 0, 'tokens.css should have a dark block');
  return { light: tokens.slice(0, darkAt), dark: tokens.slice(darkAt) };
}

const BLOCKS = themeBlocks();

/** Every token declared in one theme block, with comments already stripped. */
function declarations(block) {
  const map = new Map();
  for (const [, name, value] of block
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .matchAll(/(--kairos-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    map.set(name, value.trim());
  }
  return map;
}

/**
 * The colour a token resolves to in a theme, following `var()` aliases. The
 * dark block only redeclares what changes, so anything it does not name falls
 * back to the light value — which is exactly how the cascade delivers it to a
 * browser, and exactly the case a per-block lookup would get wrong.
 */
function colour(theme, name) {
  const own = declarations(BLOCKS[theme]);
  const base = declarations(BLOCKS.light);
  const seen = new Set();
  let value = own.get(name) ?? base.get(name);
  while (value && /^var\(/.test(value)) {
    const [, alias] = value.match(/^var\((--kairos-[a-z0-9-]+)/) ?? [];
    assert.ok(alias && !seen.has(alias), `${name} does not resolve to a colour in ${theme}`);
    seen.add(alias);
    value = own.get(alias) ?? base.get(alias);
  }
  assert.ok(value, `${name} is not declared in either theme`);
  return value;
}

/** sRGB channels 0–1. Hex only: the token layer has no other colour syntax. */
function channels(value) {
  const hex = value.trim().replace('#', '');
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  assert.match(full, /^[0-9a-f]{6}$/i, `${value} is not a plain hex colour`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
}

/** WCAG 2.x relative luminance. */
function luminance(value) {
  const [r, g, b] = channels(value).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, unrounded. */
function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The ratio of two tokens in one theme, by name, unrounded.
 *
 * A floor is compared against this and never against a rounded figure. The
 * first candidate written for `--kairos-accent-on-light` measured 4.4988 and
 * displayed as 4.50, which is a value that fails WCAG and passes a test that
 * rounds first. Round for a person to read, not for a comparison.
 */
function pair(theme, fg, bg) {
  return ratio(colour(theme, fg), colour(theme, bg));
}

/** Two decimals, which is how every figure in `tokens.css` is written. */
function quoted(theme, fg, bg) {
  return Math.round(pair(theme, fg, bg) * 100) / 100;
}

const THEMES = ['light', 'dark'];

/** WCAG 1.4.3 for body-sized text. */
const TEXT_FLOOR = 4.5;
/** WCAG 1.4.11 for a control boundary or any other non-text signal. */
const NON_TEXT_FLOOR = 3;

const GROUNDS = ['--kairos-bg', '--kairos-surface', '--kairos-elevated'];

test('every text rank clears 4.5:1 on every ground it can sit on', () => {
  // `--kairos-sidebar` holds the same value as `--kairos-elevated` in both
  // themes, so it adds a name and no case.
  const ranks = ['--kairos-text', '--kairos-text-2', '--kairos-text-muted'];
  const failures = [];
  for (const theme of THEMES) {
    for (const rank of ranks) {
      for (const ground of GROUNDS) {
        const value = pair(theme, rank, ground);
        if (value < TEXT_FLOOR) failures.push(`${theme}: ${rank} on ${ground} is ${value.toFixed(2)}`);
      }
    }
  }
  assert.deepEqual(failures, [], `text below 4.5:1:\n${failures.join('\n')}`);
});

test('a control boundary clears 3:1 on every ground it can sit on', () => {
  // The assertion handed over by the remediation change. `--kairos-border-subtle`
  // draws the only edge `.kairos-overflow-trigger` and `.kairos-segmented-option`
  // have at rest, so it is a non-text contrast surface and not a decorative
  // tint. It measured 1.73 / 1.82 / 1.49 in light and 3.04 / 2.75 / 2.45 in
  // dark before that change moved it.
  const failures = [];
  for (const theme of THEMES) {
    for (const ground of GROUNDS) {
      const value = pair(theme, '--kairos-border-subtle', ground);
      if (value < NON_TEXT_FLOOR) {
        failures.push(`${theme}: --kairos-border-subtle on ${ground} is ${value.toFixed(2)}`);
      }
    }
  }
  assert.deepEqual(failures, [], `control boundary below 3:1:\n${failures.join('\n')}`);
});

test('the figures written in tokens.css are the figures', () => {
  // Every number a comment in that file asserts. A mismatch here is a finding
  // about the comment, not about the test: the comment is what a person reads
  // before deciding a value is safe to reuse.
  assert.equal(quoted('light', '--kairos-accent', '--kairos-bg'), 1.52);
  assert.equal(quoted('light', '--kairos-accent', '--kairos-text'), 11.67);
  assert.equal(quoted('light', '--kairos-border-subtle', '--kairos-bg'), 3.52);
  assert.equal(quoted('light', '--kairos-border-subtle', '--kairos-surface'), 3.72);
  assert.equal(quoted('light', '--kairos-border-subtle', '--kairos-elevated'), 3.04);
  assert.equal(quoted('dark', '--kairos-border-subtle', '--kairos-bg'), 3.77);
  assert.equal(quoted('dark', '--kairos-border-subtle', '--kairos-surface'), 3.41);
  assert.equal(quoted('dark', '--kairos-border-subtle', '--kairos-elevated'), 3.04);
  assert.equal(quoted('light', '--kairos-accent-text', '--kairos-accent-disabled'), 13.17);
  assert.equal(quoted('dark', '--kairos-accent-text', '--kairos-accent-disabled'), 6.26);
});

test('a state chip reads against its own tint', () => {
  // Every chip carries a border, a label and a tint, and the label is text, so
  // the pair owes 4.5:1. This is the set most likely to drift, because a chip
  // colour is picked to look right beside the other three rather than against
  // the ground behind it.
  const STATES = ['settled', 'overdue', 'awaiting', 'draft'];
  const failures = [];
  for (const theme of THEMES) {
    for (const state of STATES) {
      const value = pair(theme, `--kairos-state-${state}`, `--kairos-state-${state}-tint`);
      if (value < TEXT_FLOOR) failures.push(`${theme}: ${state} chip is ${value.toFixed(2)}`);
    }
  }
  assert.deepEqual(failures, [], `chip label below 4.5:1:\n${failures.join('\n')}`);
});

test('a filled control reads against its own fill', () => {
  // Each of these is a background and the label written on it, paired in the
  // token layer rather than composed by a rule, so a drift in one half is
  // invisible at the call site.
  const PAIRS = [
    ['--kairos-accent-text', '--kairos-accent'],
    ['--kairos-accent-text', '--kairos-accent-hover'],
    ['--kairos-accent-text', '--kairos-accent-disabled'],
    ['--kairos-danger-solid-fg', '--kairos-danger-solid'],
    ['--kairos-danger-solid-fg', '--kairos-danger-solid-hover'],
    ['--kairos-invert-fg', '--kairos-invert-bg'],
  ];
  const failures = [];
  for (const theme of THEMES) {
    for (const [fg, bg] of PAIRS) {
      const value = pair(theme, fg, bg);
      if (value < TEXT_FLOOR) failures.push(`${theme}: ${fg} on ${bg} is ${value.toFixed(2)}`);
    }
  }
  assert.deepEqual(failures, [], `label below 4.5:1 on its own fill:\n${failures.join('\n')}`);
});

test('amber text reads on every ground a card can set', () => {
  // `.kairos-button--tertiary` takes `--kairos-accent-on-light` for its label
  // and `.kairos-card` sets an elevated ground, so a tertiary button in a card
  // is a composition three apps can build and no story does. It measured
  // 3.97:1 against a 4.5:1 requirement.
  const failures = [];
  for (const theme of THEMES) {
    for (const ground of GROUNDS) {
      const value = pair(theme, '--kairos-accent-on-light', ground);
      if (value < TEXT_FLOOR) {
        failures.push(`${theme}: --kairos-accent-on-light on ${ground} is ${value.toFixed(2)}`);
      }
    }
  }
  assert.deepEqual(failures, [], `amber text below 4.5:1:\n${failures.join('\n')}`);
});

test('the focus ring is findable on every ground', () => {
  // WCAG 2.2 SC 1.4.11. The ink ring carries the contrast and the amber inner
  // ring says which brand drew it, so the ink one is the one with a floor.
  const failures = [];
  for (const theme of THEMES) {
    for (const ground of GROUNDS) {
      const value = pair(theme, '--kairos-focus', ground);
      if (value < NON_TEXT_FLOOR) failures.push(`${theme}: --kairos-focus on ${ground} is ${value.toFixed(2)}`);
    }
  }
  assert.deepEqual(failures, [], `focus ring below 3:1:\n${failures.join('\n')}`);
});
