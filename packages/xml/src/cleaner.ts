/**
 * Dirty XML Cleaner
 *
 * Cleans malformed XML:
 * - Unquoted attributes: <user name=alice> → <user name="alice">
 * - Single quotes: <user name='alice'> → <user name="alice">
 * - Missing self-close: <img src="foo"> → <img src="foo"/>
 * - Unescaped entities: a & b → a &amp; b
 */

import { ParseError } from './types.js';

/**
 * Clean dirty XML to valid XML
 *
 * @param input - Dirty XML string
 * @param maxSize - Maximum input size in bytes (default: 100MB)
 * @returns Clean XML string
 */
export function cleanDirtyXML(input: string, maxSize = 100 * 1024 * 1024): string {
  // Size check
  if (input.length > maxSize) {
    throw new ParseError(`Input size ${input.length} exceeds maximum ${maxSize}`);
  }

  let result = '';
  let i = 0;
  const len = input.length;

  while (i < len) {
    const c = input[i];

    // XML Declaration or Processing Instruction
    if (c === '<' && input[i + 1] === '?') {
      const end = input.indexOf('?>', i + 2);
      if (end === -1) {
        throw new ParseError('Unterminated processing instruction', i);
      }
      result += input.slice(i, end + 2);
      i = end + 2;
      continue;
    }

    // Comment
    if (c === '<' && input.slice(i, i + 4) === '<!--') {
      const end = input.indexOf('-->', i + 4);
      if (end === -1) {
        throw new ParseError('Unterminated comment', i);
      }
      result += input.slice(i, end + 3);
      i = end + 3;
      continue;
    }

    // CDATA
    if (c === '<' && input.slice(i, i + 9) === '<![CDATA[') {
      const end = input.indexOf(']]>', i + 9);
      if (end === -1) {
        throw new ParseError('Unterminated CDATA section', i);
      }
      result += input.slice(i, end + 3);
      i = end + 3;
      continue;
    }

    // Opening or closing tag
    if (c === '<' && isValidTagStart(input, i + 1)) {
      const tagEnd = findTagEnd(input, i + 1);
      if (tagEnd === -1) {
        throw new ParseError('Unterminated tag', i);
      }

      const tagContent = input.slice(i + 1, tagEnd);
      const isClosing = tagContent[0] === '/';
      const isSelfClosing = tagContent[tagContent.length - 1] === '/';

      if (isClosing) {
        // Closing tag - just copy
        result += '<' + tagContent + '>';
      } else {
        // Opening or self-closing tag - clean attributes
        const cleaned = cleanTagAttributes(tagContent, isSelfClosing);
        result += '<' + cleaned + '>';
      }

      i = tagEnd + 1;
      continue;
    }

    // Text content - escape entities if needed
    const textEnd = input.indexOf('<', i + 1);
    const textContent = textEnd === -1 ? input.slice(i) : input.slice(i, textEnd);
    result += escapeTextContent(textContent);
    i = textEnd === -1 ? len : textEnd;
    continue;

    result += c;
    i++;
  }

  return result;
}

/**
 * Check if < is followed by a valid tag name start
 */
function isValidTagStart(input: string, start: number): boolean {
  if (start >= input.length) return false;
  const c = input[start]!;
  // Valid tag starts with letter, _, :, or / (closing tag)
  return /[a-zA-Z_:\/]/.test(c);
}

/**
 * Find the end of a tag (the closing >)
 * Handles quoted strings in attributes
 */
function findTagEnd(input: string, start: number): number {
  let i = start;
  let inQuote = false;
  let quoteChar = '';

  while (i < input.length) {
    const c = input[i];

    if (inQuote) {
      if (c === quoteChar && input[i - 1] !== '\\') {
        inQuote = false;
      }
    } else {
      if (c === '"' || c === "'") {
        inQuote = true;
        quoteChar = c;
      } else if (c === '>') {
        return i;
      }
    }

    i++;
  }

  return -1;
}

/**
 * Clean tag attributes
 * - Quote unquoted attributes
 * - Convert single quotes to double quotes
 * - Ensure self-closing tags have /
 */
function cleanTagAttributes(tagContent: string, isSelfClosing: boolean): string {
  // Separate tag name and attributes
  const spaceIndex = tagContent.search(/\s/);
  if (spaceIndex === -1) {
    // No attributes
    const tagName = isSelfClosing ? tagContent.slice(0, -1).trim() : tagContent.trim();
    return isSelfClosing ? tagName + ' /' : tagName;
  }

  const tagName = tagContent.slice(0, spaceIndex);
  const attrsString = isSelfClosing
    ? tagContent.slice(spaceIndex + 1, -1).trim()
    : tagContent.slice(spaceIndex + 1).trim();

  if (!attrsString) {
    return isSelfClosing ? tagName + ' /' : tagName;
  }

  // Parse and clean attributes
  const attrs = parseAttributes(attrsString);
  const cleanedAttrs = attrs
    .map(({ name, value }) => {
      // Escape value if needed
      const escaped = value.replace(/"/g, '&quot;');
      return `${name}="${escaped}"`;
    })
    .join(' ');

  return isSelfClosing ? `${tagName} ${cleanedAttrs} /` : `${tagName} ${cleanedAttrs}`;
}

/**
 * Parse attributes from string
 * Handles unquoted, single-quoted, and double-quoted values
 */
function parseAttributes(attrsString: string): Array<{ name: string; value: string }> {
  const attrs: Array<{ name: string; value: string }> = [];
  let i = 0;
  const len = attrsString.length;

  while (i < len) {
    // Skip whitespace
    while (i < len && /\s/.test(attrsString[i]!)) {
      i++;
    }

    if (i >= len) break;

    // Read attribute name
    const nameStart = i;
    while (i < len && attrsString[i] !== '=' && !/\s/.test(attrsString[i]!)) {
      i++;
    }
    const name = attrsString.slice(nameStart, i).trim();

    if (!name) break;

    // Skip whitespace around =
    while (i < len && /\s/.test(attrsString[i]!)) {
      i++;
    }

    if (i >= len || attrsString[i] !== '=') {
      // Boolean attribute (no value)
      attrs.push({ name, value: name });
      continue;
    }

    i++; // Skip =

    // Skip whitespace after =
    while (i < len && /\s/.test(attrsString[i]!)) {
      i++;
    }

    if (i >= len) {
      attrs.push({ name, value: '' });
      break;
    }

    // Read value
    const quote = attrsString[i];
    let value = '';

    if (quote === '"' || quote === "'") {
      // Quoted value
      i++; // Skip opening quote
      const valueStart = i;
      while (i < len && attrsString[i] !== quote) {
        if (attrsString[i] === '\\' && i + 1 < len) {
          i += 2; // Skip escaped character
        } else {
          i++;
        }
      }
      value = attrsString.slice(valueStart, i);
      i++; // Skip closing quote
    } else {
      // Unquoted value
      const valueStart = i;
      while (i < len && !/\s/.test(attrsString[i]!)) {
        i++;
      }
      value = attrsString.slice(valueStart, i);
    }

    attrs.push({ name, value });
  }

  return attrs;
}

/**
 * Escape special characters in text content
 */
function escapeTextContent(text: string): string {
  return text
    .replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Unescape XML entities
 */
export function unescapeXML(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}
