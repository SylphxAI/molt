/**
 * TOML Parser
 *
 * Parses TOML string to JavaScript object
 */

import type { ParseTOMLOptions } from './types.js';
import { ParseError } from './types.js';

/**
 * Parse TOML string to JavaScript object
 *
 * @param input - TOML string
 * @param options - Parse options
 * @returns Parsed object
 */
export function parseTOML(input: string, options: ParseTOMLOptions = {}): unknown {
  const { maxSize = 100 * 1024 * 1024, parseDates = true } = options;

  // Size check
  if (input.length > maxSize) {
    throw new ParseError(`Input size ${input.length} exceeds maximum ${maxSize}`);
  }

  const parser = new TOMLParser(input, { parseDates });
  return parser.parse();
}

/**
 * TOML Parser implementation
 */
class TOMLParser {
  private lines: string[];
  private currentLine = 0;
  private readonly parseDates: boolean;
  private root: Record<string, unknown> = {};
  private currentTable: Record<string, unknown> = this.root;

  constructor(input: string, options: { parseDates: boolean }) {
    // Normalize line endings and split
    this.lines = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    this.parseDates = options.parseDates;
  }

  parse(): unknown {
    while (this.currentLine < this.lines.length) {
      const line = this.lines[this.currentLine]!;
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        this.currentLine++;
        continue;
      }

      // Table header [table]
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        this.parseTableHeader(trimmed);
        this.currentLine++;
        continue;
      }

      // Key-value pair
      if (trimmed.includes('=')) {
        this.parseKeyValue(trimmed);
        this.currentLine++;
        continue;
      }

