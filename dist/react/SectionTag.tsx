import type { ReactNode } from 'react';

export interface SectionTagProps {
  /** The label. A few words, not a sentence: the rule needs the room. */
  children: ReactNode;
  /**
   * Render the label as a heading. A public page's sections are usually real
   * headings, and a screen reader's heading list is how a reader skips
   * between them. Left off, the label is a `<span>` and names nothing, which
   * is why `'span'` is in the union: the default has to be a value the prop
   * accepts, or the component does not typecheck against its own signature.
   */
  as?: 'span' | 'h2' | 'h3' | 'h4';
}

/**
 * The Brand Scale section transition: a label, then a rule to the edge.
 *
 * The label's type rank comes from the stylesheet rather than from a class the
 * call site passes, because a rule paired with the wrong rank is the only way
 * to get this pattern visibly wrong.
 *
 * This is not `PageHeader`. That is the 56px row at the top of a tool screen,
 * with the page title and one primary action. This opens a section partway
 * down a public page and carries no actions at all.
 */
export default function SectionTag({ children, as: Label = 'span' }: SectionTagProps) {
  return (
    <div className="kairos-section-tag">
      <Label>{children}</Label>
    </div>
  );
}
