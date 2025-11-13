/**
 * XML Parser
 *
 * Parses XML string to XMLDocument structure
 */

import type { XMLDocument, XMLElement, XMLNode, ParseXMLOptions } from './types.js';
import { ParseError } from './types.js';
import { cleanDirtyXML, unescapeXML } from './cleaner.js';

/**
 * Parse XML string to XMLDocument
 *
 * @param input - XML string
 * @param options - Parse options
 * @returns XMLDocument
 */
export function parseXML(input: string, options: ParseXMLOptions = {}): XMLDocument {
  const {
    cleanDirty = true,
    removeComments = false,
    trimText = true,
    parseCDATA = true,
    maxSize = 100 * 1024 * 1024,
  } = options;

  // Clean dirty XML if enabled
  let xml = input;
  if (cleanDirty) {
    xml = cleanDirtyXML(input, maxSize);
  }

  const parser = new XMLParser(xml, { removeComments, trimText, parseCDATA });
  return parser.parse();
}

/**
 * XML Parser implementation
 */
class XMLParser {
  private pos = 0;
  private readonly input: string;
  private readonly len: number;
  private readonly options: Required<Pick<ParseXMLOptions, 'removeComments' | 'trimText' | 'parseCDATA'>>;

  constructor(
    input: string,
    options: Pick<ParseXMLOptions, 'removeComments' | 'trimText' | 'parseCDATA'>
  ) {
    this.input = input;
    this.len = input.length;
    this.options = {
      removeComments: options.removeComments ?? false,
      trimText: options.trimText ?? true,
      parseCDATA: options.parseCDATA ?? true,
    };
  }

  parse(): XMLDocument {
    this.skipWhitespace();

    // Parse XML declaration if present
    let declaration: XMLDocument['declaration'];
    if (this.peek(5) === '<?xml') {
      declaration = this.parseDeclaration();
      this.skipWhitespace();
    }

    // Parse root element
    const root = this.parseElement();

    // Ensure we consumed all input
    this.skipWhitespace();
    if (this.pos < this.len) {
      throw new ParseError(`Unexpected content after root element`, this.pos);
    }

    return { declaration, root };
  }

  private parseDeclaration(): XMLDocument['declaration'] {
    this.expect('<?xml');
    this.skipWhitespace();

    const attrs = this.parseAttributes();
    this.skipWhitespace();
    this.expect('?>');

    return {
      version: attrs.version || '1.0',
      encoding: attrs.encoding,
      standalone: attrs.standalone === 'yes',
    };
  }

  private parseElement(): XMLElement {
    const start = this.pos;
    this.expect('<');

    // Read tag name
    const name = this.readTagName();
    if (!name) {
      throw new ParseError('Empty tag name', this.pos);
    }

    this.skipWhitespace();

    // Read attributes
    const attributes = this.parseAttributes();

    this.skipWhitespace();

    // Self-closing tag
    if (this.peek(2) === '/>') {
      this.pos += 2;
      return {
        type: 'element',
        name,
        attributes,
        children: [],
        position: { start, end: this.pos },
      };
    }

    this.expect('>');

    // Parse children
    const children = this.parseChildren(name);

    // Parse closing tag
    this.expect('</');
    const closingName = this.readTagName();
    if (closingName !== name) {
      throw new ParseError(
        `Mismatched closing tag: expected </${name}> but got </${closingName}>`,
        this.pos
      );
    }
    this.skipWhitespace();
    this.expect('>');

    return {
      type: 'element',
      name,
      attributes,
      children,
      position: { start, end: this.pos },
    };
  }

  private parseChildren(parentName: string): XMLNode[] {
    const children: XMLNode[] = [];

    while (this.pos < this.len) {
      // Only skip whitespace if trimText is enabled
      if (this.options.trimText) {
        this.skipWhitespace();
      }

      if (this.peek(2) === '</') {
        // Closing tag
        break;
      }

      if (this.peek(4) === '<!--') {
        // Comment
        const comment = this.parseComment();
        if (!this.options.removeComments) {
          children.push(comment);
        }
        continue;
      }

      if (this.peek(9) === '<![CDATA[') {
        // CDATA
        if (this.options.parseCDATA) {
          children.push(this.parseCDATA());
        } else {
          // Skip CDATA
          this.skipCDATA();
        }
        continue;
      }

      if (this.peek(1) === '<') {
        // Child element
        children.push(this.parseElement());
        continue;
      }

      // Text content
      const text = this.parseText();
      if (text) {
        children.push(text);
      } else if (!this.options.trimText) {
        // If trimText is false and we got no text, we might have just whitespace
        // Move forward one character to avoid infinite loop
        this.pos++;
      }
    }

    return children;
  }

