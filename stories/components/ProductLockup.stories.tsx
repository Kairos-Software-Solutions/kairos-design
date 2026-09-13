import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import ProductLockup from '../../dist/react/ProductLockup';
import { Page, Section } from '../Specimen';

/**
 * How a Kairos tool says which app it is.
 *
 * Before 0.11.0 it said it three ways. The sign-in put `ICON + WORDMARK` at
 * 190px over a 24px Bebas title, the sidebar plaque put the same artwork over
 * 11px tracked caps, and the top bar put a 32px icon beside them. Three
 * compositions, so nothing could drift back together and a fourth placement
 * had three precedents to copy.
 *
 * One object now, and the size comes from the context it sits in rather than
 * from a prop. The stories below are the three contexts.
 */
const meta: Meta<typeof ProductLockup> = {
  title: 'Components/Product lockup',
  component: ProductLockup,
};

export default meta;
type Story = StoryObj<typeof ProductLockup>;

/** The three sizes, in the three places a tool names itself. */
export const Contexts: Story = {
  render: () => (
    <Page title="Product lockup">
      <Section title="Sign in">
        <div className="kairos-auth-header">
          <ProductLockup product="Paykit" as="h1" />
          <p className="kairos-body-muted">Invoices, payments, and what has already settled.</p>
        </div>
      </Section>

      <Section title="Sidebar plaque">
        <div className="kairos-sidebar-brand" style={{ width: 244 }}>
          <ProductLockup product="Paykit" />
        </div>
      </Section>

      <Section title="Mobile top bar">
        <header className="kairos-topbar">
          <span className="kairos-topbar-brand">
            <ProductLockup product="Paykit" />
          </span>
        </header>
      </Section>
    </Page>
  ),
};

/**
 * Every Kairos app, the same object.
 *
 * The product name is type rather than artwork, so a new app ships its
 * identity by passing a string. That is the property worth protecting: four
 * apps that each drew a logo would be four brands inside a release.
 */
export const EveryApp: Story = {
  render: () => (
    <Page title="One object, four apps">
      <Section title="The apps">
        <div className="kairos-stack kairos-stack--lg kairos-stack--start">
          <ProductLockup product="Paykit" />
          <ProductLockup product="Mailkit" />
          <ProductLockup product="Uptime" />
          <ProductLockup product="Card" />
        </div>
      </Section>
    </Page>
  ),
};

/**
 * The mark is the icon, never the full lockup.
 *
 * `ICON + WORDMARK` contains the word KAIROS, so pairing it with a product
 * name set in Bebas puts two display wordmarks on one screen. This asserts the
 * artwork by URL, because the defect is not a missing element — it is the
 * wrong one of two files that both render a Kairos logo and both look right in
 * a screenshot taken at the wrong size.
 */
export const MarkIsTheIcon: Story = {
  render: () => <ProductLockup product="Paykit" as="h1" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Paykit');

    // Both variants, same alt, neither aria-hidden: which one is visible
    // depends on the surface, so naming only one leaves the visible logo
    // unnamed on half the screens.
    const marks = canvas.getAllByAltText('Kairos Software Solutions');
    await expect(marks).toHaveLength(2);

    for (const mark of marks) {
      await expect(mark.getAttribute('src')).toContain('ICON%20ONLY');
      await expect(mark.getAttribute('src')).not.toContain('WORDMARK');
    }
  },
};
