import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import ActionSet from '../../dist/react/ActionSet';
import Button from '../../dist/react/Button';
import Dialog from '../../dist/react/Dialog';
import DisclosureSection, { DisclosureGroup } from '../../dist/react/DisclosureSection';
import { Field } from '../../dist/react/Field';
import OverflowMenu from '../../dist/react/OverflowMenu';
import Panel, { PageHeader } from '../../dist/react/Panel';
import Steps from '../../dist/react/Steps';
import SubNav from '../../dist/react/SubNav';
import { Page, Section } from '../Specimen';

/**
 * The 0.14.0 shapes: a screen that names its first action and folds the rest,
 * and rows whose shape comes from their slot rather than their labels.
 *
 * Every story here is the fix for a screenshot. Switch the viewport to 320 and
 * the two themes: nothing below should wrap into a second row, drop a control
 * onto a line of its own, or break a label a letter per line.
 */
const meta = {
  title: 'Components/Density',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const RECORD = 'QUO-0042';

/** Every child of a row that sits on the same line as `target`. */
function sharesARow(row: Element, target: Element) {
  const top = target.getBoundingClientRect().top;
  return [...row.children].some(
    (child) => child !== target && (child as HTMLElement).offsetParent !== null
      && Math.abs(child.getBoundingClientRect().top - top) < 1
  );
}

export const HeaderActions: Story = {
  render: () => (
    <Page
      title="One primary, one secondary, one menu"
      lede="From 900px up the secondary is a button beside the primary. Below it the secondary folds into the menu, so a phone shows the primary and the menu on one row. Below 640px the group is a grid: the primary first at full width, the menu in a narrow end column."
    >
      <Section title="Primary, secondary and menu" lede="A customer: New invoice, Statement, and the rest.">
        <div className="kairos-panel kairos-pad" data-specimen="full">
          <PageHeader
            kicker="Customers"
            title="Merch Den Limited"
            actions={(
              <ActionSet
                context="page"
                label="Merch Den Limited"
                primary={{ label: 'New invoice', href: '#new-invoice' }}
                secondary={[{ label: 'Statement', href: '#statement' }]}
                more={[
                  { label: 'New quote', href: '#new-quote' },
                  { label: 'Edit customer', href: '#edit' },
                  {
                    label: 'Archive',
                    onSelect: () => {},
                    destructive: { confirm: 'Archive Merch Den Limited? They stay on every invoice already issued and cannot be chosen for a new one.' },
                  },
                ]}
              />
            )}
          />
        </div>
      </Section>

      <Section title="Primary and menu" lede="Nothing earned a second button.">
        <div className="kairos-panel kairos-pad" data-specimen="menu">
          <PageHeader
            title={RECORD}
            actions={(
              <ActionSet
                context="page"
                label={RECORD}
                primary={{ label: 'Send quote', onSelect: () => {} }}
                more={[{ label: 'Download PDF', onSelect: () => {} }, { label: 'Duplicate', onSelect: () => {} }]}
              />
            )}
          />
        </div>
      </Section>
    </Page>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-specimen="full"] .kairos-page-header-actions') as HTMLElement;
    const trigger = group.querySelector('.kairos-overflow-trigger') as HTMLElement;
    const primary = group.querySelector('.kairos-button--primary') as HTMLElement;
    const secondary = group.querySelector('.kairos-page-header-secondary') as HTMLElement;

    // One of the two copies of the secondary is on the screen at any width.
    if (window.innerWidth >= 900) {
      await expect(secondary).toBeVisible();
    } else {
      await expect(secondary).not.toBeVisible();
      await userEvent.click(trigger);
      await expect(await screen.findByRole('menuitem', { name: 'Statement' })).toBeVisible();
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    }

    // The menu never sits alone on a row, and the primary is never beside a
    // control of another height.
    await expect(sharesARow(group, trigger)).toBe(true);
    await expect(primary.getBoundingClientRect().height).toBe(trigger.getBoundingClientRect().height);

    const second = canvasElement.querySelector('[data-specimen="menu"] .kairos-page-header-actions') as HTMLElement;
    await expect(sharesARow(second, second.querySelector('.kairos-overflow-trigger') as HTMLElement)).toBe(true);
  },
};

