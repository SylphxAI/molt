import { describe, it, expect } from 'vitest';
import { MoltCSV, molt, parseCSV, stringifyCSV } from '../src/index.js';

describe('MoltCSV', () => {
  describe('API', () => {
    it('should export MoltCSV class', () => {
      expect(MoltCSV).toBeDefined();
      expect(MoltCSV.parse).toBeDefined();
      expect(MoltCSV.stringify).toBeDefined();
    });

    it('should export molt function', () => {
      expect(molt).toBeDefined();
    });

    it('should export individual functions', () => {
      expect(parseCSV).toBeDefined();
      expect(stringifyCSV).toBeDefined();
    });
  });

  describe('MoltCSV.parse', () => {
    it('should parse CSV string', () => {
      const csv = `name,age
Alice,30
Bob,25`;
      const result = MoltCSV.parse(csv);
      expect(result).toEqual([
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ]);
    });

    it('should accept options', () => {
      const csv = `name;age
Alice;30`;
      const result = MoltCSV.parse(csv, { delimiter: ';' });
      expect(result).toEqual([{ name: 'Alice', age: 30 }]);
    });
  });

  describe('MoltCSV.stringify', () => {
    it('should stringify JavaScript array', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const csv = MoltCSV.stringify(data);
      expect(csv).toContain('name,age');
      expect(csv).toContain('Alice,30');
      expect(csv).toContain('Bob,25');
    });

    it('should accept options', () => {
      const data = [{ name: 'Alice', age: 30 }];
      const csv = MoltCSV.stringify(data, { delimiter: ';' });
      expect(csv).toContain('name;age');
      expect(csv).toContain('Alice;30');
    });
  });

  describe('molt', () => {
    it('should parse CSV string', () => {
      const csv = `name,age
Alice,30
Bob,25`;
      const result = molt(csv);
      expect(result).toEqual([
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ]);
    });

    it('should accept options', () => {
      const csv = `name;age
Alice;30`;
      const result = molt(csv, { delimiter: ';' });
      expect(result).toEqual([{ name: 'Alice', age: 30 }]);
    });
  });

  describe('Round-trip', () => {
    it('should handle simple data round-trip', () => {
      const original = [
        { name: 'Alice', age: 30, city: 'NYC' },
        { name: 'Bob', age: 25, city: 'LA' },
      ];
      const csv = stringifyCSV(original);
      const parsed = parseCSV(csv);
      expect(parsed).toEqual(original);
    });

    it('should handle fields with commas', () => {
      const original = [
        { name: 'Alice', address: '123 Main St, NYC' },
        { name: 'Bob', address: '456 Oak Ave, LA' },
      ];
      const csv = stringifyCSV(original);
      const parsed = parseCSV(csv);
      expect(parsed).toEqual(original);
    });

    it('should handle fields with quotes', () => {
      const original = [
        { name: 'Alice', quote: 'She said "Hello"' },
        { name: 'Bob', quote: 'He said "Goodbye"' },
      ];
      const csv = stringifyCSV(original);
      const parsed = parseCSV(csv);
      expect(parsed).toEqual(original);
    });

    it('should handle fields with newlines', () => {
      const original = [
        { name: 'Alice', bio: 'Line 1\nLine 2' },
        { name: 'Bob', bio: 'Single line' },
      ];
      const csv = stringifyCSV(original);
      const parsed = parseCSV(csv);
      expect(parsed).toEqual(original);
    });

    it('should handle different delimiters', () => {
      const original = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const csv = stringifyCSV(original, { delimiter: ';' });
      const parsed = parseCSV(csv, { delimiter: ';' });
      expect(parsed).toEqual(original);
    });

    it('should handle array of arrays', () => {
      const original = [
        ['Alice', 30, 'NYC'],
        ['Bob', 25, 'LA'],
      ];
      const csv = stringifyCSV(original);
      const parsed = parseCSV(csv, { header: false, convertTypes: false });
      expect(parsed).toEqual(original.map((row) => row.map(String)));
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle employee data', () => {
      const employees = [
        { id: 1, name: 'Alice Smith', department: 'Engineering', salary: 120000, active: true },
        { id: 2, name: 'Bob Jones', department: 'Marketing', salary: 95000, active: true },
        { id: 3, name: 'Carol White', department: 'Sales', salary: 85000, active: false },
      ];
      const csv = stringifyCSV(employees);
      const parsed = parseCSV(csv);
      expect(parsed).toEqual(employees);
    });

    it('should handle product catalog', () => {
      const products = [
        { sku: 'ABC123', name: 'Widget Pro', price: 29.99, in_stock: true },
        { sku: 'DEF456', name: 'Gadget Ultra', price: 49.99, in_stock: false },
        { sku: 'GHI789', name: 'Thing Classic', price: 19.99, in_stock: true },
      ];
      const csv = stringifyCSV(products);
      const parsed = parseCSV(csv);
      expect(parsed).toEqual(products);
    });

    it('should handle transaction log', () => {
      const transactions = [
        { id: 'TX001', date: new Date('2024-01-15T10:30:00Z'), amount: 1500.5, status: 'completed' },
        { id: 'TX002', date: new Date('2024-01-16T14:20:00Z'), amount: 750.25, status: 'pending' },
      ];
      const csv = stringifyCSV(transactions);
      const parsed = parseCSV(csv) as any[];
      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe('TX001');
      expect(parsed[0].amount).toBe(1500.5);
      expect(parsed[1].id).toBe('TX002');
      expect(parsed[1].amount).toBe(750.25);
    });
  });
});
