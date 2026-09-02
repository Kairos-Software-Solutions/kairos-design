import type { Meta, StoryObj } from '@storybook/react-vite';
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

const SHADOWS = [
  { token: 'shadow', use: 'A button at rest, and a card.' },
  { token: 'shadow-card', use: 'A panel, and a button under the cursor.' },
  { token: 'shadow-lg', use: 'A dialog. The only thing genuinely off the page.' },
];

export const Shape: Story = {
  render: () => (
    <Page
      title="Geometry"
      lede="Radius, border weight, and the stamp. Every one of these was a value written by hand into four apps before it was a token, and every one of them drifted."
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
          invisible and the offset is the whole point of the mark. Three sizes, and they rank: a
          panel is raised off the page, a dialog is off the page entirely, and a panel inside a
          panel is not raised at all.
        </Note>
        <div className="kairos-panel kairos-pad kairos-stack kairos-stack--xl">
          {SHADOWS.map(({ token, use }) => (
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

      <Section title="Nesting" lede="One rule, so nobody has to decide: the outermost panel stamps and everything nested in it is flat.">
        <div className="kairos-panel kairos-pad kairos-stack kairos-stack--md">
          <h2 className="kairos-panel-heading">A panel, stamped</h2>
          <div className="kairos-subpanel">
            <p className="spec-note">A subpanel inside it, flat. Two stamps stacked read as a printing error rather than as depth.</p>
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
