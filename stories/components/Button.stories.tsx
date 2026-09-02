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
    loading: { control: 'boolean' },
    loadingLabel: { control: 'text' },
  },
  args: { children: 'Save changes', variant: 'primary', size: 'md', loadingLabel: 'Saving…' },
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
      <Section
        title="Equal width, mixed ranks"
        lede="The case the row above cannot show. A borderless rank in an equal track used to centre its label in a track it did not size, so the tertiary read as a link floating in the middle of an invisible full-width button. Every track is the same width and every label sits at the same offset inside it."
      >
        <div className="kairos-action-row kairos-action-row--equal">
          <Button variant="primary">Send invoice</Button>
          <Button variant="tertiary">Cancel</Button>
        </div>
      </Section>
    </Page>
  ),
};

const ALL_RANKS: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'ghost', 'danger', 'dangerSolid'];

/**
 * The arrangement the Matrix could not make.
 *
 * The Matrix rendered all six ranks in every state for three versions and hid
 * a broken left edge the whole time, because a grid of cells never puts two
 * boxes' edges next to each other — each cell centres its own button and the
 * comparison the defect lives in is never drawn. Rendering a component is
 * necessary and not sufficient. The arrangement decides what a reviewer can
 * see.
 *
 * Two arrangements here, each aimed at one defect:
 *
 * - **One column, left-aligned, against a guide.** Restore tertiary's
 *   `padding-inline` or drop the transparent border off the borderless ranks
 *   and the ragged edge is the first thing on the page.
 * - **Each rank's two states, adjacent.** Put `opacity: 0.7` back as the only
 *   disabled signal and the ghost row becomes one control printed twice.
 */
export const Edges: Story = {
  render: () => (
    <Page
      title="Edges and states"
      lede="Two comparisons the Matrix cannot draw, because a grid centres every cell and a defect in a shared edge only exists between two boxes."
    >
      <Section
        title="One column, one edge"
        lede="Every rank, left-aligned, against a guide. Rank is fill, border and shadow. Geometry carries nothing, so every box is 84×36 and every label starts at the same offset — including the two ranks that paint no border and reserve it transparently instead."
      >
        <div
          className="kairos-panel kairos-pad kairos-stack kairos-stack--sm"
          style={{ borderLeft: '2px dashed var(--kairos-accent-on-light)' }}
        >
          {ALL_RANKS.map((variant) => (
            <Button key={variant} variant={variant}>
              Action
            </Button>
          ))}
        </div>
      </Section>

      <Section
        title="Each rank, both states"
        lede="Enabled beside disabled, rank by rank. A disabled control carries two signals — the ground drops to the page and the border drops to the subtle weight — so no rank reads as its own enabled state in lighter ink."
      >
        <div className="kairos-panel kairos-pad kairos-stack kairos-stack--sm">
          {ALL_RANKS.map((variant) => (
            <div key={variant} className="kairos-action-row">
              <Button variant={variant}>Action</Button>
              <Button variant={variant} disabled>
                Action
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Rank 1 disabled against rank 2 enabled"
        lede="The pairing the flat opacity inverted. A primary that drops its ground to the page becomes a disabled secondary, so a screen with nothing available shows no primary at all — at the moment somebody is looking for the way forward. The primary is the one rank that desaturates instead of dropping."
      >
        <div className="kairos-panel kairos-pad kairos-action-row">
          <Button variant="primary" disabled>
            Send invoice
          </Button>
          <Button variant="secondary">Save as draft</Button>
        </div>
      </Section>
    </Page>
  ),
};

/**
 * The state that did not exist for the first five versions, and the two
 * comparisons that check it.
 *
 * `kairos-spin` and `kairos-progress-dot` both shipped for five versions with
 * no caller: the ring was in the vocabulary, the animation was in the
 * vocabulary, and a submit button that shows it was pressed was left to each
 * app. Three apps, three answers.
 *
 * What a story has to draw, because neither is visible in one button on its own:
 *
 * - **Rest beside busy.** The box is the wider of the two labels in *both*
 *   states, so pressing the button cannot resize it or move the row it sits
 *   in. Swap the two cells out of their shared grid area and the right edge
 *   moves the moment the request starts.
 * - **Busy beside disabled.** They have to read differently. A busy button
 *   keeps its rank's fill, its border and its stamp; a disabled one drops the
 *   ground to the page and the border to the subtle weight. Give busy the
 *   disabled treatment and every press looks like a press that failed.
 *
 * Check it with reduced motion on as well. The ring stops turning — the global
 * guard collapses the animation to one iteration — so the label is the whole
 * signal at that point, which is why `loadingLabel` names the work rather than
 * saying `Loading`.
 */
export const Working: Story = {
  render: () => (
    <Page
      title="Working"
      lede="A button waiting on a response is not an unavailable one. It keeps its rank and its box, and it refuses every further press."
    >
      <Section
        title="Rest beside busy, one edge"
        lede="Each rank twice, left-aligned against a guide: at rest, then mid-request. Both boxes are the wider of the two labels, so the two right edges line up down the column. A label swapped in place instead of stacked would step outward on every busy row."
      >
        <div
          className="kairos-panel kairos-pad kairos-stack kairos-stack--sm"
          style={{ borderLeft: '2px dashed var(--kairos-accent-on-light)' }}
        >
          {ALL_RANKS.map((variant) => (
            <div key={variant} className="kairos-action-row">
              <Button variant={variant} loading={false} loadingLabel="Sending…">
                Send
              </Button>
              <Button variant={variant} loading loadingLabel="Sending…">
                Send
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Busy against unavailable"
        lede="The pairing that has to stay distinguishable. Working keeps the rank; unavailable drops its ground and its border. If these two rows read alike, the busy rule is repainting the rank it should be leaving alone."
      >
        <div className="kairos-panel kairos-pad kairos-stack kairos-stack--sm">
          {ALL_RANKS.map((variant) => (
            <div key={variant} className="kairos-action-row">
              <Button variant={variant} loading loadingLabel="Saving…">
                Save
              </Button>
              <Button variant={variant} disabled>
                Save
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="The label carries the meaning"
        lede="Left: the work is named. Right: the prop was skipped, so the pending label falls back to the resting one. Both hold their box and both announce busy, but only the first says anything a reader did not already know — and under reduced motion, where the ring is a static glyph, the first is the only one still communicating."
      >
        <div className="kairos-panel kairos-pad kairos-action-row">
          <Button variant="primary" loading loadingLabel="Sending invoice…">
            Send invoice
          </Button>
          <Button variant="primary" loading>
            Send invoice
          </Button>
        </div>
      </Section>
    </Page>
  ),
};
