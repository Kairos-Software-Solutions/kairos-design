import tokensCss from '../dist/tokens.css?raw';

/**
 * The Foundations pages read `tokens.css` itself rather than repeating its
 * contents.
 *
 * A specimen page with a hand-written list of swatches is a second copy of the
 * token layer, and the copy is wrong the first time somebody adds a token and
 * forgets the page. Parsing the file means a token that exists has a swatch,
 * a token that is deleted loses one, and neither costs anybody a commit.
 */
export interface Token {
  name: string;
  light: string;
  dark: string | null;
  /** The comment block immediately above the token, if it has one. */
  note: string | null;
}

/** Declarations inside one selector block, in source order, with their notes. */
function readBlock(css: string, selector: string): Array<{ name: string; value: string; note: string | null }> {
  const start = css.indexOf(selector);
  if (start === -1) return [];
  const open = css.indexOf('{', start);
  const close = css.indexOf('\n}', open);
  const body = css.slice(open + 1, close);

  const out: Array<{ name: string; value: string; note: string | null }> = [];
  let note: string | null = null;

  // One pass over the block, holding the most recent comment so it can attach
  // to the declaration under it. The comments in tokens.css carry the whole
  // reasoning for the palette; dropping them here would leave the workshop
  // showing what a value is with no way to see why.
  const parts = body.split(/(\/\*[\s\S]*?\*\/)/);
  for (const part of parts) {
    if (part.startsWith('/*')) {
      note = part.slice(2, -2).replace(/\s*\n\s*/g, ' ').replace(/^-+|-+$/g, '').trim();
      continue;
    }
    for (const [, name, value] of part.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      out.push({ name, value: value.trim(), note });
      note = null;
    }
  }
  return out;
}

const lightBlock = readBlock(tokensCss, ':root {');
const darkBlock = readBlock(tokensCss, "[data-theme='dark'] {");
const geometryBlock = readBlock(tokensCss, 'Theme-independent');

const darkByName = new Map(darkBlock.map((d) => [d.name, d.value]));

/** Colour and shadow tokens: everything that carries a light and a dark value. */
export const themed: Token[] = lightBlock.map((d) => ({
  name: d.name,
  light: d.value,
  dark: darkByName.get(d.name) ?? null,
  note: d.note,
}));

/** Type, geometry, and motion: one value, the same in both themes. */
export const constant: Token[] = geometryBlock.map((d) => ({
  name: d.name,
  light: d.value,
  dark: null,
  note: d.note,
}));

/** The tokens whose names start with one of the given stems, in source order. */
export function group(tokens: Token[], ...stems: string[]): Token[] {
  return tokens.filter((token) => stems.some((stem) => token.name.startsWith(stem)));
}
