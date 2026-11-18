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

const RANKS: Array<{ rank: string; className: string; sample: string }> = [
  { rank: 'display', className: 'kairos-type-display', sample: 'Websites that bring you work' },
  { rank: 'title', className: 'kairos-type-title', sample: 'About us' },
  { rank: 'title--compact', className: 'kairos-type-title kairos-type-title--compact', sample: 'Contact' },
  { rank: 'h2', className: 'kairos-type-h2', sample: 'How it works' },
  { rank: 'h3', className: 'kairos-type-h3', sample: 'A call first' },
  { rank: 'card', className: 'kairos-type-card', sample: 'A website that works' },
  { rank: 'card--sm', className: 'kairos-type-card kairos-type-card--sm', sample: 'Who it is for' },
  { rank: 'quote', className: 'kairos-type-quote', sample: 'They answered the same day.' },
  { rank: 'lead', className: 'kairos-type-lead', sample: 'A short introduction under the page title.' },
  { rank: 'statement', className: 'kairos-type-statement', sample: 'One clear statement in a list.' },
  { rank: 'body', className: 'kairos-type-body', sample: 'Body copy, read rather than glanced at.' },
  { rank: 'small', className: 'kairos-type-small', sample: 'Small print beside a field or a photo.' },
  { rank: 'legal', className: 'kairos-type-legal', sample: 'The legal line in the footer.' },
  { rank: 'label', className: 'kairos-type-label', sample: 'Pages' },
  { rank: 'price', className: 'kairos-type-price', sample: '$ 1,200' },
  { rank: 'time', className: 'kairos-type-time', sample: '9:00 to 9:30' },
  { rank: 'button', className: 'kairos-type-button', sample: 'Book a call' },
  { rank: 'nav', className: 'kairos-type-nav', sample: 'About' },
];

export const TypeRanks: Story = {
  render: () => (
    <div className="kairos-stack kairos-stack--lg">
      {RANKS.map(({ rank, className, sample }) => (
        <div className="kairos-stack kairos-stack--xs" key={rank}>
          <span className="kairos-type-label">{rank}</span>
          <p className={className} data-rank={rank} style={{ margin: 0 }}>
            {sample}
          </p>
        </div>
      ))}
      {/* A label set on a heading: the base heading rule must not capitalise it. */}
      <div className="kairos-stack kairos-stack--xs">
        <span className="kairos-type-label">label on a heading</span>
        <h3 className="kairos-type-label" data-rank="label-heading" style={{ margin: 0 }}>
          What we set up
        </h3>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const { rank, className } of RANKS) {
      const el = one(canvasElement, `[data-rank="${rank}"]`);
      await expect(canvasElement.querySelector(`.${className.split(' ')[0]}`)).not.toBeNull();
      // The brief: never set a width. Every rank computes the family's normal one.
      await expect(style(el).fontStretch).toBe('100%');
    }

    const display = style(one(canvasElement, '[data-rank="display"]'));
    await expect(display.fontFamily).toMatch(/^"?Epilogue"?,/);
    await expect(display.fontWeight).toBe('800');
    await expect(display.fontStretch).toBe('100%');

    const body = style(one(canvasElement, '[data-rank="body"]'));
    await expect(body.fontFamily).toMatch(/^"?Epilogue"?,/);
    await expect(body.fontSize).toBe('17px');
    await expect(parseFloat(body.lineHeight) / parseFloat(body.fontSize)).toBeCloseTo(1.6, 5);

    // The compact title is the title at its own size; that size follows the
    // viewport, so only its weight and case are read here.
    const compact = style(one(canvasElement, '[data-rank="title--compact"]'));
    await expect(compact.fontFamily).toMatch(/^"?Epilogue"?,/);
    await expect(compact.fontWeight).toBe('800');
    await expect(compact.textTransform).toBe('none');

    // The card heading: 20px at 800 and 1.15, no case change; the small one is 19px.
    const card = style(one(canvasElement, '[data-rank="card"]'));
    await expect(card.fontFamily).toMatch(/^"?Epilogue"?,/);
    await expect(card.fontSize).toBe('20px');
    await expect(card.fontWeight).toBe('800');
    await expect(parseFloat(card.lineHeight) / parseFloat(card.fontSize)).toBeCloseTo(1.15, 5);
    await expect(card.textTransform).toBe('none');
    await expect(style(one(canvasElement, '[data-rank="card--sm"]')).fontSize).toBe('19px');

    for (const rank of ['label', 'price']) {
      const s = style(one(canvasElement, `[data-rank="${rank}"]`));
      await expect(s.fontFamily).toMatch(/^"?Courier Prime"?,/);
      await expect(s.fontWeight).toBe('700');
    }

    // The time line is typed too, at 400 and 16px on a 1.6 line.
    const time = style(one(canvasElement, '[data-rank="time"]'));
    await expect(time.fontFamily).toMatch(/^"?Courier Prime"?,/);
    await expect(time.fontWeight).toBe('400');
    await expect(time.fontSize).toBe('16px');
    await expect(parseFloat(time.lineHeight) / parseFloat(time.fontSize)).toBeCloseTo(1.6, 5);

    // A label on an h3 keeps the brief's case: the base heading rule's capitals do not reach it.
    const heading = style(one(canvasElement, '[data-rank="label-heading"]'));
    await expect(heading.textTransform).toBe('none');
    await expect(heading.fontFamily).toMatch(/^"?Courier Prime"?,/);
  },
};
