/**
 * HyperJSON - Monster-level JSON transformer
 * Combines dirty JSON parsing + typed JSON serialization
 */

import { cleanDirtyJSON } from './cleaner.js';
import { createDefaultRegistry } from './registry.js';
import { deserialize, serialize } from './serializer.js';
import type { CustomTypeTransformer, ParseOptions, StringifyOptions, TypedJSON } from './types.js';

/**
 * Main HyperJSON API
 */
export class HyperJSON {
  /**
   * Parse JSON string (with optional dirty JSON cleaning and type reconstruction)
   */
  static parse<T = unknown>(input: string, options: ParseOptions = {}): T {
    const {
      cleanDirty = true,
      parseTypes = true,
      maxSize = 100 * 1024 * 1024, // 100MB
      customTypes,
      schema,
    } = options;

    let jsonString = input;

    // Step 1: Clean dirty JSON if enabled
    if (cleanDirty) {
      jsonString = cleanDirtyJSON(input, maxSize);
    }

    // Step 2: Parse JSON
    const parsed = JSON.parse(jsonString);

    // Step 3: Reconstruct types if enabled
    let result: unknown = parsed;
    if (parseTypes) {
      // Check if input is TypedJSON format
      if (
        parsed &&
        typeof parsed === 'object' &&
        'json' in parsed &&
        ('meta' in parsed || Object.keys(parsed).length === 1)
      ) {
        result = deserialize(parsed as TypedJSON, customTypes);
      }
    } else {
      result = parsed;
    }

    // Step 4: Validate with schema if provided
    if (schema) {
      return schema.parse(result) as T;
    }

    return result as T;
  }

  /**
   * Stringify value to JSON (with optional type preservation)
   */
  static stringify(value: unknown, options: StringifyOptions = {}): string {
    const { includeTypes = true, customTypes, space } = options;

    if (!includeTypes) {
      return JSON.stringify(value, null, space);
    }

    const typedJSON = serialize(value, customTypes);

    // If no metadata, just return regular JSON
    if (!typedJSON.meta || Object.keys(typedJSON.meta.values ?? {}).length === 0) {
      return JSON.stringify(value, null, space);
    }

    return JSON.stringify(typedJSON, null, space);
  }

  /**
   * Serialize value to TypedJSON format
   */
  static serialize(value: unknown, customTypes?: CustomTypeTransformer[]): TypedJSON {
    return serialize(value, customTypes);
  }

  /**
   * Deserialize TypedJSON back to original value
   */
  static deserialize<T = unknown>(typedJSON: TypedJSON, customTypes?: CustomTypeTransformer[]): T {
    return deserialize(typedJSON, customTypes) as T;
  }

  /**
   * Clean dirty JSON to valid JSON string
   */
  static clean(input: string, maxSize?: number): string {
    return cleanDirtyJSON(input, maxSize);
  }

  /**
   * Register a custom type transformer globally
   */
  static registerCustom(transformer: CustomTypeTransformer): void {
    globalRegistry.register(transformer);
  }

  /**
   * Unregister a custom type transformer globally
   */
  static unregisterCustom(name: string): void {
    globalRegistry.unregister(name);
  }
}

// Global registry for custom types
const globalRegistry = createDefaultRegistry();

// Export unified Molt API (recommended)
export { molt, detectDirty, hasTypeMetadata } from './molt.js';
export type { MoltOptions, MoltStringifyOptions } from './molt.js';

// Export streaming functions
export { parseStream, parseNDJSON, parseJSONArray } from './streaming.js';

// Export validation
export {
  ZodAdapter,
  JSONSchemaAdapter,
  SimpleSchemaValidator,
  validateJSON,
  safeValidateJSON,
} from './validation.js';
export type { SchemaValidator, SimpleSchema } from './validation.js';

// Export types
export type {
  ParseOptions,
  StringifyOptions,
  CustomTypeTransformer,
  TypedJSON,
  TypeAnnotation,
  TypeMetadata,
} from './types.js';

export {
  HyperJSONError,
  ParseError,
  ValidationError,
} from './types.js';

export { TypeRegistry, createDefaultRegistry } from './registry.js';

// Export WASM accelerated functions
export {
  cleanWithWasm,
  cleanWithWasmSimd,
  cleanSync,
  initWasm,
  isWasmAvailable,
  isWasmEnabled,
  disableWasm,
  enableWasm,
} from './wasm-loader.js';

// Export smart engine selection
export {
  smartClean,
  smartCleanSync,
  setEngineStrategies,
  resetEngineStrategies,
  getPlatformInfo,
  getPerformanceStats,
  resetPerformanceCache,
  benchmarkEngines,
} from './engine-selector.js';
export type { EngineStrategy } from './engine-selector.js';

// Default export
export default HyperJSON;
