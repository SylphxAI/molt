/**
 * Unified Molt API with smart detection
 *
 * This module provides a single, unified entry point that automatically
 * detects and handles dirty JSON, type preservation, and validation
 * with minimal overhead when features aren't needed.
 */

import { cleanDirtyJSON } from './cleaner.js';
import { deserialize, serialize } from './serializer.js';
import type { CustomTypeTransformer, TypedJSON, SchemaValidator } from './types.js';

/**
 * Molt options for parsing
 */
export interface MoltOptions {
  /**
   * Dirty JSON cleaning mode
   * - 'auto': Automatically detect and clean if needed (default)
   * - 'always': Always clean, even if input appears valid
   * - 'never': Never clean, assume input is valid JSON
   */
  dirty?: 'auto' | 'always' | 'never';

  /**
   * Type preservation mode
   * - 'auto': Automatically detect and restore types if metadata present (default)
   * - 'always': Always attempt type restoration
   * - 'never': Never restore types
   */
  typed?: 'auto' | 'always' | 'never';

  /**
   * Schema validator for validation
   */
  validate?: SchemaValidator<any>;

  /**
   * Custom type transformers
   */
  customTypes?: CustomTypeTransformer[];

  /**
   * Maximum input size in bytes (default: 100MB)
   */
  maxSize?: number;
}

/**
 * Molt options for stringification
 */
export interface MoltStringifyOptions {
  /**
   * Include type metadata
   * - 'auto': Include only if types need preservation (default)
   * - 'always': Always include type metadata
   * - 'never': Never include type metadata
   */
  typed?: 'auto' | 'always' | 'never';

  /**
   * Custom type transformers
   */
  customTypes?: CustomTypeTransformer[];

  /**
   * JSON formatting spaces
   */
  space?: number;
}

/**
 * Fast heuristic to detect if input might be dirty JSON
 * Returns true if input contains common dirty JSON patterns
 */
export function detectDirty(input: string): boolean {
  // Check for comments (// or /* */)
  if (input.includes('//') || input.includes('/*')) {
    return true;
  }

  // Check for single quotes (JSON only allows double quotes)
  if (input.includes("'")) {
    return true;
  }

  // Check for unquoted keys (common dirty JSON pattern)
  // Look for pattern: whitespace + word + whitespace + colon
  // after opening brace or comma
  const unquotedKeyPattern = /[{,]\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/;
  if (unquotedKeyPattern.test(input)) {
    return true;
  }

  // Check for trailing commas (look for ,] or ,})
  if (/,\s*[}\]]/.test(input)) {
    return true;
  }

  return false;
}

/**
 * Check if parsed object has TypedJSON metadata
 */
export function hasTypeMetadata(obj: unknown): obj is TypedJSON {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const record = obj as Record<string, unknown>;

  // TypedJSON format: { json: ..., meta: { values: ... } }
  // Or shorthand: { json: ... } when no metadata
  if ('json' in record) {
    // Has json field, check if meta exists
    if ('meta' in record) {
      const meta = record.meta;
      if (meta && typeof meta === 'object' && 'values' in meta) {
        return true;
      }
    }
    // If only json field exists and no other fields, might be TypedJSON
    // but without metadata (all values are JSON-compatible)
    return Object.keys(record).length === 1;
  }

  return false;
}

/**
 * Unified Molt parser - automatically handles dirty JSON, type preservation, and validation
 *
 * This is the recommended API for most use cases. It intelligently detects
 * and handles dirty JSON and type metadata with minimal overhead.
 *
 * @example
 * ```typescript
 * // Simple usage - auto-detects everything
 * const data = molt('{ name: "alice", age: 30 }'); // Handles dirty JSON
 *
 * // With explicit options
 * const data = molt(input, {
 *   dirty: 'auto',      // Auto-detect dirty JSON
 *   typed: 'auto',      // Auto-detect type metadata
 *   validate: mySchema, // Optional validation
 * });
 *
 * // Force clean even if appears valid
 * const data = molt(input, { dirty: 'always' });
 *
 * // Skip cleaning for performance (if you know input is valid)
 * const data = molt(input, { dirty: 'never', typed: 'never' });
 * ```
 */
