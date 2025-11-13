/**
 * TOML Types and Interfaces
 */

/**
 * Parse options
 */
export interface ParseTOMLOptions {
  /** Clean dirty TOML (fix syntax issues) */
  cleanDirty?: boolean;
  /** Maximum input size in bytes */
  maxSize?: number;
  /** Convert dates */
  parseDates?: boolean;
}

/**
 * Stringify options
 */
export interface StringifyTOMLOptions {
  /** Indentation for inline tables (spaces) */
  indent?: number;
  /** Use inline tables for small objects */
  inlineTables?: boolean;
  /** Maximum keys for inline tables */
  maxInlineKeys?: number;
  /** Quote all string keys */
  quoteKeys?: boolean;
}

/**
 * TOML Error
 */
export class TOMLError extends Error {
  constructor(
    message: string,
    public readonly line?: number,
    public readonly column?: number
  ) {
    super(message);
    this.name = 'TOMLError';
  }
}

/**
 * Parse Error
 */
export class ParseError extends TOMLError {
  constructor(message: string, line?: number, column?: number) {
    super(message, line, column);
    this.name = 'ParseError';
  }
}
