/**
 * @sylphx/molt-xml - XML Transformer
 *
 * Handle dirty XML, type preservation, and streaming
 */

import { parseXML } from './parser.js';
import { stringifyXML, toObject } from './serializer.js';
import { cleanDirtyXML } from './cleaner.js';
import type {
  XMLDocument,
  XMLNode,
  XMLElement,
  ParseXMLOptions,
  StringifyXMLOptions,
} from './types.js';

/**
 * Main XML API
 */
export class MoltXML {
  /**
   * Parse XML string to XMLDocument
   *
   * @param input - XML string (can be dirty)
   * @param options - Parse options
   * @returns XMLDocument
   */
  static parse(input: string, options?: ParseXMLOptions): XMLDocument {
    return parseXML(input, options);
  }

  /**
   * Parse XML and convert to plain object
   *
   * @param input - XML string (can be dirty)
   * @param options - Parse options
   * @returns Plain JavaScript object
   */
  static toObject(input: string, options?: ParseXMLOptions): unknown {
    const doc = parseXML(input, options);
    return toObject(doc);
  }

  /**
   * Stringify XMLDocument to XML string
   *
   * @param doc - XMLDocument
   * @param options - Stringify options
   * @returns XML string
   */
  static stringify(doc: XMLDocument, options?: StringifyXMLOptions): string {
    return stringifyXML(doc, options);
  }

  /**
   * Clean dirty XML to valid XML string
   *
   * @param input - Dirty XML string
   * @param maxSize - Maximum input size
   * @returns Clean XML string
   */
  static clean(input: string, maxSize?: number): string {
    return cleanDirtyXML(input, maxSize);
  }
}

/**
 * Unified molt API for XML
 *
 * @param input - XML string (can be dirty)
 * @param options - Parse options
 * @returns Plain JavaScript object
 *
 * @example
 * ```typescript
 * import { molt } from '@sylphx/molt-xml';
 *
 * // Parse dirty XML to object
 * const data = molt('<user name=alice age=30/>');
 * // => { '@name': 'alice', '@age': '30' }
 * ```
 */
export function molt(input: string, options?: ParseXMLOptions): unknown {
  return MoltXML.toObject(input, options);
}

// Export types
export type {
  XMLDocument,
  XMLNode,
  XMLElement,
  ParseXMLOptions,
  StringifyXMLOptions,
} from './types.js';

export { XMLError, ParseError, ValidationError } from './types.js';

// Export individual functions
export { parseXML } from './parser.js';
export { stringifyXML, toObject } from './serializer.js';
export { cleanDirtyXML } from './cleaner.js';

// Default export
export default MoltXML;
