import { describe, it, expect } from 'vitest';
import { stringifyTOML } from '../src/serializer.js';

describe('TOML Serializer', () => {
  describe('Scalars', () => {
    it('should stringify strings', () => {
      expect(stringifyTOML({ key: 'value' })).toContain('key = "value"');
    });

    it('should stringify numbers', () => {
      expect(stringifyTOML({ number: 42 })).toContain('number = 42');
      expect(stringifyTOML({ float: 3.14 })).toContain('float = 3.14');
    });

    it('should stringify booleans', () => {
      expect(stringifyTOML({ enabled: true })).toContain('enabled = true');
      expect(stringifyTOML({ disabled: false })).toContain('disabled = false');
    });

    it('should stringify dates', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const toml = stringifyTOML({ date });
      expect(toml).toContain('date = 2024-01-15T10:30:00.000Z');
    });
  });

  describe('Arrays', () => {
    it('should stringify simple arrays', () => {
      const toml = stringifyTOML({ numbers: [1, 2, 3] });
      expect(toml).toContain('numbers = [1, 2, 3]');
    });

    it('should stringify string arrays', () => {
      const toml = stringifyTOML({ strings: ['a', 'b', 'c'] });
      expect(toml).toContain('strings = ["a", "b", "c"]');
    });

    it('should stringify empty arrays', () => {
      const toml = stringifyTOML({ empty: [] });
      expect(toml).toContain('empty = []');
    });
  });

  describe('Tables', () => {
    it('should stringify simple tables', () => {
      const obj = {
        server: {
          host: 'localhost',
          port: 8080,
        },
      };
      const toml = stringifyTOML(obj);
      expect(toml).toContain('[server]');
      expect(toml).toContain('host = "localhost"');
      expect(toml).toContain('port = 8080');
    });

    it('should stringify nested tables', () => {
      const obj = {
        database: {
          connection: {
            server: '192.168.1.1',
            port: 5432,
          },
        },
      };
      const toml = stringifyTOML(obj);
      expect(toml).toContain('[database.connection]');
      expect(toml).toContain('server = "192.168.1.1"');
      expect(toml).toContain('port = 5432');
    });

    it('should separate root keys from tables', () => {
      const obj = {
        title: 'My App',
        server: {
          host: 'localhost',
        },
      };
      const toml = stringifyTOML(obj);
      const lines = toml.split('\n');
      const titleIndex = lines.findIndex((l) => l.includes('title'));
      const serverIndex = lines.findIndex((l) => l.includes('[server]'));
      expect(titleIndex).toBeLessThan(serverIndex);
    });
  });

  describe('Inline Tables', () => {
    it('should use inline tables for small objects', () => {
      const obj = {
        point: { x: 1, y: 2 },
      };
      const toml = stringifyTOML(obj, { maxInlineKeys: 2 });
      expect(toml).toContain('point = { x = 1, y = 2 }');
    });

    it('should use regular tables for large objects', () => {
      const obj = {
        config: { a: 1, b: 2, c: 3, d: 4 },
      };
      const toml = stringifyTOML(obj);
      expect(toml).toContain('[config]');
    });

    it('should respect maxInlineKeys option', () => {
      const obj = {
        point: { x: 1, y: 2, z: 3 },
      };
      const toml = stringifyTOML(obj, { maxInlineKeys: 5 });
      expect(toml).toContain('{ x = 1, y = 2, z = 3 }');
    });

    it('should disable inline tables when requested', () => {
      const obj = {
        point: { x: 1, y: 2 },
      };
      const toml = stringifyTOML(obj, { inlineTables: false });
      expect(toml).toContain('[point]');
      expect(toml).not.toContain('{ x = 1');
    });
  });

  describe('Array of Tables', () => {
    it('should stringify array of tables', () => {
      const obj = {
        products: [
          { name: 'Hammer', sku: 738594937 },
          { name: 'Nail', sku: 284758393 },
        ],
      };
      const toml = stringifyTOML(obj);
      expect(toml).toContain('[[products]]');
      expect(toml).toContain('name = "Hammer"');
      expect(toml).toContain('name = "Nail"');
    });
  });

  describe('String Escaping', () => {
    it('should use multiline strings for newlines', () => {
      const obj = { text: 'Line 1\nLine 2' };
      const toml = stringifyTOML(obj);
      // Should use multiline string format
      expect(toml).toContain('"""');
      expect(toml).toContain('Line 1');
      expect(toml).toContain('Line 2');
    });

    it('should escape quotes', () => {
      const obj = { text: 'He said "Hello"' };
      const toml = stringifyTOML(obj);
      expect(toml).toContain('\\"');
    });

    it('should escape backslashes', () => {
      const obj = { path: 'C:\\Users\\file.txt' };
      const toml = stringifyTOML(obj);
      expect(toml).toContain('\\\\');
    });
  });

  describe('Key Formatting', () => {
    it('should quote keys with special characters', () => {
      const obj = { 'my-key': 'value' };
      const toml = stringifyTOML(obj);
      // Hyphens are allowed, should not be quoted
      expect(toml).toContain('my-key = "value"');
    });

    it('should quote all keys when requested', () => {
      const obj = { key: 'value' };
      const toml = stringifyTOML(obj, { quoteKeys: true });
      expect(toml).toContain('"key" = "value"');
    });
  });

  describe('Complex Structures', () => {
    it('should stringify complex object', () => {
      const obj = {
        title: 'TOML Example',
        owner: {
          name: 'Alice',
          age: 30,
        },
        database: {
          server: '192.168.1.1',
          ports: [8000, 8001, 8002],
          enabled: true,
        },
      };
      const toml = stringifyTOML(obj);
      expect(toml).toContain('title = "TOML Example"');
      expect(toml).toContain('[owner]');
      expect(toml).toContain('name = "Alice"');
      expect(toml).toContain('[database]');
      expect(toml).toContain('ports = [8000, 8001, 8002]');
    });
  });

  describe('Edge Cases', () => {
    it('should throw on non-object root', () => {
      expect(() => stringifyTOML('string')).toThrow(/root must be an object/);
      expect(() => stringifyTOML(42)).toThrow(/root must be an object/);
      expect(() => stringifyTOML([1, 2, 3])).toThrow(/root must be an object/);
    });

    it('should handle empty object', () => {
      const toml = stringifyTOML({});
      expect(toml).toBe('');
    });

    it('should handle null values', () => {
      const obj = { key: null };
      const toml = stringifyTOML(obj);
      expect(toml).toContain('key = ""');
    });
  });

  describe('Real-world Examples', () => {
    it('should stringify Cargo.toml-like structure', () => {
      const obj = {
        package: {
          name: 'my-app',
          version: '0.1.0',
          edition: '2021',
        },
        dependencies: {
          serde: '1.0',
        },
      };
      const toml = stringifyTOML(obj);
      expect(toml).toContain('[package]');
      expect(toml).toContain('name = "my-app"');
      expect(toml).toContain('[dependencies]');
      expect(toml).toContain('serde = "1.0"');
    });

    it('should stringify config file', () => {
      const obj = {
        app_name: 'MyApp',
        server: {
          host: '0.0.0.0',
          port: 3000,
        },
        database: {
          url: 'postgres://localhost/mydb',
          pool_size: 10,
        },
      };
      const toml = stringifyTOML(obj);
      expect(toml).toContain('app_name = "MyApp"');
      expect(toml).toContain('[server]');
      expect(toml).toContain('host = "0.0.0.0"');
      expect(toml).toContain('[database]');
      expect(toml).toContain('pool_size = 10');
    });
  });
});