  private parseComment(): XMLNode {
    const start = this.pos;
    this.expect('<!--');

    const contentStart = this.pos;
    const end = this.input.indexOf('-->', this.pos);
    if (end === -1) {
      throw new ParseError('Unterminated comment', start);
    }

    const content = this.input.slice(contentStart, end);
    this.pos = end + 3;

    return {
      type: 'comment',
      content,
      position: { start, end: this.pos },
    };
  }

  private parseCDATA(): XMLNode {
    const start = this.pos;
    this.expect('<![CDATA[');

    const contentStart = this.pos;
    const end = this.input.indexOf(']]>', this.pos);
    if (end === -1) {
      throw new ParseError('Unterminated CDATA section', start);
    }

    const content = this.input.slice(contentStart, end);
    this.pos = end + 3;

    return {
      type: 'cdata',
      content,
      position: { start, end: this.pos },
    };
  }

  private skipCDATA(): void {
    this.expect('<![CDATA[');
    const end = this.input.indexOf(']]>', this.pos);
    if (end === -1) {
      throw new ParseError('Unterminated CDATA section', this.pos);
    }
    this.pos = end + 3;
  }

  private parseText(): XMLNode | null {
    const start = this.pos;
    let content = '';

    while (this.pos < this.len && this.input[this.pos] !== '<') {
      content += this.input[this.pos];
      this.pos++;
    }

    if (!content) {
      return null;
    }

    // Unescape entities
    content = unescapeXML(content);

    // Trim if enabled
    if (this.options.trimText) {
      content = content.trim();
    }

    // Skip empty text nodes
    if (!content) {
      return null;
    }

    return {
      type: 'text',
      content,
      position: { start, end: this.pos },
    };
  }

  private parseAttributes(): Record<string, string> {
    const attrs: Record<string, string> = {};

    while (this.pos < this.len) {
      this.skipWhitespace();

      // Check for end of tag
      if (this.peek(1) === '>' || this.peek(2) === '/>') {
        break;
      }

      // Check for end of processing instruction
      if (this.peek(2) === '?>') {
        break;
      }

      // Read attribute name
      const name = this.readAttributeName();
      if (!name) {
        break;
      }

      this.skipWhitespace();

      // Expect =
      if (this.peek(1) !== '=') {
        // Boolean attribute
        attrs[name] = name;
        continue;
      }

      this.pos++; // Skip =
      this.skipWhitespace();

      // Read attribute value
      const value = this.readAttributeValue();
      attrs[name] = value;
    }

    return attrs;
  }

  private readTagName(): string {
    let name = '';
    while (this.pos < this.len) {
      const c = this.input[this.pos]!;
      if (/[a-zA-Z0-9_:\-.]/.test(c)) {
        name += c;
        this.pos++;
      } else {
        break;
      }
    }
    return name;
  }

  private readAttributeName(): string {
    let name = '';
    while (this.pos < this.len) {
      const c = this.input[this.pos]!;
      if (/[a-zA-Z0-9_:\-.]/.test(c)) {
        name += c;
        this.pos++;
      } else {
        break;
      }
    }
    return name;
  }

  private readAttributeValue(): string {
    const quote = this.input[this.pos];
    if (quote !== '"' && quote !== "'") {
      throw new ParseError(`Expected quote for attribute value`, this.pos);
    }

    this.pos++; // Skip opening quote

    let value = '';
    while (this.pos < this.len) {
      const c = this.input[this.pos]!;
      if (c === quote) {
        this.pos++; // Skip closing quote
        break;
      }
      value += c;
      this.pos++;
    }

    return unescapeXML(value);
  }

  private skipWhitespace(): void {
    while (this.pos < this.len && /\s/.test(this.input[this.pos]!)) {
      this.pos++;
    }
  }

  private peek(length: number): string {
    return this.input.slice(this.pos, this.pos + length);
  }

  private expect(str: string): void {
    if (this.input.slice(this.pos, this.pos + str.length) !== str) {
      throw new ParseError(`Expected "${str}"`, this.pos);
    }
    this.pos += str.length;
  }
}
