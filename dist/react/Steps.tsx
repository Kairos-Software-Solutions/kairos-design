'use client';

export interface StepsProps {
  /** Names the sequence for assistive technology: `Quote steps`. */
  label: string;
  steps: readonly string[];
  /** The step the person is on, from zero. */
  current: number;
  /**
   * Moves to a step. Leave it out where the sequence is read-only — an import
   * that moves forward as each part finishes — and the steps render as text.
   */
  onSelect?: (index: number) => void;
}

/**
 * A sequence on one row: a composer's steps, an import's stages.
 *
 * One bordered row with shared dividers, the current step in ink. It never
 * wraps: where the names do not fit, every step but the current one drops to
 * its number, so a phone reads `1  2 ITEMS  3  4`. The dropped names are
 * hidden visually and kept for a screen reader, which still hears every step.
 * The stylesheet folds each count from two to seven at its own width, read
 * from the row through a container query, so the same row folds the same way
 * in a dialog and in a page.
 *
 * Paykit built this as its composer header after the registry's segmented
 * control wrapped four steps onto two rows; the wizard rail broke its labels a
 * letter per line in the same place. This is that header, for every app.
 */
export default function Steps({ label, steps, current, onSelect }: StepsProps) {
  return (
    <nav aria-label={label} className="kairos-steps" data-count={steps.length}>
      <ol className="kairos-steps-list">
        {steps.map((name, index) => {
          const state = {
            'aria-current': index === current ? ('step' as const) : undefined,
            'data-done': index < current ? 'true' : undefined,
          };
          const body = (
            <>
              <span className="kairos-step-number" aria-hidden="true">{index + 1}</span>
              <span className="kairos-step-label">{name}</span>
            </>
          );
          return (
            <li key={name} className="kairos-steps-item" data-current={index === current ? 'true' : undefined}>
              {onSelect ? (
                <button type="button" className="kairos-step" onClick={() => onSelect(index)} {...state}>
                  {body}
                </button>
              ) : (
                <span className="kairos-step" {...state}>
                  {body}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
