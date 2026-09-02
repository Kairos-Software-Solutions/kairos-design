import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Banner from '../../dist/react/Banner';
import Toast, { ToastRegion } from '../../dist/react/Toast';
import EmptyState from '../../dist/react/EmptyState';
import Button from '../../dist/react/Button';
import Dialog from '../../dist/react/Dialog';
import ConfirmDialog from '../../dist/react/ConfirmDialog';
import { Skeleton, SkeletonStack, Metric, MetricRow } from '../../dist/react/Panel';
import { Page, Section } from '../Specimen';

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
