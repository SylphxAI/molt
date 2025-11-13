import { describe, it, expect } from 'vitest';
import { parseTOML } from '../src/parser.js';

describe('TOML Parser', () => {
  describe('Scalars', () => {
    it('should parse strings', () => {
      expect(parseTOML('key = "value"')).toEqual({ key: 'value' });
      expect(parseTOML("key = 'literal'")).toEqual({ key: 'literal' });
    });

    it('should parse integers', () => {
      expect(parseTOML('number = 42')).toEqual({ number: 42 });
      expect(parseTOML('negative = -42')).toEqual({ negative: -42 });
      expect(parseTOML('with_underscores = 1_000_000')).toEqual({ with_underscores: 1000000 });
    });

    it('should parse floats', () => {
      expect(parseTOML('pi = 3.14')).toEqual({ pi: 3.14 });
      expect(parseTOML('negative = -0.01')).toEqual({ negative: -0.01 });
    });

    it('should parse booleans', () => {
      expect(parseTOML('enabled = true')).toEqual({ enabled: true });
      expect(parseTOML('disabled = false')).toEqual({ disabled: false });
    });

    it('should parse dates', () => {
      const result = parseTOML('date = 1979-05-27T07:32:00Z') as any;
      expect(result.date).toBeInstanceOf(Date);
      expect(result.date.toISOString()).toBe('1979-05-27T07:32:00.000Z');
    });

    it('should not parse dates when disabled', () => {
      const result = parseTOML('date = 1979-05-27T07:32:00Z', { parseDates: false }) as any;
      expect(result.date).toBe('1979-05-27T07:32:00Z');
    });
  });

  describe('Arrays', () => {
    it('should parse arrays', () => {
      expect(parseTOML('numbers = [1, 2, 3]')).toEqual({ numbers: [1, 2, 3] });
      expect(parseTOML('strings = ["a", "b", "c"]')).toEqual({ strings: ['a', 'b', 'c'] });
    });

    it('should parse empty arrays', () => {
      expect(parseTOML('empty = []')).toEqual({ empty: [] });
    });

    it('should parse nested arrays', () => {
      expect(parseTOML('nested = [[1, 2], [3, 4]]')).toEqual({ nested: [[1, 2], [3, 4]] });
    });

    it('should parse mixed type arrays', () => {
      const toml = 'mixed = [1, "two", true]';
      expect(parseTOML(toml)).toEqual({ mixed: [1, 'two', true] });
    });
  });

  describe('Tables', () => {
    it('should parse simple table', () => {
      const toml = `
[server]
host = "localhost"
port = 8080
`;
      expect(parseTOML(toml)).toEqual({
        server: {
          host: 'localhost',
          port: 8080,
        },
      });
    });

    it('should parse nested tables', () => {
      const toml = `
[database.connection]
server = "192.168.1.1"
port = 5432
`;
      expect(parseTOML(toml)).toEqual({
        database: {
          connection: {
            server: '192.168.1.1',
            port: 5432,
          },
        },
      });
    });

    it('should parse multiple tables', () => {
      const toml = `
[server]
host = "localhost"

[database]
name = "mydb"
`;
      expect(parseTOML(toml)).toEqual({
        server: { host: 'localhost' },
        database: { name: 'mydb' },
      });
    });
  });

  describe('Inline Tables', () => {
    it('should parse inline tables', () => {
      const toml = 'point = { x = 1, y = 2 }';
      expect(parseTOML(toml)).toEqual({ point: { x: 1, y: 2 } });
    });

    it('should parse empty inline tables', () => {
      const toml = 'empty = {}';
      expect(parseTOML(toml)).toEqual({ empty: {} });
    });

    it('should parse nested inline tables', () => {
      const toml = 'nested = { a = { b = 1 } }';
      expect(parseTOML(toml)).toEqual({ nested: { a: { b: 1 } } });
    });
  });

  describe('Array of Tables', () => {
    it('should parse array of tables', () => {
      const toml = `
[[products]]
name = "Hammer"
sku = 738594937

[[products]]
name = "Nail"
sku = 284758393
`;
      expect(parseTOML(toml)).toEqual({
        products: [
          { name: 'Hammer', sku: 738594937 },
          { name: 'Nail', sku: 284758393 },
        ],
      });
    });

    it('should parse nested array of tables', () => {
      const toml = `
[[users]]
name = "Alice"

[[users.emails]]
address = "alice@example.com"

[[users]]
name = "Bob"
`;
      const result = parseTOML(toml) as any;
      expect(result.users).toHaveLength(2);
      expect(result.users[0].name).toBe('Alice');
      expect(result.users[0].emails).toEqual([{ address: 'alice@example.com' }]);
      expect(result.users[1].name).toBe('Bob');
    });
  });

  describe('Dotted Keys', () => {
    it('should parse dotted keys', () => {
      const toml = 'a.b.c = 1';
      expect(parseTOML(toml)).toEqual({
        a: {
          b: {
            c: 1,
          },
        },
      });
    });

    it('should parse mixed dotted and regular keys', () => {
      const toml = `
a.b = 1
a.c = 2
d = 3
`;
      expect(parseTOML(toml)).toEqual({
        a: {
          b: 1,
          c: 2,
        },
        d: 3,
      });
    });
  });

  describe('Comments', () => {
    it('should ignore comments', () => {
      const toml = `
# This is a comment
key = "value"
# Another comment
number = 42
`;
      expect(parseTOML(toml)).toEqual({
        key: 'value',
        number: 42,
      });
    });
  });

  describe('Multiline Strings', () => {
    it('should parse multiline basic strings', () => {
      const toml = `
text = """
Line 1
Line 2
Line 3"""
`;
      const result = parseTOML(toml) as any;
      expect(result.text).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should parse multiline literal strings', () => {
      const toml = `
path = '''
C:\\Users\\nodejs\\templates'''
`;
      const result = parseTOML(toml) as any;
      expect(result.path).toBe('C:\\Users\\nodejs\\templates');
    });
  });

  describe('String Escaping', () => {
    it('should handle escaped characters', () => {
      const toml = 'text = "Line 1\\nLine 2"';
      expect(parseTOML(toml)).toEqual({ text: 'Line 1\nLine 2' });
    });

    it('should handle escaped quotes', () => {
      const toml = 'text = "He said \\"Hello\\""';
      expect(parseTOML(toml)).toEqual({ text: 'He said "Hello"' });
    });

    it('should handle backslashes', () => {
      const toml = 'path = "C:\\\\Users\\\\file.txt"';
      expect(parseTOML(toml)).toEqual({ path: 'C:\\Users\\file.txt' });
    });
  });

  describe('Number Formats', () => {
    it('should parse hexadecimal', () => {
      const toml = 'hex = 0xDEADBEEF';
      expect(parseTOML(toml)).toEqual({ hex: 0xdeadbeef });
    });

    it('should parse octal', () => {
      const toml = 'octal = 0o755';
      expect(parseTOML(toml)).toEqual({ octal: 0o755 });
    });

    it('should parse binary', () => {
      const toml = 'binary = 0b11010110';
      expect(parseTOML(toml)).toEqual({ binary: 0b11010110 });
    });

    it('should parse scientific notation', () => {
      const toml = 'sci = 1e6';
      expect(parseTOML(toml)).toEqual({ sci: 1e6 });
    });
  });

  describe('Complex Structures', () => {
    it('should parse complex TOML document', () => {
      const toml = `
title = "TOML Example"

[owner]
name = "Alice"
age = 30

[database]
server = "192.168.1.1"
ports = [8000, 8001, 8002]
connection_max = 5000
enabled = true

[servers.alpha]
ip = "10.0.0.1"
dc = "eqdc10"

[servers.beta]
ip = "10.0.0.2"
dc = "eqdc10"
`;
      const result = parseTOML(toml) as any;
      expect(result.title).toBe('TOML Example');
      expect(result.owner.name).toBe('Alice');
      expect(result.owner.age).toBe(30);
      expect(result.database.server).toBe('192.168.1.1');
      expect(result.database.ports).toEqual([8000, 8001, 8002]);
      expect(result.servers.alpha.ip).toBe('10.0.0.1');
      expect(result.servers.beta.ip).toBe('10.0.0.2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty document', () => {
      expect(parseTOML('')).toEqual({});
      expect(parseTOML('# Just a comment')).toEqual({});
    });

    it('should throw on oversized input', () => {
      const largeTOML = 'key = "' + 'a'.repeat(200 * 1024 * 1024) + '"';
      expect(() => parseTOML(largeTOML)).toThrow(/exceeds maximum/);
    });

    it('should respect maxSize option', () => {
      const toml = 'key = "value"';
      expect(() => parseTOML(toml, { maxSize: 5 })).toThrow(/exceeds maximum/);
    });

    it('should handle Windows line endings', () => {
      const toml = 'key1 = "value1"\r\nkey2 = "value2"';
      expect(parseTOML(toml)).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });
  });

  describe('Real-world Examples', () => {
    it('should parse Cargo.toml-like structure', () => {
      const toml = `
[package]
name = "my-app"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = "1.0"
tokio = { version = "1.0", features = ["full"] }
`;
      const result = parseTOML(toml) as any;
      expect(result.package.name).toBe('my-app');
      expect(result.package.version).toBe('0.1.0');
      expect(result.dependencies.serde).toBe('1.0');
      expect(result.dependencies.tokio.version).toBe('1.0');
      expect(result.dependencies.tokio.features).toEqual(['full']);
    });
  });
});
