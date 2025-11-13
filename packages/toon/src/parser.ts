/**
 * TOON Parser
 *
 * Parse Token-Oriented Object Notation (TOON) format
 */

import type { ParseTOONOptions, TOONValue, TOONObject } from './types.js';
import { ParseError } from './types.js';

/**
 * Parse TOON string to JavaScript value
 *
 * @param input - TOON string
 * @param options - Parse options
 * @returns Parsed value
 */
export function parseTOON(input: string, options: ParseTOONOptions = {}): TOONValue {
  const {
    parseTypes = true,
    allowComments = true,
    strict = true,
    maxDepth = 100,
  } = options;

  const parser = new TOONParser(input, {
    parseTypes,
    allowComments,
    strict,
    maxDepth,
  });

  return parser.parse();
}

/**
 * TOON Parser implementation
 */
class TOONParser {
  private lines: string[];
  private lineNumber = 0;
  private depth = 0;

  constructor(
    input: string,
    private readonly options: Required<ParseTOONOptions>
  ) {
    this.lines = input.split(/\r?\n/);
  }

  parse(): TOONValue {
    const result = this.parseValue(0);
    return result;
  }

  private parseValue(baseIndent: number): TOONValue {
    const obj: TOONObject = {};

    while (this.lineNumber < this.lines.length) {
      const line = this.lines[this.lineNumber]!;
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || (this.options.allowComments && trimmed.startsWith('#'))) {
        this.lineNumber++;
        continue;
      }

      // Calculate indentation
      const indent = this.getIndentation(line);

      // If indent is less than base, we're done with this block
      if (indent < baseIndent) {
        break;
      }

      // If indent is greater than base + expected, skip
      if (indent > baseIndent && Object.keys(obj).length === 0) {
        this.lineNumber++;
        continue;
      }

      // Check if this is a key: value line
      if (trimmed.includes(':')) {
        const colonIndex = trimmed.indexOf(':');
        const key = trimmed.slice(0, colonIndex).trim();
        const rest = trimmed.slice(colonIndex + 1).trim();

        // Check for table format (contains |)
        if (rest.includes('|')) {
          // Table header on same line: key: col1 | col2 | col3
          obj[key] = this.parseTable(indent);
        } else if (rest) {
          // Inline value
          obj[key] = this.parseInlineValue(rest);
          this.lineNumber++;
        } else {
          // Check if next line is a table header
          const nextLineIdx = this.lineNumber + 1;
          if (nextLineIdx < this.lines.length) {
            const nextLine = this.lines[nextLineIdx]!;
            const nextTrimmed = nextLine.trim();
            if (nextTrimmed && nextTrimmed.includes('|')) {
              // Table format with header on next line
              this.lineNumber++;
              obj[key] = this.parseTableMultiline(indent);
              continue;
            }
          }

          // Nested object on next lines
          this.lineNumber++;
          this.depth++;
          if (this.depth > this.options.maxDepth) {
            throw new ParseError(`Max depth ${this.options.maxDepth} exceeded`, this.lineNumber);
          }
          obj[key] = this.parseValue(indent + 2);
          this.depth--;
        }
      } else {
        // Unexpected line format
        if (this.options.strict) {
          throw new ParseError(`Invalid syntax: ${trimmed}`, this.lineNumber);
        }
        this.lineNumber++;
      }
    }

    return obj;
  }

  private parseTable(baseIndent: number): TOONValue[] {
    // Current line is the header
    const headerLine = this.lines[this.lineNumber]!;
    const colonIndex = headerLine.indexOf(':');
    const headerPart = headerLine.slice(colonIndex + 1).trim();

    // Parse column headers
    const columns = headerPart.split('|').map((col) => col.trim());

    this.lineNumber++;

    const rows: TOONObject[] = [];

    // Parse data rows
    while (this.lineNumber < this.lines.length) {
      const line = this.lines[this.lineNumber]!;
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        this.lineNumber++;
        continue;
      }

      // Skip comments
      if (this.options.allowComments && trimmed.startsWith('#')) {
        this.lineNumber++;
        continue;
      }

      // Calculate indentation
      const indent = this.getIndentation(line);

      // If indent is less than or equal to base, we're done with table
      if (indent <= baseIndent) {
        break;
      }

      // If line doesn't contain |, we're done with table
      if (!trimmed.includes('|')) {
        break;
      }

      // Parse row values
      const values = trimmed.split('|').map((val) => val.trim());

      if (values.length !== columns.length) {
        if (this.options.strict) {
          throw new ParseError(
            `Row has ${values.length} values but expected ${columns.length}`,
            this.lineNumber
          );
        }
      }

      const row: TOONObject = {};
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i]!;
        const val = values[i] || '';
        row[col] = this.parseInlineValue(val);
      }

      rows.push(row);
      this.lineNumber++;
    }

    return rows;
  }

  private parseTableMultiline(baseIndent: number): TOONValue[] {
    // Current line is the header (already advanced past the key: line)
    const headerLine = this.lines[this.lineNumber]!;
    const trimmed = headerLine.trim();

    // Parse column headers
    const columns = trimmed.split('|').map((col) => col.trim());

    this.lineNumber++;

    const rows: TOONObject[] = [];

    // Parse data rows
    while (this.lineNumber < this.lines.length) {
      const line = this.lines[this.lineNumber]!;
      const lineTrimmed = line.trim();

      // Skip empty lines
      if (!lineTrimmed) {
        this.lineNumber++;
        continue;
      }

      // Skip comments
      if (this.options.allowComments && lineTrimmed.startsWith('#')) {
        this.lineNumber++;
        continue;
      }

      // Calculate indentation
      const indent = this.getIndentation(line);

      // If indent is less than or equal to base, we're done with table
      if (indent <= baseIndent) {
        break;
      }

      // If line doesn't contain |, we're done with table
      if (!lineTrimmed.includes('|')) {
        break;
      }

      // Parse row values
      const values = lineTrimmed.split('|').map((val) => val.trim());

      if (values.length !== columns.length) {
        if (this.options.strict) {
          throw new ParseError(
            `Row has ${values.length} values but expected ${columns.length}`,
            this.lineNumber
          );
        }
      }

      const row: TOONObject = {};
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i]!;
        const val = values[i] || '';
        row[col] = this.parseInlineValue(val);
      }

      rows.push(row);
      this.lineNumber++;
    }

    return rows;
  }

  private parseInlineValue(value: string): TOONValue {
    if (!this.options.parseTypes) {
      return value;
    }

    // null
    if (value === 'null' || value === 'nil') {
      return null;
    }

    // boolean
    if (value === 'true' || value === 'yes') {
      return true;
    }
    if (value === 'false' || value === 'no') {
      return false;
    }

    // number
    if (/^-?\d+$/.test(value)) {
      return Number.parseInt(value, 10);
    }
    if (/^-?\d+\.\d+$/.test(value)) {
      return Number.parseFloat(value);
    }

    // quoted string - remove quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.slice(1, -1);
    }

    // array notation [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1);
      if (!inner.trim()) {
        return [];
      }
      return inner.split(',').map((item) => this.parseInlineValue(item.trim()));
    }

    return value;
  }

  private getIndentation(line: string): number {
    let indent = 0;
    for (const char of line) {
      if (char === ' ') {
        indent++;
      } else if (char === '\t') {
        indent += 2; // Treat tab as 2 spaces
      } else {
        break;
      }
    }
    return indent;
  }
}
