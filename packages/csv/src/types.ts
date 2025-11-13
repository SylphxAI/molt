/**
 * CSV Types and Interfaces
 */

/**
 * Parse options
 */
export interface ParseCSVOptions {
  /** Delimiter character (default: ',') */
  delimiter?: string;
  /** Has header row (default: true) */
  header?: boolean;
  /** Maximum input size in bytes */
  maxSize?: number;
  /** Skip empty lines (default: true) */
  skipEmptyLines?: boolean;
  /** Trim whitespace from fields (default: false) */
  trim?: boolean;
  /** Convert types (numbers, booleans) (default: true) */
  convertTypes?: boolean;
}

/**
 * Stringify options
 */
export interface StringifyCSVOptions {
  /** Delimiter character (default: ',') */
  delimiter?: string;
  /** Include header row (default: true) */
  header?: boolean;
  /** Quote all fields (default: false, only quotes when needed) */
  quoteAll?: boolean;
  /** Line ending (default: '\n') */
  lineEnding?: '\n' | '\r\n';
  /** Column order (default: use object keys order) */
  columns?: string[];
}

/**
 * CSV Error
 */
export class CSVError extends Error {
  constructor(
    message: string,
    public readonly line?: number,
    public readonly column?: number
  ) {
    super(message);
    this.name = 'CSVError';
  }
}

/**
 * Parse Error
 */
export class ParseError extends CSVError {
  constructor(message: string, line?: number, column?: number) {
    super(message, line, column);
    this.name = 'ParseError';
  }
}
