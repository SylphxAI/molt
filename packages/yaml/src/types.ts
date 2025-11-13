/**
 * YAML Types and Interfaces
 */

/**
 * Parse options
 */
export interface ParseYAMLOptions {
  /** Clean dirty YAML (fix indentation, etc.) */
  cleanDirty?: boolean;
  /** Maximum input size in bytes */
  maxSize?: number;
  /** Convert dates */
  parseDates?: boolean;
}

/**
 * Stringify options
 */
export interface StringifyYAMLOptions {
  /** Indentation (spaces) */
  indent?: number;
  /** Quote strings */
  quoteStrings?: 'always' | 'minimal' | 'never';
  /** Line width */
  lineWidth?: number;
}

/**
 * YAML Error
 */
export class YAMLError extends Error {
  constructor(
    message: string,
    public readonly line?: number,
    public readonly column?: number
  ) {
    super(message);
    this.name = 'YAMLError';
  }
}

/**
 * Parse Error
 */
export class ParseError extends YAMLError {
  constructor(message: string, line?: number, column?: number) {
    super(message, line, column);
    this.name = 'ParseError';
  }
}
