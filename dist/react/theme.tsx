'use client';

import { useSyncExternalStore } from 'react';
import Segmented from './Segmented';

/**
 * The three states a person can be in, in the order the button cycles them.
 * `system` is first because it is the default and the one they return to: a
 * toggle that only knows light and dark cannot be handed back to the device.
 */
const THEMES = ['system', 'light', 'dark'] as const;
export type ThemePreference = (typeof THEMES)[number];

const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

/**
 * Where the preference is remembered.
 *
 * Configurable because the apps already have keys in their users' browsers —
 * Paykit's is `paykit.theme` — and changing the key silently resets every
 * existing preference to the device default. Call this once at startup, before
 * anything reads the theme.
 */
let storageKey = 'kairos.theme';

export function setThemeStorageKey(key: string): void {
  storageKey = key;
}

const SHORT_LABELS: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

/**
 * The full sentence, for the cycling button's title and accessible name.
 *
 * Deliberately not shown under the settings row's label. These three differ in
 * length by more than a phone has room for, so a row that printed the current
 * one re-laid itself out on every choice: picking `System` grew the sentence
 * enough to push the segmented control onto its own line, which moved the
 * buttons out from under the thumb that had just tapped one.
 */
const LABELS: Record<ThemePreference, string> = {
  system: 'Theme follows your device',
  light: 'Light theme',
  dark: 'Dark theme',
};

function nextTheme(current: ThemePreference): ThemePreference {
  return THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
}

function readStored(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    // Private browsing and blocked storage both throw here. The device
    // preference still works; only remembering the override is lost.
    return 'system';
  }
}

/**
 * Apply a preference to the document.
 *
 * The token layer reads `data-theme` as its only signal, so `system` resolves
 * the device preference into that same attribute. Keeping one signal also
 * keeps the page ground and the theme-specific lockup on the same theme.
 */
export function applyTheme(theme: ThemePreference): void {
  document.documentElement.dataset.theme =
    theme === 'system'
      ? window.matchMedia(SYSTEM_THEME_QUERY).matches
        ? 'dark'
        : 'light'
      : theme;
}

/**
 * The pre-paint script. Inline it at the top of the body.
 *
 * The attribute has to be on `<html>` before the first paint. Reading the
 * preference from an effect instead renders the device's theme first and
 * flashes the chosen one in, which is worst for exactly the person who chose
 * dark. A function rather than a constant because it closes over the key.
 */
export function themeInitScript(): string {
  return `(function(){var q=window.matchMedia(${JSON.stringify(SYSTEM_THEME_QUERY)});function r(){try{return localStorage.getItem(${JSON.stringify(storageKey)})}catch(e){return null}}function a(){var t=r();document.documentElement.dataset.theme=t==='light'||t==='dark'?t:q.matches?'dark':'light'}a();q.addEventListener('change',a);window.addEventListener('storage',a)})()`;
}

/**
 * The stored preference, read as an external store.
 *
 * It is external state: another tab can change it, and the server cannot see
 * it at all. Reading it in an effect and calling `setState` would render the
 * wrong label first and correct it a frame later; this renders the server's
 * answer, then the real one, with no intermediate wrong state.
 */
const listeners = new Set<() => void>();

function notifyListeners(): void {
  for (const listener of listeners) listener();
}

let systemMediaQuery: MediaQueryList | undefined;

function handleStorageChange(event: StorageEvent): void {
  if (event.key !== null && event.key !== storageKey) return;
  applyTheme(readStored());
  notifyListeners();
}

function handleSystemThemeChange(): void {
  if (readStored() === 'system') applyTheme('system');
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  if (listeners.size === 1) {
    // Another tab of the same app is the same person, so its choice is theirs.
    window.addEventListener('storage', handleStorageChange);
    systemMediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);
    systemMediaQuery.addEventListener('change', handleSystemThemeChange);
  }

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      window.removeEventListener('storage', handleStorageChange);
      systemMediaQuery?.removeEventListener('change', handleSystemThemeChange);
    }
  };
}

/** The server has no storage to read, so it renders the default. */
function serverSnapshot(): ThemePreference {
  return 'system';
}

export function useThemePreference(): [ThemePreference, (next: ThemePreference) => void] {
  const theme = useSyncExternalStore(subscribe, readStored, serverSnapshot);

  function choose(next: ThemePreference) {
    applyTheme(next);
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      // The theme still changes for this visit; it just is not remembered.
    }
    notifyListeners();
  }

  return [theme, choose];
}

const ICONS: Record<ThemePreference, JSX.Element> = {
  // Monitor, sun, and moon as inline paths. An icon package would be a
  // dependency every app inherits for three glyphs.
  system: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="9" rx="1" />
      <path d="M5.5 14h5M8 11.5V14" strokeLinecap="round" />
    </svg>
  ),
  light: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M13 3l-1 1M4 12l-1 1" strokeLinecap="round" />
    </svg>
  ),
  dark: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 107 7z" strokeLinejoin="round" />
    </svg>
  ),
};

/**
 * The theme control on a settings screen. This is the placement the pattern
 * asks for first: a labelled row with all three options visible, so a person
 * can see what they are choosing between instead of clicking to find out.
 *
 * The row says nothing that changes with the choice. The control already shows
 * which of the three is on, and what `System` means is said once by the screen
 * around it.
 */
export function ThemeSetting() {
  const [theme, choose] = useThemePreference();

  return (
    <div className="kairos-setting-row">
      <span className="kairos-input-label">Theme</span>
      <Segmented
        label="Theme"
        options={THEMES.map((value) => ({ value, label: SHORT_LABELS[value] }))}
        value={theme}
        onChange={choose}
      />
    </div>
  );
}

/**
 * The cycling control, for screens with no chrome to put a settings row in:
 * sign-in, public quote and payment pages, anything with no header and no nav.
 *
 * An app should have exactly one of these visible at a time. Where the app
 * shell is present, use `ThemeSetting` on the settings screen instead and hide
 * this one in CSS — two theme controls on one screen is the drift the registry
 * exists to stop.
 */
export default function ThemeToggle({ inline = false }: { inline?: boolean } = {}) {
  const [theme, choose] = useThemePreference();
  const upcoming = nextTheme(theme);

  // The accessible name states both the current state and the next one, so it
  // is usable without seeing which icon is showing.
  const description = `${LABELS[theme]}. Switch to ${upcoming === 'system' ? 'your device setting' : upcoming}.`;

  return (
    <button
      type="button"
      className={inline ? 'kairos-theme-toggle kairos-theme-toggle--inline' : 'kairos-theme-toggle'}
      title={description}
      aria-label={description}
      onClick={() => choose(upcoming)}
    >
      {ICONS[theme]}
      <span className="kairos-theme-toggle-text">{SHORT_LABELS[theme]}</span>
    </button>
  );
}
