/**
 * One-shot provenance script for the initial `dist/kairos.css`.
 *
 * Paykit is the most complete Kairos implementation, so the shared vocabulary
 * starts as a port of its component layer. This script does the mechanical
 * part — lifting top-level rules, dropping Paykit's own domain classes, and
 * rewriting `--color-*` / `--k-*` onto the canonical `--kairos-*` names — and
 * prints what it dropped so the judgement calls stay visible in review.
 *
 * It is kept in the repo as the record of where each rule came from. It is not
 * part of the build: after this port, `dist/kairos.css` is the source and is
 * edited directly.
 *
 *   node scripts/extract-from-paykit.mjs <path-to-paykit-globals.css>
 */

import { readFileSync, writeFileSync } from 'node:fs';

const source = readFileSync(process.argv[2], 'utf8');

/* Paykit's own domain, not the shared vocabulary. Each of these is tied to a
   screen or a capability that only Paykit has. */
const APP_SPECIFIC = [
  'kairos-attention',        // dashboard "needs attention" panel
  'kairos-board',            // CRM pipeline board
  'kairos-control',          // the control plane, a Paykit-only surface
  'kairos-quote-response',   // the public quote-acceptance page
  'kairos-offline',          // Paykit's offline queue
  'kairos-submit-offline',
  'kairos-live-header',
  'kairos-freshness',
  'kairos-delivery-mark',
  'kairos-console',
  'document-item',            // the Paykit documents screen
  'document-items',
];

/* Blocks that belong to the token layer or to the host app, not to the
   component vocabulary. */
