import type { ElementType, ReactNode } from 'react';

export interface PanelProps {
  heading?: ReactNode;
  /** Removes the panel's own padding, for a table that supplies its own. */
  flush?: boolean;
  children: ReactNode;
}

/**
 * A bordered container. No shadow: a shadow is a rank, and a panel that is
 * simply holding content is not raised above the page.
 *
 * The padding is `kairos-pad`, applied here rather than left to the call site.
 * `.kairos-panel` carries the border and the ground only, so a panel written
 * by hand needs both classes — and every app that reached for `<Panel>` alone
 * got content sitting on the border, with a heading overlapping it. A
 * component whose `flush` prop promises to remove padding has to have applied
 * some.
 */
export default function Panel({ heading, flush = false, children }: PanelProps) {
  return (
    <section className={['kairos-panel', !flush && 'kairos-pad'].filter(Boolean).join(' ')}>
      {/* Epilogue 600, not Bebas. Bebas is the page title and nothing else in
          a tool, and a panel heading in it reads as a second page title. */}
      {heading ? <h2 className="kairos-panel-heading">{heading}</h2> : null}
      {children}
    </section>
  );
}

export interface PageHeaderProps {
  /**
   * The eyebrow over the title, and only where it names real nesting:
   * `Invoices` above `Invoice INV-0042`. On a top-level screen the nav item
   * repeated above the title is two lines of chrome carrying no information.
   */
  kicker?: ReactNode;
  /**
   * Where the kicker goes, when the screen above it is a real screen.
   *
   * This is the breadcrumb, and it is why a screen needs no `BACK TO …`
   * button: navigation between pages is a link, and a bordered button in the
   * header spends one of the two secondary action slots doing a link's job.
   */
  kickerHref?: string;
  /**
   * The link component to render `kickerHref` with. Defaults to `<a>`, which
   * is a full page load in a routed app — pass the router's own link
   * (`next/link`, `react-router`'s `Link`) to keep the soft navigation.
   *
   * A component rather than a node, because the class has to go on the anchor
   * itself: `kairos-kicker-link` adds the underline and the 24px target to the
   * eyebrow rank `kairos-kicker` sets, so the two are one element's class list
   * and a call site handing in a finished node would be deciding that here.
   * `EmptyState` takes a node for the opposite reason — an action is whatever
   * the surface has, and three of the five have no router at all.
   */
  kickerAs?: ElementType;
  title: ReactNode;
  /** One sentence under the title: what this screen is for, or what it counts. */
  description?: ReactNode;
  /** One primary action. Emphasis is a budget. */
  actions?: ReactNode;
}

/**
 * The page title row: the kicker and title left, action group right, one line
 * of supporting copy under the title.
 *
 * `kairos-page-header-description` has been in the stylesheet since the port
 * and this component never rendered it, so every app grew its own subtitle
 * class with its own measure and its own margin. It is one element; it belongs
 * to the header that owns the spacing above and below it.
 *
 * The kicker was the same story one step further along. It has to sit inside
 * `kairos-page-header-body`, above the `h1` — a place a call site cannot reach
 * from outside this component — so Paykit kept a second `PageHeader` for
 * sixty-six screens that name a parent. Two components rendering one row is
 * one of them drifting; this is the row.
 */
export function PageHeader({
  kicker,
  kickerHref,
  kickerAs,
  title,
  description,
  actions,
}: PageHeaderProps) {
  const KickerLink: ElementType = kickerAs ?? 'a';

  return (
    <header className="kairos-page-header">
      <div className="kairos-page-header-body">
        {kicker
          ? kickerHref
            ? (
              <KickerLink href={kickerHref} className="kairos-kicker kairos-kicker-link">
                {kicker}
              </KickerLink>
            )
            : <span className="kairos-kicker">{kicker}</span>
          : null}
        <h1 className="kairos-page-title">{title}</h1>
        {description ? <p className="kairos-page-header-description">{description}</p> : null}
      </div>
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
