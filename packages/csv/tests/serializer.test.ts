import { describe, it, expect } from 'vitest';
import { stringifyCSV } from '../src/serializer.js';

describe('CSV Serializer', () => {
  describe('Basic Serialization', () => {
    it('should stringify array of objects with header', () => {
      const data = [
        { name: 'Alice', age: 30, city: 'NYC' },
        { name: 'Bob', age: 25, city: 'LA' },
      ];
      const csv = stringifyCSV(data);
      expect(csv).toContain('name,age,city');
      expect(csv).toContain('Alice,30,NYC');
      expect(csv).toContain('Bob,25,LA');
    });

    it('should stringify array of objects without header', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const csv = stringifyCSV(data, { header: false });
      expect(csv).not.toContain('name,age');
      expect(csv).toContain('Alice,30');
      expect(csv).toContain('Bob,25');
    });

    it('should stringify array of arrays', () => {
      const data = [
        ['name', 'age', 'city'],
        ['Alice', '30', 'NYC'],
        ['Bob', '25', 'LA'],
      ];
      const csv = stringifyCSV(data);
      expect(csv).toContain('name,age,city');
      expect(csv).toContain('Alice,30,NYC');
      expect(csv).toContain('Bob,25,LA');
    });

    it('should return empty string for empty array', () => {
      expect(stringifyCSV([])).toBe('');
    });
  });

  describe('Field Quoting', () => {
    it('should quote fields with commas', () => {
      const data = [{ name: 'Alice', address: '123 Main St, NYC' }];
      const csv = stringifyCSV(data);
      expect(csv).toContain('"123 Main St, NYC"');
    });

    it('should quote fields with newlines', () => {
      const data = [{ name: 'Alice', bio: 'Line 1\nLine 2' }];
      const csv = stringifyCSV(data);
      expect(csv).toContain('"Line 1\nLine 2"');
    });

    it('should quote fields with quotes', () => {
      const data = [{ name: 'Alice', quote: 'She said "Hello"' }];
      const csv = stringifyCSV(data);
      expect(csv).toContain('"She said ""Hello"""');
    });

    it('should quote all fields when requested', () => {
      const data = [{ name: 'Alice', age: 30 }];
      const csv = stringifyCSV(data, { quoteAll: true });
      expect(csv).toContain('"Alice"');
      expect(csv).toContain('"30"');
    });

    it('should not quote simple fields by default', () => {
      const data = [{ name: 'Alice', age: 30 }];
      const csv = stringifyCSV(data);
      const lines = csv.split('\n');
      expect(lines[1]).toBe('Alice,30');
    });
  });

  describe('Different Delimiters', () => {
    it('should use semicolon delimiter', () => {
      const data = [{ name: 'Alice', age: 30 }];
      const csv = stringifyCSV(data, { delimiter: ';' });
      expect(csv).toContain('name;age');
      expect(csv).toContain('Alice;30');
    });

    it('should use tab delimiter', () => {
      const data = [{ name: 'Alice', age: 30 }];
      const csv = stringifyCSV(data, { delimiter: '\t' });
      expect(csv).toContain('name\tage');
      expect(csv).toContain('Alice\t30');
    });

    it('should use pipe delimiter', () => {
      const data = [{ name: 'Alice', age: 30 }];
      const csv = stringifyCSV(data, { delimiter: '|' });
      expect(csv).toContain('name|age');
      expect(csv).toContain('Alice|30');
    });
  });

  describe('Line Endings', () => {
    it('should use LF by default', () => {
      const data = [{ a: 1 }, { a: 2 }];
      const csv = stringifyCSV(data);
      expect(csv.split('\n')).toHaveLength(3);
      expect(csv).not.toContain('\r\n');
    });

    it('should use CRLF when specified', () => {
      const data = [{ a: 1 }, { a: 2 }];
      const csv = stringifyCSV(data, { lineEnding: '\r\n' });
      expect(csv).toContain('\r\n');
      expect(csv.split('\r\n')).toHaveLength(3);
    });
  });

  describe('Column Order', () => {
    it('should respect custom column order', () => {
      const data = [
        { name: 'Alice', age: 30, city: 'NYC' },
        { name: 'Bob', age: 25, city: 'LA' },
      ];
      const csv = stringifyCSV(data, { columns: ['city', 'name', 'age'] });
      expect(csv.split('\n')[0]).toBe('city,name,age');
      expect(csv).toContain('NYC,Alice,30');
      expect(csv).toContain('LA,Bob,25');
    });

    it('should handle missing columns', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', city: 'LA' },
      ];
      const csv = stringifyCSV(data, { columns: ['name', 'age', 'city'] });
      expect(csv).toContain('Alice,30,');
      expect(csv).toContain('Bob,,LA');
    });
  });

  describe('Value Types', () => {
    it('should handle numbers', () => {
      const data = [{ age: 30, score: 98.5 }];
      const csv = stringifyCSV(data);
      expect(csv).toContain('30');
      expect(csv).toContain('98.5');
    });

    it('should handle booleans', () => {
      const data = [{ active: true, verified: false }];
      const csv = stringifyCSV(data);
      expect(csv).toContain('true');
      expect(csv).toContain('false');
    });

    it('should handle null values', () => {
      const data = [{ name: 'Alice', middle: null }];
      const csv = stringifyCSV(data);
      const lines = csv.split('\n');
      expect(lines[1]).toMatch(/Alice,$/);
    });

    it('should handle undefined values', () => {
      const data = [{ name: 'Alice', middle: undefined }];
      const csv = stringifyCSV(data);
      const lines = csv.split('\n');
      expect(lines[1]).toMatch(/Alice,$/);
    });

    it('should handle dates', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const data = [{ name: 'Alice', created: date }];
      const csv = stringifyCSV(data);
      expect(csv).toContain('2024-01-15T10:30:00.000Z');
    });
  });

  describe('Real-world Examples', () => {
    it('should stringify employee data', () => {
      const data = [
        { id: 1, name: 'Alice Smith', department: 'Engineering', salary: 120000 },
        { id: 2, name: 'Bob Jones', department: 'Marketing', salary: 95000 },
      ];
      const csv = stringifyCSV(data);
      expect(csv).toContain('id,name,department,salary');
      expect(csv).toContain('1,Alice Smith,Engineering,120000');
      expect(csv).toContain('2,Bob Jones,Marketing,95000');
    });

    it('should stringify product catalog', () => {
      const data = [
        { sku: 'ABC123', name: 'Widget Pro', price: 29.99, in_stock: true },
        { sku: 'DEF456', name: 'Gadget Ultra', price: 49.99, in_stock: false },
      ];
      const csv = stringifyCSV(data);
      expect(csv).toContain('sku,name,price,in_stock');
      expect(csv).toContain('ABC123,Widget Pro,29.99,true');
      expect(csv).toContain('DEF456,Gadget Ultra,49.99,false');
    });
  });
});