const NOT_A_COMPONENT = /^(@import|@theme|:root|\[data-theme|html|body|\*)/;


/* Canonical token names. Paykit reaches its tokens through Tailwind's
   `--color-*` aliases; the registry has no Tailwind, so every one is rewritten
   onto the `--kairos-*` name the visual spec specifies. */
const TOKENS = {
  '--color-bg': '--kairos-bg',
  '--color-surface': '--kairos-surface',
  '--color-raised': '--kairos-elevated',
  '--color-sidebar': '--kairos-sidebar',
  '--color-border': '--kairos-border',
  '--color-border-subtle': '--kairos-border-subtle',
  '--color-text-primary': '--kairos-text',
  '--color-text-secondary': '--kairos-text-2',
  '--color-text-tertiary': '--kairos-text-muted',
  '--color-text-on-dark': '--kairos-text-on-dark',
  '--color-accent': '--kairos-accent',
  '--color-accent-hover': '--kairos-accent-hover',
  '--color-accent-dim': '--kairos-accent-dim',
  '--color-accent-text': '--kairos-accent-text',
  '--color-accent-on-light': '--kairos-accent-on-light',
  '--color-invert-bg': '--kairos-invert-bg',
  '--color-invert-fg': '--kairos-invert-fg',
  '--color-focus': '--kairos-focus',
  '--color-focus-inner': '--kairos-focus-inner',
  '--color-settled': '--kairos-state-settled',
  '--color-settled-tint': '--kairos-state-settled-tint',
  '--color-overdue': '--kairos-state-overdue',
  '--color-overdue-tint': '--kairos-state-overdue-tint',
  '--color-awaiting': '--kairos-state-awaiting',
  '--color-awaiting-tint': '--kairos-state-awaiting-tint',
  '--color-draft': '--kairos-state-draft',
  '--color-draft-tint': '--kairos-state-draft-tint',
  '--color-success': '--kairos-state-settled',
  '--color-success-dim': '--kairos-state-settled-tint',
  '--color-warning': '--kairos-state-awaiting',
  '--color-warning-dim': '--kairos-state-awaiting-tint',
  '--color-danger': '--kairos-state-overdue',
  '--color-danger-dim': '--kairos-state-overdue-tint',
  '--color-danger-solid': '--kairos-danger-solid',
  '--color-danger-solid-fg': '--kairos-danger-solid-fg',
  '--color-danger-solid-hover': '--kairos-danger-solid-hover',
  '--color-row-hover': '--kairos-row-hover',
  '--color-row-selected': '--kairos-row-selected',
  '--color-row-stripe': '--kairos-row-stripe',
  '--color-skeleton-bg': '--kairos-skeleton-bg',
  '--color-skeleton-fg': '--kairos-skeleton-fg',
  '--color-overlay': '--kairos-overlay',
  '--color-shadow': '--kairos-shadow-color',
  '--font-sans': '--kairos-body',
  '--font-display': '--kairos-display',
  '--font-mono': '--kairos-mono',
  '--radius-sm': '--kairos-radius-input',
  '--radius-panel': '--kairos-radius-panel',
  '--control-height': '--kairos-control-h',
  '--row-height': '--kairos-row-h',
  '--nav-row-height': '--kairos-nav-row-h',
  '--shadow-button': '--kairos-shadow',
  '--shadow-card': '--kairos-shadow-card',
  '--shadow-large': '--kairos-shadow-lg',

  /* Three variables Paykit references but never defines. Each one silently
     invalidates its declaration in the shipped app; see docs/decisions.md.
     They are mapped onto the token that was clearly intended. */
  '--color-accent-strong': '--kairos-accent-on-light',
  '--color-border-strong': '--kairos-border',
  '--touch-target': '--kairos-control-h-touch',
};

/* Canonical class names, per docs/decisions.md. */
const CLASSES = {
  'kairos-table-sort': 'kairos-sort-header',
  'kairos-scroll-x': 'kairos-table-wrap',

  // Roles where the skill's Canonical Component Set names it and Paykit does
  // not. Renamed here rather than aliased, because nothing consumes the
  // registry yet: the cost is zero now and lands on the apps either way.
  'kairos-filter-form': 'kairos-filter-bar',
  'kairos-filter-form__action': 'kairos-filter-bar-action',
  'kairos-filter-search': 'kairos-filter-bar-search',
  'kairos-stat': 'kairos-metric',
  'kairos-stat-row': 'kairos-metric-row',
  'kairos-stat-value': 'kairos-metric-value',
  'kairos-stat-label': 'kairos-metric-label',
  'kairos-steps': 'kairos-wizard-steps',
  'kairos-steps-list': 'kairos-wizard-steps-list',
  'kairos-step': 'kairos-wizard-step',
  'kairos-step-marker': 'kairos-wizard-step-marker',
  'kairos-disclose': 'kairos-collapsible-card',
  'kairos-disclose-summary': 'kairos-collapsible-card-summary',
  'kairos-disclose-body': 'kairos-collapsible-card-body',

  // Unprefixed classes. Everything the registry ships carries the prefix, or
  // it collides with the host app the first time one is installed.
  'icon-action': 'kairos-icon-action',
  'icon-action--accent': 'kairos-icon-action--accent',
  'icon-action--danger': 'kairos-icon-action--danger',
  'motion-fade-in': 'kairos-motion-fade-in',
  'motion-fade-up': 'kairos-motion-fade-up',
  'motion-slide-in-right': 'kairos-motion-slide-in-right',
  'skip-link': 'kairos-skip-link',
  'spin': 'kairos-spin',
};

/* `.tabular` is Paykit's unprefixed alias for `.kairos-figure`. One name for
   tabular numerals, not two. */
const DROP_SELECTOR = /^\.tabular\b/;

/* Roles that could not be ported mechanically and are written by hand in
   `dist/kairos.css` instead. Paykit's `kairos-notice` (an inline left-rule
   note) and `kairos-callout` (a bordered box) are two shapes of the one
   `kairos-banner` role the other apps ship, so they merge into a base plus an
   `--inline` modifier rather than into two rules of the same name. */
const HAND_AUTHORED = ['kairos-notice', 'kairos-callout'];

/** Split CSS into top-level blocks, respecting nesting and strings. */
function topLevelBlocks(css) {
  const blocks = [];
  let depth = 0;
  let start = 0;
  let inComment = false;
  let inString = null;

  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    const next = css[i + 1];

    if (inComment) {
      if (c === '*' && next === '/') { inComment = false; i++; }
      continue;
    }
    if (inString) {
      if (c === '\\') { i++; continue; }
      if (c === inString) inString = null;
      continue;
    }
    if (c === '/' && next === '*') { inComment = true; i++; continue; }
    if (c === '"' || c === "'") { inString = c; continue; }

    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        blocks.push(css.slice(start, i + 1).trim());
        start = i + 1;
      }
    } else if (c === ';' && depth === 0) {
      blocks.push(css.slice(start, i + 1).trim());
      start = i + 1;
    }
  }
  return blocks.filter(Boolean);
}

/** The selector or at-rule prelude of a block, comments stripped. */
function prelude(block) {
  const brace = block.indexOf('{');
  return (brace === -1 ? block : block.slice(0, brace))
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();
}

