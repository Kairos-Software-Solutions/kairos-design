import type { Meta, StoryObj } from '@storybook/react-vite';
import Button, { type ButtonVariant } from '../../dist/react/Button';
import { Page, Section } from '../Specimen';

/**
 * Six ranks and no seventh.
 *
 * Emphasis is a budget: one amber claim per screen. The rank a button takes is
 * a statement about what the screen is for, so a second primary is not a
 * styling choice, it is two screens fighting over one page.
 */
const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'tertiary', 'ghost', 'danger', 'dangerSolid'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Save changes', variant: 'primary', size: 'md' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const RANKS: Array<{ variant: ButtonVariant; label: string; use: string }> = [
  { variant: 'primary', label: 'New invoice', use: 'The one thing this screen is for. One per screen.' },
  { variant: 'secondary', label: 'Save draft', use: 'The outline. Every other action that commits something.' },
  { variant: 'tertiary', label: 'Cancel', use: 'Borderless and underlined. Leaving without committing.' },
  { variant: 'ghost', label: 'Filter', use: 'Borderless, not underlined. A control that changes the view.' },
  { variant: 'danger', label: 'Suspend tenant', use: 'The outline form of a destructive action, on the page.' },
  { variant: 'dangerSolid', label: 'Delete invoice', use: 'The confirm button of a confirmation dialog, and nothing else.' },
];

/** Every rank, at rest, side by side. This is the page to check a new variant against. */
export const Ranks: Story = {
  render: () => (
    <Page title="Ranks" lede="Emphasis is a budget. Reading down this list is reading down the strength of a claim.">
      <div className="kairos-panel kairos-pad kairos-stack kairos-stack--md">
        {RANKS.map((rank) => (
          <div className="kairos-split kairos-split--baseline" key={rank.variant}>
            <Button variant={rank.variant}>{rank.label}</Button>
            <span className="spec-note">{rank.use}</span>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/** Small, default, and disabled, for every rank. The grid a change gets checked against. */
export const Matrix: Story = {
  render: () => (
    <Page title="Matrix" lede="Size against state, for all six ranks. A rank that loses its border when disabled, or a small button that does not match its full-size sibling's tracking, shows up here and nowhere else.">
      <div className="kairos-panel kairos-pad">
        <table className="kairos-table">
          <thead>
            <tr><th>Rank</th><th>Default</th><th>Small</th><th>Disabled</th></tr>
          </thead>
          <tbody>
            {RANKS.map((rank) => (
              <tr key={rank.variant}>
                <td><code className="kairos-code">{rank.variant}</code></td>
                <td><Button variant={rank.variant}>Action</Button></td>
                <td><Button variant={rank.variant} size="sm">Action</Button></td>
                <td><Button variant={rank.variant} disabled>Action</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  ),
};

/** A row of buttons. The gap and the wrap belong to the row, not to the buttons. */
export const InARow: Story = {
  render: () => (
    <Page title="Action rows" lede="Three modifiers, because a row of buttons at the end of a form and a row of buttons in a dialog are different rows.">
      <Section title="Default">
        <div className="kairos-action-row">
          <Button variant="primary">Save changes</Button>
          <Button variant="tertiary">Cancel</Button>
        </div>
      </Section>
      <Section title="Pushed to the end" lede="A dialog's action row, where the committing button is closest to the corner the eye leaves from.">
        <div className="kairos-action-row kairos-action-row--end">
          <Button variant="tertiary">Cancel</Button>
          <Button variant="primary">Send invoice</Button>
        </div>
      </Section>
      <Section title="Equal width" lede="Two choices of the same weight, so neither is nudged by being wider.">
        <div className="kairos-action-row kairos-action-row--equal">
          <Button variant="secondary">Save as draft</Button>
          <Button variant="secondary">Save and send</Button>
        </div>
      </Section>
    </Page>
  ),
};