export function molt<T = unknown>(input: string, options: MoltOptions = {}): T {
  const {
    dirty = 'auto',
    typed = 'auto',
    validate,
    customTypes,
    maxSize = 100 * 1024 * 1024,
  } = options;

  let processed = input;

  // Step 1: Dirty cleaning (if needed)
  if (dirty === 'always' || (dirty === 'auto' && detectDirty(input))) {
    processed = cleanDirtyJSON(processed, maxSize);
  }

  // Step 2: Native parse (always fastest)
  let result: unknown = JSON.parse(processed);

  // Step 3: Type restoration (if needed)
  if (typed === 'always') {
    // Always mode: try to deserialize if it looks like TypedJSON, otherwise return as-is
    if (hasTypeMetadata(result)) {
      result = deserialize(result as TypedJSON, customTypes);
    }
    // If not TypedJSON format, just return the parsed result
  } else if (typed === 'auto' && hasTypeMetadata(result)) {
    // Auto mode: only deserialize if metadata detected
    result = deserialize(result as TypedJSON, customTypes);
  }

  // Step 4: Validation (if provided)
  if (validate) {
    result = validate.parse(result);
  }

  return result as T;
}

/**
 * Unified Molt stringifier - automatically handles type preservation
 *
 * @example
 * ```typescript
 * // Auto mode - only includes metadata if types need preservation
 * const json = molt.stringify({ date: new Date(), count: 42 });
 *
 * // Never include type metadata (same as JSON.stringify)
 * const json = molt.stringify(data, { typed: 'never' });
 *
 * // Always include type metadata
 * const json = molt.stringify(data, { typed: 'always' });
 * ```
 */
molt.stringify = function stringify(value: unknown, options: MoltStringifyOptions = {}): string {
  const { typed = 'auto', customTypes, space } = options;

  // Never mode - just use native JSON.stringify
  if (typed === 'never') {
    return JSON.stringify(value, null, space);
  }

  // Always mode - always include TypedJSON wrapper
  if (typed === 'always') {
    const typedJSON = serialize(value, customTypes);
    return JSON.stringify(typedJSON, null, space);
  }

  // Auto mode - only include metadata if there are types to preserve
  const typedJSON = serialize(value, customTypes);
  if (!typedJSON.meta || Object.keys(typedJSON.meta.values ?? {}).length === 0) {
    // No metadata needed, return regular JSON
    return JSON.stringify(value, null, space);
  }

  // Auto mode with metadata
  return JSON.stringify(typedJSON, null, space);
};

/**
 * Fast mode - directly use native JSON.parse without any processing
 * Use this when you know your input is valid JSON and has no types
 *
 * This is equivalent to:
 * ```typescript
 * molt(input, { dirty: 'never', typed: 'never' })
 * ```
 */
molt.fast = function fast<T = unknown>(input: string): T {
  return JSON.parse(input) as T;
};

/**
 * Parse with dirty cleaning but no type restoration
 * Use when input might be dirty but doesn't have type metadata
 */
molt.dirty = function dirty<T = unknown>(input: string, maxSize?: number): T {
  const options: MoltOptions = { dirty: 'always', typed: 'never' };
  if (maxSize !== undefined) {
    options.maxSize = maxSize;
  }
  return molt<T>(input, options);
};

/**
 * Parse with type restoration but no dirty cleaning
 * Use when input is valid JSON with type metadata
 */
molt.typed = function typed<T = unknown>(input: string, customTypes?: CustomTypeTransformer[]): T {
  const options: MoltOptions = { dirty: 'never', typed: 'always' };
  if (customTypes !== undefined) {
    options.customTypes = customTypes;
  }
  return molt<T>(input, options);
};

/**
 * Full pipeline - always clean and always restore types
 * Use when you want all features enabled
 */
molt.full = function full<T = unknown>(
  input: string,
  customTypes?: CustomTypeTransformer[],
  maxSize?: number,
): T {
  const options: MoltOptions = { dirty: 'always', typed: 'always' };
  if (customTypes !== undefined) {
    options.customTypes = customTypes;
  }
  if (maxSize !== undefined) {
    options.maxSize = maxSize;
  }
  return molt<T>(input, options);
};
