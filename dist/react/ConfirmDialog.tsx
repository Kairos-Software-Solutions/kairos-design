'use client';

import { type RefObject, useState } from 'react';
import Button from './Button';
import Dialog from './Dialog';
import InputField, { Field } from './Field';
import { confirmGateOpen } from './confirm';

/** What the gate collected, handed to the action it was standing in front of. */
export interface ConfirmDetails {
  /** What the person typed to confirm, or `''` where nothing was asked for. */
  typed: string;
  /** Why they did it, or `''` where no reason was asked for. */
  reason: string;
}

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
  /**
   * The string the person has to type before the action will run: the record's
   * own name, or `PURGE cf2a…` where naming the record is not specific enough
   * to be evidence.
   *
   * Reach for it where the consequence reaches past this screen — a public
   * object deleted for every reader, a key every application is using. A
   * second click is not proof that the right row was read, and the wrong row
   * is the failure mode a list of near-identical records actually has. On an
   * action whose consequence is one record and one screen, leave it out: a
   * gate that asks for typing on everything gets typed through on everything.
   *
   * Matched trimmed and case-insensitively. See `confirmationMatches`.
   */
  typeToConfirm?: string;
  /**
   * The action is recorded, and the record needs to say why.
   *
   * The confirm button stays unavailable until something is written. That is
   * the whole of it — this component does not store the reason, it collects
   * it and hands it to `onConfirm`, and where it goes afterwards is the
   * caller's audit trail.
   */
  requireReason?: boolean;
  /** Override when "Reason" is not what the trail calls it. */
  reasonLabel?: string;
  /** What the reason is for, in the field's hint row. */
  reasonHint?: string;
  /**
   * Runs once the gate is satisfied, with whatever the gate collected.
   *
   * Declared with the argument rather than without, so a handler that ignores
   * it — every existing one — still assigns.
   */
  onConfirm: (details: ConfirmDetails) => void | Promise<void>;
  onClose: () => void;
  /** Where focus goes when this closes. See `Dialog`. */
  restoreFocusTo?: RefObject<HTMLElement | null>;
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
 *
 * Three strengths of gate, and the difference between them is what the person
 * has to do rather than how loudly the dialog is painted. A confirmation on
 * its own asks them to read; `typeToConfirm` asks them to name the record;
 * `requireReason` asks them to account for it. Painting a louder dialog and
 * asking for the same single click is a warning, not a gate.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = true,
  typeToConfirm,
  requireReason,
  reasonLabel = 'Reason',
  reasonHint,
  onConfirm,
  onClose,
  restoreFocusTo,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [reason, setReason] = useState('');

  const satisfied = confirmGateOpen({ typeToConfirm, typed, requireReason, reason });

  // Reset on the way out rather than in an effect, so a dialog reopened after
  // a failure never shows the previous attempt's error, spinner, or half-typed
  // record name. Both exits go through here: the one the person takes and the
  // one a successful confirmation takes.
  function clear() {
    setError(null);
    setTyped('');
    setReason('');
  }

  function close() {
    if (pending) return;
    clear();
    onClose();
  }

  async function confirm() {
    if (pending || !satisfied) return;
    setPending(true);
    setError(null);
    try {
      await onConfirm({ typed, reason });
      setPending(false);
      clear();
    } catch {
      setError('That did not go through. Check your connection and try again.');
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onClose={close} title={title} restoreFocusTo={restoreFocusTo}>
      <p className="kairos-body">{message}</p>

      {/* The gate's own fields, in the order the person works through them:
          name the record, then say why. Both are ordinary fields, so each
          holds its label, control and message rows and the dialog is one
          height whether or not either is filled. */}
      {typeToConfirm ? (
        <InputField
          label={`Type ${typeToConfirm} to confirm`}
          value={typed}
          autoComplete="off"
          spellCheck={false}
          hint="Letter case and surrounding spaces do not matter."
          onChange={(event) => setTyped(event.target.value)}
        />
      ) : null}

      {requireReason ? (
        <Field label={reasonLabel} hint={reasonHint}>
          {({ id, describedBy }) => (
            <textarea
              id={id}
              aria-describedby={describedBy}
              className="kairos-input-field"
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          )}
        </Field>
      ) : null}

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
          // Two states that look nothing alike, and must not be conflated.
          // Unsatisfied is unavailable — the gate has not been answered, and it
          // will still be unanswered when the person looks back, so it takes
          // the disabled treatment. Pending is the opposite: the action is
          // running, on the control they just pressed Enter on, so `loading`
          // keeps the rank, the box and the tab stop and refuses the press
          // itself.
          disabled={!satisfied}
          loading={pending}
          loadingLabel={`${confirmLabel}…`}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
