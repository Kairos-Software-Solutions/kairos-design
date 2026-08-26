import type { ReactNode } from 'react';

export interface PanelProps {
  heading?: ReactNode;
  /** Removes the panel's own padding, for a table that supplies its own. */
  flush?: boolean;
  children: ReactNode;
}

/**
 * A bordered container. No shadow: a shadow is a rank, and a panel that is
 * simply holding content is not raised above the page.
 */
export default function Panel({ heading, flush = false, children }: PanelProps) {
  return (
    <section className={['kairos-panel', flush && 'kairos-flush'].filter(Boolean).join(' ')}>
      {/* Epilogue 600, not Bebas. Bebas is the page title and nothing else in
          a tool, and a panel heading in it reads as a second page title. */}
      {heading ? <h2 className="kairos-panel-heading">{heading}</h2> : null}
      {children}
    </section>
  );
}

export interface PageHeaderProps {
  title: ReactNode;
  /** One primary action. Emphasis is a budget. */
  actions?: ReactNode;
}

/** The page title row: title left, action group right. */
export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <header className="kairos-page-header">
      <h1 className="kairos-page-title">{title}</h1>
      {actions ? <div className="kairos-page-header-actions">{actions}</div> : null}
    </header>
  );
}

export interface MetricProps {
  label: ReactNode;
  value: ReactNode;
}

/** A single figure with its label. Not a card: five boxes for five numbers is
 *  four borders more than the numbers need. */
export function Metric({ label, value }: MetricProps) {
  return (
    <div className="kairos-metric">
      <span className="kairos-metric-label">{label}</span>
      {/* Tabular numerals and no line break inside the figure: TTD 41,800.
          above 00 reads as two numbers. */}
      <span className="kairos-metric-value kairos-figure">{value}</span>
    </div>
  );
}

export function MetricRow({ children }: { children: ReactNode }) {
  return <div className="kairos-metric-row">{children}</div>;
}

/** Loading placeholder shaped like the content it replaces. */
export function Skeleton({
  variant = 'line',
}: {
  variant?: 'line' | 'heading' | 'label' | 'row' | 'control' | 'summary';
}) {
  return <div className={`kairos-skeleton kairos-skeleton--${variant}`} aria-hidden="true" />;
}

/**
 * A stack of skeletons standing in for a block of content.
 *
 * `aria-busy` on the region, and the skeletons themselves hidden: a screen
 * reader announcing four empty boxes is noise, and the one useful fact is that
 * something is loading.
 */
export function SkeletonStack({ lines = 3 }: { lines?: number }) {
  return (
    <div className="kairos-skeleton-stack" aria-busy="true" aria-live="polite">
      <span className="kairos-visually-hidden">Loading</span>
      <Skeleton variant="heading" />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} variant="line" />
      ))}
    </div>
  );
}
