/**
 * One money format for every Kairos app.
 *
 * Money carries its currency code: `TTD 8,500.00`. In Trinidad and Tobago a
 * bare `$` is ambiguous between TTD and USD, and on an invoice that ambiguity
 * is commercial risk rather than a style preference.
 *
 * Exact amounts are held in integer minor units, never in a float. `0.1 + 0.2`
 * is the reason: a total assembled from floats drifts by a cent somewhere past
 * the hundredth line, and an invoice that does not add up is not a rounding
 * bug to the person holding it.
 */

/**
 * ISO 4217 minor units for the currencies Kairos apps actually handle.
 *
 * An explicit table rather than a default of 2, because the default is wrong
 * for JPY and being wrong there is silent: an amount comes out a hundred times
 * too large and nothing throws. Add a row when an app needs one.
 */
const MINOR_UNITS = {
  TTD: 2,
  USD: 2,
  EUR: 2,
  GBP: 2,
  CAD: 2,
  JPY: 0,
} as const;

export type Currency = keyof typeof MINOR_UNITS;

export const DEFAULT_CURRENCY: Currency = 'TTD';

function normalizeCode(currency: string): string {
  const normalized = currency.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error(`Currency must be a three-letter ISO code (received '${currency}').`);
  }
  return normalized;
}

export function validateCurrency(currency: string): Currency {
  const normalized = normalizeCode(currency);
  if (!(normalized in MINOR_UNITS)) {
    throw new Error(
      `Currency '${normalized}' has no minor-unit entry. Add it to MINOR_UNITS in the ` +
        `kairos-design registry rather than guessing two decimal places.`
    );
  }
  return normalized as Currency;
}

function decimalStringToMinor(amount: string, minorUnits: number): number {
  const match = amount.trim().match(/^([+-]?)(\d+)(?:\.(\d+))?$/);
  if (!match) {
    throw new Error(`Invalid monetary amount '${amount}'.`);
  }

  const [, sign, wholeDigits, fraction = ''] = match;
  if (fraction.length > minorUnits) {
    throw new Error(`Amount '${amount}' has more than ${minorUnits} decimal places.`);
  }

  const scale = BigInt(10) ** BigInt(minorUnits);
  const whole = BigInt(wholeDigits);
  const padded = fraction.padEnd(minorUnits, '0');
  const fractional = padded ? BigInt(padded) : BigInt(0);
  const value = (whole * scale + fractional) * (sign === '-' ? BigInt(-1) : BigInt(1));

  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new Error(`Amount '${amount}' exceeds the safe integer range.`);
  }

  return Number(value);
}

/** An exact decimal amount as integer minor units, without float rounding. */
export function toMinor(amount: number | string, currency: string = DEFAULT_CURRENCY): number {
  const validated = validateCurrency(currency);
  const minorUnits = MINOR_UNITS[validated];

  if (typeof amount === 'number') {
    if (!Number.isFinite(amount)) {
      throw new Error('Monetary amount must be finite.');
    }
    const scaled = amount * 10 ** minorUnits;
    const rounded = Math.round(scaled);
    if (Math.abs(scaled - rounded) > Number.EPSILON * Math.max(1, Math.abs(scaled)) * 4) {
      throw new Error(`Amount '${amount}' has more than ${minorUnits} decimal places.`);
    }
    if (!Number.isSafeInteger(rounded)) {
      throw new Error(`Amount '${amount}' exceeds the safe integer range.`);
    }
    return rounded;
  }

  return decimalStringToMinor(amount, minorUnits);
}

export function fromMinor(minor: number, currency: string = DEFAULT_CURRENCY): number {
  const validated = validateCurrency(currency);
  if (!Number.isSafeInteger(minor)) {
    throw new Error('Minor-unit amount must be a safe integer.');
  }
  return minor / 10 ** MINOR_UNITS[validated];
}

/**
 * The amount a person typed, in minor units, or null when it is not an amount.
 *
 * `toMinor` throws, correctly — a caller computing money must not be handed a
 * guess. But at a request boundary that throw is a 500, and the person sees
 * "the payment was not updated" for typing `1,000`, the thousands format the
 * app itself displays. Null is the same refusal in a form the boundary can
 * turn into a sentence.
 */
export function toMinorOrNull(value: unknown, currency: string = DEFAULT_CURRENCY): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  try {
    return toMinor(value, currency);
  } catch {
    return null;
  }
}

/**
 * A money bound somebody typed into a filter.
 *
 * The idiom this replaces read `Number(text)` and skipped the bound when the
 * result was `NaN`, so typing `m` into Maximum amount dropped the filter and
 * rendered the whole ledger while the box still showed `m`. The control did
 * not fail; it lied. A refusal has to come back as something the field can say.
 */
export function parseAmountFilter(
  text: string,
  currency: string = DEFAULT_CURRENCY
): { value: number | null; error: string | null } {
  const trimmed = text.trim();
  if (trimmed === '') return { value: null, error: null };
  const minor = toMinorOrNull(trimmed, currency);
  if (minor === null || minor < 0) {
    return { value: null, error: 'Enter an amount, like 250 or 250.00.' };
  }
  return { value: fromMinor(minor, currency), error: null };
}

/**
 * `TTD 8,500.00`. The one money format.
 *
 * The space after the code is a non-breaking space, so the code never sits
 * alone at the end of a line. It does not stop a break inside the digits,
 * which is what `.kairos-figure` is for: `TTD 41,800.` above `00` reads as two
 * numbers.
 */
export function formatMoney(amount: number | string, currency: string = DEFAULT_CURRENCY): string {
  const normalized = normalizeCode(currency);
  const numeric = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(numeric)) {
    throw new Error(`Invalid monetary amount '${amount}'.`);
  }

  try {
    return new Intl.NumberFormat('en-TT', {
      style: 'currency',
      currency: normalized,
      currencyDisplay: 'code',
    })
      .format(numeric)
      // Intl emits a regular space after the code in some runtimes and a
      // narrow no-break space in others. Normalise to one non-breaking space
      // so the same amount does not wrap differently across Node versions.
      .replace(/^([A-Z]{3})[\s  ]*/, '$1 ');
  } catch {
    throw new Error(`Currency '${normalized}' is not supported by this runtime.`);
  }
}

/** `TTD 8,500.00` from integer minor units, which is how amounts are stored. */
export function formatMinor(minor: number, currency: string = DEFAULT_CURRENCY): string {
  return formatMoney(fromMinor(minor, currency), currency);
}
