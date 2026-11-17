import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import InputField, { SelectField, Textarea } from '../../dist/react/Field';
import { colour, durationOf, height, one, all, rgb, style } from './computed';

/**
 * The brief's form: text fields, the required mark, tick boxes, the day grid,
 * the time-of-day switch, and the error line, at the Brand Scale.
 *
 * Every choice is a native checkbox or radio, so keyboard picking is the
 * browser's; the reviewer checks it by hand. These play functions click and
 * read what the browser computed.
 */
const meta: Meta = {
  title: 'Brand/Form',
  parameters: { layout: 'padded', scale: 'brand' },
};

export default meta;
type Story = StoryObj;

const DAYS = [
  ['Mon', '18'],
  ['Tue', '19'],
  ['Wed', '20'],
  ['Thu', '21'],
  ['Fri', '22'],
] as const;

const TIMES = ['Morning', 'Afternoon', 'Evening'] as const;

function DayGrid({ name, invalid }: { name: string; invalid?: boolean }) {
  return (
    <div className="kairos-day-grid" role="radiogroup" aria-label="Day" aria-invalid={invalid || undefined} data-specimen={`${name}-days`}>
      {DAYS.map(([weekday, date]) => (
        <label className="kairos-day-grid-cell" key={date}>
          <input className="kairos-day-grid-input" type="radio" name={name} value={date} />
          <span className="kairos-day-grid-face">
            <span className="kairos-day-grid-weekday">{weekday}</span>
            <span className="kairos-day-grid-date">{date}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

function TimeSwitch({ name, invalid }: { name: string; invalid?: boolean }) {
  return (
    <div className="kairos-time-switch" role="radiogroup" aria-label="Time of day" aria-invalid={invalid || undefined} data-specimen={`${name}-times`}>
      {TIMES.map((time) => (
        <label className="kairos-time-switch-option" key={time}>
          <input className="kairos-time-switch-input" type="radio" name={name} value={time} />
          <span className="kairos-time-switch-label">{time}</span>
        </label>
      ))}
      <span className="kairos-time-switch-pill" aria-hidden="true" />
    </div>
  );
}

export const Fields: Story = {
  render: () => (
    <form className="kairos-stack kairos-stack--md" style={{ maxWidth: 520 }} onSubmit={(event) => event.preventDefault()}>
      <InputField label="Your name" name="name" hint="As you would like us to address you." data-specimen="input" />
      <InputField label="Email" name="email" type="email" required data-specimen="required" />
      <Textarea label="What would you like to talk about?" name="message" data-specimen="textarea" />
      <SelectField label="Language" name="language" data-specimen="select">
        <option value="en">English</option>
        <option value="es">Español</option>
      </SelectField>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const ink3 = colour('--kairos-ink-3');
    await expect(ink3).toBe(rgb('#79624a'));

    const input = one(canvasElement, '[data-specimen="input"]');
    const textarea = one(canvasElement, '[data-specimen="textarea"]');
    const select = one(canvasElement, '[data-specimen="select"]');

    await expect(style(input).minHeight).toBe('52px');
    await expect(style(textarea).minHeight).toBe('120px');

    for (const control of [input, textarea]) {
      const s = style(control);
      await expect([s.paddingTop, s.paddingBottom]).toEqual(['10px', '10px']);
      await expect([s.paddingLeft, s.paddingRight]).toEqual(['14px', '14px']);
      await expect(s.borderTopWidth).toBe('2px');
      await expect(s.borderTopColor).toBe(ink3);
      await expect(s.borderTopLeftRadius).toBe('3px');
      await expect(s.fontSize).toBe('18px');
      await expect(s.fontWeight).toBe('500');
      await expect(durationOf(control, 'border-color')).toBe(160);
      await expect(durationOf(control, 'background-color')).toBe(160);
    }
    await expect(style(select).borderTopLeftRadius).toBe('3px');
    await expect(style(select).fontSize).toBe('18px');

    const field = input.closest('.kairos-field') as HTMLElement;
    const label = one(field, '.kairos-input-label');
    const l = style(label);
    await expect(l.fontSize).toBe('15px');
    await expect(l.fontWeight).toBe('700');
    await expect(l.textTransform).toBe('none');
    await expect(l.color).toBe(colour('--kairos-ink'));

    const hint = one(field, '.kairos-field-hint');
    await expect(hint.textContent).toContain('address you');
    await expect(style(hint).fontSize).toBe('15px');
    await expect(style(hint).color).toBe(ink3);
    // Under the control, as Field lays it out.
    await expect(hint.getBoundingClientRect().top).toBeGreaterThanOrEqual(input.getBoundingClientRect().bottom);

    // Required: an asterisk in the error colour, hidden from assistive
    // technology, and the control carries `required` itself.
    const required = one(canvasElement, '[data-specimen="required"]');
    await expect(required.hasAttribute('required')).toBe(true);
    const mark = one(required.closest('.kairos-field') as HTMLElement, '.kairos-input-label .kairos-required');
    await expect(mark.textContent).toBe('*');
    await expect(mark.getAttribute('aria-hidden')).toBe('true');
    await expect(style(mark).display).not.toBe('none');
    await expect(style(mark).color).toBe(colour('--kairos-error'));
    await expect(style(mark).color).toBe(rgb('#b3261e'));
    // The other fields carry no mark.
    await expect(all(canvasElement, '.kairos-required')).toHaveLength(1);
  },
};

export const Choices: Story = {
  render: () => (
    <div className="kairos-stack kairos-stack--lg" style={{ maxWidth: 520 }}>
      <div className="kairos-tick-box-group" role="group" aria-label="How should we reach you?">
        <label className="kairos-tick-box" data-specimen="tick-email">
          <input className="kairos-tick-box-input" type="checkbox" name="reach" value="email" />
          <span className="kairos-tick-box-label">Email</span>
        </label>
        <label className="kairos-tick-box" data-specimen="tick-phone">
          <input className="kairos-tick-box-input" type="checkbox" name="reach" value="phone" />
          <span className="kairos-tick-box-label">Phone</span>
        </label>
      </div>
      <DayGrid name="choice-day" />
      <TimeSwitch name="choice-time" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tint = colour('--kairos-tint');
    const picked = colour('--kairos-picked');
    const card = colour('--kairos-card');

    // Tick a box: its square fills with tint; the other stays on card.
    const email = one(canvasElement, '[data-specimen="tick-email"]');
    const phone = one(canvasElement, '[data-specimen="tick-phone"]');
    await expect(style(one(email, '.kairos-tick-box-label'), '::before').backgroundColor).toBe(card);
    await userEvent.click(one(email, '.kairos-tick-box-label'));
    await expect(one<HTMLInputElement>(email, 'input').checked).toBe(true);
    await waitFor(() => expect(style(one(email, '.kairos-tick-box-label'), '::before').backgroundColor).toBe(tint));
    await expect(style(one(phone, '.kairos-tick-box-label'), '::before').backgroundColor).toBe(card);

    // The day grid: five columns of 62px cells.
    const grid = one(canvasElement, '[data-specimen="choice-day-days"]');
    await expect(style(grid).gridTemplateColumns.trim().split(/\s+/)).toHaveLength(5);
    const faces = all(grid, '.kairos-day-grid-face');
    for (const face of faces) {
      await expect(style(face).minHeight).toBe('62px');
      await expect(height(face)).toBeGreaterThanOrEqual(62);
    }

    // Pick a day, then another: only the last reads as picked.
    const cells = all(grid, '.kairos-day-grid-cell');
    await userEvent.click(cells[1]);
    await userEvent.click(cells[3]);
    await waitFor(() => expect(style(faces[3], '::after').opacity).toBe('1'));
    faces.forEach((face, i) => {
      const isPicked = i === 3;
      expect(style(face).backgroundColor === picked).toBe(isPicked);
      if (!isPicked) expect(style(face, '::after').opacity).toBe('0');
    });
    await expect(style(faces[3], '::after').borderTopWidth).toBe('2px');
    await expect(style(faces[3], '::after').borderTopColor).toBe(colour('--kairos-ink'));
    await expect(all<HTMLInputElement>(grid, 'input').filter((i) => i.checked)).toHaveLength(1);

    // The time switch: the pill is hidden until the first pick, then sits on
    // the checked option.
    const track = one(canvasElement, '[data-specimen="choice-time-times"]');
    const pill = one(track, '.kairos-time-switch-pill');
    await expect(style(pill).opacity).toBe('0');
    const options = all(track, '.kairos-time-switch-option');
    await userEvent.click(options[2]);
    await waitFor(() => {
      expect(style(pill).opacity).toBe('1');
      const p = pill.getBoundingClientRect();
      const o = options[2].getBoundingClientRect();
      expect(Math.abs(p.left + p.width / 2 - (o.left + o.width / 2))).toBeLessThan(2);
    });
    await expect(style(pill).backgroundColor).toBe(picked);
  },
};

export const Errors: Story = {
  render: () => (
    <div className="kairos-stack kairos-stack--lg" style={{ maxWidth: 720 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <InputField label="Email" name="email-bad" defaultValue="name@" error="Add the rest of your email address." data-specimen="invalid" />
        <InputField label="Email" name="email-ok" defaultValue="name@example.com" data-specimen="valid" />
      </div>
      <DayGrid name="error-day" invalid />
      <TimeSwitch name="error-time" invalid />
      <p className="kairos-error-line" data-specimen="line">Pick a day that suits you.</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const error = colour('--kairos-error');
    await expect(error).toBe(rgb('#b3261e'));

    const invalid = one(canvasElement, '[data-specimen="invalid"]');
    const valid = one(canvasElement, '[data-specimen="valid"]');
    await expect(invalid.getAttribute('aria-invalid')).toBe('true');
    await expect(style(invalid).borderTopColor).toBe(error);
    await expect(valid.hasAttribute('aria-invalid')).toBe(false);

    const invalidField = invalid.closest('.kairos-field') as HTMLElement;
    const message = one(invalidField, '.kairos-field-error');
    await expect(message.textContent).toContain('rest of your email');
    const m = style(message);
    await expect(m.fontSize).toBe('15px');
    await expect(m.fontWeight).toBe('600');
    await expect(m.color).toBe(error);
    const badge = style(message, '::before');
    await expect(badge.content).toBe('"!"');
    await expect(badge.display).not.toBe('none');
    await expect(badge.width).toBe('20px');
    await expect(badge.height).toBe('20px');
    await expect(badge.borderTopLeftRadius).toBe('50%');
    await expect(badge.backgroundColor).toBe(error);
    await expect(badge.color).toBe(colour('--kairos-on-error'));

    // An error moves nothing below the field.
    const validField = valid.closest('.kairos-field') as HTMLElement;
    await expect(height(invalidField)).toBe(height(validField));

    // Invalid groups draw their edge in the error colour.
    const days = one(canvasElement, '[data-specimen="error-day-days"]');
    const times = one(canvasElement, '[data-specimen="error-time-times"]');
    for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const) {
      await expect(style(days)[`border${side}Color`]).toBe(error);
      await expect(style(times)[`border${side}Color`]).toBe(error);
    }

    // The standalone error line.
    const line = one(canvasElement, '[data-specimen="line"]');
    await expect(style(line).color).toBe(error);
    const lineBadge = style(line, '::before');
    await expect(lineBadge.content).toBe('"!"');
    await expect(lineBadge.width).toBe('20px');
    await expect(lineBadge.height).toBe('20px');
    await expect(lineBadge.borderTopLeftRadius).toBe('50%');
    await expect(lineBadge.backgroundColor).toBe(error);
    await expect(lineBadge.color).toBe(colour('--kairos-on-error'));
  },
};
