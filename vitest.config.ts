/**
 * Browser-mode Vitest, for one job: run every story and let axe look at it.
 *
 * The Node suite under `tests/` reads CSS and TypeScript as text, which is why
 * `.kairos-table-panel` could name a container, paint nothing, and pass. This
 * project renders instead. It is deliberately separate from `npm test` — that
 * suite runs in a second with no browser, and making every commit wait on
 * Chromium would cost the fast loop that catches most of what it catches.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        // No `setupFiles`. Since Storybook 10.3 the plugin provisions the
        // preview annotations itself, including the a11y addon's, and a
        // hand-written `setProjectAnnotations` makes it skip that and use the
        // hand-written list instead — which is a list that goes stale the
        // first time an addon is added.
        plugins: [storybookTest({ configDir: join(here, '.storybook') })],
        // `aria-query` is CommonJS and reaches the browser through the a11y
        // addon's annotations. Unbundled, the browser asks it for a named
        // `elementRoles` export that a CJS module cannot give, and every story
        // file fails to import before a single test runs. Pre-bundling
        // converts it once. This has to sit on the project rather than the
        // root config, because the project is what serves the browser.
        optimizeDeps: { include: ['aria-query', 'lz-string', 'dequal', 'pretty-format'] },
        test: {
          name: 'stories',
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
