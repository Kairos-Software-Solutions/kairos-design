import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(ROOT, 'dist', 'react', 'theme.tsx'), 'utf8');
const query = '(prefers-color-scheme: dark)';

function compiledApplyTheme() {
  const match = source.match(
    /export function applyTheme\(theme: ThemePreference\): void \{([\s\S]*?)\n\}/
  );
  assert.ok(match, 'applyTheme was found');

  const body = match[1].replaceAll('SYSTEM_THEME_QUERY', JSON.stringify(query));
  return new Function('theme', 'window', 'document', body);
}

function compiledInitScript(storageKey = 'test.theme') {
  const match = source.match(
    /export function themeInitScript\(\): string \{\s*return `([\s\S]*?)`;\s*\}/
  );
  assert.ok(match, 'themeInitScript was found');

  return match[1]
    .replaceAll('${JSON.stringify(SYSTEM_THEME_QUERY)}', JSON.stringify(query))
    .replaceAll('${JSON.stringify(storageKey)}', JSON.stringify(storageKey));
}

function browser({ stored = 'system', dark = false } = {}) {
  const document = { documentElement: { dataset: {} } };
  const mediaListeners = new Set();
  const storageListeners = new Set();
  const media = {
    matches: dark,
    addEventListener(type, listener) {
      if (type === 'change') mediaListeners.add(listener);
    },
  };
  const localStorage = {
    getItem() {
      return stored;
    },
  };
  const window = {
    matchMedia(value) {
      assert.equal(value, query);
      return media;
    },
    addEventListener(type, listener) {
      if (type === 'storage') storageListeners.add(listener);
    },
  };

  return {
    document,
    localStorage,
    media,
    window,
    setStored(value) {
      stored = value;
    },
    changeSystemTheme(value) {
      media.matches = value;
      for (const listener of mediaListeners) listener();
    },
    sendStorageEvent() {
      for (const listener of storageListeners) listener();
    },
  };
}

test('applyTheme resolves System through the device preference', () => {
  const applyTheme = compiledApplyTheme();
  const darkBrowser = browser({ dark: true });
  const lightBrowser = browser({ dark: false });

  applyTheme('system', darkBrowser.window, darkBrowser.document);
  applyTheme('system', lightBrowser.window, lightBrowser.document);

  assert.equal(darkBrowser.document.documentElement.dataset.theme, 'dark');
  assert.equal(lightBrowser.document.documentElement.dataset.theme, 'light');
});

test('applyTheme keeps an explicit preference ahead of the device', () => {
  const applyTheme = compiledApplyTheme();
  const darkBrowser = browser({ dark: true });
  const lightBrowser = browser({ dark: false });

  applyTheme('light', darkBrowser.window, darkBrowser.document);
  applyTheme('dark', lightBrowser.window, lightBrowser.document);

  assert.equal(darkBrowser.document.documentElement.dataset.theme, 'light');
  assert.equal(lightBrowser.document.documentElement.dataset.theme, 'dark');
});

test('the pre-paint script resolves System and follows later device changes', () => {
  const context = browser({ stored: 'system', dark: true });
  const run = new Function('window', 'document', 'localStorage', compiledInitScript());

  run(context.window, context.document, context.localStorage);
  assert.equal(context.document.documentElement.dataset.theme, 'dark');

  context.changeSystemTheme(false);
  assert.equal(context.document.documentElement.dataset.theme, 'light');
});

test('the pre-paint script keeps explicit choices and follows cross-tab changes', () => {
  const context = browser({ stored: 'light', dark: true });
  const run = new Function('window', 'document', 'localStorage', compiledInitScript());

  run(context.window, context.document, context.localStorage);
  context.changeSystemTheme(false);
  assert.equal(context.document.documentElement.dataset.theme, 'light');

  context.setStored('dark');
  context.sendStorageEvent();
  assert.equal(context.document.documentElement.dataset.theme, 'dark');
});
