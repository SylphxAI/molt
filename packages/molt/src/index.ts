/**
 * @sylphx/molt - Unified Data Transformation Stack
 *
 * High-performance transformers for JSON, YAML, TOML, INI, CSV, XML, MessagePack, and TOON
 * with type preservation, dirty cleaning, and streaming support.
 */

// Namespaced exports to avoid naming conflicts
export * as JSON from '@sylphx/molt-json';
export * as YAML from '@sylphx/molt-yaml';
export * as TOML from '@sylphx/molt-toml';
export * as INI from '@sylphx/molt-ini';
export * as CSV from '@sylphx/molt-csv';
export * as XML from '@sylphx/molt-xml';
export * as MessagePack from '@sylphx/molt-msgpack';
export * as TOON from '@sylphx/molt-toon';

// Re-export default exports as named exports
export { default as MoltJSON } from '@sylphx/molt-json';
export { default as MoltYAML } from '@sylphx/molt-yaml';
export { default as MoltTOML } from '@sylphx/molt-toml';
export { default as MoltINI } from '@sylphx/molt-ini';
export { default as MoltCSV } from '@sylphx/molt-csv';
export { default as MoltXML } from '@sylphx/molt-xml';
export { encode as encodeMessagePack, decode as decodeMessagePack } from '@sylphx/molt-msgpack';
export { parseTOON, serializeTOON } from '@sylphx/molt-toon';

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
