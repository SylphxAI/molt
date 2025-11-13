/**
 * CSV Parser
 *
 * Parses CSV string to JavaScript array of objects
 */

import type { ParseCSVOptions } from './types.js';
import { ParseError } from './types.js';

/**
 * Parse CSV string to JavaScript array of objects
 *
 * @param input - CSV string
 * @param options - Parse options
 * @returns Array of objects
 */
export function parseCSV(input: string, options: ParseCSVOptions = {}): unknown[] {
  const {
    delimiter = ',',
    header = true,
    maxSize = 100 * 1024 * 1024,
    skipEmptyLines = true,
    trim = false,
    convertTypes = true,
  } = options;

  // Size check
  if (input.length > maxSize) {
    throw new ParseError(`Input size ${input.length} exceeds maximum ${maxSize}`);
  }

  const parser = new CSVParser(input, {
    delimiter,
    header,
    skipEmptyLines,
    trim,
    convertTypes,
  });
  return parser.parse();
}

/**
 * CSV Parser implementation
 */
class CSVParser {
  private readonly input: string;
  private pos = 0;
  private readonly len: number;
  private readonly delimiter: string;
  private readonly header: boolean;
  private readonly skipEmptyLines: boolean;
  private readonly trim: boolean;
  private readonly convertTypes: boolean;
  private lineNumber = 1;

  constructor(
    input: string,
    options: {
      delimiter: string;
      header: boolean;
      skipEmptyLines: boolean;
      trim: boolean;
      convertTypes: boolean;
    }
  ) {
    this.input = input;
    this.len = input.length;
    this.delimiter = options.delimiter;
    this.header = options.header;
    this.skipEmptyLines = options.skipEmptyLines;
    this.trim = options.trim;
    this.convertTypes = options.convertTypes;
  }

  parse(): unknown[] {
    const rows: string[][] = [];

    while (this.pos < this.len) {
      const row = this.parseRow();
      if (row === null) {
        // Skip empty line
        continue;
      }
      rows.push(row);
    }

    if (rows.length === 0) {
      return [];
    }

    if (!this.header) {
      // No header, return array of arrays
      return rows;
    }

    // Use first row as headers
    const headers = rows[0]!;
    const data: Record<string, unknown>[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]!;
      const obj: Record<string, unknown> = {};

      for (let j = 0; j < headers.length; j++) {
        const key = headers[j]!;
        const value = row[j] ?? '';
        obj[key] = this.convertValue(value);
      }

      data.push(obj);
    }

    return data;
  }

  private parseRow(): string[] | null {
    const fields: string[] = [];

    while (this.pos < this.len) {
      const field = this.parseField();
      fields.push(field);

      // Check what comes after the field
      if (this.pos >= this.len) {
        break;
      }

      const char = this.input[this.pos];

      if (char === this.delimiter) {
        this.pos++; // Skip delimiter
        continue;
      }

      if (char === '\n') {
        this.pos++; // Skip newline
        this.lineNumber++;
        break;
      }

      if (char === '\r') {
        this.pos++; // Skip \r
        if (this.pos < this.len && this.input[this.pos] === '\n') {
          this.pos++; // Skip \n in \r\n
        }
        this.lineNumber++;
        break;
      }

      // Unexpected character
      throw new ParseError(
        `Unexpected character '${char}' at position ${this.pos}`,
        this.lineNumber,
        this.pos
      );
    }

    // Check if row is empty
    if (this.skipEmptyLines && fields.length === 1 && fields[0] === '') {
      return null;
    }

    return fields;
  }

  private parseField(): string {
    if (this.pos >= this.len) {
      return '';
    }

    const char = this.input[this.pos];

    // Quoted field
    if (char === '"') {
      return this.parseQuotedField();
    }

    // Unquoted field
    return this.parseUnquotedField();
  }

  private parseQuotedField(): string {
    this.pos++; // Skip opening quote

    let result = '';

    while (this.pos < this.len) {
      const char = this.input[this.pos];

      if (char === '"') {
        // Check for escaped quote (doubled quotes)
        if (this.pos + 1 < this.len && this.input[this.pos + 1] === '"') {
          result += '"';
          this.pos += 2;
          continue;
        }

        // End of quoted field
        this.pos++;
        break;
      }

      if (char === '\n') {
        this.lineNumber++;
      }

      result += char;
      this.pos++;
    }

    return this.trim ? result.trim() : result;
  }

  private parseUnquotedField(): string {
    let result = '';

    while (this.pos < this.len) {
      const char = this.input[this.pos];

      // End of field
      if (char === this.delimiter || char === '\n' || char === '\r') {
        break;
      }

      result += char;
      this.pos++;
    }

    return this.trim ? result.trim() : result;
  }

  private convertValue(value: string): unknown {
    if (!this.convertTypes) {
      return value;
    }

    // Empty string
    if (value === '') {
      return value;
    }

    // Boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Number
    if (/^-?\d+$/.test(value)) {
      const num = parseInt(value, 10);
      if (!isNaN(num)) return num;
    }

    if (/^-?\d+\.\d+$/.test(value)) {
      const num = parseFloat(value);
      if (!isNaN(num)) return num;
    }

    // String
    return value;
  }
}
