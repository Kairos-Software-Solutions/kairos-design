import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Banner from '../../dist/react/Banner';
import Toast, { ToastRegion } from '../../dist/react/Toast';
import EmptyState from '../../dist/react/EmptyState';
import Button from '../../dist/react/Button';
import Dialog from '../../dist/react/Dialog';
import ConfirmDialog from '../../dist/react/ConfirmDialog';
import CopyField from '../../dist/react/CopyField';
import { Skeleton, SkeletonStack, Metric, MetricRow } from '../../dist/react/Panel';
import { Page, Section } from '../Specimen';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  title: 'Components/Feedback',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** Four tones and no accent, because amber is the action colour and a banner is not an action. */
export const Banners: Story = {
  render: () => (
    <Page title="Banners" lede="One per screen. A field-level problem belongs to the field, not to the top of the page.">
      <div className="kairos-stack kairos-stack--md">
        <Banner>Two of your ten monitors are paused. Paused monitors do not alert.</Banner>
        <Banner tone="danger">The last three sends to accounts@angostura.com bounced. Check the address before sending again.</Banner>
        <Banner tone="warning">You have reached the monitor limit. Edit or remove a monitor before adding another.</Banner>
        <Banner tone="success">Invoice INV-2026-0184 was sent to accounts@angostura.com.</Banner>
      </div>
      <Section title="Inline" lede="Inside a panel rather than above one, where the notice belongs to a section and not to the screen.">
        <div className="kairos-panel kairos-pad kairos-stack kairos-stack--md">
          <h2 className="kairos-panel-heading">Sending domain</h2>
          <Banner tone="warning" inline>DKIM is not verified. Mail from this domain will land in spam.</Banner>
        </div>
      </Section>
    </Page>
  ),
};

export const Toasts: Story = {
  render: () => (
    <Page title="Toasts" lede="Transient confirmation of something that already happened. Anything the user still has to act on is a banner.">
      <ToastRegion>
        <Toast>Invoice sent.</Toast>
        <Toast>Password changed for ricardo@felixfam.com.</Toast>
      </ToastRegion>
    </Page>
  ),
};

export const Empty: Story = {
  render: () => (
    <Page title="Empty states" lede="An empty list is not an error. It takes no state colour, no alert role, and no Try again.">
      <div className="kairos-stack kairos-stack--lg">
        <div className="kairos-panel kairos-pad">
          <EmptyState message="No monitors are watching your services yet." action={<Button variant="primary">New monitor</Button>} />
        </div>
        <div className="kairos-panel kairos-pad">
          <EmptyState message="No invoices match this filter." />
        </div>
      </div>
    </Page>
  ),
};

export const Loading: Story = {
  render: () => (
    <Page title="Skeletons" lede="A skeleton is a promise about what is arriving, so a form loads as fields and a list loads as rows.">
      <div className="kairos-stack kairos-stack--lg">
        <Section title="A list"><SkeletonStack lines={5} /></Section>
        <Section title="Individual shapes">
          <div className="kairos-panel kairos-pad kairos-stack kairos-stack--sm">
            <Skeleton variant="heading" />
            <Skeleton variant="label" />
            <Skeleton variant="line" />
            <Skeleton variant="control" />
          </div>
        </Section>
      </div>
    </Page>
  ),
};

export const Figures: Story = {
  render: () => (
    <Page title="Metrics" lede="A figure with its label. Not a card: five boxes for five numbers is four borders more than the numbers need.">
      <MetricRow>
        <Metric label="Outstanding" value="TTD 4,342,550.00" />
        <Metric label="Overdue" value="TTD 312,000.00" />
        <Metric label="Paid this month" value="TTD 84,550.00" />
        <Metric label="Invoices" value="184" />
      </MetricRow>
    </Page>
  ),
};

