import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import ActionSet, { type Action, type RankedAction } from '../../dist/react/ActionSet';
import Dialog from '../../dist/react/Dialog';
import Button from '../../dist/react/Button';
import { PageHeader } from '../../dist/react/Panel';
import { Page, Section } from '../Specimen';

/**
 * The argument for the component is the first story: one description of what
 * an invoice can do, rendered four ways, with nothing about the arrangement
 * written at any of the four call sites.
 *
 * The declarations below are the whole surface area. `context` is the only
 * thing that differs between them.
 */
const meta = {
  title: 'Components/ActionSet',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const RECORD = 'INV-2026-0184';

/** What an invoice can do. Declared once, for every surface below. */
function useInvoiceActions() {
  const [log, setLog] = useState<string[]>([]);
  const run = (what: string) => () => setLog((prior) => [`${what} ran`, ...prior].slice(0, 4));

  const send: RankedAction = { label: 'Send invoice', onSelect: run('Send invoice') };
  const record: RankedAction = { label: 'Record payment', onSelect: run('Record payment') };

  const more: Action[] = [
    { label: 'Duplicate', onSelect: run('Duplicate') },
    { label: 'Open in Paykit', href: '#paykit' },
    { label: 'Download PDF', onSelect: run('Download PDF'), disabled: true },
    {
      label: 'Delete',
      onSelect: run('Delete'),
      destructive: {
        confirm: `Delete ${RECORD}? The invoice is removed for everyone, and the two payments recorded against it are not.`,
      },
    },
  ];

  return { send, record, more, log };
}

/**
 * The same actions on a page header, a table row, a mobile card, and a dialog
 * footer.
 */
export const EveryContext: Story = {
  render: function EveryContextStory() {
    const { send, record, more, log } = useInvoiceActions();
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
      <Page
        title="Action set"
        lede="One declaration of what an invoice can do, rendered for four surfaces. Nothing below chooses a rank, an order, or a placement — those are the component's, and the only judgement left at the call site is which action is primary."
      >
        <Section
          title="Page header"
          lede="Primary right, secondary beside it, and the rest in the menu. The disabled entry renders unavailable rather than vanishing, and Delete sits last behind a rule."
        >
          <div className="kairos-panel kairos-pad">
            <PageHeader
              title={RECORD}
              description="TTD 42,500.00 · Due 14 October"
              actions={
                <ActionSet context="page" label={RECORD} primary={send} secondary={[record]} more={more} />
              }
            />
          </div>
        </Section>

        <Section
          title="Table row and mobile card"
          lede="The same actions with no buttons at all. A record's primary action is its own linked identifier, so the row carries that and the menu and nothing else. `context='row'` and `context='card'` render alike; they are separate names because the surfaces are, and one of them may stop being alike."
        >
          <div className="kairos-panel kairos-pad kairos-stack kairos-stack--md">
            <div className="kairos-split">
              <a className="kairos-link" href="#invoice">
                {RECORD}
              </a>
              <ActionSet context="row" label={RECORD} more={[send, record, ...more]} />
            </div>
            <div className="kairos-split">
              <span className="kairos-muted">The same record as a card</span>
              <ActionSet context="card" label={RECORD} more={[send, record, ...more]} />
            </div>
          </div>
        </Section>

        <Section
          title="Dialog footer"
          lede="Ranked buttons and no menu, because a dialog is one question and a footer that grows a menu is a dialog doing too much. There is no destructive slot either: the dialog that confirms a destructive action is ConfirmDialog, and it renders its own footer."
        >
          <div className="kairos-action-row">
            <Button variant="secondary" onClick={() => setDialogOpen(true)}>
              Open dialog
            </Button>
          </div>
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={`Send ${RECORD}`}>
            <p className="kairos-body">
              The invoice goes to accounts@brightideas.tt. You can send it again later.
            </p>
            <ActionSet
              context="dialog"
              primary={{ label: 'Send invoice', onSelect: () => setDialogOpen(false) }}
              secondary={[{ label: 'Cancel', onSelect: () => setDialogOpen(false) }]}
            />
          </Dialog>
        </Section>

        <Section
          title="What ran"
          lede="Nothing here is wired to a backend. This is only so a destructive action can be seen to run after its confirmation, and seen not to run without one."
        >
          <div className="kairos-panel kairos-pad">
            {log.length === 0 ? (
              <p className="kairos-body-muted">Nothing yet.</p>
            ) : (
              <ul className="kairos-stack kairos-stack--xs">
                {log.map((entry, index) => (
                  <li key={index} className="kairos-body">
                    {entry}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>
      </Page>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Three menus name the same record — the header's, the row's and the
    // card's — because the record is what they all act on. That is the point
    // of the label: a trigger that read "More" three times would be three
    // controls a screen reader could not tell apart.
    const triggers = canvas.getAllByRole('button', { name: `Actions for ${RECORD}` });
    await expect(triggers.length).toBe(3);

    // A row carries no buttons at all. Its only control is the menu.
    const rows = canvasElement.querySelectorAll('.kairos-split');
    for (const row of rows) {
      await expect(row.querySelector('.kairos-button')).toBeNull();
      await expect(row.querySelector('.kairos-overflow-trigger')).not.toBeNull();
    }
    const rowTrigger = rows[0].querySelector('.kairos-overflow-trigger') as HTMLElement;

    // The header's ranked buttons, and the menu that holds the rest.
    await expect(canvas.getByRole('button', { name: 'Send invoice' })).toHaveClass(
      'kairos-button kairos-button--primary'
    );
    await expect(canvas.getByRole('button', { name: 'Record payment' })).toHaveClass(
      'kairos-button kairos-button--secondary'
    );

    // The primary keeps the right-hand end of the group, whatever else is in
    // it. Comparing positions rather than DOM order, because the arrangement
    // is what the rule is about.
    const group = canvasElement.querySelector('.kairos-page-header-actions') as HTMLElement;
    const box = (selector: string) =>
      (group.querySelector(selector) as HTMLElement).getBoundingClientRect();
    await expect(box('.kairos-button--primary').right).toBeGreaterThan(
      box('.kairos-button--secondary').right
    );
    await expect(box('.kairos-button--secondary').right).toBeGreaterThan(
      box('.kairos-overflow-trigger').right
    );

    // Destructive sorts to the bottom of the menu behind the rule that
    // already existed as a modifier. No new class was added for it.
    await userEvent.click(rowTrigger);
    const items = await screen.findAllByRole('menuitem');
    const last = items[items.length - 1];
    await expect(last).toHaveTextContent('Delete');
    await expect(last).toHaveClass(/kairos-overflow-item--destructive/);
    await expect(last).toHaveClass(/kairos-overflow-item--divided/);

    // A disabled entry renders unavailable rather than vanishing.
    const download = items.find((item) => item.textContent === 'Download PDF') as HTMLElement;
    await expect(download).toHaveAttribute('data-disabled');

    // The gate. Choosing the destructive item opens the confirmation and runs
    // nothing, which is the claim the whole `destructive` property makes.
    await userEvent.click(last);
    const dialog = await screen.findByRole('dialog');
    await expect(within(dialog).getByText(`Delete ${RECORD}?`)).toBeVisible();
    await expect(within(dialog).getByText(/removed for everyone/)).toBeVisible();
    await expect(canvas.getByText('Nothing yet.')).toBeVisible();

    // The confirming control takes the destructive treatment, never amber.
    const confirm = within(dialog).getByRole('button', { name: 'Delete' });
    await expect(confirm).toHaveClass(/kairos-button--danger-solid/);

    // Backing out runs nothing either, and hands focus back to the trigger
    // the menu was opened from. This is the one thing group 1 left open: a
    // dialog opened from a menu item has two components restoring focus, and
    // whether they race was untestable until something did it.
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await expect(canvas.getByText('Nothing yet.')).toBeVisible();
    await waitFor(() => expect(document.activeElement).toBe(rowTrigger));

    // And confirming runs it.
    await userEvent.click(rowTrigger);
    const reopened = await screen.findAllByRole('menuitem');
    await userEvent.click(reopened[reopened.length - 1]);
    const second = await screen.findByRole('dialog');
    await userEvent.click(within(second).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(canvas.getByText('Delete ran')).toBeVisible());
  },
};

/**
 * The migration contract: a header that declares its actions renders what a
 * header that assembled them by hand renders.
 *
 * This is the story that makes adoption safe to do one screen at a time. If
 * the two ever diverge, an app half-migrated has two headers that do not
 * match, and the reason to reach for `ActionSet` at all gets weaker.
 */
export const SameAsHandAssembled: Story = {
  render: () => (
    <Page
      title="Hand-assembled and declared"
      lede="Paykit's invoices screen renders its header the first way today. The second is the same header with the actions declared instead of built. The play function compares the markup."
    >
      <Section title="Assembled by hand" lede="What `Screens/Record list/Paykit` renders today.">
        <div className="kairos-panel kairos-pad" data-specimen="hand">
          <PageHeader
            title="Invoices"
            description="5 open · TTD 4,342,550.00 outstanding."
            actions={<Button variant="primary">New invoice</Button>}
          />
        </div>
      </Section>

      <Section title="Declared" lede="The same screen through `ActionSet`.">
        <div className="kairos-panel kairos-pad" data-specimen="declared">
          <PageHeader
            title="Invoices"
            description="5 open · TTD 4,342,550.00 outstanding."
            actions={
              <ActionSet
                context="page"
                label="Invoices"
                primary={{ label: 'New invoice', onSelect: () => {} }}
              />
            }
          />
        </div>
      </Section>
    </Page>
  ),
  play: async ({ canvasElement }) => {
    const group = (specimen: string) =>
      canvasElement.querySelector(
        `[data-specimen="${specimen}"] .kairos-page-header-actions`
      ) as HTMLElement;

    // The markup, not just the look. A class that differs is a rank that
    // differs the first time an app stylesheet has an opinion about one.
    await expect(group('declared').innerHTML).toBe(group('hand').innerHTML);

    // And `ActionSet` adds no wrapper of its own, because `PageHeader`
    // already owns the group.
    await expect(group('declared').children.length).toBe(1);
  },
};

/**
 * A lone routine action collapses into a tertiary button; a lone destructive
 * one does not.
 */
export const OneRemainingAction: Story = {
  render: function OneRemainingActionStory() {
    const send: RankedAction = { label: 'Send invoice', onSelect: () => {} };
    const duplicate: Action = { label: 'Duplicate', onSelect: () => {} };
    const remove: Action = {
      label: 'Delete',
      onSelect: () => {},
      destructive: { confirm: `Delete ${RECORD}? The invoice is removed for everyone.` },
    };

    return (
      <Page
        title="One remaining action"
        lede="A menu holding a single item is a menu asking for two presses to do the work of one. In a page header it collapses to a tertiary button — except when it is destructive, because a button is a rank and the rank a destructive action gets is none."
      >
        <Section title="One routine action" lede="Renders inline as `kairos-button--tertiary`.">
          <div className="kairos-panel kairos-pad">
            <PageHeader
              title={RECORD}
              actions={<ActionSet context="page" label={RECORD} primary={send} more={[duplicate]} />}
            />
          </div>
        </Section>

        <Section title="One destructive action" lede="Stays in the menu, behind its confirmation.">
          <div className="kairos-panel kairos-pad">
            <PageHeader
              title={RECORD}
              actions={<ActionSet context="page" label={RECORD} primary={send} more={[remove]} />}
            />
          </div>
        </Section>

        <Section
          title="One action in a row"
          lede="Stays in the menu whatever it is. A row carries no buttons, so there is nothing for it to collapse into."
        >
          <div className="kairos-panel kairos-pad kairos-split">
            <a className="kairos-link" href="#invoice">
              {RECORD}
            </a>
            <ActionSet context="row" label={RECORD} more={[duplicate]} />
          </div>
        </Section>
      </Page>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // One routine action: a button, not a menu holding one item.
    await expect(canvas.getByRole('button', { name: 'Duplicate' })).toHaveClass(
      'kairos-button kairos-button--tertiary'
    );

    // One destructive action: still the menu. A button is a rank.
    const headers = canvasElement.querySelectorAll('.kairos-page-header-actions');
    await expect(headers[1].querySelector('.kairos-button--tertiary')).toBeNull();
    await expect(headers[1].querySelector('.kairos-overflow-trigger')).not.toBeNull();

    // A row never collapses, because a row carries no buttons at all.
    const row = canvasElement.querySelector('.kairos-panel.kairos-split') as HTMLElement;
    await expect(row.querySelector('.kairos-button')).toBeNull();
    await expect(row.querySelector('.kairos-overflow-trigger')).not.toBeNull();
  },
};
