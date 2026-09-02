import type { Meta, StoryObj } from '@storybook/react-vite';
import OverflowMenu from '../../dist/react/OverflowMenu';
import Button from '../../dist/react/Button';
import { Page, Section } from '../Specimen';

/**
 * The menu had no story of its own. It rendered only inside `DataTable`, so
 * three of its four item shapes — a link, an external link, and an item the
 * call site disabled — were never rendered by anything, and the rebuild on
 * Radix had nothing to be checked against. `context="header"` was in the same
 * position.
 */
const meta = {
  title: 'Components/OverflowMenu',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Items: Story = {
  render: () => (
    <Page
      title="Overflow menu"
      lede="Everything a record can do except open it. The trigger names the record, so six identical buttons down a table are still six distinct controls to a screen reader."
    >
      <Section
        title="Item shapes"
        lede="An action, a link, a link that leaves the app, and a destructive action behind its rule. A disabled item is omitted rather than greyed: an unavailable action a person can still reach is a question with no answer."
      >
        <div className="kairos-panel kairos-pad kairos-action-row">
          <span className="kairos-muted">INV-2026-0184</span>
          <OverflowMenu
            label="INV-2026-0184"
            items={[
              { label: 'Record payment', onSelect: () => {} },
              { label: 'Open in Paykit', href: '#paykit' },
              { label: 'View in bank portal', href: 'https://example.com', external: true },
              { label: 'Duplicate', onSelect: () => {}, disabled: true },
              { label: 'Delete', destructive: true, onSelect: () => {} },
            ]}
          />
        </div>
      </Section>

      <Section
        title="Beside a page action"
        lede="The header context gives the trigger the same border weight and radius as the button next to it, so the pair reads as one control group rather than a button and a leftover."
      >
        <div className="kairos-panel kairos-pad kairos-action-row">
          <Button variant="primary">New invoice</Button>
          <OverflowMenu
            context="header"
            label="invoices"
            items={[
              { label: 'Import from CSV', onSelect: () => {} },
              { label: 'Export this list', onSelect: () => {} },
              { label: 'Delete all drafts', destructive: true, onSelect: () => {} },
            ]}
          />
        </div>
      </Section>

      <Section
        title="Nothing to offer"
        lede="Every item disabled leaves no item, and a trigger that opens an empty menu is a dead control. The component renders nothing at all — the space below is the whole story."
      >
        <div className="kairos-panel kairos-pad">
          <OverflowMenu
            label="INV-2026-0185"
            items={[
              { label: 'Record payment', onSelect: () => {}, disabled: true },
              { label: 'Delete', destructive: true, onSelect: () => {}, disabled: true },
            ]}
          />
        </div>
      </Section>
    </Page>
  ),
};
