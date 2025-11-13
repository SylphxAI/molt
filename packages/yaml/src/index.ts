/**
 * @sylphx/molt-yaml - YAML Transformer
 *
 * Handle dirty YAML, type preservation, and streaming
 */

import { parseYAML } from './parser.js';
import { stringifyYAML } from './serializer.js';
import type { ParseYAMLOptions, StringifyYAMLOptions } from './types.js';

/**
 * Main YAML API
 */
export class MoltYAML {
  /**
   * Parse YAML string to JavaScript object
   *
   * @param input - YAML string (can be dirty)
   * @param options - Parse options
   * @returns JavaScript object
   */
  static parse(input: string, options?: ParseYAMLOptions): unknown {
    return parseYAML(input, options);
  }

  /**
   * Stringify JavaScript object to YAML string
   *
   * @param value - JavaScript object
   * @param options - Stringify options
   * @returns YAML string
   */
  static stringify(value: unknown, options?: StringifyYAMLOptions): string {
    return stringifyYAML(value, options);
  }
}

/**
 * Unified molt API for YAML
 *
 * @param input - YAML string (can be dirty)
 * @param options - Parse options
 * @returns JavaScript object
 *
 * @example
 * ```typescript
 * import { molt } from '@sylphx/molt-yaml';
 *
 * // Parse YAML to object
 * const data = molt(`
 *   name: alice
 *   age: 30
 *   tags:
 *     - developer
 *     - typescript
 * `);
 * // => { name: 'alice', age: 30, tags: ['developer', 'typescript'] }
 * ```
 */
export function molt(input: string, options?: ParseYAMLOptions): unknown {
  return MoltYAML.parse(input, options);
}

// Export types
export type { ParseYAMLOptions, StringifyYAMLOptions } from './types.js';
export { YAMLError, ParseError } from './types.js';

// Export individual functions
export { parseYAML } from './parser.js';
export { stringifyYAML } from './serializer.js';

// Default export
export default MoltYAML;
