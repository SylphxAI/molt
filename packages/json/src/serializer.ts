/**
 * Type-aware JSON serializer (superjson-compatible)
 */

import { type TypeRegistry, createDefaultRegistry } from './registry.js';
import type { CustomTypeTransformer, TypeAnnotation, TypedJSON } from './types.js';

/**
 * Serialize a value to TypedJSON format
 */
export function serialize(value: unknown, customTypes?: CustomTypeTransformer[]): TypedJSON {
  const registry = createDefaultRegistry();

  // Register custom types
  if (customTypes) {
    for (const transformer of customTypes) {
      registry.register(transformer);
    }
  }

  const paths = new Map<string, TypeAnnotation>();
  const json = serializeValue(value, '', registry, paths);

  // Return TypedJSON format
  if (paths.size === 0) {
    return { json };
  }

  return {
    json,
    meta: {
      values: Object.fromEntries(paths),
    },
  };
}

/**
 * Serialize a single value
 */
function serializeValue(
  value: unknown,
  path: string,
  registry: TypeRegistry,
  paths: Map<string, TypeAnnotation>,
): unknown {
  // Handle primitives
  if (value === null) return null;
  if (value === undefined) {
    paths.set(path, 'undefined');
    return null;
  }

  const type = typeof value;

  if (type === 'string' || type === 'boolean') {
    return value;
  }

  if (type === 'number') {
    if (Number.isNaN(value)) {
      paths.set(path, 'NaN');
      return null;
    }
    if (value === Number.POSITIVE_INFINITY) {
      paths.set(path, 'Infinity');
      return null;
    }
    if (value === Number.NEGATIVE_INFINITY) {
      paths.set(path, '-Infinity');
      return null;
    }
    return value;
  }

  // Check custom types
  const transformer = registry.findTransformer(value);
  if (transformer) {
    const serialized = transformer.serialize(value);
    paths.set(path, transformer.name as TypeAnnotation);
    return serializeValue(serialized, path, registry, paths);
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      const itemPath = path ? `${path}.${index}` : String(index);
      return serializeValue(item, itemPath, registry, paths);
    });
  }

  // Handle plain objects
  if (type === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const itemPath = path ? `${path}.${key}` : key;
      result[key] = serializeValue(val, itemPath, registry, paths);
    }
    return result;
  }

  // Fallback: convert to string
  return String(value);
}

/**
 * Deserialize TypedJSON back to original value
 */
export function deserialize(typedJSON: TypedJSON, customTypes?: CustomTypeTransformer[]): unknown {
  const registry = createDefaultRegistry();

  // Register custom types
  if (customTypes) {
    for (const transformer of customTypes) {
      registry.register(transformer);
    }
  }

  const paths = new Map<string, TypeAnnotation>(Object.entries(typedJSON.meta?.values ?? {}));

  return deserializeValue(typedJSON.json, '', registry, paths);
}

/**
 * Deserialize a single value
 */
function deserializeValue(
  value: unknown,
  path: string,
  registry: TypeRegistry,
  paths: Map<string, TypeAnnotation>,
): unknown {
  const annotation = paths.get(path);

  // Handle annotated types
  if (annotation) {
    // Handle special primitives
    if (annotation === 'undefined') return undefined;
    if (annotation === 'NaN') return Number.NaN;
    if (annotation === 'Infinity') return Number.POSITIVE_INFINITY;
    if (annotation === '-Infinity') return Number.NEGATIVE_INFINITY;

    // For transformable types, first deserialize the nested structure,
    // then apply the transformer
    let transformedValue = value;

    // Deserialize nested values for arrays
    if (Array.isArray(value)) {
      transformedValue = value.map((item, index) => {
        const itemPath = path ? `${path}.${index}` : String(index);
        return deserializeValue(item, itemPath, registry, paths);
      });
    }
    // Deserialize nested values for objects
    else if (value !== null && typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        const itemPath = path ? `${path}.${key}` : key;
        result[key] = deserializeValue(val, itemPath, registry, paths);
      }
      transformedValue = result;
    }

    // Handle custom types
    if (Array.isArray(annotation) && annotation[0] === 'custom') {
      const transformer = registry.getByName(annotation[1]!);
      if (!transformer) {
        throw new Error(`Unknown custom type: ${annotation[1]}`);
      }
      return transformer.deserialize(transformedValue);
    }

    // Handle built-in types (string annotations only)
    if (typeof annotation === 'string') {
      const transformer = registry.getByName(annotation);
      if (transformer) {
        return transformer.deserialize(transformedValue);
      }
    }
  }

  // Handle arrays (without annotation)
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      const itemPath = path ? `${path}.${index}` : String(index);
      return deserializeValue(item, itemPath, registry, paths);
    });
  }

  // Handle plain objects (without annotation)
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const itemPath = path ? `${path}.${key}` : key;
      result[key] = deserializeValue(val, itemPath, registry, paths);
    }
    return result;
  }

  // Return primitives as-is
  return value;
}