function rewrite(css) {
  let out = css;
  for (const [from, to] of Object.entries(TOKENS)) {
    out = out.replaceAll(new RegExp(`(?<![\\w-])${from}(?![\\w-])`, 'g'), to);
  }
  for (const [from, to] of Object.entries(CLASSES)) {
    out = out.replaceAll(new RegExp(`(?<![\\w-])${from}(?![\\w-])`, 'g'), to);
  }
  /* Paykit writes BEM elements both ways: `kairos-page-header-primary` in the
     older rules and `kairos-record-card__meta` in the newer ones. The skill's
     naming convention documents the single-dash form, so that is the one the
     registry ships. Two of these merge onto names Uptime already uses. */
  out = out.replaceAll(/(?<=kairos-[a-z0-9-]*)__(?=[a-z0-9-])/g, '-');
  return out;
}

const kept = [];
const dropped = [];

/**
 * Keep or drop one block. At-rules are recursed into rather than judged whole:
 * the token layer reappears inside `@media (prefers-color-scheme: dark)` and
 * inside `@media print`, and a filter that only reads the outer prelude ships
 * both of them into the component file.
 */
function filterBlock(block) {
  const sel = prelude(block);

  if (sel.startsWith('@')) {
    // Conditional group rules have a nested rule list; everything else
    // (@font-face, @property, @charset) does not.
    if (!/^@(media|supports|layer|container)\b/.test(sel)) {
      return NOT_A_COMPONENT.test(sel) ? null : block;
    }
    const open = block.indexOf('{');
    const inner = block.slice(open + 1, block.lastIndexOf('}'));
    const survivors = topLevelBlocks(inner).map(filterBlock).filter(Boolean);
    if (!survivors.length) {
      dropped.push([sel.slice(0, 70), 'every nested rule dropped']);
      return null;
    }
    return `${sel} {\n${survivors.join('\n\n').replace(/^/gm, '  ')}\n}`;
  }

  if (NOT_A_COMPONENT.test(sel)) {
    dropped.push([sel.slice(0, 70), 'token layer or host reset']);
    return null;
  }
  if (DROP_SELECTOR.test(sel)) {
    dropped.push([sel.slice(0, 70), 'unprefixed alias of a kairos- class']);
    return null;
  }
  const hit = APP_SPECIFIC.find((p) => block.includes(p));
  if (hit) {
    dropped.push([sel.slice(0, 70), `Paykit domain: ${hit}`]);
    return null;
  }
  const hand = HAND_AUTHORED.find((p) => sel.includes(p));
  if (hand) {
    dropped.push([sel.slice(0, 70), `merged by hand: ${hand}`]);
    return null;
  }
  return block;
}

for (const block of topLevelBlocks(source)) {
  const survivor = filterBlock(block);
  if (survivor) kept.push(rewrite(survivor));
}

/* Any remaining `--color-*` or `--k-*` is a token the map does not cover, and
   would ship as a dangling reference. Fail loudly rather than emit it. */
const orphans = [...new Set(
  (kept.join('\n').match(/--(?:color|k)-[a-z0-9-]+/g) ?? [])
)];
if (orphans.length) {
  console.error('Unmapped tokens still present:\n  ' + orphans.join('\n  '));
  process.exit(1);
}

/* Two output files. Rules that style bare elements are a base layer, and a
   library that restyles `table` and `input` in a host app it was merely added
   to is invasive. An app opts into base.css; kairos.css only ever touches
   elements carrying a `kairos-` class. */
/* `@keyframes` ships with the components, not with the base layer. The
   skeleton, the collapsible card, and the motion utilities all reference one
   by name, and an app that took kairos.css without base.css would get a
   component whose animation silently does not exist. */
const isComponent = (b) => b.includes('kairos-') || /^@keyframes\b/.test(prelude(b));
const components = kept.filter(isComponent);
const base = kept.filter((b) => !isComponent(b));

console.error(`kept ${kept.length} blocks (${components.length} component, ${base.length} base), dropped ${dropped.length}`);
for (const [sel, why] of dropped) console.error(`  drop  ${sel}  (${why})`);

writeFileSync(process.argv[3] ?? '/dev/stdout', components.join('\n\n') + '\n');
if (process.argv[4]) writeFileSync(process.argv[4], base.join('\n\n') + '\n');
