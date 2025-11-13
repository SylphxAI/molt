/**
 * Type registry for custom and built-in type transformers
 */

import type { CustomTypeTransformer } from './types.js';

/**
 * Global type registry
 */
export class TypeRegistry {
  private transformers: CustomTypeTransformer[] = [];

  /**
   * Register a custom type transformer
   */
  register(transformer: CustomTypeTransformer): void {
    // Remove existing transformer with same name
    this.transformers = this.transformers.filter((t) => t.name !== transformer.name);

    // Add new transformer
    this.transformers.push(transformer);

    // Sort by priority (higher priority first)
    this.transformers.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  /**
   * Unregister a custom type transformer
   */
  unregister(name: string): void {
    this.transformers = this.transformers.filter((t) => t.name !== name);
  }

  /**
   * Get all registered transformers
   */
  getAll(): CustomTypeTransformer[] {
    return [...this.transformers];
  }

  /**
   * Find transformer for a value
   */
  findTransformer(value: unknown): CustomTypeTransformer | undefined {
    return this.transformers.find((t) => t.isApplicable(value));
  }

  /**
   * Get transformer by name
   */
  getByName(name: string): CustomTypeTransformer | undefined {
    return this.transformers.find((t) => t.name === name);
  }

  /**
   * Clear all transformers
   */
  clear(): void {
    this.transformers = [];
  }
}

/**
 * Create default type registry with built-in types
 */
export function createDefaultRegistry(): TypeRegistry {
  const registry = new TypeRegistry();

  // Date
  registry.register({
    name: 'Date',
    isApplicable: (v): v is Date => v instanceof Date,
    serialize: (v: unknown) => (v as Date).toISOString(),
    deserialize: (v: unknown) => new Date(v as string),
    priority: 100,
  });

  // BigInt
  registry.register({
    name: 'bigint',
    isApplicable: (v): v is bigint => typeof v === 'bigint',
    serialize: (v: unknown) => (v as bigint).toString(),
    deserialize: (v: unknown) => BigInt(v as string),
    priority: 90,
  });

  // Map
  registry.register({
    name: 'Map',
    isApplicable: (v): v is Map<unknown, unknown> => v instanceof Map,
    serialize: (v: unknown) => Array.from((v as Map<unknown, unknown>).entries()),
    deserialize: (v: unknown) => new Map(v as [unknown, unknown][]),
    priority: 80,
  });

  // Set
  registry.register({
    name: 'Set',
    isApplicable: (v): v is Set<unknown> => v instanceof Set,
    serialize: (v: unknown) => Array.from(v as Set<unknown>),
    deserialize: (v: unknown) => new Set(v as unknown[]),
    priority: 70,
  });

  // RegExp
  registry.register({
    name: 'RegExp',
    isApplicable: (v): v is RegExp => v instanceof RegExp,
    serialize: (v: unknown) => {
      const regex = v as RegExp;
      return { source: regex.source, flags: regex.flags };
    },
    deserialize: (v: unknown) => {
      const { source, flags } = v as { source: string; flags: string };
      return new RegExp(source, flags);
    },
    priority: 60,
  });

  // URL
  registry.register({
    name: 'URL',
    isApplicable: (v): v is URL => v instanceof URL,
    serialize: (v: unknown) => (v as URL).href,
    deserialize: (v: unknown) => new URL(v as string),
    priority: 50,
  });

  // Error
  registry.register({
    name: 'Error',
    isApplicable: (v): v is Error => v instanceof Error,
    serialize: (v: unknown) => {
      const error = v as Error;
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    },
    deserialize: (v: unknown) => {
      const { name, message, stack } = v as { name: string; message: string; stack?: string };
      const error = new Error(message);
      error.name = name;
      if (stack) error.stack = stack;
      return error;
    },
    priority: 40,
  });

  return registry;
}
