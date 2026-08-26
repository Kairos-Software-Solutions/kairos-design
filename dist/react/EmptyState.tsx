import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** One plain sentence. Not a heading and a paragraph. */
  message: ReactNode;
  /** The screen's primary action, as a button or a link. */
  action?: ReactNode;
}

/**
 * A list or table with no records.
 *
 * An empty list is not an error: it takes no state colour, no alert role, and
 * no `Try again`. It says what is not here and offers the way to make one.
 *
 * The action is a `ReactNode` rather than an href so this works in any React
 * app. Taking `actionHref` would bind the registry to one framework's router,
 * and three of the five Kairos surfaces do not have one.
 */
export default function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="kairos-empty-state">
      <p>{message}</p>
      {action}
    </div>
  );
}
