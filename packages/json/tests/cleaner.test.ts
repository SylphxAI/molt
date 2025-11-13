import { describe, expect, it } from 'vitest';
import { cleanDirtyJSON } from '../src/cleaner.js';

describe('cleanDirtyJSON', () => {
  describe('valid JSON', () => {
    it('should handle valid JSON unchanged', () => {
      const input = '{"key": "value", "number": 123}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ key: 'value', number: 123 });
    });

    it('should handle nested objects', () => {
      const input = '{"a": {"b": {"c": 123}}}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ a: { b: { c: 123 } } });
    });

    it('should handle arrays', () => {
      const input = '[1, 2, 3, "four"]';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual([1, 2, 3, 'four']);
    });
  });

  describe('unquoted keys', () => {
    it('should quote unquoted object keys', () => {
      const input = '{user: "alice", age: 30}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ user: 'alice', age: 30 });
    });

    it('should handle mixed quoted and unquoted keys', () => {
      const input = '{user: "alice", "age": 30, city: "NYC"}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ user: 'alice', age: 30, city: 'NYC' });
    });

    it('should handle keys with underscores and dollar signs', () => {
      const input = '{_private: 1, $dollar: 2, regular: 3}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ _private: 1, $dollar: 2, regular: 3 });
    });
  });

  describe('single quotes', () => {
    it('should convert single quotes to double quotes', () => {
      const input = "{'key': 'value'}";
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ key: 'value' });
    });

    it('should handle nested single quotes', () => {
      const input = "{'a': {'b': 'c'}}";
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ a: { b: 'c' } });
    });

    it('should escape double quotes in single-quoted strings', () => {
      const input = `{'key': 'value with "quotes"'}`;
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ key: 'value with "quotes"' });
    });

    it('should handle escaped single quotes', () => {
      const input = "{'key': 'it\\'s working'}";
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ key: "it's working" });
    });
  });

  describe('trailing commas', () => {
    it('should remove trailing comma in objects', () => {
      const input = '{"a": 1, "b": 2,}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ a: 1, b: 2 });
    });

    it('should remove trailing comma in arrays', () => {
      const input = '[1, 2, 3,]';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual([1, 2, 3]);
    });

    it('should handle multiple trailing commas', () => {
      const input = '{"a": [1, 2,], "b": {"c": 3,}}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ a: [1, 2], b: { c: 3 } });
    });
  });

  describe('comments', () => {
    it('should remove single-line comments', () => {
      const input = `{
        // This is a comment
        "key": "value"
      }`;
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ key: 'value' });
    });

    it('should remove multi-line comments', () => {
      const input = `{
        /* This is a
           multi-line comment */
        "key": "value"
      }`;
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ key: 'value' });
    });

    it('should handle comments between properties', () => {
      const input = `{
        "a": 1, // comment
        /* another comment */
        "b": 2
      }`;
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ a: 1, b: 2 });
    });
  });

  describe('numbers', () => {
    it('should handle leading decimal point', () => {
      const input = '{a: .5, b: .123}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ a: 0.5, b: 0.123 });
    });

    it('should handle hex numbers', () => {
      const input = '{a: 0xFF, b: 0x10}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ a: 255, b: 16 });
    });

    it('should handle positive sign', () => {
      const input = '{a: +123, b: +45.67}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ a: 123, b: 45.67 });
    });

    it('should handle scientific notation', () => {
      const input = '{a: 1e5, b: 1.23e-4}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ a: 1e5, b: 1.23e-4 });
    });
  });

  describe('special values', () => {
    it('should convert undefined to null', () => {
      const input = '{a: undefined}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ a: null });
    });

    it('should handle null', () => {
      const input = '{a: null}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ a: null });
    });

    it('should handle boolean values', () => {
      const input = '{a: true, b: false}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ a: true, b: false });
    });
  });

  describe('complex cases', () => {
    it('should handle all features combined', () => {
      const input = `{
        // User object
        user: 'alice',
        age: 30,
        'email': "alice@example.com",
        active: true,
        /* Settings */
        settings: {
          theme: 'dark',
          notifications: true,
        },
        scores: [10, 20, 30,],
        metadata: undefined,
      }`;
      const result = cleanDirtyJSON(input);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual({
        user: 'alice',
        age: 30,
        email: 'alice@example.com',
        active: true,
        settings: {
          theme: 'dark',
          notifications: true,
        },
        scores: [10, 20, 30],
        metadata: null,
      });
    });

    it('should handle deeply nested structures', () => {
      const input = `{
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deep',
              }
            }
          }
        }
      }`;
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'deep',
              },
            },
          },
        },
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const input = '{}';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({});
    });

    it('should handle empty array', () => {
      const input = '[]';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual([]);
    });

    it('should handle whitespace', () => {
      const input = '  {  "key"  :  "value"  }  ';
      const result = cleanDirtyJSON(input);
      expect(JSON.parse(result)).toEqual({ key: 'value' });
    });

    it('should throw on input too large', () => {
      const largeInput = 'a'.repeat(200 * 1024 * 1024);
      expect(() => cleanDirtyJSON(largeInput)).toThrow('Input too large');
    });
  });
});
