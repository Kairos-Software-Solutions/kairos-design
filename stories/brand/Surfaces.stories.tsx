import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { colour, one, all, rgb, shadow, style } from './computed';

/**
 * The brief's grounds, lists and marks at the Brand Scale: the soft card and
 * the panel under it, the bands, the tint cards, the tick list, the step line,
 * placeholder text, the photo slot and the marker.
 *
 * Which section of a site takes which ground is the site's decision; this page
 * only shows that each ground paints what the brief says.
 */
const meta: Meta = {
  title: 'Brand/Surfaces',
  parameters: { layout: 'padded', scale: 'brand' },
};

export default meta;
type Story = StoryObj;

export const CardsAndBands: Story = {
  render: () => (
    <div className="kairos-stack kairos-stack--lg">
      <div className="kairos-card kairos-card--soft kairos-pad" data-specimen="soft">
        <p className="kairos-type-body">A soft card: card ground, no edge, the soft shadow.</p>
      </div>
      <div className="kairos-card kairos-card--soft kairos-card--soft-rounded kairos-pad" data-specimen="soft-rounded">
        <p className="kairos-type-body">The same card with the 2px corner.</p>
      </div>
      <div className="kairos-panel kairos-pad" data-specimen="panel">
        <p className="kairos-type-body">A panel at the Brand Scale takes the same shadow and a 2px corner.</p>
      </div>
      <div className="kairos-inset-band" data-specimen="inset">
        <p className="kairos-type-body">An inset band: tint, inside the content width.</p>
      </div>
      <div className="kairos-section-band kairos-pad" data-specimen="section">
        <p className="kairos-type-body">A section band: the band ground, edge to edge.</p>
      </div>
      <div className="kairos-tint-card" data-specimen="tint">
        <p className="kairos-type-body">A tint card.</p>
      </div>
      <div className="kairos-tint-card kairos-tint-card--band" data-specimen="tint-band">
        <p className="kairos-type-body">A tint card on the band ground.</p>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const soft = shadow('--kairos-shadow-soft-card');
    // `0 14px 30px -20px` in the soft shadow colour.
    await expect(soft).toBe('rgba(71, 55, 40, 0.32) 0px 14px 30px -20px');

    const card = one(canvasElement, '[data-specimen="soft"]');
    await expect(style(card).backgroundColor).toBe(colour('--kairos-card'));
    await expect(style(card).backgroundColor).toBe(rgb('#ffffff'));
    await expect(style(card).borderTopWidth).toBe('0px');
    await expect(style(card).borderTopLeftRadius).toBe('0px');
    await expect(style(card).boxShadow).toBe(soft);
    await expect(style(one(canvasElement, '[data-specimen="soft-rounded"]')).borderTopLeftRadius).toBe('2px');

    const panel = one(canvasElement, '[data-specimen="panel"]');
    await expect(style(panel).boxShadow).toBe(soft);
    await expect(style(panel).borderTopLeftRadius).toBe('2px');

    await expect(style(one(canvasElement, '[data-specimen="inset"]')).backgroundColor).toBe(rgb('#e3eedc'));
    await expect(style(one(canvasElement, '[data-specimen="inset"]')).backgroundColor).toBe(colour('--kairos-tint'));
    await expect(style(one(canvasElement, '[data-specimen="section"]')).backgroundColor).toBe(rgb('#f1f6ec'));
    await expect(style(one(canvasElement, '[data-specimen="section"]')).backgroundColor).toBe(colour('--kairos-band'));
    await expect(style(one(canvasElement, '[data-specimen="tint"]')).backgroundColor).toBe(colour('--kairos-tint'));
    await expect(style(one(canvasElement, '[data-specimen="tint-band"]')).backgroundColor).toBe(colour('--kairos-band'));
  },
};

const STEPS = ['Tell us about your business', 'We call you back', 'We send a plan', 'You decide'];

