import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import InputField, { Field } from '../../dist/react/Field';
import Button from '../../dist/react/Button';
import Segmented from '../../dist/react/Segmented';
import { Page, Section } from '../Specimen';

/**
 * Label, control, hint, and error as one unit.
 *
 * A field holds one message slot whether or not it carries content, so
 * validating a form does not move the layout under the cursor of the person
 * fixing it. The hint holds the slot and an error replaces it.
 */
const meta = {
  title: 'Components/Field',
  component: InputField,
  parameters: { layout: 'padded' },
  args: { label: 'Customer email', placeholder: 'name@company.com' },
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Every state a field can be in, stacked so the row heights line up or do not. */
export const States: Story = {
  render: () => (
    <Page title="Field states" lede="One message slot, held whether or not it is filled. The hint holds it, an error replaces it, and every field is the same height either way. Four shapes here: no message, hint only, error only, and both at once.">
      <div className="kairos-panel kairos-pad kairos-form-stack" style={{ maxWidth: '32rem' }}>
        <InputField label="Reference" defaultValue="INV-2026-0184" />
        <InputField label="Customer email" placeholder="name@company.com" hint="We send the invoice here and nowhere else." />
        <InputField label="Amount" defaultValue="8500.00" error="Enter an amount with at most two decimal places." />
        {/* Both at once. The error takes the slot and the hint is hidden, which
            is the case that decides whether the field grows on validation. No
            story rendered it before 0.3.1, which is how the stacked rows
            shipped. */}
        <InputField
          label="Tenant slug"
          defaultValue="kairos solutions"
          hint="Lowercase letters, numbers and hyphens."
          error="Slugs cannot contain spaces. Try kairos-solutions."
        />
        <InputField label="Tenant" defaultValue="kairossolutionstt" disabled />
        <Field label="Terms" hint="Shown at the foot of the invoice.">
          {({ id, describedBy }) => (
            <textarea id={id} aria-describedby={describedBy} className="kairos-input-field" rows={3} defaultValue="Net 30. Late payments attract 2% monthly." />
          )}
        </Field>
        <Field label="Currency">
          {({ id, describedBy }) => (
            <span className="kairos-select-wrap">
              <select id={id} aria-describedby={describedBy} className="kairos-select" defaultValue="TTD">
                <option value="TTD">TTD</option>
                <option value="USD">USD</option>
              </select>
            </span>
          )}
        </Field>
      </div>
    </Page>
  ),
};

/** A whole form, which is the only place field spacing can actually be judged. */
export const AForm: Story = {
  render: function AFormStory() {
    const [scope, setScope] = useState<'one' | 'recurring'>('one');
    return (
      <Page title="New invoice" lede="Two panels, one action row. The gap between the panels and the gap between the fields inside one are different decisions and different tokens.">
        <div className="kairos-stack kairos-stack--lg" style={{ maxWidth: '40rem' }}>
          <section className="kairos-panel kairos-pad kairos-form-stack">
            <h2 className="kairos-panel-heading">Customer</h2>
            <InputField label="Name" defaultValue="Angostura Holdings Limited" />
            <InputField label="Email" defaultValue="accounts@angostura.com" hint="We send the invoice here and nowhere else." />
          </section>
          <section className="kairos-panel kairos-pad kairos-form-stack">
            <h2 className="kairos-panel-heading">Terms</h2>
            <Segmented
              label="Invoice type"
              value={scope}
              onChange={setScope}
              options={[{ value: 'one', label: 'One-off' }, { value: 'recurring', label: 'Recurring' }]}
            />
            <div className="kairos-form-grid">
              <InputField label="Issued" type="date" defaultValue="2026-08-29" />
              <InputField label="Due" type="date" defaultValue="2026-09-28" />
            </div>
            <InputField label="Amount" defaultValue="8500.00" hint="TTD. Two decimal places." />
          </section>
          <div className="kairos-action-row kairos-action-row--end">
            <Button variant="tertiary">Cancel</Button>
            <Button variant="primary">Save invoice</Button>
          </div>
        </div>
      </Page>
    );
  },
};

/** Checkboxes and radios, which are fields that do not take an input border. */
export const Choices: Story = {
  render: () => (
    <Page title="Choices">
      <div className="kairos-panel kairos-pad kairos-stack kairos-stack--md" style={{ maxWidth: '32rem' }}>
        <label className="kairos-checkbox-row"><input type="checkbox" defaultChecked /> Send a copy to myself</label>
        <label className="kairos-checkbox-row"><input type="checkbox" /> Attach the last statement</label>
        <Section title="With supporting copy">
          <label className="kairos-choice-row">
            <input type="radio" name="delivery" defaultChecked />
            <span>
              <strong>Email</strong>
              <span className="kairos-field-hint">Delivered through Mailkit. Bounces show on the invoice.</span>
            </span>
          </label>
          <label className="kairos-choice-row">
            <input type="radio" name="delivery" />
            <span>
              <strong>Link only</strong>
              <span className="kairos-field-hint">Nothing is sent. You copy the link and share it yourself.</span>
            </span>
          </label>
        </Section>
      </div>
    </Page>
  ),
};
