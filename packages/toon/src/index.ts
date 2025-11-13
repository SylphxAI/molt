/**
 * @sylphx/molt-toon
 *
 * Token-Oriented Object Notation (TOON) parser and serializer
 * Designed to reduce LLM token usage by 30-60%
 *
 * @packageDocumentation
 */

export { parseTOON } from './parser.js';
export { serializeTOON } from './serializer.js';
export type {
  ParseTOONOptions,
  SerializeTOONOptions,
  TOONValue,
  TOONObject,
  TOONArray,
} from './types.js';
export { ParseError } from './types.js';

/**
 * Main API - parse TOON string
 */
export { parseTOON as molt } from './parser.js';

/**
 * Main API - serialize to TOON string
 */
export { serializeTOON as stringify } from './serializer.js';

/**
 * Main API - parse TOON string (alias)
 */
export { parseTOON as parse } from './parser.js';