      // Invalid line
      throw new ParseError(`Invalid TOML syntax: ${trimmed}`, this.currentLine + 1);
    }

    return this.root;
  }

  private parseTableHeader(line: string): void {
    // Check if it's an array of tables [[array]]
    const isArrayOfTables = line.startsWith('[[') && line.endsWith(']]');
    const content = isArrayOfTables ? line.slice(2, -2) : line.slice(1, -1);
    const path = content.trim().split('.');

    if (isArrayOfTables) {
      // Array of tables
      let current: any = this.root;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i]!.trim();
        if (!current[key]) {
          current[key] = {};
        }
        // If we encounter an array, navigate to the last item
        if (Array.isArray(current[key])) {
          current = current[key][current[key].length - 1];
        } else {
          current = current[key];
        }
      }

      const lastKey = path[path.length - 1]!.trim();
      if (!current[lastKey]) {
        current[lastKey] = [];
      }
      if (!Array.isArray(current[lastKey])) {
        throw new ParseError(`Cannot redefine ${lastKey} as array of tables`, this.currentLine + 1);
      }

      const newTable: Record<string, unknown> = {};
      current[lastKey].push(newTable);
      this.currentTable = newTable;
    } else {
      // Regular table
      let current: any = this.root;
      for (const key of path) {
        const trimmedKey = key.trim();
        if (!current[trimmedKey]) {
          current[trimmedKey] = {};
        }
        if (typeof current[trimmedKey] !== 'object' || Array.isArray(current[trimmedKey])) {
          throw new ParseError(`Cannot redefine ${trimmedKey} as table`, this.currentLine + 1);
        }
        current = current[trimmedKey];
      }
      this.currentTable = current;
    }
  }

  private parseKeyValue(line: string): void {
    const eqIndex = line.indexOf('=');
    const key = line.slice(0, eqIndex).trim();
    const valueStr = line.slice(eqIndex + 1).trim();

    // Handle dotted keys (e.g., "a.b.c = value")
    const keyParts = key.split('.').map((k) => k.trim());
    let target = this.currentTable;

    for (let i = 0; i < keyParts.length - 1; i++) {
      const k = keyParts[i]!;
      if (!target[k]) {
        target[k] = {};
      }
      target = target[k] as Record<string, unknown>;
    }

    const finalKey = keyParts[keyParts.length - 1]!;
    target[finalKey] = this.parseValue(valueStr);
  }

  private parseValue(value: string): unknown {
    const trimmed = value.trim();

    // Boolean
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    // Multiline string (must check before single-line strings)
    if (trimmed.startsWith('"""')) {
      return this.parseMultilineString();
    }
    if (trimmed.startsWith("'''")) {
      return this.parseMultilineLiteralString();
    }

    // String (basic or literal)
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return this.parseBasicString(trimmed.slice(1, -1));
    }
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1); // Literal string
    }

    // Array
    if (trimmed.startsWith('[')) {
      return this.parseArray(trimmed);
    }

    // Inline table
    if (trimmed.startsWith('{')) {
      return this.parseInlineTable(trimmed);
    }

    // Date/time (RFC 3339) - check format first, then decide how to parse
    if (/^\d{4}-\d{2}-\d{2}[T ]/.test(trimmed)) {
      if (this.parseDates) {
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } else {
        // parseDates is false, return as string to prevent number parsing
        return trimmed;
      }
    }

    // Number (integer or float) - check for valid number patterns
    if (/^[+-]?(\d|0x|0o|0b)/.test(trimmed)) {
      return this.parseNumber(trimmed);
    }

    // If nothing matches, return as string
    return trimmed;
  }

  private parseBasicString(str: string): string {
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }

  private parseMultilineString(): string {
    let result = '';
    let foundEnd = false;

    // Move to next line (the opening """ is on the current line in the value part)
    this.currentLine++;

    while (this.currentLine < this.lines.length) {
      const line = this.lines[this.currentLine]!;
      if (line.includes('"""')) {
        const endIndex = line.indexOf('"""');
        result += line.slice(0, endIndex);
        foundEnd = true;
        break;
      }
      result += line + '\n';
      this.currentLine++;
    }

    if (!foundEnd) {
      throw new ParseError('Unterminated multiline string', this.currentLine + 1);
    }

    return this.parseBasicString(result.trimEnd());
  }

  private parseMultilineLiteralString(): string {
    let result = '';
    let foundEnd = false;

    // Move to next line (the opening ''' is on the current line in the value part)
    this.currentLine++;

    while (this.currentLine < this.lines.length) {
      const line = this.lines[this.currentLine]!;
      if (line.includes("'''")) {
        const endIndex = line.indexOf("'''");
        result += line.slice(0, endIndex);
        foundEnd = true;
        break;
      }
      result += line + '\n';
      this.currentLine++;
    }

    if (!foundEnd) {
      throw new ParseError('Unterminated multiline literal string', this.currentLine + 1);
    }

    return result.trimEnd();
  }

  private parseArray(str: string): unknown[] {
    // Remove brackets
    const content = str.slice(1, -1).trim();
    if (!content) return [];

    const result: unknown[] = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < content.length; i++) {
      const char = content[i]!;
      const prev = i > 0 ? content[i - 1] : '';

      // Handle string boundaries
      if ((char === '"' || char === "'") && prev !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      if (!inString) {
        // Track nesting depth
        if (char === '[' || char === '{') depth++;
        if (char === ']' || char === '}') depth--;

        // Split on comma at depth 0
        if (char === ',' && depth === 0) {
          result.push(this.parseValue(current.trim()));
          current = '';
          continue;
        }
      }

      current += char;
    }

    if (current.trim()) {
      result.push(this.parseValue(current.trim()));
    }

    return result;
  }

  private parseInlineTable(str: string): Record<string, unknown> {
    // Remove braces
    const content = str.slice(1, -1).trim();
    if (!content) return {};

    const result: Record<string, unknown> = {};
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < content.length; i++) {
      const char = content[i]!;
      const prev = i > 0 ? content[i - 1] : '';

      // Handle string boundaries
      if ((char === '"' || char === "'") && prev !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      if (!inString) {
        // Track nesting depth
        if (char === '[' || char === '{') depth++;
        if (char === ']' || char === '}') depth--;

        // Split on comma at depth 0
        if (char === ',' && depth === 0) {
          this.parseInlineKeyValue(current.trim(), result);
          current = '';
          continue;
        }
      }

      current += char;
    }

    if (current.trim()) {
      this.parseInlineKeyValue(current.trim(), result);
    }

    return result;
  }

  private parseInlineKeyValue(pair: string, target: Record<string, unknown>): void {
    const eqIndex = pair.indexOf('=');
    if (eqIndex === -1) return;

    const key = pair.slice(0, eqIndex).trim();
    const value = pair.slice(eqIndex + 1).trim();
    target[key] = this.parseValue(value);
  }

  private parseNumber(str: string): number {
    // Remove underscores (allowed in TOML)
    const cleaned = str.replace(/_/g, '');

    // Hex, octal, binary
    if (cleaned.startsWith('0x') || cleaned.startsWith('0X')) {
      return parseInt(cleaned.slice(2), 16);
    }
    if (cleaned.startsWith('0o') || cleaned.startsWith('0O')) {
      return parseInt(cleaned.slice(2), 8);
    }
    if (cleaned.startsWith('0b') || cleaned.startsWith('0B')) {
      return parseInt(cleaned.slice(2), 2);
    }

    // Float
    if (cleaned.includes('.') || cleaned.includes('e') || cleaned.includes('E')) {
      return parseFloat(cleaned);
    }

    // Integer
    return parseInt(cleaned, 10);
  }
}
