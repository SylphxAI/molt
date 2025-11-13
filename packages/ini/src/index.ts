/**
 * @sylphx/molt-ini
 *
 * High-performance INI parser and serializer
 *
 * @packageDocumentation
 */

export { parseINI } from './parser.js';
export { serializeINI } from './serializer.js';
export type {
  ParseINIOptions,
  SerializeINIOptions,
  INIData,
} from './types.js';
export { ParseError } from './types.js';

/**
 * Main API - parse INI string
 */
export { parseINI as molt } from './parser.js';

/**
 * Main API - serialize to INI string
 */
export { serializeINI as stringify } from './serializer.js';

/**
 * Main API - parse INI string (alias)
 */
export { parseINI as parse } from './parser.js';
