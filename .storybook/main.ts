import type { StorybookConfig } from '@storybook/react-vite';

/**
 * The registry's own workshop.
 *
 * Every component in `dist/` and every class in `kairos.css` renders here, in
 * both themes, at every breakpoint the system claims to support. It exists
 * because the repo shipped `kairos-table-panel` — a class whose name says
 * panel and whose rule paints no border, no ground, and no shadow — through a
 * published version and into production, and no test could have caught it. A
 * static analysis of CSS text cannot tell you that a container draws nothing.
 * Rendering it can.
 */
const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: { name: '@storybook/react-vite', options: {} },
  typescript: { check: false },

  /**
   * Watch the registry's own source.
   *
   * The package ships hand-edited source from `dist/`, because it has no build
   * step and the export map points there. Vite's dev watcher treats a
   * directory with that name as build output and does not pick up changes
   * inside it, so an edit to `kairos.css` reached the browser only on a server
   * restart. A design system whose stylesheet needs a restart to be seen has
   * the same feedback loop as no workshop at all, which is how a container
   * that paints nothing shipped in the first place.
   *
   * `server.watcher.add` plus a full reload rather than a CSS hot update: the
   * whole stylesheet is one file, every component depends on it, and a full
   * reload of a page that renders in under a second is not worth being clever
   * about.
   *
   * The naming is worth fixing at the source. Hand-edited source under a path
   * called `dist` will keep tripping tools that assume the conventional
   * meaning, and this is the second thing it has broken.
   */
  viteFinal: async (config) => {
    const { resolve } = await import('node:path');
    const { watch } = await import('node:fs');
    const source = resolve(import.meta.dirname, '..', 'dist');

    config.plugins = [
      ...(config.plugins ?? []),
      {
        name: 'kairos-watch-registry',
        configureServer(server: any) {
          // `node:fs.watch` rather than Vite's watcher. Vite's does not report
          // changes under `dist/` here, `server.watcher.add()` does not make it
          // start, and a design system whose stylesheet needs a server restart
          // to be seen has the same feedback loop as no workshop at all. This
          // is 12 lines and it does not care what the directory is called.
          watch(source, { recursive: true }, (_event, name) => {
            if (!name) return;
            const file = resolve(source, name.toString());
            // Vite caches the transformed module, so dropping it from the graph
            // has to happen before the reload or the browser refetches the same
            // bytes it already has.
            const graph = server.environments?.client?.moduleGraph ?? server.moduleGraph;
            for (const mod of graph.getModulesByFile?.(file) ?? []) graph.invalidateModule(mod);
            server.ws.send({ type: 'full-reload' });
          });
        },
      },
    ];
    return config;
  },
};

export default config;
