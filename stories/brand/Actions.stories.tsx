import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import Button from '../../dist/react/Button';
import { colour, durationOf, height, noShadow, one, all, rgb, style, width } from './computed';

/**
 * The brief's main and outline buttons and its three links, at the Brand
 * Scale.
 *
 * The play functions read rest states only. Hover, press and focus are not
 * reachable from a play function, so the brief's state shots are checked in a
 * browser by the reviewer.
 */
const meta: Meta = {
  title: 'Brand/Actions',
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

const onBusyClick = fn();

/** Workshop layout only: a wrapping row. */
const ROW = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 } as const;

export const Buttons: Story = {
  parameters: { scale: 'brand' },
  render: () => (
    <div className="kairos-stack kairos-stack--lg">
      <div style={ROW} data-specimen="default">
        <Button variant="primary">Book a call</Button>
        <Button variant="secondary">Book a call</Button>
      </div>
      <div style={ROW} data-specimen="small">
        <Button variant="primary" size="sm">Book a call</Button>
        <Button variant="secondary" size="sm">Book a call</Button>
      </div>
      <div style={ROW} data-specimen="busy">
        <Button variant="primary" loading={false} loadingLabel="Sending…">Send</Button>
        <Button variant="primary" loading loadingLabel="Sending…" onClick={onBusyClick}>Send</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(document.documentElement.dataset.scale).toBe('brand');

    const ink = rgb('#16110b');
    const sizes = [
      { specimen: 'default', h: 50, pad: '26px' },
      { specimen: 'small', h: 44, pad: '18px' },
    ];
    for (const { specimen, h, pad } of sizes) {
      const row = one(canvasElement, `[data-specimen="${specimen}"]`);
      const primary = one(row, '.kairos-button--primary');
      const secondary = one(row, '.kairos-button--secondary');
      for (const button of [primary, secondary]) {
        const s = style(button);
        await expect(s.borderTopLeftRadius).toBe('3px');
        await expect(height(button)).toBe(h);
        await expect(s.paddingLeft).toBe(pad);
        await expect(s.paddingRight).toBe(pad);
        await expect(s.fontSize).toBe('16px');
        await expect(s.fontWeight).toBe('700');
        await expect(s.textTransform).toBe('none');
        await expect(noShadow(s.boxShadow)).toBe(true);
        await expect(s.borderTopWidth).toBe('2px');
        await expect(s.borderTopColor).toBe(ink);
        await expect(durationOf(button, 'background-color')).toBe(160);
        await expect(durationOf(button, 'box-shadow')).toBe(160);
      }
      await expect(style(primary).backgroundColor).toBe(colour('--kairos-highlight'));
      await expect(style(primary).backgroundColor).toBe(rgb('#ffc247'));
      await expect(style(secondary).backgroundColor).toBe(colour('--kairos-card'));
      await expect(width(primary)).toBe(width(secondary));
    }

    // A busy button keeps its box, says it is busy, and refuses the press.
    const [idle, busy] = all(one(canvasElement, '[data-specimen="busy"]'), '.kairos-button');
    await expect(width(busy)).toBe(width(idle));
    await expect(busy.getAttribute('aria-busy')).toBe('true');
    await expect(idle.hasAttribute('aria-busy')).toBe(false);
    await userEvent.click(busy);
    await expect(onBusyClick).not.toHaveBeenCalled();

    // The ring is hidden while idle, and a hidden element still animates unless
    // told not to: it turns only on the busy button.
    await expect(style(one(idle, '.kairos-spin')).animationName).toBe('none');
    await expect(style(one(busy, '.kairos-spin')).animationName).toBe('kairos-spin');
  },
};

export const Links: Story = {
  parameters: { scale: 'brand' },
  render: () => (
    <div className="kairos-stack kairos-stack--lg">
      <p className="kairos-type-body">
        <a className="kairos-text-link" href="#how-it-works" data-specimen="text">
          <span className="kairos-text-link-text">
            See how it works <span className="kairos-text-link-arrow" aria-hidden="true">→</span>
          </span>
        </a>
      </p>
      <nav aria-label="Menu specimen" style={ROW}>
        <a className="kairos-menu-link" href="#home" aria-current="page" data-specimen="current">Home</a>
        <a className="kairos-menu-link" href="#about" data-specimen="other">About</a>
        <a className="kairos-lang-link" href="#es" lang="es" hrefLang="es" data-specimen="lang">Español</a>
      </nav>
      <div>
        <a className="kairos-lang-link kairos-lang-link--row" href="#es-row" lang="es" hrefLang="es" data-specimen="lang-row">
          Español
        </a>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const ink = colour('--kairos-ink');
    const highlight = colour('--kairos-highlight');

    const text = one(canvasElement, '[data-specimen="text"]');
    const t = style(text);
    await expect(t.color).toBe(ink);
    await expect(t.fontWeight).toBe('700');
    await expect(t.textDecorationLine).toBe('underline');
    await expect(t.textDecorationColor).toBe(highlight);
    await expect(t.textDecorationThickness).toBe('3px');
    await expect(t.textUnderlineOffset).toBe('5px');
    await expect(height(text)).toBeGreaterThanOrEqual(44);

    // The label and the arrow sit in one wrapper, so the arrow is no flex item
    // of the link and draws no underline of its own. A flex container blockifies
    // its child, so the wrapper's `display: inline` computes to `block` here.
    await expect(text.children).toHaveLength(1);
    const wrapper = text.children[0] as HTMLElement;
    await expect(wrapper.classList.contains('kairos-text-link-text')).toBe(true);
    await expect(style(wrapper).display).toBe('block');
    await expect(style(one(wrapper, '.kairos-text-link-arrow')).display).toBe('inline-block');

    const current = one(canvasElement, '[data-specimen="current"]');
    const other = one(canvasElement, '[data-specimen="other"]');
    for (const link of [current, other]) await expect(height(link)).toBeGreaterThanOrEqual(44);
    await expect(style(current).textDecorationLine).toBe('underline');
    await expect(style(current).textDecorationThickness).toBe('3px');
    await expect(style(current).textDecorationColor).toBe(highlight);
    await expect(style(other).textDecorationLine).toBe('none');

    const separator = style(one(canvasElement, '[data-specimen="lang"]'), '::before');
    await expect(separator.width).toBe('1px');
    await expect(separator.height).toBe('18px');
    await expect(separator.backgroundColor).toBe(colour('--kairos-ink-3'));

    const row = one(canvasElement, '[data-specimen="lang-row"]');
    await expect(height(row)).toBe(48);
    await expect(style(row, '::before').content).toBe('none');
  },
};

/**
 * The one story in this folder with no `scale` parameter. It renders after the
 * Brand stories, with `brand.css` still imported, and proves the decorator
 * took the switch off again: the Product Scale button is back.
 */
export const WithoutTheSwitch: Story = {
  render: () => (
    <div style={ROW}>
      <Button variant="primary">Save changes</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(document.documentElement.hasAttribute('data-scale')).toBe(false);
    const button = one(canvasElement, '.kairos-button--primary');
    const s = style(button);
    await expect(s.borderTopLeftRadius).toBe('0px');
    await expect(height(button)).toBe(36);
    await expect(s.boxShadow).toBe(`${rgb('#16110b')} 4px 4px 0px 0px`);
    // 0.17.0's sentence-case label.
    await expect(s.textTransform).toBe('none');
  },
};
