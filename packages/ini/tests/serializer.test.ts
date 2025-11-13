import { describe, it, expect } from 'vitest';
import { serializeINI, parseINI } from '../src/index.js';

describe('INI Serializer', () => {
  describe('Basic serialization', () => {
    it('should serialize simple object', () => {
      const data = {
        '': {
          key1: 'value1',
          key2: 'value2',
        },
      };
      const result = serializeINI(data);
      expect(result).toBe('key1 = value1\nkey2 = value2');
    });

    it('should serialize with sections', () => {
      const data = {
        section1: {
          key1: 'value1',
        },
        section2: {
          key2: 'value2',
        },
      };
      const result = serializeINI(data);
      expect(result).toBe('[section1]\nkey1 = value1\n\n[section2]\nkey2 = value2');
    });
  });

  describe('Type serialization', () => {
    it('should serialize numbers', () => {
      const data = {
        '': {
          port: 8080,
          pi: 3.14,
        },
      };
      const result = serializeINI(data);
      expect(result).toBe('port = 8080\npi = 3.14');
    });

    it('should serialize booleans', () => {
      const data = {
        '': {
          enabled: true,
          disabled: false,
        },
      };
      const result = serializeINI(data);
      expect(result).toBe('enabled = true\ndisabled = false');
    });

    it('should serialize null', () => {
      const data = {
        '': {
          empty: null,
        },
      };
      const result = serializeINI(data);
      expect(result).toBe('empty = null');
    });
  });

  describe('Formatting options', () => {
    it('should use custom whitespace', () => {
      const data = {
        '': { key: 'value' },
      };
      const result = serializeINI(data, { whitespace: '=' });
      expect(result).toBe('key=value');
    });

    it('should use custom line ending', () => {
      const data = {
        '': {
          key1: 'value1',
          key2: 'value2',
        },
      };
      const result = serializeINI(data, { lineEnding: '\r\n' });
      expect(result).toBe('key1 = value1\r\nkey2 = value2');
    });

    it('should sort sections', () => {
      const data = {
        zebra: { key: 'value' },
        alpha: { key: 'value' },
        beta: { key: 'value' },
      };
      const result = serializeINI(data, { sortSections: true });
      expect(result.indexOf('[alpha]')).toBeLessThan(result.indexOf('[beta]'));
      expect(result.indexOf('[beta]')).toBeLessThan(result.indexOf('[zebra]'));
    });

    it('should sort keys', () => {
      const data = {
        '': {
          z: '3',
          a: '1',
          m: '2',
        },
      };
      const result = serializeINI(data, { sortKeys: true });
      expect(result).toBe('a = 1\nm = 2\nz = 3');
    });

    it('should add header comment', () => {
      const data = {
        '': { key: 'value' },
      };
      const result = serializeINI(data, {
        headerComment: 'Configuration file\nGenerated automatically',
      });
      expect(result).toBe('; Configuration file\n; Generated automatically\n\nkey = value');
    });
  });

  describe('Quote handling', () => {
    it('should quote strings with special characters', () => {
      const data = {
        '': {
          path: 'C:\\Users\\Alice',
          message: 'Hello; World',
        },
      };
      const result = serializeINI(data);
      expect(result).toContain('"C:\\Users\\Alice"');
      expect(result).toContain('"Hello; World"');
    });

    it('should quote strings with leading/trailing spaces', () => {
      const data = {
        '': {
          padded: '  value  ',
        },
      };
      const result = serializeINI(data);
      expect(result).toBe('padded = "  value  "');
    });
  });

  describe('Round-trip', () => {
    it('should preserve data through parse-serialize cycle', () => {
      const original = {
        section1: {
          string: 'value',
          number: 42,
          bool: true,
        },
        section2: {
          pi: 3.14,
          enabled: false,
        },
      };
      const serialized = serializeINI(original);
      const parsed = parseINI(serialized);
      expect(parsed).toEqual(original);
    });
  });
});
