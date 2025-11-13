import { describe, it, expect } from 'vitest';
import { parseCSV } from '../src/parser.js';

describe('CSV Parser', () => {
  describe('Basic Parsing', () => {
    it('should parse simple CSV with header', () => {
      const csv = `name,age,city
Alice,30,NYC
Bob,25,LA`;
      const result = parseCSV(csv);
      expect(result).toEqual([
        { name: 'Alice', age: 30, city: 'NYC' },
        { name: 'Bob', age: 25, city: 'LA' },
      ]);
    });

    it('should parse CSV without header', () => {
      const csv = `Alice,30,NYC
Bob,25,LA`;
      const result = parseCSV(csv, { header: false });
      expect(result).toEqual([
        ['Alice', '30', 'NYC'],
        ['Bob', '25', 'LA'],
      ]);
    });

    it('should parse empty CSV', () => {
      expect(parseCSV('')).toEqual([]);
    });

    it('should parse CSV with only header', () => {
      const csv = 'name,age,city';
      const result = parseCSV(csv);
      expect(result).toEqual([]);
    });
  });

  describe('Type Conversion', () => {
    it('should convert numbers', () => {
      const csv = `name,age,score
Alice,30,98.5
Bob,25,87.3`;
      const result = parseCSV(csv) as any[];
      expect(result[0].age).toBe(30);
      expect(result[0].score).toBe(98.5);
      expect(result[1].age).toBe(25);
      expect(result[1].score).toBe(87.3);
    });

    it('should convert booleans', () => {
      const csv = `name,active,verified
Alice,true,false
Bob,false,true`;
      const result = parseCSV(csv) as any[];
      expect(result[0].active).toBe(true);
      expect(result[0].verified).toBe(false);
      expect(result[1].active).toBe(false);
      expect(result[1].verified).toBe(true);
    });

    it('should disable type conversion', () => {
      const csv = `name,age,active
Alice,30,true`;
      const result = parseCSV(csv, { convertTypes: false }) as any[];
      expect(result[0].age).toBe('30');
      expect(result[0].active).toBe('true');
    });
  });

  describe('Quoted Fields', () => {
    it('should handle quoted fields', () => {
      const csv = `name,description
Alice,"Software Engineer"
Bob,"Product Manager"`;
      const result = parseCSV(csv);
      expect(result).toEqual([
        { name: 'Alice', description: 'Software Engineer' },
        { name: 'Bob', description: 'Product Manager' },
      ]);
    });

    it('should handle fields with commas', () => {
      const csv = `name,address
Alice,"123 Main St, NYC"
Bob,"456 Oak Ave, LA"`;
      const result = parseCSV(csv);
      expect(result).toEqual([
        { name: 'Alice', address: '123 Main St, NYC' },
        { name: 'Bob', address: '456 Oak Ave, LA' },
      ]);
    });

    it('should handle fields with newlines', () => {
      const csv = `name,bio
Alice,"Line 1
Line 2"
Bob,"Single line"`;
      const result = parseCSV(csv);
      expect(result).toEqual([
        { name: 'Alice', bio: 'Line 1\nLine 2' },
        { name: 'Bob', bio: 'Single line' },
      ]);
    });

    it('should handle escaped quotes', () => {
      const csv = `name,quote
Alice,"She said ""Hello"""
Bob,"He said ""Goodbye"""`;
      const result = parseCSV(csv);
      expect(result).toEqual([
        { name: 'Alice', quote: 'She said "Hello"' },
        { name: 'Bob', quote: 'He said "Goodbye"' },
      ]);
    });
  });

  describe('Different Delimiters', () => {
    it('should parse semicolon-delimited CSV', () => {
      const csv = `name;age;city
Alice;30;NYC
Bob;25;LA`;
      const result = parseCSV(csv, { delimiter: ';' });
      expect(result).toEqual([
        { name: 'Alice', age: 30, city: 'NYC' },
        { name: 'Bob', age: 25, city: 'LA' },
      ]);
    });

    it('should parse tab-delimited CSV', () => {
      const csv = `name\tage\tcity
Alice\t30\tNYC
Bob\t25\tLA`;
      const result = parseCSV(csv, { delimiter: '\t' });
      expect(result).toEqual([
        { name: 'Alice', age: 30, city: 'NYC' },
        { name: 'Bob', age: 25, city: 'LA' },
      ]);
    });

    it('should parse pipe-delimited CSV', () => {
      const csv = `name|age|city
Alice|30|NYC
Bob|25|LA`;
      const result = parseCSV(csv, { delimiter: '|' });
      expect(result).toEqual([
        { name: 'Alice', age: 30, city: 'NYC' },
        { name: 'Bob', age: 25, city: 'LA' },
      ]);
    });
  });

  describe('Empty Fields', () => {
    it('should handle empty fields', () => {
      const csv = `name,age,city
Alice,,NYC
Bob,25,`;
      const result = parseCSV(csv);
      expect(result).toEqual([
        { name: 'Alice', age: '', city: 'NYC' },
        { name: 'Bob', age: 25, city: '' },
      ]);
    });

    it('should handle rows with missing fields', () => {
      const csv = `name,age,city
Alice,30
Bob,25,LA`;
      const result = parseCSV(csv);
      expect(result).toEqual([
        { name: 'Alice', age: 30, city: '' },
        { name: 'Bob', age: 25, city: 'LA' },
      ]);
    });
  });

  describe('Empty Lines', () => {
    it('should skip empty lines by default', () => {
      const csv = `name,age,city
Alice,30,NYC

Bob,25,LA`;
      const result = parseCSV(csv);
      expect(result).toEqual([
        { name: 'Alice', age: 30, city: 'NYC' },
        { name: 'Bob', age: 25, city: 'LA' },
      ]);
    });

    it('should not skip empty lines when disabled', () => {
      const csv = `name,age,city
Alice,30,NYC

Bob,25,LA`;
      const result = parseCSV(csv, { skipEmptyLines: false });
      expect(result).toHaveLength(3);
    });
  });

  describe('Whitespace', () => {
    it('should preserve whitespace by default', () => {
      const csv = `name,age,city
 Alice ,30, NYC `;
      const result = parseCSV(csv);
      expect(result).toEqual([{ name: ' Alice ', age: 30, city: ' NYC ' }]);
    });

    it('should trim whitespace when enabled', () => {
      const csv = `name,age,city
 Alice ,30, NYC `;
      const result = parseCSV(csv, { trim: true });
      expect(result).toEqual([{ name: 'Alice', age: 30, city: 'NYC' }]);
    });
  });

  describe('Line Endings', () => {
    it('should handle Unix line endings (LF)', () => {
      const csv = 'name,age\nAlice,30\nBob,25';
      const result = parseCSV(csv);
      expect(result).toHaveLength(2);
    });

    it('should handle Windows line endings (CRLF)', () => {
      const csv = 'name,age\r\nAlice,30\r\nBob,25';
      const result = parseCSV(csv);
      expect(result).toHaveLength(2);
    });

    it('should handle old Mac line endings (CR)', () => {
      const csv = 'name,age\rAlice,30\rBob,25';
      const result = parseCSV(csv);
      expect(result).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should throw on oversized input', () => {
      const largeCsv = 'a,'.repeat(200 * 1024 * 1024);
      expect(() => parseCSV(largeCsv)).toThrow(/exceeds maximum/);
    });

    it('should respect maxSize option', () => {
      const csv = 'name,age\nAlice,30';
      expect(() => parseCSV(csv, { maxSize: 10 })).toThrow(/exceeds maximum/);
    });

    it('should handle CSV with BOM', () => {
      const csv = '\uFEFFname,age\nAlice,30';
      const result = parseCSV(csv);
      expect(result).toHaveLength(1);
    });
  });

  describe('Real-world Examples', () => {
    it('should parse employee data', () => {
      const csv = `id,name,department,salary
1,Alice Smith,Engineering,120000
2,Bob Jones,Marketing,95000
3,Carol White,Sales,85000`;
      const result = parseCSV(csv);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 1,
        name: 'Alice Smith',
        department: 'Engineering',
        salary: 120000,
      });
    });

    it('should parse product catalog', () => {
      const csv = `sku,name,price,in_stock
ABC123,"Widget Pro",29.99,true
DEF456,"Gadget Ultra",49.99,false
GHI789,"Thing Classic",19.99,true`;
      const result = parseCSV(csv) as any[];
      expect(result).toHaveLength(3);
      expect(result[0].price).toBe(29.99);
      expect(result[0].in_stock).toBe(true);
    });
  });
});
