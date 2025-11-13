/**
 * @sylphx/molt - Unified Data Transformation Stack
 *
 * High-performance transformers for JSON, XML, YAML, TOML, and CSV
 * with type preservation, dirty cleaning, and streaming support.
 */

// Re-export JSON transformer
export * from '@sylphx/molt-json';
export { default as MoltJSON } from '@sylphx/molt-json';

// Re-export XML transformer
export * from '@sylphx/molt-xml';
export { default as MoltXML } from '@sylphx/molt-xml';

// Re-export YAML transformer
export * from '@sylphx/molt-yaml';
export { default as MoltYAML } from '@sylphx/molt-yaml';

// Re-export TOML transformer
export * from '@sylphx/molt-toml';
export { default as MoltTOML } from '@sylphx/molt-toml';

// Re-export CSV transformer
export * from '@sylphx/molt-csv';
export { default as MoltCSV } from '@sylphx/molt-csv';

/**
 * Unified molt API
 *
 * Auto-detects format and transforms accordingly
 */
export { molt, detectFormat, transform } from './molt.js';

/**
 * Version info
 */
export const VERSION = '0.1.0';
