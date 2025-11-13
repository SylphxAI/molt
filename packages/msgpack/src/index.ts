/**
 * @sylphx/molt-msgpack
 *
 * High-performance MessagePack binary format parser and serializer
 *
 * @packageDocumentation
 */

export { decode } from './decoder.js';
export { encode } from './encoder.js';
export type {
  DecodeOptions,
  EncodeOptions,
  ExtensionType,
} from './types.js';
export { DecodeError, EncodeError } from './types.js';

/**
 * Main API - decode MessagePack binary
 */
export { decode as molt } from './decoder.js';

/**
 * Main API - encode to MessagePack binary
 */
export { encode as stringify } from './encoder.js';

/**
 * Main API - decode MessagePack binary (alias)
 */
export { decode as parse } from './decoder.js';
