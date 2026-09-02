import type { ReactNode } from 'react';
import type { Token } from './tokens';

/**
 * The furniture the Foundations pages are built from.
 *
 * These are workshop parts, not registry components, and they carry the
 * `spec-` prefix so that an agent reading the stories for patterns cannot
 * mistake one for something an app may use. If a specimen ever needs to look
 * like a Kairos component, that is the signal it should be one.
 */

export function Page({ title, lede, children }: { title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <div className="kairos-stack kairos-stack--xl">
      <header className="kairos-stack kairos-stack--xs">
        <h1 className="kairos-page-title">{title}</h1>
        {lede ? <p className="kairos-measure kairos-body-muted">{lede}</p> : null}
      </header>
      {children}
    </div>
  );
}

export function Section({ title, lede, children }: { title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <section className="kairos-stack kairos-stack--md">
      <div className="kairos-stack kairos-stack--xs">
        <h2 className="kairos-section-title">{title}</h2>
        {lede ? <p className="kairos-measure kairos-body-muted">{lede}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** One colour, painted from the custom property so the theme decides the value. */
export function Swatch({ token }: { token: Token }) {
  return (
    <div className="kairos-stack kairos-stack--xs">
      <div className="spec-swatch" style={{ background: `var(${token.name})` }} />
      <span className="spec-name">{token.name.replace('--kairos-', '')}</span>
      <span className="spec-value">{token.light}</span>
    </div>
  );
}

export function Swatches({ tokens }: { tokens: Token[] }) {
  return (
    <div className="spec-grid">
      {tokens.map((token) => <Swatch key={token.name} token={token} />)}
    </div>
  );
}

/** A token's name against its value. For geometry, type, and motion. */
export function Values({ tokens }: { tokens: Token[] }) {
  return (
    <div className="kairos-panel kairos-pad">
      {tokens.map((token) => (
        <div className="spec-row" key={token.name}>
          <span className="spec-name">{token.name.replace('--kairos-', '')}</span>
          <span className="spec-value">{token.light}</span>
        </div>
      ))}
    </div>
  );
}

/** The reasoning that ships in `tokens.css`, shown beside what it decided. */
export function Note({ children }: { children: ReactNode }) {
  return <p className="spec-note kairos-measure">{children}</p>;
}
