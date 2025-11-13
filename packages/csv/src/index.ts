/**
 * @sylphx/molt-csv - CSV Transformer
 *
 * Handle CSV parsing and serialization
 */

import { parseCSV } from './parser.js';
import { stringifyCSV } from './serializer.js';
import type { ParseCSVOptions, StringifyCSVOptions } from './types.js';

/**
 * Main CSV API
 */
export class MoltCSV {
  /**
   * Parse CSV string to JavaScript array
   *
   * @param input - CSV string
   * @param options - Parse options
   * @returns Array of objects or arrays
   */
  static parse(input: string, options?: ParseCSVOptions): unknown[] {
    return parseCSV(input, options);
  }

  /**
   * Stringify JavaScript array to CSV string
   *
   * @param data - Array of objects or arrays
   * @param options - Stringify options
   * @returns CSV string
   */
  static stringify(data: unknown[], options?: StringifyCSVOptions): string {
    return stringifyCSV(data, options);
  }
}

/**
 * Unified molt API for CSV
 *
 * @param input - CSV string
 * @param options - Parse options
 * @returns Array of objects or arrays
 *
 * @example
 * ```typescript
 * import { molt } from '@sylphx/molt-csv';
 *
 * // Parse CSV to array of objects
 * const data = molt(`
 * name,age,city
 * Alice,30,NYC
 * Bob,25,LA
 * `);
 * // => [
 * //   { name: 'Alice', age: 30, city: 'NYC' },
 * //   { name: 'Bob', age: 25, city: 'LA' }
 * // ]
 * ```
 */
export function molt(input: string, options?: ParseCSVOptions): unknown[] {
  return MoltCSV.parse(input, options);
}

// Export types
export type { ParseCSVOptions, StringifyCSVOptions } from './types.js';
export { CSVError, ParseError } from './types.js';

// Export individual functions
export { parseCSV } from './parser.js';
export { stringifyCSV } from './serializer.js';

// Default export
export default MoltCSV;
