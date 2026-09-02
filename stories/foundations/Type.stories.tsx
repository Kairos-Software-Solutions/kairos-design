import type { Meta, StoryObj } from '@storybook/react-vite';
import { constant, group } from '../tokens';
import { Note, Page, Section, Values } from '../Specimen';

/**
 * The type scale, set.
 *
 * `Foundations/Type` has been named in the workshop's sort order since the
 * workshop was built and has never existed, so five of the eight ranks had
 * never been rendered beside each other — which is the only way to see that
 * two of them are one rank written twice. Every size, family and tracking
 * value below is read from `tokens.css` through a custom property, so changing
 * a token moves this page and the page cannot drift from what it documents.
 */
const meta: Meta = {
  title: 'Foundations/Type',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

/**
 * Eight steps. Seven sit in the type scale block and the eighth,
 * `--kairos-text-title`, sits with the roles because it is the Bebas size and
 * has only ever had one caller. It is a step regardless, and leaving it out of
 * this page is how it would drift.
 */
const SIZES = ['2xs', 'xs', 'sm', 'md', 'body', 'lg', 'xl', 'title'];

const TRACKING = [
  { rank: 'display', use: 'A page title, and headings in the Product Scale.' },
  { rank: 'heading', use: 'Section titles and panel headings.' },
  { rank: 'label', use: 'Field labels, chips, table headers — anything uppercase and small.' },
  { rank: 'button', use: 'Button labels, the widest rank, because they are the shortest strings.' },
];

function Step({ step }: { step: string }) {
  return (
    <div className="spec-row" style={{ alignItems: 'baseline' }}>
      <span className="spec-name">text-{step}</span>
      <span
        style={{
          fontFamily: 'var(--kairos-body)',
          fontSize: `var(--kairos-text-${step})`,
          lineHeight: 1.3,
        }}
      >
        Settle the outstanding invoice
      </span>
      <span className="spec-value">{`var(--kairos-text-${step})`}</span>
    </div>
  );
}

export const Scale: Story = {
  render: () => (
    <Page
      title="Type"
      lede="Two families and eight sizes. Every rank here has to be a rank you can see from across the desk, because a rank nobody can see is a value a later screen copies and a fourth app then rounds differently."
    >
      <Section title="The steps">
        <Note>
          The stylesheet was using 33 distinct font sizes, mixing rem and px, and six of
          them — 0.8, 0.8125, 0.82, 0.84, 0.85 and 0.86rem — sat inside one pixel of each other.
          Nobody can tell 12.8px from 13.1px, so it was never a decision; it was six guesses at the
          same rank. Set in one column, the remaining eight are eight.
        </Note>
        <div className="kairos-panel kairos-pad">
          {SIZES.map((step) => <Step key={step} step={step} />)}
        </div>
      </Section>

      <Section
        title="By role"
        lede="What a size is for, so a rule names its decision rather than its number. Tightening the scale is one edit here instead of a search."
      >
        <Values tokens={group(constant, '--kairos-text-title', '--kairos-text-heading', '--kairos-text-label', '--kairos-text-chip', '--kairos-text-button', '--kairos-text-meta', '--kairos-text-input')} />
        <Note>
          <code className="kairos-code">text-input</code> is 16px and the reason is not that a
          control is a large rank. Safari zooms the page when a control under 16px takes focus, so
          this is a layout shift with a name on it. Any pass that tightens the scale has to see that
          before moving <code className="kairos-code">text-lg</code>.
        </Note>
      </Section>

      <Section
        title="Tracking"
        lede="Four ranks, set at the same size so the only difference on the page is the one being decided."
      >
        <Note>
          The stylesheet was using eleven tracking values against three tokens and referencing none
          of them: 0.02, 0.03, 0.04, 0.06, 0.08, 0.09, 0.1, 0.12, 0.14, 0.16 and 0.18em, all written
          by hand. Nobody can tell 0.08em from 0.09em, so the difference was never a decision — it
          was eleven separate guesses.
        </Note>
        <div className="kairos-panel kairos-pad">
          {TRACKING.map(({ rank, use }) => (
            <div className="spec-row" key={rank} style={{ alignItems: 'baseline' }}>
              <span className="spec-name">track-{rank}</span>
              <span
                style={{
                  fontFamily: 'var(--kairos-body)',
                  fontSize: 'var(--kairos-text-sm)',
                  letterSpacing: `var(--kairos-track-${rank})`,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Outstanding invoices
              </span>
              <span className="spec-value">{use}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="The families"
        lede="Two, and never a third. The host app loads them; these tokens only name the stack."
      >
        <div className="kairos-panel kairos-pad kairos-stack kairos-stack--lg">
          {(
            [
              ['display', 'Bebas Neue', 'Page titles. Nothing else.'],
              ['body', 'Epilogue', 'Everything that is read rather than glanced at.'],
              ['mono', 'System monospace', 'Identifiers, amounts in a column, anything that has to line up.'],
            ] as const
          ).map(([token, name, use]) => (
            <div className="kairos-stack kairos-stack--xs" key={token}>
              <span className="spec-name">{token} — {name}</span>
              <span
                style={{
                  fontFamily: `var(--kairos-${token})`,
                  fontSize: 'var(--kairos-text-xl)',
                  letterSpacing: token === 'display' ? 'var(--kairos-track-display)' : undefined,
                }}
              >
                Settle the outstanding invoice
              </span>
              <span className="spec-value">{use}</span>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};

/**
 * The rule most often broken, shown as the break rather than as a sentence.
 *
 * Bebas outside a page title shipped for three versions: five heading classes
 * drew it because the only rule dropping it was scoped to `.kairos-app-shell`,
 * so every heading in a dialog, on a sign-in page, or on any surface outside
 * the shell came out as uppercase condensed display type. A page that only
 * shows the correct case cannot teach anybody to spot that.
 */
export const OneFamilyPerJob: Story = {
  render: () => (
    <Page
      title="Bebas is the page title"
      lede="At 24px, with a hard limit of two per screen. Every other piece of type in a tool is Epilogue. The two panels below are the same screen; only the family moved."
    >
      <div className="kairos-row kairos-row--lg" style={{ alignItems: 'flex-start' }}>
        <section className="kairos-panel kairos-pad kairos-stack kairos-stack--md" style={{ flex: 1 }}>
          <span className="spec-name">Correct</span>
          <h2 style={{ margin: 0, fontFamily: 'var(--kairos-display)', fontSize: 'var(--kairos-text-title)', letterSpacing: 'var(--kairos-track-display)', textTransform: 'uppercase' }}>
            Outstanding invoices
          </h2>
          <h3 className="kairos-panel-heading">This month</h3>
          <p className="kairos-body">
            Three invoices are past their due date. The oldest has been outstanding for 41 days.
          </p>
          <p className="kairos-meta">Last checked 09:14</p>
        </section>

        <section className="kairos-panel kairos-pad kairos-stack kairos-stack--md" style={{ flex: 1 }}>
          <span className="spec-name">What shipped for three versions</span>
          <h2 style={{ margin: 0, fontFamily: 'var(--kairos-display)', fontSize: 'var(--kairos-text-title)', letterSpacing: 'var(--kairos-track-display)', textTransform: 'uppercase' }}>
            Outstanding invoices
          </h2>
          <h3 style={{ margin: 0, fontFamily: 'var(--kairos-display)', fontSize: 'var(--kairos-text-heading)', letterSpacing: 'var(--kairos-track-heading)', textTransform: 'uppercase' }}>
            This month
          </h3>
          <p style={{ margin: 0, fontFamily: 'var(--kairos-display)', fontSize: 'var(--kairos-text-body)' }}>
            Three invoices are past their due date. The oldest has been outstanding for 41 days.
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--kairos-display)', fontSize: 'var(--kairos-text-meta)', color: 'var(--kairos-text-muted)' }}>
            Last checked 09:14
          </p>
        </section>
      </div>

      <Note>
        The right-hand panel is not a caricature. It is what every heading class rendered outside
        `.kairos-app-shell` until 0.3.0, because the rule dropping Bebas was scoped to the shell and
        a dialog is not inside one. Display type carries a page title and loses a sentence: the
        second panel has no rank order, because everything in it is shouting.
      </Note>
    </Page>
  ),
};
