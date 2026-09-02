import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import Select, { FILTER_THRESHOLD, type SelectOption } from '../../dist/react/Select';
import Tooltip from '../../dist/react/Tooltip';
import Popover from '../../dist/react/Popover';
import Button from '../../dist/react/Button';
import InputField, { Field } from '../../dist/react/Field';
import { Page, Section } from '../Specimen';

/**
 * The three things that open over the page and were not built.
 *
 * Both React apps installed Radix for the dialog and stopped there, so every
 * screen needing one of these either went without or grew its own. Behaviour
 * is Radix's, per ADR 0005; every class is this package's.
 */
const meta = {
  title: 'Components/Overlays',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const CURRENCIES: SelectOption[] = [
  { value: 'TTD', label: 'Trinidad and Tobago dollar' },
  { value: 'USD', label: 'United States dollar' },
  { value: 'GBP', label: 'Pound sterling' },
];

/** More than a person can scan, which is the whole reason this component is here. */
const TENANTS: SelectOption[] = [
  'Bright Ideas Ltd',
  'Caribbean Freight Co',
  'Coral Reef Diving',
  'Delta Print Works',
  'Eastern Supplies',
  'Fernandes Hardware',
  'Gulf View Medical',
  'Harbour Logistics',
  'Island Fresh Produce',
  'Joseph & Sons Joinery',
  'Kingsley Motors',
  'Lopinot Coffee',
  'Maracas Beach Rentals',
  'Northern Rangers FC',
].map((label) => ({ value: label.toLowerCase().replace(/[^a-z]+/g, '-'), label }));

export const Selects: Story = {
  render: function SelectsStory() {
    const [currency, setCurrency] = useState('TTD');
    const [tenant, setTenant] = useState<string | undefined>(undefined);

    return (
      <Page
        title="Choosing from a list"
        lede={`Two controls, one boundary. At ${FILTER_THRESHOLD} options or fewer the native select stays, because on a phone it opens the platform picker and that is better than anything built here. Past ${FILTER_THRESHOLD}, Select — with a box to narrow the list, which is the thing the native control cannot do.`}
      >
        <Section
          title={`${FILTER_THRESHOLD} or fewer: the native control`}
          lede="Not replaced, and not wrapped. `kairos-select` on a `<select>`, exactly as it was."
        >
          <div className="kairos-stack kairos-stack--md" style={{ maxWidth: 320 }}>
            <Field label="Currency">
              {({ id, describedBy }) => (
                <span className="kairos-select-wrap">
                  <select
                    id={id}
                    aria-describedby={describedBy}
                    className="kairos-select"
                    defaultValue="TTD"
                  >
                    {CURRENCIES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </span>
              )}
            </Field>
          </div>
        </Section>

        <Section
          title={`Past ${FILTER_THRESHOLD}: Select`}
          lede="The filter box appears on its own rather than behind a prop, so which control a list gets is decided by the list rather than at the call site. Typing narrows; Radix's own typeahead only jumps, and jumping inside two hundred tenants is not the same as narrowing to the four that match."
        >
          <div className="kairos-stack kairos-stack--md" style={{ maxWidth: 320 }}>
            <Field label="Tenant">
              {({ id }) => (
                <Select
                  id={id}
                  label="Tenant"
                  value={tenant}
                  onValueChange={setTenant}
                  options={TENANTS}
                  placeholder="Choose a tenant…"
                />
              )}
            </Field>
            <p className="kairos-body-muted">
              Chosen: <span data-testid="chosen">{tenant ?? 'nothing yet'}</span>
            </p>
          </div>
        </Section>

        <Section
          title="Short, through Select"
          lede="No filter box, because three options do not need one. The same component, deciding for itself."
        >
          <div style={{ maxWidth: 320 }}>
            <Select
              label="Reporting currency"
              value={currency}
              onValueChange={setCurrency}
              options={CURRENCIES}
            />
          </div>
        </Section>
      </Page>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The native control is still a native control. Not a wrapper, not a
    // replacement — the thing that opens the platform picker on a phone.
    const native = canvasElement.querySelector('select.kairos-select') as HTMLSelectElement;
    await expect(native.tagName).toBe('SELECT');
    await expect(native.options.length).toBe(CURRENCIES.length);

    // Past the threshold, the list can be narrowed by typing.
    await userEvent.click(canvas.getByRole('combobox', { name: 'Tenant' }));
    const filter = await screen.findByRole('textbox', { name: 'Filter options' });
    await expect(await screen.findAllByRole('option')).toHaveLength(TENANTS.length);

    // Anywhere in the label, not just the start: a person hunting for
    // "Bright Ideas Ltd" types "ideas" as readily as "bright".
    await userEvent.type(filter, 'ideas');
    await waitFor(async () => expect(await screen.findAllByRole('option')).toHaveLength(1));
    await userEvent.click(screen.getByRole('option', { name: /Bright Ideas Ltd/ }));
    await waitFor(() => expect(canvas.getByTestId('chosen')).toHaveTextContent('bright-ideas-ltd'));

    // A list narrowed to nothing says so, rather than emptying without a word.
    await userEvent.click(canvas.getByRole('combobox', { name: 'Tenant' }));
    const reopened = await screen.findByRole('textbox', { name: 'Filter options' });
    await userEvent.type(reopened, 'zzz');
    await expect(await screen.findByText('Nothing matches.')).toBeVisible();
    await userEvent.keyboard('{Escape}');

    // Under the threshold the same component offers no filter, because three
    // options do not need one.
    await userEvent.click(canvas.getByRole('combobox', { name: 'Reporting currency' }));
    await expect(await screen.findAllByRole('option')).toHaveLength(CURRENCIES.length);
    await expect(screen.queryByRole('textbox', { name: 'Filter options' })).toBeNull();
    await userEvent.keyboard('{Escape}');
  },
};

export const Tooltips: Story = {
  render: () => (
    <Page
      title="Tooltip"
      lede="Enhancement, never the information itself. A tooltip is unreachable on a touch screen, invisible in every screenshot a support ticket carries, and gone by the time somebody reads it down the phone — so it never carries a control's only name."
    >
      <Section
        title="An icon-only control"
        lede="The control is named by its own `aria-label`, which the tooltip repeats for anyone using a pointer. It is named whether or not the tooltip ever opens."
      >
        <div className="kairos-panel kairos-pad kairos-action-row">
          <Tooltip name="Refresh the list" content="Last checked 4 minutes ago.">
            <button type="button" className="kairos-icon-action">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="M13 8a5 5 0 1 1-1.6-3.7M13 2v3h-3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </button>
          </Tooltip>

          <Tooltip content="Applies to every invoice raised after today.">
            <Button variant="secondary">Change terms</Button>
          </Tooltip>
        </div>
      </Section>
    </Page>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The whole requirement, in one assertion: the control is named without
    // the tooltip opening. Nothing has been hovered at this point.
    const icon = canvas.getByRole('button', { name: 'Refresh the list' });
    await expect(icon).toHaveAttribute('aria-label', 'Refresh the list');
    await expect(screen.queryByRole('tooltip')).toBeNull();

    // And a trigger with visible text keeps that text as its name — the
    // tooltip describes it rather than renaming it.
    const labelled = canvas.getByRole('button', { name: 'Change terms' });
    await expect(labelled).not.toHaveAttribute('aria-label');

    await userEvent.hover(icon);
    const tip = await screen.findByRole('tooltip');
    await expect(tip).toHaveTextContent('Last checked 4 minutes ago.');

    // Still named by its own label, not by what just opened.
    await expect(canvas.getByRole('button', { name: 'Refresh the list' })).toBe(icon);
  },
};

export const Popovers: Story = {
  render: function PopoversStory() {
    const [note, setNote] = useState('');
    return (
      <Page
        title="Popover"
        lede="Content beside the page rather than over it. A menu is for picking one thing, a popover is for doing something small, a dialog is for stopping the page until it is answered."
      >
        <Section
          title="A small form"
          lede="Several controls, and using one does not close it — which is what separates it from a menu. It is dismissible by clicking anywhere else, which is what makes it wrong for anything you need an answer to."
        >
          <div className="kairos-panel kairos-pad kairos-action-row">
            <Popover
              label="Add a note"
              trigger={<Button variant="secondary">Add note</Button>}
            >
              <div className="kairos-stack kairos-stack--md" style={{ minWidth: 240 }}>
                <InputField
                  label="Note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
                <Button variant="primary">Save</Button>
              </div>
            </Popover>
          </div>
        </Section>
      </Page>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Add note' }));

    const popover = await screen.findByRole('dialog', { name: 'Add a note' });
    const field = within(popover).getByLabelText('Note');

    // Using a control inside it does not close it. A menu would have closed.
    await userEvent.type(field, 'Chased by phone');
    await expect(screen.getByRole('dialog', { name: 'Add a note' })).toBeVisible();
    await expect(field).toHaveValue('Chased by phone');

    // Escape closes it and hands focus back to what opened it.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Add a note' })).toBeNull());
    await expect(document.activeElement).toBe(canvas.getByRole('button', { name: 'Add note' }));
  },
};
