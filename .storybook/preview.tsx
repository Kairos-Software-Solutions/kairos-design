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
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: [
          'Foundations',
          ['Introduction', 'Colour', 'Type', 'Geometry', 'Elevation', 'Motion'],
          'Components',
          'Screens',
        ],
      },
    },
    viewport: {
      options: {
        /* The three widths the system makes promises about: the 320px floor
           from base.css, the 768px table-to-card swap, and a desktop width
           wide enough that a six-column table does not scroll. */
        floor: { name: 'Floor (320px)', styles: { width: '320px', height: '900px' } },
        card: { name: 'Card (720px)', styles: { width: '720px', height: '900px' } },
        table: { name: 'Table (1024px)', styles: { width: '1024px', height: '900px' } },
        desk: { name: 'Desk (1440px)', styles: { width: '1440px', height: '900px' } },
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
