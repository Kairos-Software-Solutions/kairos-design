import type { Meta, StoryObj } from '@storybook/react-vite';
import StateChip, { type StateVariant } from '../../dist/react/StateChip';
import { Page, Section } from '../Specimen';

/**
 * The status of a record, and nothing else.
 *
 * Four states plus neutral. A count, a label, a category, and a tag are not
 * states and do not take a chip. Amber is never available here: it is the
 * action colour, and a status is not an action.
 */
const meta = {
  title: 'Components/StateChip',
  component: StateChip,
  parameters: { layout: 'padded' },
  argTypes: { variant: { control: 'select', options: ['settled', 'overdue', 'awaiting', 'draft', 'neutral'] } },
  args: { variant: 'settled', children: 'Paid' },
} satisfies Meta<typeof StateChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const STATES: Array<{ variant: StateVariant; label: string; means: string }> = [
  { variant: 'settled', label: 'Paid', means: 'Done, and nothing further is expected.' },
  { variant: 'overdue', label: 'Overdue', means: 'Wrong, late, or failed. Somebody has to act.' },
  { variant: 'awaiting', label: 'Awaiting', means: 'In flight. Waiting on somebody or something.' },
  { variant: 'draft', label: 'Draft', means: 'Not yet real. Nothing has been committed.' },
  { variant: 'neutral', label: 'Archived', means: 'Out of the flow, and not a judgement either way.' },
];

/** The five, with the glyph each carries so the state survives being printed in grey. */
export const States: Story = {
  render: () => (
    <Page
      title="State palette"
      lede="Warm and desaturated, every tint within 1.2:1 of the page so a row still reads as paper. Each chip carries a glyph as well as a tint, because a tint alone is not a status to anybody who cannot see it."
    >
      <div className="kairos-panel kairos-pad kairos-stack kairos-stack--md">
        {STATES.map((state) => (
          <div className="kairos-split kairos-split--baseline" key={state.variant}>
            <StateChip variant={state.variant}>{state.label}</StateChip>
            <span className="spec-note">{state.means}</span>
          </div>
        ))}
      </div>
      <Section title="Deprecated spellings" lede="Every app's old vocabulary still resolves, so adopting the registry is not one enormous commit. They map onto the five above and are not a sixth state.">
        <div className="kairos-chip-row">
          <StateChip variant="success">success</StateChip>
          <StateChip variant="danger">danger</StateChip>
          <StateChip variant="warning">warning</StateChip>
          <StateChip variant="complete">complete</StateChip>
          <StateChip variant="failed">failed</StateChip>
          <StateChip variant="progress">progress</StateChip>
          <StateChip variant="accent">accent</StateChip>
        </div>
      </Section>
    </Page>
  ),
};

/** In a row, which is where a chip actually lives. */
export const InARow: Story = {
  render: () => (
    <div className="kairos-chip-row">
      {STATES.map((state) => <StateChip key={state.variant} variant={state.variant}>{state.label}</StateChip>)}
    </div>
  ),
};
