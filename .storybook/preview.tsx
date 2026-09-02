import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

import '../dist/tokens.css';
import '../dist/base.css';
import '../dist/kairos.css';
import './workshop.css';

/**
 * The theme is a `data-theme` attribute on `<html>`, because that is the
 * signal `tokens.css` reads and the one every Kairos surface already sets. A
 * class-based switch here would test a selector no app ships.
 *
 * Both themes render for every story. Dark mode in this system is a token
 * swap and nothing else, so a component that needs a dark branch is a
 * component with a value in the wrong layer, and the toolbar is how that
 * shows up.
 */
const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    /**
     * Armed by `vitest.config.ts`. For three versions this line was set and
     * nothing ran it: the addon draws a panel, and only a runner turns a
     * violation into a failed build. `npm run test-stories` is that runner.
     *
     * Two things a reader is likely to assume this covers, and does not:
     *
     * `region` and `landmark-one-main` do not fire, and no decorator here
     * makes them. The addon ships `region` in its own disabled list, because a
     * story is a fragment and landmarks are not always present in one.
     * `landmark-one-main` matches `html:not(html *)`, and the addon runs axe
     * with `include: document.body`, so the only node the rule can match is
     * outside the context. Wrapping stories in a `<main>` was tried and
     * changed no result — the rules were not being suppressed, they were
     * never reachable.
     *
     * Contrast is text only. See `tests/contrast.test.mjs`.
     */
    a11y: { test: 'error' },
    options: {
      /**
       * Names what exists. The list here read Introduction, Colour, Type,
       * Geometry, Elevation and Motion, of which two existed — and Space,
       * which did exist, was not in it, so it sorted last by accident rather
       * than by decision. A sort order naming four absent pages is a claim
       * about coverage that the sidebar quietly disproves.
       *
       * Type is built. Elevation is the stamp, and it is a section of
       * Geometry rather than a page of its own. Introduction and Motion are
       * removed rather than stubbed: an empty page named in a menu is the
       * same defect one line further on.
       */
      storySort: {
        order: ['Foundations', ['Colour', 'Type', 'Space', 'Geometry'], 'Components', 'Screens'],
      },
    },
    viewport: {
      /**
       * Every width where the layout actually changes, plus the floor.
       *
       * The old four — 320, 720, 1024, 1440 — were the widths the system makes
       * promises about, which is not the same list as the widths it behaves
       * differently at. 720 sits between 640 and 767 and so renders three of
       * the seven breakpoints identically to 660 or 700; nothing in the set
       * landed either side of 420, 520, 900 or 980 at all, so four boundaries
       * could move and no viewport would show it.
       *
       * Each entry below is one pixel under a boundary or on it, so switching
       * between two neighbours is the boundary crossing and nothing else. The
       * register of the seven is at the foot of `tokens.css`.
       */
      options: {
        /* The floor `base.css` sets. Below this the system promises nothing. */
        floor: { name: '320 — floor', styles: { width: '320px', height: '900px' } },
        /* Under 420: dialog actions stacked. */
        narrow: { name: '419 — narrow phone', styles: { width: '419px', height: '900px' } },
        /* Between 520 and 640: filter bar search on its own row. */
        phone: { name: '560 — phone', styles: { width: '560px', height: '900px' } },
        /* Under 768: cards rather than a table, no kicker, bottom nav. */
        card: { name: '767 — card', styles: { width: '767px', height: '900px' } },
        /* Over 768 and under 900: a table, still no sidebar. */
        tablet: { name: '860 — tablet', styles: { width: '860px', height: '900px' } },
        /* Over 900: sidebar. Under 980: the login grid is still one column. */
        sidebar: { name: '940 — sidebar', styles: { width: '940px', height: '900px' } },
        /* Over 980 and under 1200: everything on, padding not yet roomiest. */
        desk: { name: '1100 — desk', styles: { width: '1100px', height: '900px' } },
        /* Over 1200: the widest main padding. */
        wide: { name: '1280 — wide', styles: { width: '1280px', height: '900px' } },
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
    (Story) => (
      <div className="workshop">
        <Story />
      </div>
    ),
  ],
};

export default preview;
