import type { Meta, StoryObj } from '@storybook/react-vite';
import { constant, group } from '../tokens';
import { Note, Page, Section, Values } from '../Specimen';

/**
 * The scale, drawn.
 *
 * A number in a table is not a size you can judge. These bars are painted from
 * the tokens themselves, so the page is the scale rather than a description of
 * it, and a step that is too close to its neighbour to be a separate decision
 * is visible as one.
 */
const meta: Meta = {
  title: 'Foundations/Space',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

const STEPS = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

function Bar({ step }: { step: string }) {
  return (
    <div className="spec-row">
      <span className="spec-name">space-{step}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            display: 'block',
            width: `var(--kairos-space-${step})`,
            height: 16,
            background: 'var(--kairos-accent)',
            border: '1px solid var(--kairos-border)',
          }}
        />
        <span className="spec-value">{`var(--kairos-space-${step})`}</span>
      </span>
    </div>
  );
}

export const Scale: Story = {
  render: () => (
    <Page
      title="Space"
      lede="Nine steps, fine at the bottom and coarse at the top. That is how a dense tool actually spends space: 2px decisions inside a control, 24px decisions between sections, and nothing that needs to tell 20px from 22px."
    >
      <Section title="The steps">
        <Note>
          Before this scale existed, <code className="kairos-code">kairos.css</code> held 38 distinct
          padding values and 13 distinct gaps, including <code className="kairos-code">7px 11px</code>,{' '}
          <code className="kairos-code">10px 10px 4px</code>, and gaps of 5px, 7px, and 9px. That is
          not a system with drift in it. It is 51 separate decisions, none of them repeatable, and it
          is the mechanism by which two apps that both use the design system end up looking nothing
          alike: an agent building a new screen has to pick a number, and with no scale to pick from,
          it picks a new one.
        </Note>
        <div className="kairos-panel kairos-pad">
          {STEPS.map((step) => <Bar key={step} step={step} />)}
        </div>
      </Section>

      <Section
        title="By role"
        lede="What a step is for, so a call site names its decision rather than its size. One edit when panels get roomier, instead of nine."
      >
        <Values tokens={group(constant, '--kairos-pad-', '--kairos-panel-pad', '--kairos-section-pad', '--kairos-page-pad', '--kairos-screen-pad')} />
      </Section>

      <Section title="Gaps" lede="From tightest to loosest: inside a control, between siblings, between blocks in a panel, between panels, between sections.">
        <Values tokens={group(constant, '--kairos-gap')} />
      </Section>

      <Section title="Stacks" lede="The same scale, reached through a class rather than a token. This is what an app writes.">
        <div className="kairos-panel kairos-pad kairos-stack kairos-stack--lg">
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
            <div key={size}>
              <p className="spec-name">kairos-stack--{size}</p>
              <div className={`kairos-stack kairos-stack--${size}`}>
                <div style={{ height: 12, background: 'var(--kairos-elevated)', border: '1px solid var(--kairos-border-subtle)' }} />
                <div style={{ height: 12, background: 'var(--kairos-elevated)', border: '1px solid var(--kairos-border-subtle)' }} />
                <div style={{ height: 12, background: 'var(--kairos-elevated)', border: '1px solid var(--kairos-border-subtle)' }} />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};