export const Dialogs: Story = {
  render: function DialogStory() {
    const [plain, setPlain] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [significant, setSignificant] = useState(false);
    return (
      <Page title="Dialogs" lede="The destructive gate. A confirmation names the record, says what happens, and says what survives it.">
        <div className="kairos-action-row">
          <Button variant="secondary" onClick={() => setPlain(true)}>Open a dialog</Button>
          <Button variant="danger" onClick={() => setConfirm(true)}>Delete company</Button>
          <Button variant="secondary" onClick={() => setSignificant(true)}>Send invoice</Button>
        </div>
        <Dialog open={plain} onClose={() => setPlain(false)} title="Change quota">
          <p className="kairos-body-muted">Set the mailbox quota for ricardo@felixfam.com.</p>
          <div className="kairos-action-row kairos-action-row--end">
            <Button variant="tertiary" onClick={() => setPlain(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setPlain(false)}>Save quota</Button>
          </div>
        </Dialog>
        <ConfirmDialog
          open={confirm}
          title="Delete Angostura Holdings Limited?"
          message="The company and its five contacts are removed. Its 12 invoices stay, and keep the company name as it reads today."
          confirmLabel="Delete company"
          onConfirm={() => setConfirm(false)}
          onClose={() => setConfirm(false)}
        />
        <ConfirmDialog
          open={significant}
          destructive={false}
          title="Send INV-2026-0184?"
          message="The invoice is emailed to accounts@angostura.com and can no longer be edited. You can still record a payment or void it."
          confirmLabel="Send invoice"
          onConfirm={() => setSignificant(false)}
          onClose={() => setSignificant(false)}
        />
      </Page>
    );
  },
};

/**
 * The two stronger gates.
 *
 * What separates them from the confirmation above is what the person has to
 * do, not how loudly the dialog is painted. A louder dialog asking for the
 * same single click is a warning; typing the record's name is evidence that
 * the right row was read, which is the failure a list of near-identical
 * records actually has.
 */
export const Gates: Story = {
  render: function GateStory() {
    const [open, setOpen] = useState(false);
    const [purged, setPurged] = useState<string | null>(null);

    return (
      <Page
        title="Gates"
        lede="Reach past a plain confirmation only where the consequence reaches past the screen: a public object deleted for every reader, a key every application is using. A gate that asks for typing on everything gets typed through on everything."
      >
        <div className="kairos-action-row">
          <Button variant="danger" onClick={() => setOpen(true)}>Purge asset</Button>
        </div>
        <p className="kairos-body-muted">
          Outcome: <span data-testid="outcome">{purged ?? 'nothing purged'}</span>
        </p>
        <ConfirmDialog
          open={open}
          title="Purge kairos-logo.png?"
          message="The public object is deleted permanently and the four historical emails referencing it will show a broken image. Active references block this, so nothing being sent today is affected."
          confirmLabel="Purge asset"
          typeToConfirm="PURGE kairos-logo.png"
          requireReason
          reasonHint="Kept against this asset in the audit trail."
          onConfirm={({ reason }) => {
            setPurged(reason);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      </Page>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Purge asset' }));

    const dialog = await screen.findByRole('dialog', { name: 'Purge kairos-logo.png?' });
    const commit = within(dialog).getByRole('button', { name: 'Purge asset' });

    // Unanswered is unavailable. Not a dialog that opens, accepts a click, and
    // does nothing.
    await expect(commit).toBeDisabled();

    // Half-answered is still unavailable, and each half on its own.
    await userEvent.type(within(dialog).getByLabelText(/Type PURGE kairos-logo.png to confirm/), 'purge kairos-logo.png');
    await expect(commit).toBeDisabled();

    await userEvent.type(within(dialog).getByLabelText('Reason'), 'Client closed the account');
    await expect(commit).toBeEnabled();

    // And the reason reaches the action, which is the only reason to collect it.
    await userEvent.click(commit);
    await waitFor(() => expect(canvas.getByTestId('outcome')).toHaveTextContent('Client closed the account'));
  },
};

/**
 * A value an operator carries somewhere else.
 *
 * Not a disabled input. An operator putting a DKIM record into a registrar's
 * panel needs the whole value, unwrapped and copyable in one press, and an
 * `<input readonly>` gives them a one-line scroller that looks like something
 * they should be typing in.
 */
export const CopyFields: Story = {
  render: () => (
    <Page
      title="Copy field"
      lede="The copy control is a control at rest. Hover does not exist on a phone, does not appear in the screenshot attached to a support ticket, and cannot be described to whoever is standing at the registrar's control panel."
    >
      <Section title="A DNS record" lede="Three values, three names. The control is named by what it copies, so a column of them says which one each belongs to rather than repeating `Copy` three times.">
        <div className="kairos-panel kairos-pad kairos-stack kairos-stack--md">
          <CopyField label="Type" value="TXT" readOnlyValue />
          <CopyField label="Name" value="mail._domainkey" />
          <CopyField
            label="Value"
            value="v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1n7Yk3Qf0pW2sL9vRt6ZbQxJ8mHcE4dNfKgUvA2iOyTpLrXwB5eMzHqCnDsVj0kFuWaGtYbPh3RcMlNoAiQjEz"
          />
        </div>
      </Section>
      <Section title="A block" lede="Meaningful line breaks, read as a block. It scrolls rather than wrapping, because a key rewrapped at the panel's width cannot be compared line by line against the one it is meant to match.">
        <div className="kairos-panel kairos-pad">
          <CopyField
            label="Response body"
            multiline
            value={'{\n  "id": "evt_01JQ4T8M2K",\n  "status": "accepted",\n  "usage_units": 1\n}'}
          />
        </div>
      </Section>
    </Page>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Named by its value. Three controls, three names, no ambiguity in a column.
    await expect(canvas.getByRole('button', { name: 'Copy Name' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Copy Value' })).toBeVisible();

    // A value nobody pastes carries no control at all.
    await expect(canvas.queryByRole('button', { name: 'Copy Type' })).toBeNull();
  },
};