export const Lists: Story = {
  render: () => (
    <div className="kairos-stack kairos-stack--xl" style={{ maxWidth: 960 }}>
      <ul className="kairos-tick-list" data-specimen="ticks">
        <li className="kairos-tick-list-item">
          <span className="kairos-tick-list-box" aria-hidden="true" />
          <span className="kairos-tick-list-label">Answer</span>
          <span className="kairos-tick-list-value">Within one working day</span>
        </li>
        <li className="kairos-tick-list-item">
          <span className="kairos-tick-list-box" aria-hidden="true" />
          <span className="kairos-tick-list-label">Cost of the first call</span>
          <span className="kairos-tick-list-value">Nothing</span>
        </li>
      </ul>
      <ul className="kairos-tick-list kairos-tick-list--statement">
        <li className="kairos-tick-list-item">
          <span className="kairos-tick-list-box" aria-hidden="true" />
          <span className="kairos-tick-list-value">One statement per row.</span>
        </li>
      </ul>
      <ol className="kairos-step-line" data-specimen="steps">
        {STEPS.map((title, i) => (
          <li className="kairos-step-line-item" key={title}>
            <span className="kairos-step-line-box">{i + 1}</span>
            <span className="kairos-step-line-title">{title}</span>
          </li>
        ))}
      </ol>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tick = colour('--kairos-tick');
    await expect(tick).toBe(rgb('#3d6f57'));

    const boxes = all(one(canvasElement, '[data-specimen="ticks"]'), '.kairos-tick-list-box');
    await expect(boxes).toHaveLength(2);
    for (const box of boxes) {
      const s = style(box);
      await expect(s.width).toBe('28px');
      await expect(s.height).toBe('28px');
      for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const) {
        await expect(s[`border${side}Width`]).toBe('2px');
        await expect(s[`border${side}Color`]).toBe(tick);
      }
    }

    const steps = all(one(canvasElement, '[data-specimen="steps"]'), '.kairos-step-line-box');
    await expect(steps).toHaveLength(4);
    await expect(style(steps[0]).backgroundColor).toBe(colour('--kairos-highlight'));
    for (const box of steps.slice(1)) {
      await expect(style(box).backgroundColor).toBe(colour('--kairos-card'));
      await expect(style(box).borderTopColor).toBe(tick);
      await expect(style(box).borderTopWidth).toBe('2px');
    }
  },
};

export const PlaceholdersAndMarker: Story = {
  render: () => (
    <div className="kairos-stack kairos-stack--xl" style={{ maxWidth: 720 }}>
      <p className="kairos-type-body">
        Opening hours: <span className="kairos-placeholder" data-specimen="placeholder">[opening hours to come]</span>
      </p>
      <div className="kairos-photo-slot" style={{ maxWidth: 320 }} data-specimen="photo">
        <span className="kairos-photo-slot-label">Photo to come: the team at work</span>
      </div>
      <h2 className="kairos-type-title kairos-title-bar">About us</h2>
      <p className="kairos-type-h2">
        Websites that <span className="kairos-marker" data-specimen="marker">bring you work</span>
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const placeholder = one(canvasElement, '[data-specimen="placeholder"]');
    await expect(style(placeholder).color).toBe(colour('--kairos-placeholder'));
    await expect(style(placeholder).color).toBe(rgb('#b93d10'));
    await expect(style(placeholder).fontWeight).toBe('600');

    const photo = one(canvasElement, '[data-specimen="photo"]');
    await expect(style(photo).boxShadow).toBe(shadow('--kairos-shadow-soft-photo'));
    await expect(style(photo).boxShadow).toBe('rgba(71, 55, 40, 0.32) 0px 10px 22px -12px');

    const marker = one(canvasElement, '[data-specimen="marker"]');
    await expect(style(marker, '::after').backgroundColor).toBe(colour('--kairos-highlight'));
    await expect(style(one(canvasElement, '.kairos-title-bar'), '::after').backgroundColor).toBe(colour('--kairos-highlight'));

    // Both tilt a degree through `rotate`, and set no `transform`, so a host that
    // wipes them in with `transform: scaleX()` keeps the tilt.
    for (const el of [marker, one(canvasElement, '.kairos-title-bar')]) {
      await expect(style(el, '::after').rotate).toBe('-1deg');
      await expect(style(el, '::after').transform).toBe('none');
    }
  },
};
