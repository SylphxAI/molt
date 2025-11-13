import { describe, expect, it } from 'vitest';
import { HyperJSON } from '../src/index.js';

describe('HyperJSON', () => {
  describe('parse', () => {
    it('should parse valid JSON', () => {
      const json = '{"key": "value", "number": 123}';
      const result = HyperJSON.parse(json);
      expect(result).toEqual({ key: 'value', number: 123 });
    });

    it('should parse dirty JSON by default', () => {
      const dirty = "{user: 'alice', age: 30}";
      const result = HyperJSON.parse(dirty);
      expect(result).toEqual({ user: 'alice', age: 30 });
    });

    it('should handle typed JSON', () => {
      const data = {
        date: new Date('2024-01-01'),
        bigint: 123n,
        set: new Set([1, 2, 3]),
      };
      const json = HyperJSON.stringify(data);
      const parsed = HyperJSON.parse(json);
      expect(parsed).toEqual(data);
    });

    it('should disable dirty cleaning when cleanDirty=false', () => {
      const dirty = "{user: 'alice'}";
      expect(() => HyperJSON.parse(dirty, { cleanDirty: false })).toThrow();
    });

    it('should disable type parsing when parseTypes=false', () => {
      const data = { date: new Date('2024-01-01') };
      const json = HyperJSON.stringify(data);
      const parsed = HyperJSON.parse(json, { parseTypes: false });
      expect(parsed).toHaveProperty('json');
      expect(parsed).toHaveProperty('meta');
    });
  });

  describe('stringify', () => {
    it('should stringify plain objects', () => {
      const obj = { key: 'value', number: 123 };
      const result = HyperJSON.stringify(obj);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual(obj);
    });

    it('should preserve types by default', () => {
      const data = {
        date: new Date('2024-01-01'),
        bigint: 123n,
      };
      const json = HyperJSON.stringify(data);
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('json');
      expect(parsed).toHaveProperty('meta');
    });

    it('should disable type preservation when includeTypes=false', () => {
      const data = { date: new Date('2024-01-01') };
      const json = HyperJSON.stringify(data, { includeTypes: false });
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('date');
      expect(typeof parsed.date).toBe('string');
    });

    it('should support space parameter', () => {
      const obj = { a: 1, b: 2 };
      const json = HyperJSON.stringify(obj, { space: 2 });
      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });
  });

  describe('serialize/deserialize', () => {
    it('should serialize to TypedJSON', () => {
      const data = { date: new Date('2024-01-01') };
      const result = HyperJSON.serialize(data);
      expect(result).toHaveProperty('json');
      expect(result).toHaveProperty('meta');
    });

    it('should deserialize TypedJSON', () => {
      const data = { date: new Date('2024-01-01') };
      const serialized = HyperJSON.serialize(data);
      const deserialized = HyperJSON.deserialize(serialized);
      expect(deserialized).toEqual(data);
    });
  });

  describe('clean', () => {
    it('should clean dirty JSON', () => {
      const dirty = "{user: 'alice', age: 30}";
      const clean = HyperJSON.clean(dirty);
      expect(JSON.parse(clean)).toEqual({ user: 'alice', age: 30 });
    });

    it('should handle comments', () => {
      const dirty = `{
        // comment
        "key": "value"
      }`;
      const clean = HyperJSON.clean(dirty);
      expect(JSON.parse(clean)).toEqual({ key: 'value' });
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

    it('should handle custom types in parse/stringify', () => {
      const point = new Point(10, 20);
      const json = HyperJSON.stringify(point, { customTypes: [pointTransformer] });
      const parsed = HyperJSON.parse(json, { customTypes: [pointTransformer] });
      expect(parsed).toBeInstanceOf(Point);
      expect(parsed).toEqual(point);
    });

    it('should handle custom types in serialize/deserialize', () => {
      const point = new Point(10, 20);
      const serialized = HyperJSON.serialize(point, [pointTransformer]);
      const deserialized = HyperJSON.deserialize(serialized, [pointTransformer]);
      expect(deserialized).toBeInstanceOf(Point);
      expect(deserialized).toEqual(point);
    });
  });

  describe('integration tests', () => {
    it('should handle dirty JSON with types', () => {
      const dirty = `{
        user: 'alice',
        age: 30,
        active: true,
      }`;

      // Clean the dirty JSON
      const cleaned = HyperJSON.clean(dirty);
      const parsed = JSON.parse(cleaned);
      expect(parsed).toHaveProperty('user', 'alice');
      expect(parsed).toHaveProperty('age', 30);
      expect(parsed).toHaveProperty('active', true);
    });

    it('should round-trip complex data', () => {
      const data = {
        user: 'alice',
        created: new Date('2024-01-01'),
        tags: new Set(['tag1', 'tag2']),
        metadata: {
          score: 123n,
          settings: new Map([
            ['theme', 'dark'],
            ['lang', 'en'],
          ]),
        },
        stats: [1, 2, 3],
        active: true,
        description: undefined,
        pattern: /test/gi,
        website: new URL('https://example.com'),
      };

      const json = HyperJSON.stringify(data);
      const parsed = HyperJSON.parse(json);

      expect(parsed).toEqual(data);
    });

    it('should handle edge cases', () => {
      const data = {
        nan: Number.NaN,
        infinity: Number.POSITIVE_INFINITY,
        negInfinity: Number.NEGATIVE_INFINITY,
        empty: {},
        emptyArray: [],
        null: null,
        undefined: undefined,
      };

      const json = HyperJSON.stringify(data);
      const parsed = HyperJSON.parse(json);

      expect(parsed).toEqual(data);
    });
  });
});
