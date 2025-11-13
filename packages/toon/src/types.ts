/**
 * TOON (Token-Oriented Object Notation) Parser and Serializer Types
 */

/**
 * Parse options for TOON format
 */
export interface ParseTOONOptions {
  /**
   * Parse types (numbers, booleans, null)
   * @default true
   */
  parseTypes?: boolean;

  /**
   * Allow comments (lines starting with #)
   * @default true
   */
  allowComments?: boolean;

  /**
   * Strict mode - throw on invalid syntax
   * @default true
   */
  strict?: boolean;

  /**
   * Maximum nesting depth
   * @default 100
   */
  maxDepth?: number;
}

/**
 * Serialize options for TOON format
 */
export interface SerializeTOONOptions {
  /**
   * Indentation string
   * @default '  ' (2 spaces)
   */
  indent?: string;

  /**
   * Use table format for uniform arrays
   * @default true
   */
  useTableFormat?: boolean;

  /**
   * Minimum array length for table format
   * @default 2
   */
  minTableRows?: number;

  /**
   * Line ending
   * @default '\n'
   */
  lineEnding?: string;

  /**
   * Sort object keys
   * @default false
   */
  sortKeys?: boolean;
}

/**
 * TOON data structure (same as JSON)
 */
export type TOONValue =
  | string
  | number
  | boolean
  | null
  | TOONArray
  | TOONObject;

export type TOONArray = TOONValue[];
export type TOONObject = { [key: string]: TOONValue };

/**
 * Parse error
 */
export class ParseError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly column?: number
  ) {
    super(`${message} at line ${line}${column !== undefined ? `, column ${column}` : ''}`);
    this.name = 'ParseError';
  }
}
