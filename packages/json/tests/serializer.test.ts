import { describe, expect, it } from 'vitest';
import { deserialize, serialize } from '../src/serializer.js';

describe('serializer', () => {
  describe('primitives', () => {
    it('should handle null', () => {
      const result = serialize(null);
      expect(result).toEqual({ json: null });
    });

    it('should handle undefined', () => {
      const result = serialize(undefined);
      expect(result).toEqual({
        json: null,
        meta: { values: { '': 'undefined' } },
      });
    });

    it('should handle strings', () => {
      const result = serialize('hello');
      expect(result).toEqual({ json: 'hello' });
    });

    it('should handle numbers', () => {
      const result = serialize(123);
      expect(result).toEqual({ json: 123 });
    });

    it('should handle booleans', () => {
      expect(serialize(true)).toEqual({ json: true });
      expect(serialize(false)).toEqual({ json: false });
    });
  });

  describe('special numbers', () => {
    it('should handle NaN', () => {
      const result = serialize(Number.NaN);
      expect(result).toEqual({
        json: null,
        meta: { values: { '': 'NaN' } },
      });
    });

    it('should handle Infinity', () => {
      const result = serialize(Number.POSITIVE_INFINITY);
      expect(result).toEqual({
        json: null,
        meta: { values: { '': 'Infinity' } },
      });
    });

    it('should handle -Infinity', () => {
      const result = serialize(Number.NEGATIVE_INFINITY);
      expect(result).toEqual({
        json: null,
        meta: { values: { '': '-Infinity' } },
      });
    });
  });

  describe('Date', () => {
    it('should serialize Date', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = serialize(date);
      expect(result).toEqual({
        json: '2024-01-01T00:00:00.000Z',
        meta: { values: { '': 'Date' } },
      });
    });

    it('should deserialize Date', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const serialized = serialize(date);
      const deserialized = deserialize(serialized);
      expect(deserialized).toEqual(date);
    });
  });

  describe('BigInt', () => {
    it('should serialize BigInt', () => {
      const big = 123456789012345678901n;
      const result = serialize(big);
      expect(result).toEqual({
        json: '123456789012345678901',
        meta: { values: { '': 'bigint' } },
      });
    });

    it('should deserialize BigInt', () => {
      const big = 123456789012345678901n;
      const serialized = serialize(big);
      const deserialized = deserialize(serialized);
      expect(deserialized).toEqual(big);
    });
  });

  describe('Map', () => {
    it('should serialize Map', () => {
      const map = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);
      const result = serialize(map);
      expect(result).toEqual({
        json: [
          ['key1', 'value1'],
          ['key2', 'value2'],
        ],
        meta: { values: { '': 'Map' } },
      });
    });

    it('should deserialize Map', () => {
      const map = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);
      const serialized = serialize(map);
      const deserialized = deserialize(serialized);
      expect(deserialized).toEqual(map);
    });

    it('should handle nested values in Map', () => {
      const map = new Map([
        ['date', new Date('2024-01-01')],
        ['set', new Set([1, 2, 3])],
      ]);
      const serialized = serialize(map);
      const deserialized = deserialize(serialized);
      expect(deserialized).toEqual(map);
    });
  });

  describe('Set', () => {
    it('should serialize Set', () => {
      const set = new Set([1, 2, 3]);
      const result = serialize(set);
      expect(result).toEqual({
        json: [1, 2, 3],
        meta: { values: { '': 'Set' } },
      });
    });

    it('should deserialize Set', () => {
      const set = new Set([1, 2, 3]);
      const serialized = serialize(set);
      const deserialized = deserialize(serialized);
      expect(deserialized).toEqual(set);
    });

    it('should handle nested values in Set', () => {
      const set = new Set([new Date('2024-01-01'), 'string', 123]);
      const serialized = serialize(set);
      const deserialized = deserialize(serialized);
      expect(deserialized).toEqual(set);
    });
  });

  describe('RegExp', () => {
    it('should serialize RegExp', () => {
      const regex = /test/gi;
      const result = serialize(regex);
      expect(result).toEqual({
        json: { source: 'test', flags: 'gi' },
        meta: { values: { '': 'RegExp' } },
      });
    });

    it('should deserialize RegExp', () => {
      const regex = /test/gi;
      const serialized = serialize(regex);
      const deserialized = deserialize(serialized) as RegExp;
      expect(deserialized.source).toBe(regex.source);
      expect(deserialized.flags).toBe(regex.flags);
    });
  });

  describe('URL', () => {
    it('should serialize URL', () => {
      const url = new URL('https://example.com/path');
      const result = serialize(url);
      expect(result).toEqual({
        json: 'https://example.com/path',
        meta: { values: { '': 'URL' } },
      });
    });

    it('should deserialize URL', () => {
      const url = new URL('https://example.com/path');
      const serialized = serialize(url);
      const deserialized = deserialize(serialized);
      expect(deserialized).toEqual(url);
    });
  });

  describe('Error', () => {
    it('should serialize Error', () => {
      const error = new Error('test error');
      error.name = 'TestError';
      const result = serialize(error);
      expect(result.meta?.values?.['']).toBe('Error');
      expect((result.json as { message: string }).message).toBe('test error');
    });

    it('should deserialize Error', () => {
      const error = new Error('test error');
      error.name = 'TestError';
      const serialized = serialize(error);
      const deserialized = deserialize(serialized) as Error;
      expect(deserialized).toBeInstanceOf(Error);
      expect(deserialized.message).toBe('test error');
      expect(deserialized.name).toBe('TestError');
    });
  });

  describe('objects and arrays', () => {
    it('should handle plain objects', () => {
      const obj = { a: 1, b: 'two', c: true };
      const result = serialize(obj);
      expect(result).toEqual({ json: obj });
    });

    it('should handle arrays', () => {
      const arr = [1, 'two', true];
      const result = serialize(arr);
      expect(result).toEqual({ json: arr });
    });

    it('should handle nested structures', () => {
      const data = {
        user: 'alice',
        created: new Date('2024-01-01'),
        tags: new Set(['tag1', 'tag2']),
        metadata: {
          score: 123n,
          settings: new Map([['theme', 'dark']]),
        },
      };

      const serialized = serialize(data);
      const deserialized = deserialize(serialized);

      expect(deserialized).toEqual(data);
    });

    it('should handle arrays with special types', () => {
      const arr = [new Date('2024-01-01'), 123n, new Set([1, 2]), new Map([['key', 'value']])];

      const serialized = serialize(arr);
      const deserialized = deserialize(serialized);

      expect(deserialized).toEqual(arr);
    });
  });

  describe('custom types', () => {
    class Point {
      constructor(
        public x: number,
        public y: number,
      ) {}
    }

    const pointTransformer = {
      name: 'Point',
      isApplicable: (v: unknown): v is Point => v instanceof Point,
      serialize: (v: Point) => ({ x: v.x, y: v.y }),
      deserialize: (v: unknown) => {
        const { x, y } = v as { x: number; y: number };
        return new Point(x, y);
      },
    };

    it('should serialize custom type', () => {
      const point = new Point(10, 20);
      const result = serialize(point, [pointTransformer]);
      expect(result).toEqual({
        json: { x: 10, y: 20 },
        meta: { values: { '': 'Point' } },
      });
    });

    it('should deserialize custom type', () => {
      const point = new Point(10, 20);
      const serialized = serialize(point, [pointTransformer]);
      const deserialized = deserialize(serialized, [pointTransformer]);
      expect(deserialized).toBeInstanceOf(Point);
      expect(deserialized).toEqual(point);
    });

    it('should handle custom types in nested structures', () => {
      const data = {
        points: [new Point(1, 2), new Point(3, 4)],
        origin: new Point(0, 0),
      };

      const serialized = serialize(data, [pointTransformer]);
      const deserialized = deserialize(serialized, [pointTransformer]);

      expect(deserialized).toEqual(data);
    });
  });

  describe('round-trip', () => {
    it('should maintain data integrity through serialization', () => {
      const data = {
        string: 'hello',
        number: 123,
        boolean: true,
        null: null,
        undefined: undefined,
        date: new Date('2024-01-01'),
        bigint: 999n,
        map: new Map([['key', 'value']]),
        set: new Set([1, 2, 3]),
        regex: /test/gi,
        url: new URL('https://example.com'),
        nan: Number.NaN,
        infinity: Number.POSITIVE_INFINITY,
        negInfinity: Number.NEGATIVE_INFINITY,
        nested: {
          array: [1, new Date('2024-01-01'), new Set([1, 2])],
        },
      };

      const serialized = serialize(data);
      const deserialized = deserialize(serialized);

      expect(deserialized).toEqual(data);
    });
  });
});
