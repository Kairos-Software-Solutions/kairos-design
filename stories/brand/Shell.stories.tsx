import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import Button from '../../dist/react/Button';
import { colour, height, length, one, all, style } from './computed';

/**
 * The website's shell at the Brand Scale: the sticky header, the footer and
 * the phone menu's sheet and toggle.
 *
 * The package draws the states. Opening and closing the menu, moving focus,
 * locking the scroll, and which header button collapses at which width are
 * the site's code; the toggle here flips one piece of React state so the
 * drawn states can be read.
 */
const meta: Meta = {
  title: 'Brand/Shell',
  parameters: { layout: 'fullscreen', scale: 'brand' },
};

export default meta;
type Story = StoryObj;

function Logo() {
  return <a className="kairos-menu-link" href="#top">Kairos</a>;
}

export const HeaderAndFooter: Story = {
  render: () => (
    <div>
      <header className="kairos-site-header" data-specimen="header">
        <div className="kairos-wrap kairos-site-header-inner">
          <Logo />
          <nav className="kairos-site-header-nav" aria-label="Main">
            <a className="kairos-menu-link" href="#home" aria-current="page">Home</a>
            <a className="kairos-menu-link" href="#about">About</a>
            <a className="kairos-menu-link" href="#contact">Contact</a>
            <a className="kairos-lang-link" href="#es" lang="es" hrefLang="es">Español</a>
          </nav>
          <div className="kairos-site-header-actions">
            <Button variant="primary" size="sm">Book a call</Button>
          </div>
          <button className="kairos-site-menu-toggle" type="button" aria-expanded="false">
            <span className="kairos-site-menu-bars" aria-hidden="true" />
            Menu
          </button>
        </div>
      </header>
      <div className="kairos-wrap" style={{ minHeight: 240, paddingBlock: 48 }}>
        <p className="kairos-type-body">Page content.</p>
      </div>
      <footer className="kairos-site-footer" data-specimen="footer">
        <div className="kairos-wrap">
          <div className="kairos-site-footer-columns">
            <p className="kairos-type-small">Websites for small businesses.</p>
            <div>
              <h2 className="kairos-site-footer-heading">Pages</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                <li><a className="kairos-site-footer-link" href="#about-footer">About</a></li>
                <li><a className="kairos-site-footer-link" href="#contact-footer">Contact</a></li>
              </ul>
            </div>
            <div>
              <h2 className="kairos-site-footer-heading">Contact</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                <li><a className="kairos-site-footer-link" href="#email-footer">[email to come]</a></li>
              </ul>
            </div>
          </div>
          <p className="kairos-site-footer-legal">[legal line to come]</p>
        </div>
      </footer>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const card = colour('--kairos-card');

    const header = one(canvasElement, '[data-specimen="header"]');
    await expect(style(header).position).toBe('sticky');
    await expect(style(header).backgroundColor).toBe(card);
    await expect(height(header)).toBe(length('--kairos-site-header-h'));

    const footer = one(canvasElement, '[data-specimen="footer"]');
    await expect(style(footer).backgroundColor).toBe(card);
    await expect(style(footer).borderTopWidth).toBe('1px');
    await expect(style(footer).borderTopStyle).toBe('solid');
    await expect(style(footer).borderTopColor).toBe(colour('--kairos-rule'));
    await expect(style(footer).borderTopColor).toBe('rgba(22, 17, 11, 0.18)');

    // The headings are h2 elements: the base heading rule's capitals, tracking
    // and line height of 1 must not reach them. 15px at 1.6 is a 24px line.
    const headings = all(footer, '.kairos-site-footer-heading');
    await expect(headings).toHaveLength(2);
    for (const heading of headings) {
      await expect(heading.tagName).toBe('H2');
      await expect(style(heading).textTransform).toBe('none');
      await expect(style(heading).lineHeight).toBe('24px');
    }
  },
};

function PhoneMenuSpecimen() {
  const [open, setOpen] = useState(false);
  return (
    // `transform` makes this box the containing block for the fixed sheet, so
    // the sheet opens inside the story rather than over the workshop.
    <div style={{ position: 'relative', minHeight: 560, transform: 'translateZ(0)' }}>
      <header className="kairos-site-header">
        <div className="kairos-wrap kairos-site-header-inner">
          <Logo />
          {/* Wrapped, so the header's own rule that hides the toggle from 900px
              up does not apply: this story reads the toggle at any width. */}
          <div style={{ marginLeft: 'auto' }}>
            <button
              className="kairos-site-menu-toggle"
              type="button"
              aria-expanded={open}
              aria-controls="phone-menu"
              onClick={() => setOpen((was) => !was)}
              data-specimen="toggle"
            >
              <span className="kairos-site-menu-bars" aria-hidden="true" />
              Menu
            </button>
          </div>
        </div>
      </header>
      <nav className="kairos-site-menu" id="phone-menu" aria-label="Phone menu" hidden={!open} data-specimen="menu">
        <div>
          <a className="kairos-site-menu-row" href="#home-menu">Home</a>
          <a className="kairos-site-menu-row" href="#about-menu" aria-current="page" data-specimen="current-row">About</a>
          <a className="kairos-site-menu-row" href="#contact-menu">Contact</a>
        </div>
        <a className="kairos-lang-link kairos-lang-link--row" href="#es-menu" lang="es" hrefLang="es">Español</a>
        <Button variant="primary">Book a call</Button>
      </nav>
    </div>
  );
}

export const PhoneMenu: Story = {
  render: () => <PhoneMenuSpecimen />,
  play: async ({ canvasElement }) => {
    const toggle = one(canvasElement, '[data-specimen="toggle"]');
    const menu = one(canvasElement, '[data-specimen="menu"]');
    const bars = one(toggle, '.kairos-site-menu-bars');

    await expect(toggle.getAttribute('aria-expanded')).toBe('false');
    await expect(menu.hidden).toBe(true);
    await expect(style(menu).display).toBe('none');
    await expect(style(bars, '::before').transform).toBe('none');

    await userEvent.click(toggle);
    await expect(toggle.getAttribute('aria-expanded')).toBe('true');
    await expect(menu.hidden).toBe(false);
    await expect(style(menu).display).not.toBe('none');
    await expect(style(menu).backgroundColor).toBe(colour('--kairos-card'));
    // Both bars carry a rotation: the two lines have crossed.
    for (const pseudo of ['::before', '::after']) {
      await waitFor(() => {
        const matrix = style(bars, pseudo).transform.match(/matrix\(([^)]+)\)/);
        expect(matrix).not.toBeNull();
        const [a, b] = matrix![1].split(',').map(Number);
        // 45 degrees either way: cos and |sin| both about 0.707.
        expect(Math.abs(b)).toBeGreaterThan(0.7);
        expect(Math.abs(a)).toBeLessThan(0.71);
      });
    }
    const rows = all(menu, '.kairos-site-menu-row');
    await expect(rows).toHaveLength(3);

    // Every row is 23px; the current page's row is underlined in its own ink,
    // 6px under the text, and the others are not underlined.
    const current = one(menu, '[data-specimen="current-row"]');
    for (const row of rows) await expect(style(row).fontSize).toBe('23px');
    await expect(style(current).textDecorationLine).toBe('underline');
    await expect(style(current).textUnderlineOffset).toBe('6px');
    await expect(style(current).textDecorationColor).toBe(style(current).color);
    for (const row of rows.filter((r) => r !== current)) await expect(style(row).textDecorationLine).toBe('none');
  },
};
