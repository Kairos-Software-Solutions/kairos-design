import type { Meta, StoryObj } from '@storybook/react-vite';
import { group, themed } from '../tokens';
import { Note, Page, Section, Swatches } from '../Specimen';

/**
 * Every colour the system has, read out of `tokens.css`.
 *
 * Switch the theme in the toolbar. Nothing on this page branches on it: each
 * swatch is painted from `var(--kairos-…)`, so what changes when you flip is
 * exactly what a component would see. A colour that looks wrong in dark is a
 * token to fix, never a component to patch.
 */
const meta: Meta = {
  title: 'Foundations/Colour',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

export const Palette: Story = {
  render: () => (
    <Page
      title="Colour"
      lede="Cream ground, ink line, amber action, and four record states. Every value carries a light and a dark, so a theme is a token swap and no component ever branches."
    >
      <Section
        title="Ground"
        lede="The page, the surfaces on it, and the sidebar. Cream is the page; white is a panel raised off it."
      >
        <Swatches tokens={group(themed, '--kairos-bg', '--kairos-surface', '--kairos-elevated', '--kairos-sidebar')} />
      </Section>

      <Section title="Line" lede="Ink for a structural border, and a muted rule for a row separator inside one.">
        <Swatches tokens={group(themed, '--kairos-border')} />
      </Section>

      <Section title="Text" lede="Three ranks plus the value that survives an inverted surface.">
        <Swatches tokens={group(themed, '--kairos-text')} />
      </Section>

      <Section title="Accent">
        <Note>
          Full-saturation amber is a fill and never a text colour: it measures 1.52:1 on cream.
          <code className="kairos-code">accent-on-light</code> is the amber-toned value for text and
          icons, and it inverts to bare amber on the dark base where amber clears 3:1 on its own.
        </Note>
        <Swatches tokens={group(themed, '--kairos-accent')} />
      </Section>

      <Section title="Inverted surface">
        <Note>
          Ink-filled buttons, the sidebar brand plaque, active wizard steps. A pair rather than a
          reuse of the text colour, because it inverts: text-primary as a background is ink-on-bone
          in light and bone-on-bone in dark, which is to say invisible.
        </Note>
        <Swatches tokens={group(themed, '--kairos-invert')} />
      </Section>

      <Section title="State palette">
        <Note>
          Four states, warm and desaturated, every tint within 1.2:1 of the page so a row still
          reads as paper. Never the accent: amber is the action colour. Map a new status onto one of
          these four rather than adding a fifth.
        </Note>
        <Swatches tokens={group(themed, '--kairos-state-')} />
      </Section>

      <Section title="Destructive">
        <Note>
          The filled treatment for the confirm button of a confirmation dialog and nothing else.
          That button is the one that commits, and rank 1 in amber would say &quot;this is the safe
          way forward&quot; about the irreversible option.
        </Note>
        <Swatches tokens={group(themed, '--kairos-danger')} />
      </Section>

      <Section title="Rows" lede="Hover, selection, and the optional stripe. All three sit within a hair of the surface under them.">
        <Swatches tokens={group(themed, '--kairos-row-')} />
      </Section>

      <Section title="Focus, loading, and overlay">
        <Swatches tokens={group(themed, '--kairos-focus', '--kairos-skeleton', '--kairos-overlay')} />
      </Section>
    </Page>
  ),
};
