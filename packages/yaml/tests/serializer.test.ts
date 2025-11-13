import { describe, it, expect } from 'vitest';
import { stringifyYAML } from '../src/serializer.js';

describe('YAML Serializer', () => {
  describe('Scalars', () => {
    it('should stringify strings', () => {
      expect(stringifyYAML('hello')).toBe('hello');
    });

    it('should stringify numbers', () => {
      expect(stringifyYAML(42)).toBe('42');
      expect(stringifyYAML(-42)).toBe('-42');
      expect(stringifyYAML(3.14)).toBe('3.14');
    });

    it('should stringify booleans', () => {
      expect(stringifyYAML(true)).toBe('true');
      expect(stringifyYAML(false)).toBe('false');
    });

    it('should stringify null', () => {
      expect(stringifyYAML(null)).toBe('null');
      expect(stringifyYAML(undefined)).toBe('null');
    });

    it('should stringify dates', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      expect(stringifyYAML(date)).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('String Quoting', () => {
    it('should use minimal quoting by default', () => {
      expect(stringifyYAML('hello')).toBe('hello');
      expect(stringifyYAML('hello: world')).toBe('"hello: world"');
      expect(stringifyYAML('true')).toBe('"true"');
      expect(stringifyYAML('42')).toBe('"42"');
    });

    it('should always quote when requested', () => {
      expect(stringifyYAML('hello', { quoteStrings: 'always' })).toBe('"hello"');
      expect(stringifyYAML('world', { quoteStrings: 'always' })).toBe('"world"');
    });

    it('should never quote when requested', () => {
      expect(stringifyYAML('hello: world', { quoteStrings: 'never' })).toBe('hello: world');
      expect(stringifyYAML('true', { quoteStrings: 'never' })).toBe('true');
    });

    it('should quote strings with special characters', () => {
      expect(stringifyYAML('hello: world')).toContain('"');
      expect(stringifyYAML('hello [world]')).toContain('"');
      expect(stringifyYAML('hello {world}')).toContain('"');
    });

    it('should quote empty strings', () => {
      expect(stringifyYAML('')).toBe('""');
    });

    it('should quote strings with leading/trailing whitespace', () => {
      expect(stringifyYAML(' hello')).toContain('"');
      expect(stringifyYAML('hello ')).toContain('"');
    });

    it('should escape special characters in quoted strings', () => {
      expect(stringifyYAML('hello\nworld')).toBe('"hello\\nworld"');
      expect(stringifyYAML('hello\tworld')).toBe('"hello\\tworld"');
      expect(stringifyYAML('hello"world')).toBe('"hello\\"world"');
    });
  });

  describe('Objects', () => {
    it('should stringify simple object', () => {
      const obj = { name: 'alice', age: 30 };
      const yaml = stringifyYAML(obj);
      expect(yaml).toContain('name: alice');
      expect(yaml).toContain('age: 30');
    });

    it('should stringify nested object', () => {
      const obj = {
        user: {
          name: 'alice',
          age: 30,
        },
      };
      const yaml = stringifyYAML(obj);
      expect(yaml).toContain('user:');
      expect(yaml).toContain('  name: alice');
      expect(yaml).toContain('  age: 30');
    });

    it('should stringify empty object', () => {
      expect(stringifyYAML({})).toBe('{}');
      expect(stringifyYAML({ data: {} })).toContain('data: {}');
    });

    it('should stringify object with null values', () => {
      const obj = { name: 'alice', middle: null, last: 'smith' };
      const yaml = stringifyYAML(obj);
      expect(yaml).toContain('name: alice');
      expect(yaml).toContain('middle: null');
      expect(yaml).toContain('last: smith');
    });

    it('should respect indent option', () => {
      const obj = { user: { name: 'alice' } };
      const yaml = stringifyYAML(obj, { indent: 4 });
      expect(yaml).toContain('user:');
      expect(yaml).toContain('    name: alice');
    });
  });

  describe('Arrays', () => {
    it('should stringify simple array', () => {
      const arr = ['apple', 'banana', 'cherry'];
      const yaml = stringifyYAML(arr);
      expect(yaml).toContain('- apple');
      expect(yaml).toContain('- banana');
      expect(yaml).toContain('- cherry');
    });

    it('should stringify array of numbers', () => {
      const arr = [1, 2, 3];
      const yaml = stringifyYAML(arr);
      expect(yaml).toContain('- 1');
      expect(yaml).toContain('- 2');
      expect(yaml).toContain('- 3');
    });

    it('should stringify array of objects', () => {
      const arr = [
        { name: 'alice', age: 30 },
        { name: 'bob', age: 25 },
      ];
      const yaml = stringifyYAML(arr);
      expect(yaml).toContain('-');
      expect(yaml).toContain('name: alice');
      expect(yaml).toContain('age: 30');
      expect(yaml).toContain('name: bob');
      expect(yaml).toContain('age: 25');
    });

    it('should stringify nested arrays', () => {
      const arr = [
        [1, 2],
        [3, 4],
      ];
      const yaml = stringifyYAML(arr);
      expect(yaml).toContain('-');
      expect(yaml).toContain('- 1');
      expect(yaml).toContain('- 2');
      expect(yaml).toContain('- 3');
      expect(yaml).toContain('- 4');
    });

    it('should stringify empty array', () => {
      expect(stringifyYAML([])).toBe('[]');
      expect(stringifyYAML({ tags: [] })).toContain('tags: []');
    });

    it('should stringify object with array', () => {
      const obj = {
        name: 'alice',
        tags: ['developer', 'typescript'],
      };
      const yaml = stringifyYAML(obj);
      expect(yaml).toContain('name: alice');
      expect(yaml).toContain('tags:');
      expect(yaml).toContain('  - developer');
      expect(yaml).toContain('  - typescript');
    });
  });

  describe('Complex Structures', () => {
    it('should stringify complex nested structure', () => {
      const obj = {
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
      };
      const yaml = stringifyYAML(obj);
      expect(yaml).toContain('users:');
      expect(yaml).toContain('- developer');
      expect(yaml).toContain('settings:');
      expect(yaml).toContain('theme: dark');
      expect(yaml).toContain('notifications:');
      expect(yaml).toContain('email: true');
      expect(yaml).toContain('push: false');
    });
  });

  describe('Real-world Examples', () => {
    it('should stringify package.json-like structure', () => {
      const obj = {
        name: 'my-package',
        version: '1.0.0',
        dependencies: ['express', 'typescript'],
        scripts: {
          build: 'tsc',
          test: 'vitest',
        },
      };
      const yaml = stringifyYAML(obj);
      expect(yaml).toContain('name: my-package');
      expect(yaml).toContain('version: 1.0.0');
      expect(yaml).toContain('dependencies:');
      expect(yaml).toContain('- express');
      expect(yaml).toContain('- typescript');
      expect(yaml).toContain('scripts:');
      expect(yaml).toContain('build: tsc');
      expect(yaml).toContain('test: vitest');
    });

    it('should stringify configuration file', () => {
      const obj = {
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
      };
      const yaml = stringifyYAML(obj);
      expect(yaml).toContain('server:');
      expect(yaml).toContain('host: localhost');
      expect(yaml).toContain('port: 3000');
      expect(yaml).toContain('ssl: false');
      expect(yaml).toContain('database:');
      expect(yaml).toContain('pool:');
      expect(yaml).toContain('min: 2');
      expect(yaml).toContain('max: 10');
    });
  });

  describe('Edge Cases', () => {
    it('should handle deeply nested structures', () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              level4: 'deep',
            },
          },
        },
      };
      const yaml = stringifyYAML(obj);
      expect(yaml).toContain('level1:');
      expect(yaml).toContain('level2:');
      expect(yaml).toContain('level3:');
      expect(yaml).toContain('level4: deep');
    });

    it('should handle mixed types in array', () => {
      const arr = [1, 'two', true, null, { key: 'value' }];
      const yaml = stringifyYAML(arr);
      expect(yaml).toContain('- 1');
      expect(yaml).toContain('- two');
      expect(yaml).toContain('- true');
      expect(yaml).toContain('- null');
      expect(yaml).toContain('key: value');
    });

    it('should handle objects with numeric keys', () => {
      const obj = { 0: 'zero', 1: 'one', 2: 'two' };
      const yaml = stringifyYAML(obj);
      expect(yaml).toContain('0: zero');
      expect(yaml).toContain('1: one');
      expect(yaml).toContain('2: two');
    });
  });
});
