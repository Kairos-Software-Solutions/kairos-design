/**
 * A small CSS reader for the token and Product Scale tests.
 *
 * Plain Node, no dependency: the package has no build step and its tests run
 * with no install. It reads exactly what this repository writes — style rules,
 * `@media`/`@supports`/`@container`/`@keyframes` blocks nested to any depth,
 * comments and quoted strings — and nothing it does not.
 */

/** The source with every comment removed, strings left intact. */
export function stripComments(source) {
  let out = '';
  for (let i = 0; i < source.length; i += 1) {
    const c = source[i];
    if (c === '"' || c === "'") {
      const end = endOfString(source, i);
      out += source.slice(i, end);
      i = end - 1;
    } else if (c === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      i = end === -1 ? source.length : end + 1;
    } else {
      out += c;
    }
  }
  return out;
}

function endOfString(source, start) {
  const quote = source[start];
  let i = start + 1;
  while (i < source.length && source[i] !== quote) {
    if (source[i] === '\\') i += 1;
    i += 1;
  }
  return i + 1;
}

/** Split on a separator at the top level: outside parentheses, brackets and strings. */
export function splitTop(text, separator) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"' || c === "'") {
      i = endOfString(text, i) - 1;
    } else if (c === '(' || c === '[') {
      depth += 1;
    } else if (c === ')' || c === ']') {
      depth -= 1;
    } else if (c === separator && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** Whitespace collapsed, one quote style, no space around combinators or commas. */
export function normaliseSelector(selector) {
  return splitTop(selector.replace(/"/g, "'").replace(/\s+/g, ' ').trim(), ',')
    .map((part) => part.trim().replace(/\s*([>+~])\s*/g, ' $1 ').replace(/\s+/g, ' '))
    .join(', ');
}

export function normaliseValue(value) {
  return value
    .replace(/"/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

/**
 * Every declaration in a stylesheet, in source order:
 * `{ context: string[], selector, prop, value, important }`.
 * `context` is the chain of enclosing at-rule preludes, whitespace normalised.
 */
export function parse(source) {
  const css = stripComments(source);
  const out = [];

  function block(start, context) {
    let i = start;
    let prelude = '';
    while (i < css.length) {
      const c = css[i];
      if (c === '"' || c === "'") {
        const end = endOfString(css, i);
        prelude += css.slice(i, end);
        i = end;
        continue;
      }
      if (c === '}') return i + 1;
      if (c === ';') {
        // A statement at-rule (`@import`, `@charset`) or a stray semicolon.
        prelude = '';
        i += 1;
        continue;
      }
      if (c === '{') {
        const head = prelude.trim();
        prelude = '';
        if (/^@(media|supports|container|layer|document)\b/.test(head) || /^@(-webkit-)?keyframes\b/.test(head)) {
          i = block(i + 1, [...context, head.replace(/\s+/g, ' ')]);
        } else {
          const end = bodyEnd(i + 1);
          declarationsOf(css.slice(i + 1, end), context, head);
          i = end + 1;
        }
        continue;
      }
      prelude += c;
      i += 1;
    }
    return i;
  }

  function bodyEnd(start) {
    let depth = 0;
    for (let i = start; i < css.length; i += 1) {
      const c = css[i];
      if (c === '"' || c === "'") i = endOfString(css, i) - 1;
      else if (c === '(') depth += 1;
      else if (c === ')') depth -= 1;
      else if (c === '}' && depth === 0) return i;
    }
    return css.length;
  }

  function declarationsOf(body, context, selector) {
    for (const piece of splitTop(body, ';')) {
      const colon = piece.indexOf(':');
      if (colon === -1) continue;
      const prop = piece.slice(0, colon).trim();
      if (!/^(--[A-Za-z0-9-]+|-?[a-z][a-z-]*)$/.test(prop)) continue;
      let value = piece.slice(colon + 1).trim();
      const important = /!important\s*$/.test(value);
      if (important) value = value.replace(/\s*!important\s*$/, '');
      out.push({ context, selector: normaliseSelector(selector), prop, value, important });
    }
  }

  block(0, []);
  return out;
}

/**
 * The theme a token rule applies in, or null when it applies in neither (a
 * width query, a print block, a scale switch).
 */
function themesOf(rule) {
  const ctx = rule.context.join(' | ');
  if (ctx !== '' && ctx !== '@media not print') return null;
  const themes = new Set();
  for (const part of rule.selector.split(', ')) {
    if (part === ':root' || part === "[data-theme]" || part === 'html') {
      themes.add('light');
      themes.add('dark');
    } else if (part === "[data-theme='dark']" || part === ":root[data-theme='dark']") {
      themes.add('dark');
    } else if (part === "[data-theme='light']" || part === ":root[data-theme='light']") {
      themes.add('light');
    } else {
      return null;
    }
  }
  return themes;
}

/**
 * Each theme's token map from one `tokens.css`, in cascade order: every rule
 * that applies in the theme, later declarations winning, which is what the
 * root element of that theme receives.
 */
export function tokenMaps(source) {
  const maps = { light: new Map(), dark: new Map() };
  for (const d of parse(source)) {
    if (!d.prop.startsWith('--')) continue;
    const themes = themesOf(d);
    if (!themes) continue;
    for (const theme of themes) maps[theme].set(d.prop, d.value);
  }
  return maps;
}

/**
 * A value with every `var(--name[, fallback])` the map knows replaced by its
 * resolved value, recursively. A name the map does not know falls back to its
 * fallback when it has one and is otherwise left as written, so a component's
 * own custom properties (`--button-bg`) stay as they are.
 */
export function resolve(value, map, depth = 0) {
  if (depth > 40) throw new Error(`var() loop resolving ${value}`);
  let out = '';
  let i = 0;
  while (i < value.length) {
    const at = value.indexOf('var(', i);
    if (at === -1 || (at > 0 && /[\w-]/.test(value[at - 1]))) {
      if (at === -1) {
        out += value.slice(i);
        break;
      }
      out += value.slice(i, at + 4);
      i = at + 4;
      continue;
    }
    out += value.slice(i, at);
    let level = 1;
    let j = at + 4;
    while (j < value.length && level > 0) {
      if (value[j] === '(') level += 1;
      if (value[j] === ')') level -= 1;
      j += 1;
    }
    const inner = value.slice(at + 4, j - 1);
    const [nameRaw, ...rest] = splitTop(inner, ',');
    const name = nameRaw.trim();
    const fallback = rest.length ? rest.join(',').trim() : null;
    if (map.has(name)) out += resolve(map.get(name), map, depth + 1);
    else if (fallback !== null) out += resolve(fallback, map, depth + 1);
    else out += `var(${name})`;
    i = j;
  }
  return normaliseValue(out);
}

/** Every class a selector names, ignoring what sits inside `:not()`. */
export function classesIn(selector) {
  const withoutNot = selector.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, '');
  return [...withoutNot.matchAll(/\.(kairos-[a-z0-9-]+)/g)].map((m) => m[1]);
}
