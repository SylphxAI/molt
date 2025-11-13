/**
 * INI Parser and Serializer Types
 */

/**
 * Parse options for INI format
 */
export interface ParseINIOptions {
  /**
   * Allow sections (e.g., [section])
   * @default true
   */
  allowSections?: boolean;

  /**
   * Allow comments (lines starting with ; or #)
   * @default true
   */
  allowComments?: boolean;

  /**
   * Comment prefixes to recognize
   * @default [';', '#']
   */
  commentPrefixes?: string[];

  /**
   * Parse values as typed data (numbers, booleans)
   * @default true
   */
  parseTypes?: boolean;

  /**
   * Allow multi-line values
   * @default false
   */
  multiLine?: boolean;

  /**
   * Trim whitespace from keys and values
   * @default true
   */
  trim?: boolean;

  /**
   * Allow duplicate keys (later values override earlier ones)
   * @default true
   */
  allowDuplicates?: boolean;

  /**
   * Allow inline comments
   * @default false
   */
  inlineComments?: boolean;
}

/**
 * Serialization options for INI format
 */
export interface SerializeINIOptions {
  /**
   * Include section headers
   * @default true
   */
  sections?: boolean;

  /**
   * Whitespace around = sign
   * @default ' = '
   */
  whitespace?: string;

  /**
   * Line ending
   * @default '\n'
   */
  lineEnding?: string;

  /**
   * Sort sections alphabetically
   * @default false
   */
  sortSections?: boolean;

  /**
   * Sort keys within sections
   * @default false
   */
  sortKeys?: boolean;

  /**
   * Include comment header
   */
  headerComment?: string;
}

/**
 * INI data structure
 */
export type INIData = {
  [section: string]: {
    [key: string]: string | number | boolean | null;
  };
};

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
