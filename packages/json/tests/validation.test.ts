import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { HyperJSON } from '../src/index.js';
import {
  SimpleSchemaValidator,
  ZodAdapter,
  safeValidateJSON,
  validateJSON,
} from '../src/validation.js';

describe('ZodAdapter', () => {
  it('should validate with Zod schema', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const adapter = new ZodAdapter(schema);
    const result = adapter.parse({ name: 'Alice', age: 30 });

    expect(result).toEqual({ name: 'Alice', age: 30 });
  });

  it('should throw on invalid data', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const adapter = new ZodAdapter(schema);

    expect(() => adapter.parse({ name: 'Alice', age: 'invalid' })).toThrow();
  });

  it('should work with safeParse', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const adapter = new ZodAdapter(schema);

    const validResult = adapter.safeParse({ name: 'Alice', age: 30 });
    expect(validResult.success).toBe(true);
    if (validResult.success) {
      expect(validResult.data).toEqual({ name: 'Alice', age: 30 });
    }

    const invalidResult = adapter.safeParse({ name: 'Alice', age: 'invalid' });
    expect(invalidResult.success).toBe(false);
  });

  it('should validate complex nested schemas', () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
      tags: z.array(z.string()),
      active: z.boolean(),
    });

    const adapter = new ZodAdapter(schema);
    const data = {
      user: {
        name: 'Alice',
        email: 'alice@example.com',
      },
      tags: ['typescript', 'nodejs'],
      active: true,
    };

    const result = adapter.parse(data);
    expect(result).toEqual(data);
  });
});

describe('SimpleSchemaValidator', () => {
  it('should validate simple object schema', () => {
    const validator = new SimpleSchemaValidator({
      name: 'string',
      age: 'number',
      active: 'boolean',
    });

    const result = validator.parse({
      name: 'Alice',
      age: 30,
      active: true,
    });

    expect(result).toEqual({
      name: 'Alice',
      age: 30,
      active: true,
    });
  });

  it('should throw on missing fields', () => {
    const validator = new SimpleSchemaValidator({
      name: 'string',
      age: 'number',
    });

    expect(() => validator.parse({ name: 'Alice' })).toThrow('Missing required field: age');
  });

  it('should throw on wrong type', () => {
    const validator = new SimpleSchemaValidator({
      name: 'string',
      age: 'number',
    });

    expect(() => validator.parse({ name: 'Alice', age: 'invalid' })).toThrow(
      'Expected number at age, got string',
    );
  });

  it('should validate nested objects', () => {
    const validator = new SimpleSchemaValidator({
      user: {
        name: 'string',
        age: 'number',
      },
      active: 'boolean',
    });

    const result = validator.parse({
      user: {
        name: 'Alice',
        age: 30,
      },
      active: true,
    });

    expect(result).toEqual({
      user: {
        name: 'Alice',
        age: 30,
      },
      active: true,
    });
  });

  it('should validate arrays', () => {
    const validator = new SimpleSchemaValidator({
      items: 'array',
    });

    const result = validator.parse({
      items: [1, 2, 3],
    });

    expect(result).toEqual({
      items: [1, 2, 3],
    });
  });

  it('should validate null', () => {
    const validator = new SimpleSchemaValidator({
      value: 'null',
    });

    const result = validator.parse({
      value: null,
    });

    expect(result).toEqual({
      value: null,
    });
  });

  it('should work with safeParse', () => {
    const validator = new SimpleSchemaValidator({
      name: 'string',
    });

    const validResult = validator.safeParse({ name: 'Alice' });
    expect(validResult.success).toBe(true);

    const invalidResult = validator.safeParse({ name: 123 });
    expect(invalidResult.success).toBe(false);
  });
});

describe('validateJSON', () => {
  it('should validate JSON string with Zod', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const adapter = new ZodAdapter(schema);
    const json = '{"name": "Alice", "age": 30}';

    const result = validateJSON(json, adapter);
    expect(result).toEqual({ name: 'Alice', age: 30 });
  });

  it('should throw on invalid JSON', () => {
    const schema = z.object({
      name: z.string(),
    });

    const adapter = new ZodAdapter(schema);
    const json = 'invalid json';

    expect(() => validateJSON(json, adapter)).toThrow();
  });

  it('should throw on schema mismatch', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const adapter = new ZodAdapter(schema);
    const json = '{"name": "Alice", "age": "invalid"}';

    expect(() => validateJSON(json, adapter)).toThrow();
  });
});

describe('safeValidateJSON', () => {
  it('should safely validate valid JSON', () => {
    const schema = z.object({
      name: z.string(),
    });

    const adapter = new ZodAdapter(schema);
    const json = '{"name": "Alice"}';

    const result = safeValidateJSON(json, adapter);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: 'Alice' });
    }
  });

  it('should return error for invalid JSON', () => {
    const schema = z.object({
      name: z.string(),
    });

    const adapter = new ZodAdapter(schema);
    const json = 'invalid';

    const result = safeValidateJSON(json, adapter);
    expect(result.success).toBe(false);
  });

  it('should return error for schema mismatch', () => {
    const schema = z.object({
      name: z.string(),
    });

    const adapter = new ZodAdapter(schema);
    const json = '{"name": 123}';

    const result = safeValidateJSON(json, adapter);
    expect(result.success).toBe(false);
  });
});

describe('HyperJSON with schema validation', () => {
  it('should validate during parse', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const json = '{name: "Alice", age: 30}';

    const result = HyperJSON.parse(json, {
      schema: new ZodAdapter(schema),
    });

    expect(result).toEqual({ name: 'Alice', age: 30 });
  });

  it('should throw on validation failure', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const json = '{name: "Alice", age: "invalid"}';

    expect(() => {
      HyperJSON.parse(json, {
        schema: new ZodAdapter(schema),
      });
    }).toThrow();
  });

  it('should validate with SimpleSchemaValidator', () => {
    const json = '{user: "alice", active: true}';

    const result = HyperJSON.parse(json, {
      schema: new SimpleSchemaValidator({
        user: 'string',
        active: 'boolean',
      }),
    });

    expect(result).toEqual({ user: 'alice', active: true });
  });

  it('should validate typed JSON with schema', () => {
    const schema = z.object({
      created: z.date(),
      count: z.number(),
    });

    const typedJSON = HyperJSON.stringify({
      created: new Date('2024-01-01'),
      count: 123,
    });

    const result = HyperJSON.parse(typedJSON, {
      schema: new ZodAdapter(schema),
    });

    expect(result).toHaveProperty('created');
    expect(result).toHaveProperty('count', 123);
    expect(result.created).toBeInstanceOf(Date);
  });
});