export const ActionRow: Story = {
  render: () => (
    <Page
      title="An action row on a phone"
      lede="The draft quote that wrapped into Send quote and Approve & convert on one row and the menu alone on the next. Below 640px the primary leads at full width and the menu sits beside the next action."
    >
      <Section title="Three controls" lede="Primary, secondary, menu.">
        <div className="kairos-panel kairos-pad">
          <div className="kairos-action-row kairos-action-row--top" data-specimen="three">
            <Button variant="primary">Send quote</Button>
            <Button variant="secondary">Approve &amp; convert</Button>
            <OverflowMenu label={RECORD} items={[{ label: 'Download PDF', onSelect: () => {} }, { label: 'Delete draft', onSelect: () => {}, destructive: true }]} />
          </div>
        </div>
      </Section>

      <Section title="Two controls" lede="Primary and menu share one row at every width.">
        <div className="kairos-panel kairos-pad">
          <div className="kairos-action-row" data-specimen="two">
            <OverflowMenu label={RECORD} items={[{ label: 'Download PDF', onSelect: () => {} }]} />
            <Button variant="primary">Record payment</Button>
          </div>
        </div>
      </Section>
    </Page>
  ),
  play: async ({ canvasElement }) => {
    for (const name of ['three', 'two']) {
      const row = canvasElement.querySelector(`[data-specimen="${name}"]`) as HTMLElement;
      const trigger = row.querySelector('.kairos-overflow-trigger') as HTMLElement;
      await expect(sharesARow(row, trigger)).toBe(true);
    }

    // Whatever order the markup wrote them in, the primary is first in the
    // reading line: the top row, and at the start of it.
    const two = canvasElement.querySelector('[data-specimen="two"]') as HTMLElement;
    const primary = two.querySelector('.kairos-button--primary') as HTMLElement;
    const trigger = two.querySelector('.kairos-overflow-trigger') as HTMLElement;
    if (window.innerWidth <= 640) {
      await expect(primary.getBoundingClientRect().left).toBeLessThan(trigger.getBoundingClientRect().left);
    }
  },
};

export const DialogHead: Story = {
  render: function DialogHeadStory() {
    const [open, setOpen] = useState(false);
    return (
      <Page title="A long dialog title" lede="The close control keeps the top-right corner however many lines the title takes.">
        <Button onClick={() => setOpen(true)}>Approve and convert</Button>
        <Dialog open={open} onClose={() => setOpen(false)} title={`Approve this draft quote ${RECORD} for Merch Den Limited and convert it to an invoice?`}>
          <p className="kairos-body">An invoice is created from this quote. The quote has not been sent, so the customer will not be emailed.</p>
        </Dialog>
      </Page>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Approve and convert' }));
    const dialog = await screen.findByRole('dialog');
    const title = dialog.querySelector('.kairos-dialog-title') as HTMLElement;
    const close = within(dialog).getByRole('button', { name: 'Close' });
    const t = title.getBoundingClientRect();
    const c = close.getBoundingClientRect();
    // Beside the title, not under it.
    await expect(c.left).toBeGreaterThanOrEqual(t.right);
    await expect(c.top).toBeLessThan(t.top + t.height / 2);
    await userEvent.click(close);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  },
};

export const AmountAndUnit: Story = {
  render: () => (
    <Page title="An amount and its unit" lede="One box, so the discount and what it is measured in cannot land on different rows.">
      <div className="kairos-panel kairos-pad kairos-form-grid">
        <Field
          label="Discount"
          suffix={(
            <span className="kairos-select-wrap">
              <select className="kairos-select" aria-label="Discount as" defaultValue="percent">
                <option value="percent">%</option>
                <option value="amount">TTD</option>
              </select>
            </span>
          )}
        >
          {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} className="kairos-input-field" inputMode="decimal" defaultValue="10" />}
        </Field>
        <Field label="Due in" suffix={<span className="kairos-affix-text">days</span>}>
          {({ id, describedBy }) => <input id={id} aria-describedby={describedBy} className="kairos-input-field" inputMode="numeric" defaultValue="30" />}
        </Field>
      </div>
    </Page>
  ),
  play: async ({ canvasElement }) => {
    for (const affix of canvasElement.querySelectorAll('.kairos-affix')) {
      const [control, unit] = [...affix.children].map((child) => child.getBoundingClientRect());
      await expect(Math.abs(control.top - unit.top)).toBeLessThan(1);
      await expect(unit.left).toBeGreaterThan(control.left);
    }
  },
};

