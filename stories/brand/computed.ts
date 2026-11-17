/**
 * Small readers for the Brand stories' play functions.
 *
 * The stories assert what the browser computed, never what a stylesheet says,
 * so a token that resolves to the wrong value fails here even when every text
 * test passes. A token is read by painting it onto a throwaway element and
 * asking for the computed value, which gives the same `rgb(…)` and `px`
 * strings `getComputedStyle` reports for the part itself.
 */

function probe(property: string, value: string, read: (style: CSSStyleDeclaration) => string): string {
  const el = document.createElement('div');
  el.style.setProperty(property, value);
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  document.body.appendChild(el);
  const out = read(getComputedStyle(el));
  el.remove();
  return out;
}

/** A colour token as the browser computes it, e.g. `rgb(22, 17, 11)`. */
export function colour(token: string): string {
  return probe('color', `var(${token})`, (s) => s.color);
}

/** A length token in pixels. */
export function length(token: string): number {
  return parseFloat(probe('width', `var(${token})`, (s) => s.width));
}

/** A shadow token as the browser computes it. */
export function shadow(token: string): string {
  return probe('box-shadow', `var(${token})`, (s) => s.boxShadow);
}

/** `#rrggbb` as the browser writes it. */
export function rgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

/** No visible shadow: `none`, or a list of zero-offset, zero-blur transparent shadows. */
export function noShadow(value: string): boolean {
  if (value === 'none') return true;
  return value
    .split(/,(?![^(]*\))/)
    .map((part) => part.trim().replace(/\s+/g, ' '))
    .every((part) => part === 'rgba(0, 0, 0, 0) 0px 0px 0px 0px' || part === '0px 0px 0px 0px rgba(0, 0, 0, 0)');
}

/** Computed style of an element or one of its pseudo-elements. */
export function style(el: Element, pseudo?: string): CSSStyleDeclaration {
  return getComputedStyle(el, pseudo);
}

/** Every transition duration on the element, in milliseconds. */
export function durations(el: Element): number[] {
  return getComputedStyle(el)
    .transitionDuration.split(',')
    .map((d) => parseFloat(d) * (d.trim().endsWith('ms') ? 1 : 1000));
}

/** The duration of one transitioned property, in milliseconds. */
export function durationOf(el: Element, property: string): number | undefined {
  const s = getComputedStyle(el);
  const props = s.transitionProperty.split(',').map((p) => p.trim());
  const times = durations(el);
  const at = props.indexOf(property);
  return at === -1 ? undefined : times[at % times.length];
}

/** Rounded rendered height. */
export function height(el: Element): number {
  return Math.round(el.getBoundingClientRect().height * 100) / 100;
}

/** Rounded rendered width. */
export function width(el: Element): number {
  return Math.round(el.getBoundingClientRect().width * 100) / 100;
}

/** The one element matching `selector` under `root`; throws when it is missing. */
export function one<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`No element matches ${selector}`);
  return el;
}

/** Every element matching `selector` under `root`. */
export function all<T extends Element = HTMLElement>(root: ParentNode, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}
