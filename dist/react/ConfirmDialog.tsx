'use client';

import { useState } from 'react';
import Button from './Button';
import Dialog from './Dialog';

export interface ConfirmDialogProps {
  open: boolean;
  /** Names the specific record: "Delete Bright Ideas Ltd?" */
  title: string;
  /**
   * What will actually happen, in plain language. Say the consequence and say
   * what survives it, because the thing a person is checking for at this
   * moment is usually what they are *not* about to lose.
   */
  message: string;
  /** The verb, not "OK": "Delete company", "End plan", "Suspend tenant". */
  confirmLabel: string;
  /**
   * Override when "Cancel" would be ambiguous — cancelling an invoice, where
   * both buttons would otherwise read "Cancel" and mean opposite things.
   */
  cancelLabel?: string;
  /**
   * `false` for a gate on something merely significant rather than
   * irreversible: activating a tenant, sending a document. The confirm button
   * drops to the outline treatment; the gate itself stays.
   */
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

/**
 * The required gate in front of a destructive or irreversible action.
 *
 * This replaces `window.confirm`, which cannot be styled, renders as operating
 * system chrome with an "OK" button that says nothing about the consequence,
 * gives the destructive option the same weight as the safe one, and can be
 * silenced outright by the browser after a couple of uses — on the one dialog
 * in the app that most needs to be read.
 *
 * Anything that sends something to a customer counts as irreversible.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on the way out rather than in an effect, so a dialog reopened after
  // a failure never shows the previous attempt's error or spinner.
  function close() {
    if (pending) return;
    setError(null);
    onClose();
  }

  async function confirm() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      setPending(false);
    } catch {
      setError('That did not go through. Check your connection and try again.');
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onClose={close} title={title}>
      <p className="kairos-body">{message}</p>

      {error ? (
        <p role="alert" className="kairos-error-text">
          {error}
        </p>
      ) : null}

      {/* Cancel sits first in the reading order and the committing button last,
          so the safe option is the one the eye reaches on the way in. */}
      <div className="kairos-dialog-actions">
        <Button onClick={close} disabled={pending}>
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? 'dangerSolid' : 'primary'}
          onClick={confirm}
          disabled={pending}
        >
          {/* A button that has been pressed shows that it was pressed. */}
          {pending ? 'Working…' : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
