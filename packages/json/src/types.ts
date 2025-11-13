/**
 * Core types for HyperJSON
 */

/**
 * Supported special types that can be serialized/deserialized
 */
export type TypeAnnotation =
  | 'Date'
  | 'bigint'
  | 'Map'
  | 'Set'
  | 'RegExp'
  | 'undefined'
  | 'NaN'
  | 'Infinity'
  | '-Infinity'
  | 'URL'
  | 'Error'
  | ['custom', string];

/**
 * Metadata structure for type information
 */
export interface TypeMetadata {
  /**
   * Map of JSON paths to their type annotations
   * Path format: "a.b.0.c" for nested structures
   */
  values?: Record<string, TypeAnnotation>;
}

/**
 * Typed JSON structure (superjson-compatible)
 */
export interface TypedJSON<T = unknown> {
  /** The JSON-serializable data */
  json: T;
  /** Optional metadata for type reconstruction */
  meta?: TypeMetadata;
}

/**
 * Custom type transformer for extensibility
 */
export interface CustomTypeTransformer<T = unknown> {
  /** Unique name for this type */
  name: string;
  /** Check if a value is of this type */
  isApplicable: (value: unknown) => value is T;
  /** Serialize the value to JSON-compatible format */
  serialize: (value: T) => unknown;
  /** Deserialize back to the original type */
  deserialize: (value: unknown) => T;
  /** Optional priority (higher = checked first) */
  priority?: number;
}

/**
 * Parse options
 */
export interface ParseOptions {
  /** Enable dirty JSON cleaning */
  cleanDirty?: boolean;
  /** Enable type reconstruction */
  parseTypes?: boolean;
  /** Allow JavaScript-style comments */
  allowComments?: boolean;
  /** Allow trailing commas */
  allowTrailingCommas?: boolean;
  /** Allow unquoted object keys */
  allowUnquotedKeys?: boolean;
  /** Allow single quotes for strings */
  allowSingleQuotes?: boolean;
  /** Custom type registry */
  customTypes?: CustomTypeTransformer[];
  /** Maximum input size (bytes) */
  maxSize?: number;
  /** Maximum nesting depth */
  maxDepth?: number;
  /** Schema validator for validation */
  schema?: SchemaValidator<unknown>;
}

/**
 * Schema validator interface
 */
export interface SchemaValidator<T = unknown> {
  parse(value: unknown): T;
  safeParse(value: unknown): { success: true; data: T } | { success: false; error: Error };
}

/**
 * Stringify options
 */
export interface StringifyOptions {
  /** Include type metadata */
  includeTypes?: boolean;
  /** Custom type registry */
  customTypes?: CustomTypeTransformer[];
  /** JSON.stringify space parameter */
  space?: string | number;
}

/**
 * Error types
 */
export class HyperJSONError extends Error {
  constructor(
    message: string,
    public code: string,
    public position?: number,
  ) {
    super(message);
    this.name = 'HyperJSONError';
  }
}

export class ParseError extends HyperJSONError {
  constructor(message: string, position?: number) {
    super(message, 'PARSE_ERROR', position);
    this.name = 'ParseError';
  }
}

export class ValidationError extends HyperJSONError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
