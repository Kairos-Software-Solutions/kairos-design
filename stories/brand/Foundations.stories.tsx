import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { colour, one, rgb, style } from './computed';

/**
 * The brief's colours and type ranks, at the Brand Scale.
 *
 * Colours are shared, so these are the values every app has after a bump; the
 * ranks are what the Brand Scale changes. The full palette, both themes, is on
 * `Foundations/Colour`.
 */
const meta: Meta = {
  title: 'Brand/Foundations',
  parameters: { layout: 'padded', scale: 'brand' },
};

export default meta;
type Story = StoryObj;

/** Each brief colour role and its approved light value. */
const ROLES: Array<{ token: string; hex: string; use: string }> = [
  { token: '--kairos-page', hex: '#fff8eb', use: 'The page.' },
  { token: '--kairos-card', hex: '#ffffff', use: 'Cards, the header, the footer, fields.' },
  { token: '--kairos-band', hex: '#f1f6ec', use: 'A full-width section band.' },
  { token: '--kairos-tint', hex: '#e3eedc', use: 'Inset band, tint card, a ticked box, a focused field.' },
  { token: '--kairos-picked', hex: '#fff0c4', use: 'A picked day or time.' },
  { token: '--kairos-ink', hex: '#16110b', use: 'Text, control edges, focus ring.' },
  { token: '--kairos-ink-2', hex: '#473728', use: 'Secondary text.' },
  { token: '--kairos-ink-3', hex: '#79624a', use: 'Labels, hints, field borders.' },
  { token: '--kairos-highlight', hex: '#ffc247', use: 'The main button, underlines, the marker.' },
  { token: '--kairos-highlight-strong', hex: '#ffb627', use: 'The main button on hover.' },
  { token: '--kairos-tick', hex: '#3d6f57', use: 'Ticks, the step line. Never text, never a fill.' },
  { token: '--kairos-placeholder', hex: '#b93d10', use: 'Content still to come.' },
  { token: '--kairos-error', hex: '#b3261e', use: 'Error text and badge, the required mark, an invalid edge.' },
  { token: '--kairos-on-error', hex: '#ffffff', use: 'The "!" in the badge.' },
];

export const Colours: Story = {
  render: () => (
    <div className="kairos-stack kairos-stack--lg">
      <p className="kairos-type-lead" style={{ maxWidth: '60ch' }}>
        The brief&apos;s roles. The 0.14 names (bg, surface, text, accent, focus) still resolve, as aliases of these.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {ROLES.map(({ token, hex, use }) => (
          <div className="kairos-stack kairos-stack--xs" key={token}>
            <div
              data-swatch={token}
              style={{ height: 64, background: `var(${token})`, boxShadow: 'inset 0 0 0 1px var(--kairos-rule)' }}
            />
            <span className="kairos-type-label">{token.replace('--kairos-', '')}</span>
            <span className="kairos-type-small">{hex} · {use}</span>
          </div>
        ))}
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const { token, hex } of ROLES) {
      await expect(colour(token)).toBe(rgb(hex));
      await expect(style(one(canvasElement, `[data-swatch="${token}"]`)).backgroundColor).toBe(rgb(hex));
    }
    // The renamed roles keep their 0.14 names as aliases.
    await expect(colour('--kairos-bg')).toBe(colour('--kairos-page'));
    await expect(colour('--kairos-surface')).toBe(colour('--kairos-card'));
    await expect(colour('--kairos-text')).toBe(colour('--kairos-ink'));
    await expect(colour('--kairos-accent')).toBe(colour('--kairos-highlight'));
    await expect(colour('--kairos-accent-hover')).toBe(colour('--kairos-highlight-strong'));
  },
};

const RANKS: Array<{ rank: string; sample: string }> = [
  { rank: 'display', sample: 'Websites that bring you work' },
  { rank: 'title', sample: 'About us' },
  { rank: 'h2', sample: 'How it works' },
  { rank: 'h3', sample: 'A call first' },
  { rank: 'quote', sample: 'They answered the same day.' },
  { rank: 'lead', sample: 'A short introduction under the page title.' },
  { rank: 'statement', sample: 'One clear statement in a list.' },
  { rank: 'body', sample: 'Body copy, read rather than glanced at.' },
  { rank: 'small', sample: 'Small print beside a field or a photo.' },
  { rank: 'legal', sample: 'The legal line in the footer.' },
  { rank: 'label', sample: 'Pages' },
  { rank: 'price', sample: '$ 1,200' },
  { rank: 'button', sample: 'Book a call' },
  { rank: 'nav', sample: 'About' },
];

export const TypeRanks: Story = {
  render: () => (
    <div className="kairos-stack kairos-stack--lg">
      {RANKS.map(({ rank, sample }) => (
        <div className="kairos-stack kairos-stack--xs" key={rank}>
          <span className="kairos-type-label">{rank}</span>
          <p className={`kairos-type-${rank}`} data-rank={rank} style={{ margin: 0 }}>
            {sample}
          </p>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const { rank } of RANKS) await expect(canvasElement.querySelector(`.kairos-type-${rank}`)).not.toBeNull();

    const display = style(one(canvasElement, '[data-rank="display"]'));
    await expect(display.fontFamily).toMatch(/^"?Archivo"?,/);
    await expect(display.fontWeight).toBe('800');
    await expect(display.fontStretch).toBe('118%');

    const body = style(one(canvasElement, '[data-rank="body"]'));
    await expect(body.fontFamily).toMatch(/^"?Archivo"?,/);
    await expect(body.fontSize).toBe('17px');
    await expect(parseFloat(body.lineHeight) / parseFloat(body.fontSize)).toBeCloseTo(1.6, 5);

    for (const rank of ['label', 'price']) {
      const s = style(one(canvasElement, `[data-rank="${rank}"]`));
      await expect(s.fontFamily).toMatch(/^"?Courier Prime"?,/);
      await expect(s.fontWeight).toBe('700');
    }
  },
};
