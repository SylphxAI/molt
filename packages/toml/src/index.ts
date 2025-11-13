/**
 * @sylphx/molt-toml - TOML Transformer
 *
 * Handle TOML parsing and serialization
 */

import { parseTOML } from './parser.js';
import { stringifyTOML } from './serializer.js';
import type { ParseTOMLOptions, StringifyTOMLOptions } from './types.js';

/**
 * Main TOML API
 */
export class MoltTOML {
  /**
   * Parse TOML string to JavaScript object
   *
   * @param input - TOML string
   * @param options - Parse options
   * @returns JavaScript object
   */
  static parse(input: string, options?: ParseTOMLOptions): unknown {
    return parseTOML(input, options);
  }

  /**
   * Stringify JavaScript object to TOML string
   *
   * @param value - JavaScript object
   * @param options - Stringify options
   * @returns TOML string
   */
  static stringify(value: unknown, options?: StringifyTOMLOptions): string {
    return stringifyTOML(value, options);
  }
}

/**
 * Unified molt API for TOML
 *
 * @param input - TOML string
 * @param options - Parse options
 * @returns JavaScript object
 *
 * @example
 * ```typescript
 * import { molt } from '@sylphx/molt-toml';
 *
 * // Parse TOML to object
 * const data = molt(`
 *   title = "TOML Example"
 *
 *   [owner]
 *   name = "Alice"
 *   age = 30
 * `);
 * // => { title: 'TOML Example', owner: { name: 'Alice', age: 30 } }
 * ```
 */
export function molt(input: string, options?: ParseTOMLOptions): unknown {
  return MoltTOML.parse(input, options);
}

// Export types
export type { ParseTOMLOptions, StringifyTOMLOptions } from './types.js';
export { TOMLError, ParseError } from './types.js';

// Export individual functions
export { parseTOML } from './parser.js';
export { stringifyTOML } from './serializer.js';

// Default export
export default MoltTOML;
