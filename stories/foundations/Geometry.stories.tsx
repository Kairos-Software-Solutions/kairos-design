import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Button from '../../dist/react/Button';
import { noShadow, one, rgb, shadow, style } from '../brand/computed';
import { constant, group } from '../tokens';
import { Note, Page, Section, Values } from '../Specimen';

const meta: Meta = {
  title: 'Foundations/Geometry',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

const RADII = [
  { token: 'radius-button', use: 'Buttons, segmented controls, the sidebar plaque. Sharp.' },
  { token: 'radius-chip', use: 'State chips. Just enough to read as a marker rather than a cell.' },
  { token: 'radius-input', use: 'Inputs, selects, cards, icon actions.' },
  { token: 'radius-panel', use: 'Panels, dialogs, the table container.' },
  { token: 'radius-pill', use: 'A count badge on a nav row, and nothing else.' },
];

const WEIGHTS = [
  { token: 'border-w', use: 'A container border, and a hairline between rows inside one.' },
  { token: 'border-w-strong', use: 'A control that takes input, and the rule under a table header.' },
];

/** The stamp: one rank-1 button, in its three states. */
const STAMPS = [
  { token: 'shadow-stamp', use: 'A rank-1 button at rest.' },
  { token: 'shadow-stamp-hover', use: 'A rank-1 button under the cursor.' },
  { token: 'shadow-pressed', use: 'A rank-1 button while it is held.' },
];

/** Surfaces: the soft card shadow, three names for one value since 0.19.0. */
const SURFACES = [
  { token: 'shadow', use: 'A card.' },
  { token: 'shadow-card', use: 'A panel, a disclosure, a toast.' },
  { token: 'shadow-lg', use: 'A dialog, a popover, a menu.' },
];

export const Shape: Story = {
  render: () => (
    <Page
      title="Geometry"
      lede="Radius, border weight, the stamp and the surface shadow. Every one of these was a value written by hand into four apps before it was a token, and every one of them drifted."
    >
      <Section title="Radius" lede="Sharp by default. Softer radii belong to the named Brand Scale card families, never to generic UI.">
        <div className="kairos-panel kairos-pad kairos-stack kairos-stack--md">
          {RADII.map(({ token, use }) => (
            <div className="kairos-split kairos-split--baseline" key={token}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 56, height: 36, background: 'var(--kairos-elevated)', border: '1px solid var(--kairos-border)', borderRadius: `var(--kairos-${token})` }} />
                <span className="spec-name">{token}</span>
              </span>
              <span className="spec-note">{use}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Border weight">
        <Note>
          Three weights and no fourth. The stylesheet had 35 rules at 1px, 11 at 2px, and 3 at 4px,
          none of them reading the tokens that named those weights.
        </Note>
        <div className="kairos-panel kairos-pad kairos-stack kairos-stack--md">
          {WEIGHTS.map(({ token, use }) => (
            <div className="kairos-split kairos-split--baseline" key={token}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 56, height: 36, border: `var(--kairos-${token}) solid var(--kairos-border)` }} />
                <span className="spec-name">{token}</span>
              </span>
              <span className="spec-note">{use}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="The stamp">
        <Note>
          Flat, offset bottom-right, zero blur, zero spread. It is a rubber stamp on paper, not a
          drop shadow, and it inverts to linen on dark because an ink shadow on a dark page is
          invisible and the offset is the whole point of the mark. Only rank-1 buttons wear it:
          the primary, the confirmation's destructive solid and the page header's primary. Three
          sizes, because a button has three states.
        </Note>
        <div className="kairos-panel kairos-pad kairos-stack kairos-stack--xl">
          {STAMPS.map(({ token, use }) => (
            <div className="kairos-split kairos-split--baseline" key={token}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ width: 72, height: 36, background: 'var(--kairos-accent)', border: '2px solid var(--kairos-border)', boxShadow: `var(--kairos-${token})` }} />
                <span className="spec-name">{token}</span>
              </span>
              <span className="spec-note">{use}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Surfaces" lede="The soft card shadow, in both themes: cards, panels, menus, dialogs, toasts. Three names kept for one value, so an app's own card that reads one goes soft with the package's.">
        <div className="kairos-panel kairos-pad kairos-stack kairos-stack--xl">
          {SURFACES.map(({ token, use }) => (
            <div className="kairos-split kairos-split--baseline" key={token}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ width: 72, height: 44, background: 'var(--kairos-surface)', border: '1px solid var(--kairos-border)', borderRadius: 'var(--kairos-radius-panel)', boxShadow: `var(--kairos-${token})` }} />
                <span className="spec-name">{token}</span>
              </span>
              <span className="spec-note">{use}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Nesting" lede="One rule, so nobody has to decide: the outermost panel is raised and everything nested in it is flat.">
        <div className="kairos-panel kairos-pad kairos-stack kairos-stack--md">
          <h2 className="kairos-panel-heading">A panel, raised</h2>
          <div className="kairos-subpanel">
            <p className="spec-note">A subpanel inside it, flat. Two shadows stacked muddy rather than give depth.</p>
          </div>
          <div className="kairos-panel kairos-pad">
            <p className="spec-note">A nested panel, also flat, by the same rule.</p>
          </div>
        </div>
      </Section>

      <Section title="Control heights">
        <Values tokens={group(constant, '--kairos-row-h', '--kairos-nav-row-h', '--kairos-control-h', '--kairos-table-header-h', '--kairos-page-header-h', '--kairos-filter-bar-h', '--kairos-sidebar-')} />
      </Section>
    </Page>
  ),
};

/**
 * Who is raised and who is stamped, without the Brand Scale. The card sits
 * beside the outer panel and not inside it, because inside a panel the
 * nested-panel rule flattens a card.
 */
export const Elevation: Story = {
  render: () => (
    <div className="kairos-stack kairos-stack--lg">
      <div className="kairos-panel kairos-pad kairos-stack kairos-stack--md" data-elevation="outer">
        <p className="kairos-body">An outer panel, raised.</p>
        <div className="kairos-panel kairos-pad" data-elevation="nested">
          <p className="kairos-body">A nested panel, flat.</p>
        </div>
      </div>
      <div className="kairos-card kairos-pad">
        <p className="kairos-body">A card beside it, raised.</p>
      </div>
      <div className="kairos-row kairos-row--md">
        <Button variant="primary">Send reminder</Button>
        <Button variant="secondary">Remind later</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(document.documentElement.hasAttribute('data-scale')).toBe(false);
    const soft = shadow('--kairos-shadow-soft-card');
    await expect(style(one(canvasElement, '[data-elevation="outer"]')).boxShadow).toBe(soft);
    await expect(style(one(canvasElement, '.kairos-card')).boxShadow).toBe(soft);
    await expect(style(one(canvasElement, '[data-elevation="nested"]')).boxShadow).toBe('none');
    await expect(style(one(canvasElement, '.kairos-button--primary')).boxShadow).toBe(`${rgb('#16110b')} 4px 4px 0px 0px`);
    await expect(noShadow(style(one(canvasElement, '.kairos-button--secondary')).boxShadow)).toBe(true);
  },
};
