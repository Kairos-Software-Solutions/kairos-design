/**
 * One date format for every Kairos app.
 *
 * `money.ts` beside it is the model: it centralises `Intl.NumberFormat('en-TT',
 * { currencyDisplay: 'code' })` and is why `TTD 8,800.00` reads the same on
 * every screen. Dates had no equivalent, and drifted to five formats — ISO on
 * list screens, `24 Aug 2026, 2:03 pm` on exports and notifications,
 * `24/08/2026, 2:14:15 pm` in a report footer, a bare `06:07 PM` on documents,
 * and `08/01/2026` from native date inputs following the browser locale.
 *
 * The last one is not a tidiness problem. In Trinidad and Tobago `08/01/2026`
 * reads as 8 January and means 1 August, and on a screen that drives
 * accounting figures that is commercial risk — the same risk a bare `$` runs
 * between TTD and USD. `24 Aug 2026` names its month, so it reads the same way
 * to every reader whatever their locale is set to.
 *
 * Everything here formats in the business's own time zone. A timestamp
 * rendered on the server otherwise carries the server's zone, and a payment
 * received at 9pm in Trinidad shows up dated the next day.
 */

export const BUSINESS_TIME_ZONE = 'America/Port_of_Spain';

/**
 * What a caller has in hand: a `Date`, an ISO or `YYYY-MM-DD` string from
 * Invoice Ninja, or epoch milliseconds. Epoch *seconds* are common in this
 * codebase and are not accepted here, because the two are indistinguishable at
 * the type level and a seconds value read as milliseconds silently renders
 * January 1970. Use `fromSeconds` to say which one you have.
 */
export type DateInput = Date | string | number;

/** Invoice Ninja and Paykit's own tables both hand out epoch seconds. */
export function fromSeconds(seconds: number): Date {
  return new Date(seconds * 1000);
}

/**
 * A date or timestamp that names no zone — `2026-08-01` or
 * `2027-02-13 00:00:00`, both of which Invoice Ninja returns. It already
 * states the business's own wall clock, so converting it to a zone moves it:
 * parsed as UTC and shifted to Port of Spain, `2027-02-13 00:00:00` renders as
 * the evening of 12 February, a day earlier than the schedule it describes.
 */
const NAIVE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?$/;

function toDate(value: DateInput): { date: Date; zoned: boolean } | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : { date: value, zoned: true };
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? { date: new Date(value), zoned: true } : null;
  }
  const trimmed = value.trim();
  if (!trimmed) return null;
  const naive = NAIVE.test(trimmed);
  const parsed = new Date(naive ? trimmed.replace(' ', 'T') : trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return { date: parsed, zoned: !naive };
}

function format(value: DateInput, options: Intl.DateTimeFormatOptions, timeZone: string): string | null {
  const parsed = toDate(value);
  if (!parsed) return null;
  // A naive value is read back in the same zone it was parsed in, so no
  // conversion is applied and the wall clock it states is what prints.
  const resolved: Intl.DateTimeFormatOptions = parsed.zoned ? { ...options, timeZone } : options;
  try {
    return tidy(new Intl.DateTimeFormat('en-GB', resolved).format(parsed.date));
  } catch {
    return tidy(new Intl.DateTimeFormat('en-GB', options).format(parsed.date));
  }
}

function tidy(formatted: string): string {
  return formatted
    // `en-GB` writes `24 Aug 2026 at 2:03 pm`; the brand's register is plainer.
    .replace(' at ', ', ')
    // It also abbreviates September to four letters where every other month
    // takes three, which shifts the year by a character down a date column.
    .replace('Sept ', 'Sep ');
}

/** `24 Aug 2026`. The one date format. */
export function formatDate(value: DateInput, timeZone: string = BUSINESS_TIME_ZONE): string | null {
  return format(value, { day: '2-digit', month: 'short', year: 'numeric' }, timeZone);
}

/** `24 Aug 2026, 2:03 pm`. The one date-and-time format. */
export function formatDateTime(value: DateInput, timeZone: string = BUSINESS_TIME_ZONE): string | null {
  return format(
    value,
    { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true },
    timeZone,
  );
}

/** `2:03 pm`, for a line that has already said which day it means. */
export function formatTime(value: DateInput, timeZone: string = BUSINESS_TIME_ZONE): string | null {
  return format(value, { hour: 'numeric', minute: '2-digit', hour12: true }, timeZone);
}

/**
 * `24 Aug 2026 – 31 Aug 2026`, or the single date where both ends are the same
 * day. An en dash, because a hyphen inside a date range reads as part of a
 * date.
 */
export function formatDateRange(
  from: DateInput,
  to: DateInput,
  timeZone: string = BUSINESS_TIME_ZONE,
): string | null {
  const start = formatDate(from, timeZone);
  const end = formatDate(to, timeZone);
  if (!start || !end) return start ?? end;
  return start === end ? start : `${start} – ${end}`;
}

/**
 * The same date the native `<input type="date">` above it is holding, written
 * so it cannot be misread.
 *
 * A date input always renders in the browser's locale and there is no way to
 * change that, so on a US-locale machine a T&T user picking 1 August sees
 * `08/01/2026` and reads 8 January. The input keeps its native picker, which
 * is the right control on a phone; this is the line printed beside it that
 * says what was actually chosen. Empty in, empty out — an unfilled filter has
 * nothing to restate.
 */
export function dateInputHint(value: string | null | undefined, timeZone: string = BUSINESS_TIME_ZONE): string {
  if (!value) return '';
  return formatDate(value, timeZone) ?? '';
}
