import { describe, it, expect } from 'vitest';
import { parseTOON, serializeTOON } from '../src/index.js';

describe('TOON Parser & Serializer', () => {
  describe('Simple key-value pairs', () => {
    it('should parse simple object', () => {
      const toon = `
app: MyApp
version: 1.0.0
debug: false
`;
      const result = parseTOON(toon);
      expect(result).toEqual({
        app: 'MyApp',
        version: '1.0.0',
        debug: false,
      });
    });

    it('should serialize simple object', () => {
      const obj = {
        app: 'MyApp',
        version: '1.0.0',
        debug: false,
      };
      const toon = serializeTOON(obj);
      expect(toon).toContain('app: MyApp');
      expect(toon).toContain('version: 1.0.0');
      expect(toon).toContain('debug: false');
    });
  });

  describe('Table format', () => {
    it('should parse table format', () => {
      const toon = `
users:
  id | name  | age | active
  1  | Alice | 30  | true
  2  | Bob   | 25  | false
`;
      const result = parseTOON(toon);
      expect(result).toEqual({
        users: [
          { id: 1, name: 'Alice', age: 30, active: true },
          { id: 2, name: 'Bob', age: 25, active: false },
        ],
      });
    });

    it('should serialize uniform array as table', () => {
      const obj = {
        users: [
          { id: 1, name: 'Alice', age: 30, active: true },
          { id: 2, name: 'Bob', age: 25, active: false },
        ],
      };
      const toon = serializeTOON(obj);
      expect(toon).toContain('users:');
      expect(toon).toContain('id');
      expect(toon).toContain('name');
      expect(toon).toContain('Alice');
      expect(toon).toContain('Bob');
    });
  });

  describe('Nested objects', () => {
    it('should parse nested object', () => {
      const toon = `
config:
  database:
    host: localhost
    port: 5432
  server:
    port: 8080
`;
      const result = parseTOON(toon);
      expect(result).toEqual({
        config: {
          database: {
            host: 'localhost',
            port: 5432,
          },
          server: {
            port: 8080,
          },
        },
      });
    });

    it('should serialize nested object', () => {
      const obj = {
        config: {
          database: {
            host: 'localhost',
            port: 5432,
          },
          server: {
            port: 8080,
          },
        },
      };
      const toon = serializeTOON(obj);
      expect(toon).toContain('config:');
      expect(toon).toContain('database:');
      expect(toon).toContain('host: localhost');
      expect(toon).toContain('port: 5432');
    });
  });

  describe('Type coercion', () => {
    it('should parse numbers', () => {
      const toon = `
integer: 42
float: 3.14
negative: -100
`;
      const result = parseTOON(toon);
      expect(result).toEqual({
        integer: 42,
        float: 3.14,
        negative: -100,
      });
    });

    it('should parse booleans', () => {
      const toon = `
bool_true: true
bool_false: false
bool_yes: yes
bool_no: no
`;
      const result = parseTOON(toon);
      expect(result).toEqual({
        bool_true: true,
        bool_false: false,
        bool_yes: true,
        bool_no: false,
      });
    });

    it('should parse null', () => {
      const toon = `
null_value: null
nil_value: nil
`;
      const result = parseTOON(toon);
      expect(result).toEqual({
        null_value: null,
        nil_value: null,
      });
    });
  });

  describe('Comments', () => {
    it('should ignore comment lines', () => {
      const toon = `
# This is a comment
app: MyApp
# Another comment
version: 1.0.0
`;
      const result = parseTOON(toon);
      expect(result).toEqual({
        app: 'MyApp',
        version: '1.0.0',
      });
    });
  });

  describe('Real-world examples', () => {
    it('should handle user data with table format', () => {
      const toon = `
users:
  id    | username     | email                | active
  12345 | alice_smith  | alice@example.com    | true
  67890 | bob_jones    | bob@example.com      | false

config:
  app: MyApp
  version: 1.0.0
  debug: false
`;
      const result = parseTOON(toon);
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('config');
      expect(Array.isArray((result as any).users)).toBe(true);
      expect((result as any).users.length).toBe(2);
    });

    it('should handle API response format', () => {
      const obj = {
        success: true,
        data: [
          { id: 1, name: 'Product 1', price: 29.99, stock: 100 },
          { id: 2, name: 'Product 2', price: 49.99, stock: 50 },
          { id: 3, name: 'Product 3', price: 19.99, stock: 200 },
        ],
        meta: {
          total: 3,
          page: 1,
          perPage: 10,
        },
      };

      const toon = serializeTOON(obj);
      const parsed = parseTOON(toon);

      expect(parsed).toHaveProperty('success');
      expect(parsed).toHaveProperty('data');
      expect(parsed).toHaveProperty('meta');
    });
  });

  describe('Token savings', () => {
    it('should use fewer tokens than JSON for table data', () => {
      const data = {
        users: [
          { id: 1, name: 'Alice', age: 30, active: true },
          { id: 2, name: 'Bob', age: 25, active: false },
          { id: 3, name: 'Charlie', age: 35, active: true },
        ],
      };

      const toon = serializeTOON(data);
      const json = JSON.stringify(data, null, 2);

      // TOON should be shorter for table data
      expect(toon.length).toBeLessThan(json.length);
    });

    it('should use minimal quotes', () => {
      const data = {
        app: 'MyApp',
        version: '1.0.0',
        count: 42,
        enabled: true,
      };

      const toon = serializeTOON(data);

      // Count quotes - TOON should have fewer
      const toonQuotes = (toon.match(/"/g) || []).length;
      const jsonQuotes = (JSON.stringify(data, null, 2).match(/"/g) || []).length;

      expect(toonQuotes).toBeLessThan(jsonQuotes);
    });
  });

  describe('Round-trip', () => {
    it('should preserve data through parse-serialize cycle', () => {
      const original = {
        app: 'MyApp',
        version: '1.0.0',
        config: {
          debug: false,
          port: 8080,
        },
        users: [
          { id: 1, name: 'Alice', active: true },
          { id: 2, name: 'Bob', active: false },
        ],
      };

      const toon = serializeTOON(original);
      const parsed = parseTOON(toon);

      expect(parsed).toEqual(original);
    });
  });
});
