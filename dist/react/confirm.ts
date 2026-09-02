/**
 * The two rules a confirmation gate applies before it will let an action run.
 *
 * Separate from `ConfirmDialog.tsx` so they can be tested without a renderer,
 * the way `sort.ts` sits beside `DataTable`. Both are pure string logic and
 * both decide whether an irreversible action happens, which is the part of
 * that component most worth a test.
 */

/**
 * Does what the person typed match the record they were asked to name?
 *
 * Trimmed and case-insensitive, and both of those are deliberate. The dialog
 * shows the expected string, so the person is copying it off the screen — and
 * a copy that fails on a trailing space, or on `PURGE` against `purge`, is a
 * requirement the prompt never stated. What this gate is for is proof that the
 * right record was read, not proof that a keyboard was used carefully.
 *
 * `toLocaleLowerCase` rather than `toLowerCase`: a record named with a Turkish
 * dotted capital I lowercases differently under the two, and the comparison is
 * between something a person typed and something a person named.
 */
export function confirmationMatches(value: string, expected?: string): boolean {
  if (!expected) return true;
  return value.trim().toLocaleLowerCase() === expected.trim().toLocaleLowerCase();
}

/** What a gate is currently asking for, and what it has been given. */
export interface ConfirmGate {
  /** The string the person has to type, if the gate asks for one. */
  typeToConfirm?: string;
  /** What they have typed so far. */
  typed: string;
  /** Whether a written reason is required. */
  requireReason?: boolean;
  /** What they have written so far. */
  reason: string;
}

/**
 * Is the gate satisfied?
 *
 * A gate with neither requirement is open, which is what keeps the plain
 * confirmation — the common case, and every existing call site — exactly what
 * it was.
 */
export function confirmGateOpen({ typeToConfirm, typed, requireReason, reason }: ConfirmGate): boolean {
  if (!confirmationMatches(typed, typeToConfirm)) return false;
  if (requireReason && reason.trim() === '') return false;
  return true;
}
