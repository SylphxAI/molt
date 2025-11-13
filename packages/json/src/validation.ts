/**
 * Schema validation support
 * Integrates with popular schema validation libraries
 */

import { ParseError, ValidationError } from './types.js';

/**
 * Schema validator interface
 * Supports Zod, Yup, Joi, AJV, and custom validators
 */
export interface SchemaValidator<T = unknown> {
  /**
   * Validate a value against the schema
   * @throws ValidationError if validation fails
   */
  parse(value: unknown): T;

  /**
   * Validate a value against the schema (safe version)
   * Returns success/failure without throwing
   */
  safeParse(value: unknown): { success: true; data: T } | { success: false; error: Error };
}

/**
 * Zod schema adapter
 */
export class ZodAdapter<T> implements SchemaValidator<T> {
  constructor(private schema: { parse: (val: unknown) => T; safeParse: (val: unknown) => any }) {}

  parse(value: unknown): T {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : String(error));
    }
  }

  safeParse(value: unknown): { success: true; data: T } | { success: false; error: Error } {
    const result = this.schema.safeParse(value);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: new ValidationError(result.error?.message || 'Validation failed'),
    };
  }
}

/**
 * JSON Schema validator (uses a validation function)
 */
export class JSONSchemaAdapter<T = unknown> implements SchemaValidator<T> {
  constructor(
    private validate: (data: unknown) => boolean,
    private getErrors: () => any[] | null | undefined,
  ) {}

  parse(value: unknown): T {
    if (!this.validate(value)) {
      const errors = this.getErrors();
      const message = errors
        ? errors.map((e: any) => `${e.instancePath || e.dataPath} ${e.message}`).join(', ')
        : 'Validation failed';
      throw new ValidationError(message);
    }
    return value as T;
  }

  safeParse(value: unknown): { success: true; data: T } | { success: false; error: Error } {
    try {
      const data = this.parse(value);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}

/**
 * Simple object schema validator
 * Provides basic type checking without external dependencies
 */
export interface SimpleSchema {
  [key: string]: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | SimpleSchema;
}

export class SimpleSchemaValidator<T = unknown> implements SchemaValidator<T> {
  constructor(private schema: SimpleSchema) {}

  parse(value: unknown): T {
    this.validateValue(value, this.schema, '');
    return value as T;
  }

  safeParse(value: unknown): { success: true; data: T } | { success: false; error: Error } {
    try {
      const data = this.parse(value);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  private validateValue(value: unknown, schema: SimpleSchema | string, path: string): void {
    if (typeof schema === 'string') {
      // Primitive type check
      if (schema === 'null') {
        if (value !== null) {
          throw new ValidationError(`Expected null at ${path}, got ${typeof value}`);
        }
        return;
      }

      if (schema === 'array') {
        if (!Array.isArray(value)) {
          throw new ValidationError(`Expected array at ${path}, got ${typeof value}`);
        }
        return;
      }

      const actualType = typeof value;
      if (actualType !== schema) {
        throw new ValidationError(`Expected ${schema} at ${path}, got ${actualType}`);
      }
      return;
    }

    // Object schema
    if (typeof value !== 'object' || value === null) {
      throw new ValidationError(`Expected object at ${path}, got ${typeof value}`);
    }

    const obj = value as Record<string, unknown>;

    // Check all schema fields
    for (const [key, fieldSchema] of Object.entries(schema)) {
      const fieldPath = path ? `${path}.${key}` : key;

      if (!(key in obj)) {
        throw new ValidationError(`Missing required field: ${fieldPath}`);
      }

      this.validateValue(obj[key], fieldSchema, fieldPath);
    }
  }
}

/**
 * Validate JSON with schema
 */
export function validateJSON<T>(jsonString: string, validator: SchemaValidator<T>): T {
  const parsed = JSON.parse(jsonString);
  return validator.parse(parsed);
}

/**
 * Safe validate JSON with schema
 */
export function safeValidateJSON<T>(
  jsonString: string,
  validator: SchemaValidator<T>,
): { success: true; data: T } | { success: false; error: Error } {
  try {
    const parsed = JSON.parse(jsonString);
    return validator.safeParse(parsed);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new ParseError(String(error)),
    };
  }
}
