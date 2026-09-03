import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import AuthScreen, { AuthForm, AuthLink } from '../../dist/react/AuthScreen';
import Button from '../../dist/react/Button';
import InputField from '../../dist/react/Field';

/**
 * The signed-out screen.
 *
 * This used to assemble the screen out of raw classes, which meant the
 * workshop rendered one composition and the two React apps rendered two
 * others: a different lockup size, an error row on one and a banner on the
 * other, the theme control in two places, `--one-message` on none of them. A
 * story built from the same classes as the apps cannot catch that, because
 * every one of those was a valid use of the vocabulary.
 *
 * So the composition moved into `AuthScreen` and this renders it. What the
 * stories assert now is the behaviour the component promises rather than the
 * markup a call site happened to write.
 */
const meta: Meta = {
  title: 'Screens/Sign in',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

function SignIn({ error = '' }: { error?: string }) {
  return (
    <AuthScreen product="Paykit" tagline="Invoices, payments, and what has already settled.">
      <AuthForm
        error={error}
        onSubmit={(e) => e.preventDefault()}
        submit={
          <Button variant="primary" type="submit" className="kairos-block">
            Sign in
          </Button>
        }
        footer={<AuthLink href="#">Forgotten your password?</AuthLink>}
      >
        <InputField label="Email" type="email" defaultValue="ricardo@felixfam.com" />
        <InputField label="Password" type="password" defaultValue="hunter2hunter2" />
      </AuthForm>
    </AuthScreen>
  );
}

/** The screen at rest. */
export const Default: Story = {
  render: () => <SignIn />,
};

/**
 * The same screen with the sign-in refused, which must be the same screen.
 *
 * The pair of stories is the assertion. `--one-message` takes 23px of reserved
 * message row off each field, and it is only allowed to because the form holds
 * a row of its own for the one message it can produce. If that row were not
 * reserved, this story's button would sit lower than the one above it, and a
 * person who mistyped a password would find the button had moved out from
 * under the pointer already on its way to it.
 *
 * `AuthForm` writes both halves, so the two cannot come apart — which is the
 * reason it takes `error` as a prop instead of letting the call site render
 * the row wherever it likes.
 */
export const Refused: Story = {
  render: () => <SignIn error="Those details do not match. Check them and try again." />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('Those details do not match');

    // The empty rows are gone: a field is its label and its control, and
    // nothing else, because nothing else can arrive in it.
    const email = canvas.getByLabelText('Email').closest('.kairos-field');
    await expect(email?.querySelector('.kairos-field-hint')).not.toBeVisible();
  },
};

/**
 * The lockup is the Kairos mark and the `h1` is the product, which is what a
 * screen reader opens this screen with.
 *
 * Both lockup variants render with the same `alt` and neither is
 * `aria-hidden`, so the accessible name survives whichever one the theme
 * hides. An app that wrote the pair by hand and marked the dark one decorative
 * — which one of them did — leaves the visible logo unnamed in dark mode.
 */
export const Landmarks: Story = {
  render: () => <SignIn />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Paykit');

    const marks = canvas.getAllByAltText('Kairos Software Solutions');
    await expect(marks).toHaveLength(2);

    // The theme control is here because the screen has no shell to put a
    // settings row in. It is the one placement the pattern allows.
    await expect(canvas.getByRole('button', { name: /theme/i })).toBeInTheDocument();
  },
};