export const StepRows: Story = {
  render: function StepRowsStory() {
    const [current, setCurrent] = useState(1);
    return (
      <Page title="Steps" lede="One row at every width. Below the width the names need, the steps you are not on drop to their numbers.">
        <Section title="A composer" lede="Steps you can move between.">
          <div className="kairos-panel kairos-pad">
            <Steps label="Invoice steps" steps={['Customer', 'Items', 'Details', 'Review']} current={current} onSelect={setCurrent} />
          </div>
        </Section>
        <Section title="An import" lede="Read-only: it moves on as each part finishes.">
          <div className="kairos-panel kairos-pad">
            <Steps label="Import steps" steps={['The file', 'Safety check', 'Columns', 'Account']} current={0} />
          </div>
        </Section>
        <Section title="The wizard rail" lede="Its labels stay on one line, and the rail scrolls.">
          <div className="kairos-panel">
            <nav className="kairos-wizard-steps" aria-label="Onboarding steps">
              <ol className="kairos-wizard-steps-list">
                {['Business', 'Safety check', 'Books', 'Invite people'].map((name, index) => (
                  <li key={name} className="kairos-wizard-step" data-done={index === 0 ? 'true' : undefined}>
                    <span className="kairos-wizard-step-marker" aria-hidden="true">{index + 1}</span>
                    {name}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </Section>
      </Page>
    );
  },
  play: async ({ canvasElement }) => {
    for (const list of canvasElement.querySelectorAll('.kairos-steps-list, .kairos-wizard-steps-list')) {
      const tops = [...list.children].map((item) => Math.round(item.getBoundingClientRect().top));
      await expect(new Set(tops).size).toBe(1);
    }
    for (const label of canvasElement.querySelectorAll('.kairos-wizard-step, .kairos-step')) {
      // One line: a label broken per letter is several times its line height.
      await expect((label as HTMLElement).getBoundingClientRect().height).toBeLessThan(60);
    }
    await userEvent.click(within(canvasElement).getByRole('button', { name: /Review/ }));
    await expect(within(canvasElement).getByRole('button', { name: /Review/ })).toHaveAttribute('aria-current', 'step');
  },
};

export const RelatedSections: Story = {
  render: () => (
    <Page title="Disclosure sections" lede="A record's related lists as one ruled panel of rows. Closed, each says what is inside.">
      <Panel heading="Contact and billing" help={<button type="button" className="kairos-icon-action" aria-label="About contact and billing">?</button>}>
        <p className="kairos-body kairos-flush">Accounts · accounts@merchden.tt · 868 555 0142</p>
      </Panel>
      <DisclosureGroup label="Related to Merch Den Limited">
        <DisclosureSection heading="Invoices" summary="3 unpaid · TTD 536.72 outstanding" count={14} level={2}>
          <p className="kairos-body kairos-flush">INV-0041, INV-0039 and INV-0036 are unpaid.</p>
        </DisclosureSection>
        <DisclosureSection heading="Quotes" summary="1 waiting for approval" count={6} level={2}>
          <p className="kairos-body kairos-flush">QUO-0042 was sent on 16 October.</p>
        </DisclosureSection>
        <DisclosureSection id="story.payments" heading="Payments" summary="Last paid 16 Oct 2026 · TTD 1,250.00" count={22} level={2}>
          <p className="kairos-body kairos-flush">Twenty-two payments since March.</p>
        </DisclosureSection>
      </DisclosureGroup>
      <DisclosureSection heading="Payment link" summary="Shared 2 times" defaultOpen level={2}>
        <p className="kairos-body kairos-flush">A rare thing, at the bottom, standing alone as a panel.</p>
      </DisclosureSection>
    </Page>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    window.localStorage.removeItem('kairos.open.story.payments');

    // Closed by default, and the summary says what is inside.
    const invoices = canvasElement.querySelector('.kairos-disclosure') as HTMLDetailsElement;
    await expect(invoices.open).toBe(false);
    await expect(canvas.getByText('3 unpaid · TTD 536.72 outstanding')).toBeVisible();
    await expect(canvas.getByText(/INV-0041, INV-0039/)).not.toBeVisible();

    // Opens on tap, and says so.
    const summary = invoices.querySelector('summary') as HTMLElement;
    await userEvent.click(summary);
    await waitFor(() => expect(summary).toHaveAttribute('aria-expanded', 'true'));
    // The body fades in over the disclosure's motion, from opacity 0.
    await waitFor(() => expect(canvas.getByText(/INV-0041, INV-0039/)).toBeVisible());

    // A section with an id remembers a choice that differs from its default,
    // and forgets one that matches it.
    const payments = [...canvasElement.querySelectorAll('.kairos-disclosure')][2] as HTMLDetailsElement;
    await userEvent.click(payments.querySelector('summary') as HTMLElement);
    await waitFor(() => expect(window.localStorage.getItem('kairos.open.story.payments')).toBe('open'));
    await userEvent.click(payments.querySelector('summary') as HTMLElement);
    await waitFor(() => expect(window.localStorage.getItem('kairos.open.story.payments')).toBeNull());

    // The panel's help is at the right end of its heading row.
    const row = canvasElement.querySelector('.kairos-panel-heading-row') as HTMLElement;
    const help = canvas.getByRole('button', { name: 'About contact and billing' });
    await expect(row.getBoundingClientRect().right - help.getBoundingClientRect().right).toBeLessThan(1);
  },
};

export const AreaNavigation: Story = {
  render: () => (
    <Page title="Sub-navigation" lede="The pages inside one area, one row down from the sidebar. It scrolls rather than wrapping.">
      <Section title="Sales" lede="Invoices is the page you are on.">
      <div className="kairos-panel kairos-pad">
        <PageHeader title="Invoices" />
        <SubNav
          label="Sales"
          items={[
            { label: 'Overview', href: '#sales' },
            { label: 'Quotes', href: '#quotes', count: 3 },
            { label: 'Invoices', href: '#invoices', current: true },
            { label: 'Recurring', href: '#recurring' },
            { label: 'Products', href: '#products' },
            { label: 'Counter sales', href: '#counter-sales' },
          ]}
        />
      </div>
      </Section>
    </Page>
  ),
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', { name: 'Sales' });
    await expect(within(nav).getByRole('link', { name: 'Invoices' })).toHaveAttribute('aria-current', 'page');
    const tops = [...nav.querySelectorAll('li')].map((item) => Math.round(item.getBoundingClientRect().top));
    await expect(new Set(tops).size).toBe(1);
  },
};
