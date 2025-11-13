import { describe, it, expect } from 'vitest';
import { parseYAML } from '../src/parser.js';

describe('YAML Parser', () => {
  describe('Scalars', () => {
    it('should parse strings', () => {
      expect(parseYAML('hello')).toBe('hello');
      expect(parseYAML('"hello"')).toBe('hello');
      expect(parseYAML("'hello'")).toBe('hello');
    });

    it('should parse numbers', () => {
      expect(parseYAML('42')).toBe(42);
      expect(parseYAML('-42')).toBe(-42);
      expect(parseYAML('3.14')).toBe(3.14);
      expect(parseYAML('-3.14')).toBe(-3.14);
    });

    it('should parse booleans', () => {
      expect(parseYAML('true')).toBe(true);
      expect(parseYAML('false')).toBe(false);
      expect(parseYAML('yes')).toBe(true);
      expect(parseYAML('no')).toBe(false);
      expect(parseYAML('on')).toBe(true);
      expect(parseYAML('off')).toBe(false);
    });

    it('should parse null', () => {
      expect(parseYAML('null')).toBe(null);
      expect(parseYAML('~')).toBe(null);
      expect(parseYAML('')).toBe(null);
    });

    it('should parse dates', () => {
      const result = parseYAML('2024-01-15T10:30:00.000Z');
      expect(result).toBeInstanceOf(Date);
      expect((result as Date).toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should not parse dates when disabled', () => {
      const result = parseYAML('2024-01-15T10:30:00.000Z', { parseDates: false });
      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('Objects', () => {
    it('should parse simple object', () => {
      const yaml = `
name: alice
age: 30
`;
      expect(parseYAML(yaml)).toEqual({
        name: 'alice',
        age: 30,
      });
    });

    it('should parse nested object', () => {
      const yaml = `
user:
  name: alice
  age: 30
`;
      expect(parseYAML(yaml)).toEqual({
        user: {
          name: 'alice',
          age: 30,
        },
      });
    });

    it('should parse object with null values', () => {
      const yaml = `
name: alice
middle:
last: smith
`;
      expect(parseYAML(yaml)).toEqual({
        name: 'alice',
        middle: null,
        last: 'smith',
      });
    });

    it('should parse empty object', () => {
      const yaml = 'data: {}';
      expect(parseYAML(yaml)).toEqual({ data: {} });
    });
  });

  describe('Arrays', () => {
    it('should parse simple array', () => {
      const yaml = `
- apple
- banana
- cherry
`;
      expect(parseYAML(yaml)).toEqual(['apple', 'banana', 'cherry']);
    });

    it('should parse array of numbers', () => {
      const yaml = `
- 1
- 2
- 3
`;
      expect(parseYAML(yaml)).toEqual([1, 2, 3]);
    });

    it('should parse array of objects', () => {
      const yaml = `
- name: alice
  age: 30
- name: bob
  age: 25
`;
      expect(parseYAML(yaml)).toEqual([
        { name: 'alice', age: 30 },
        { name: 'bob', age: 25 },
      ]);
    });

    it('should parse nested arrays', () => {
      const yaml = `
- - 1
  - 2
- - 3
  - 4
`;
      expect(parseYAML(yaml)).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });

    it('should parse object with array', () => {
      const yaml = `
name: alice
tags:
  - developer
  - typescript
`;
      expect(parseYAML(yaml)).toEqual({
        name: 'alice',
        tags: ['developer', 'typescript'],
      });
    });

    it('should parse empty array', () => {
      const yaml = 'tags: []';
      expect(parseYAML(yaml)).toEqual({ tags: [] });
    });
  });

  describe('Comments', () => {
    it('should ignore comments', () => {
      const yaml = `
# This is a comment
name: alice
# Another comment
age: 30
`;
      expect(parseYAML(yaml)).toEqual({
        name: 'alice',
        age: 30,
      });
    });

    it('should handle inline comments (treated as part of value)', () => {
      const yaml = `
name: alice # developer
`;
      expect(parseYAML(yaml)).toEqual({
        name: 'alice # developer',
      });
    });
  });

  describe('Complex Structures', () => {
    it('should parse complex nested structure', () => {
      const yaml = `
users:
  - name: alice
    age: 30
    roles:
      - admin
      - developer
  - name: bob
    age: 25
    roles:
      - user
settings:
  theme: dark
  notifications:
    email: true
    push: false
`;
      expect(parseYAML(yaml)).toEqual({
        users: [
          {
            name: 'alice',
            age: 30,
            roles: ['admin', 'developer'],
          },
          {
            name: 'bob',
            age: 25,
            roles: ['user'],
          },
        ],
        settings: {
          theme: 'dark',
          notifications: {
            email: true,
            push: false,
          },
        },
      });
    });
  });

  describe('Whitespace', () => {
    it('should handle various indentation levels', () => {
      const yaml = `
level1:
  level2:
    level3: deep
`;
      expect(parseYAML(yaml)).toEqual({
        level1: {
          level2: {
            level3: 'deep',
          },
        },
      });
    });

    it('should handle mixed tabs and spaces', () => {
      const yaml = `
name: alice
\tage: 30
`;
      expect(parseYAML(yaml)).toEqual({
        name: 'alice',
        age: 30,
      });
    });

    it('should handle empty lines', () => {
      const yaml = `
name: alice

age: 30

`;
      expect(parseYAML(yaml)).toEqual({
        name: 'alice',
        age: 30,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle quoted strings with special characters', () => {
      const yaml = `
text: "hello: world"
`;
      expect(parseYAML(yaml)).toEqual({
        text: 'hello: world',
      });
    });

    it('should handle single-quoted strings', () => {
      const yaml = `
text: 'hello world'
`;
      expect(parseYAML(yaml)).toEqual({
        text: 'hello world',
      });
    });

    it('should throw on oversized input', () => {
      const largeYaml = 'x: ' + 'a'.repeat(200 * 1024 * 1024);
      expect(() => parseYAML(largeYaml)).toThrow(/exceeds maximum/);
    });

    it('should respect maxSize option', () => {
      const yaml = 'name: alice';
      expect(() => parseYAML(yaml, { maxSize: 5 })).toThrow(/exceeds maximum/);
    });
  });

  describe('Real-world Examples', () => {
    it('should parse package.json-like structure', () => {
      const yaml = `
name: my-package
version: 1.0.0
dependencies:
  - express
  - typescript
scripts:
  build: tsc
  test: vitest
`;
      expect(parseYAML(yaml)).toEqual({
        name: 'my-package',
        version: '1.0.0',
        dependencies: ['express', 'typescript'],
        scripts: {
          build: 'tsc',
          test: 'vitest',
        },
      });
    });

    it('should parse configuration file', () => {
      const yaml = `
server:
  host: localhost
  port: 3000
  ssl: false
database:
  url: postgres://localhost/mydb
  pool:
    min: 2
    max: 10
`;
      expect(parseYAML(yaml)).toEqual({
        server: {
          host: 'localhost',
          port: 3000,
          ssl: false,
        },
        database: {
          url: 'postgres://localhost/mydb',
          pool: {
            min: 2,
            max: 10,
          },
        },
      });
    });
  });
});
