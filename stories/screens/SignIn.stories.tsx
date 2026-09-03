import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import Button from '../../dist/react/Button';
import InputField from '../../dist/react/Field';

/**
 * The signed-out screen, and the only place `.kairos-login-grid` is used.
 *
 * It exists here because the 980px breakpoint had nothing to act on in the
 * workshop, so a collapse of it could only be reasoned about. Rendering it is
 * how the width becomes checkable.
 *
 * Note what the package actually owns. `.kairos-login-grid` is
 * `display: grid; place-items: center` and declares no columns at all — the
 * two-column split is the consuming app's, and `kairos.css` only carries the
 * `grid-template-columns: 1fr !important` that undoes it below 980px. So the
 * second story below supplies the app's half, because a rule written to
 * override something needs the something present before it means anything.
 */
const meta: Meta = {
  title: 'Screens/Sign in',
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

function AuthPanel({ error = '' }: { error?: string }) {
  return (
    <div className="kairos-auth">
      <header className="kairos-auth-header">
        <h1 className="kairos-page-title">Paykit</h1>
        <p className="kairos-body-muted">Sign in to continue.</p>
      </header>
      {/* `--one-message` because neither field carries a message of its own.
          What is wrong on this screen is the email and the password together,
          so the form says it once, in the row below — which is reserved
          whether or not it is filled, so the button does not move when it is. */}
      <form
        className="kairos-auth-form kairos-form-stack kairos-form-stack--one-message"
        onSubmit={(e) => e.preventDefault()}
      >
        <InputField label="Email" type="email" defaultValue="ricardo@felixfam.com" />
        <InputField label="Password" type="password" defaultValue="hunter2hunter2" />
        <p className="kairos-auth-error kairos-error-text" role="alert">{error}</p>
        <Button variant="primary" type="submit">Sign in</Button>
        <a className="kairos-auth-link" href="#">Forgotten your password?</a>
      </form>
    </div>
  );
}

/** What this package defines: one centred column at every width. */
export const Centred: Story = {
  render: () => (
    <div className="kairos-login-grid" style={{ minHeight: '100vh', padding: 'var(--kairos-space-xl)' }}>
      <AuthPanel />
    </div>
  ),
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
 */
export const Refused: Story = {
  render: () => (
    <div className="kairos-login-grid" style={{ minHeight: '100vh', padding: 'var(--kairos-space-xl)' }}>
      <AuthPanel error="Those details do not match. Check them and try again." />
    </div>
  ),
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
 * What an app builds on top, and the only arrangement the 980px rule changes.
 *
 * The two columns are set inline here rather than in `kairos.css`, because that
 * is where they live in a real app — which is also why the override needs
 * `!important` to win.
 */
export const Split: Story = {
  render: () => (
    <div
      className="kairos-login-grid"
      style={{
        minHeight: '100vh',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        gap: 'var(--kairos-space-2xl)',
        padding: 'var(--kairos-space-xl)',
      }}
    >
      <div className="kairos-stack kairos-stack--md kairos-measure">
        <h2 className="kairos-section-title">Every invoice, one ledger</h2>
        <p className="kairos-body-muted">
          Paykit tracks what you are owed, what you owe, and what has already settled — in one
          place, in the currency you billed in.
        </p>
      </div>
      <AuthPanel />
    </div>
  ),
};
