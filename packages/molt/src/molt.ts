/**
 * Unified molt API with auto-detection
 */

import { molt as moltJSON } from '@sylphx/molt-json';
import { molt as moltXML } from '@sylphx/molt-xml';
import { molt as moltYAML } from '@sylphx/molt-yaml';
import { molt as moltTOML } from '@sylphx/molt-toml';
import { molt as moltINI } from '@sylphx/molt-ini';
import { molt as moltCSV } from '@sylphx/molt-csv';
import { parseTOON } from '@sylphx/molt-toon';

/**
 * Supported data formats
 */
export type Format = 'json' | 'xml' | 'yaml' | 'toml' | 'ini' | 'csv' | 'toon' | 'auto';

/**
 * Transform options
 */
export interface TransformOptions {
  format?: Format;
  [key: string]: unknown;
}

/**
 * Detect data format from input string
 *
 * @param input - Input string
 * @returns Detected format
 */
export function detectFormat(input: string): Format {
  const trimmed = input.trim();

  // XML: starts with < or <?xml
  if (trimmed.startsWith('<')) {
    return 'xml';
  }

  // JSON: starts with { or [
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }

  // TOON: has table format with | delimiters (key:\n  col1 | col2 | col3)
  if (/^[a-zA-Z_][\w-]*:\s*\n\s+[\w-]+(\s*\|\s*[\w-]+)+/m.test(trimmed)) {
    return 'toon';
  }

  // YAML: has key: value pattern or starts with ---
  if (trimmed.startsWith('---') || /^[a-zA-Z_][\w-]*:\s/m.test(trimmed)) {
    return 'yaml';
  }

  // INI: has [section] followed by key=value (differentiate from TOML by checking for =)
  if (/^\[[\w.-]+\]\s*\n\s*[a-zA-Z_][\w-]*\s*=/m.test(trimmed)) {
    return 'ini';
  }

  // TOML: has [section] or key = value pattern (with spaces around =)
  if (/^\[[\w.-]+\]/m.test(trimmed) || /^[a-zA-Z_][\w-]*\s*=\s*/m.test(trimmed)) {
    return 'toml';
  }

  // CSV: has commas and multiple lines
  if (trimmed.includes(',') && trimmed.split('\n').length > 1) {
    return 'csv';
  }

  // Default to JSON for single-line or ambiguous input
  return 'json';
}

/**
 * Transform data using specified or auto-detected format
 *
 * @param input - Input string
 * @param options - Transform options
 * @returns Transformed data
 */
export function transform(input: string, options: TransformOptions = {}): unknown {
  const format = options.format === 'auto' || !options.format
    ? detectFormat(input)
    : options.format;

  switch (format) {
    case 'json':
      return moltJSON(input, options as any);
    case 'xml':
      return moltXML(input, options as any);
    case 'yaml':
      return moltYAML(input, options as any);
    case 'toml':
      return moltTOML(input, options as any);
    case 'ini':
      return moltINI(input, options as any);
    case 'csv':
      return moltCSV(input, options as any);
    case 'toon':
      return parseTOON(input, options as any);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Unified molt API - auto-detects format and transforms
 *
 * @param input - Input string
 * @param options - Transform options
 * @returns Transformed data
 *
 * @example
 * ```typescript
 * import { molt } from '@sylphx/molt';
 *
 * // Auto-detect JSON
 * const json = molt('{"name": "alice"}');
 *
 * // Auto-detect XML
 * const xml = molt('<user name="alice"/>');
 *
 * // Auto-detect YAML
 * const yaml = molt('name: alice\nage: 30');
 *
 * // Auto-detect TOML
 * const toml = molt('[server]\nhost = "localhost"');
 *
 * // Auto-detect CSV
 * const csv = molt('name,age\nalice,30');
 *
 * // Explicit format
 * const data = molt(input, { format: 'json' });
 * ```
 */
export function molt(input: string, options?: TransformOptions): unknown {
  return transform(input, { ...options, format: options?.format || 'auto' });
}
