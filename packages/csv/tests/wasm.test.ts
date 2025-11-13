import { describe, it, expect, beforeAll } from 'vitest';
import {
  parseWithWasm,
  stringifyWithWasm,
  initWasm,
  isWasmAvailable,
  isWasmEnabled,
  disableWasm,
  enableWasm,
} from '../src/wasm-loader.js';

describe('CSV WASM', () => {
  beforeAll(async () => {
    // Try to initialize WASM
    await initWasm();
  });

  describe('WASM Availability', () => {
    it('should report WASM status', () => {
      const enabled = isWasmEnabled();
      expect(typeof enabled).toBe('boolean');

      const available = isWasmAvailable();
      expect(typeof available).toBe('boolean');
    });

    it('should allow disabling WASM', () => {
      const wasEnabled = isWasmEnabled();

      disableWasm();
      expect(isWasmEnabled()).toBe(false);

      enableWasm();
      expect(isWasmEnabled()).toBe(true);

      // Restore original state
      if (!wasEnabled) {
        disableWasm();
      }
    });
  });

  describe('Parse with WASM', () => {
    it('should parse simple CSV', async () => {
      const csv = `name,age,city
Alice,30,NYC
Bob,25,LA`;
      const result = await parseWithWasm(csv);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: 'Alice', age: 30, city: 'NYC' });
      expect(result[1]).toEqual({ name: 'Bob', age: 25, city: 'LA' });
    });

    it('should handle quoted fields', async () => {
      const csv = `name,address
Alice,"123 Main St, NYC"
Bob,"456 Oak Ave, LA"`;
      const result = await parseWithWasm(csv);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: 'Alice', address: '123 Main St, NYC' });
      expect(result[1]).toEqual({ name: 'Bob', address: '456 Oak Ave, LA' });
    });

    it('should handle escaped quotes', async () => {
      const csv = `name,quote
Alice,"She said ""Hello"""
Bob,"He said ""Goodbye"""`;
      const result = await parseWithWasm(csv);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: 'Alice', quote: 'She said "Hello"' });
      expect(result[1]).toEqual({ name: 'Bob', quote: 'He said "Goodbye"' });
    });

    it('should parse CSV without header', async () => {
      const csv = `Alice,30,NYC
Bob,25,LA`;
      const result = await parseWithWasm(csv, { header: false });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(['Alice', '30', 'NYC']);
      expect(result[1]).toEqual(['Bob', '25', 'LA']);
    });

    it('should handle different delimiters', async () => {
      const csv = `name;age;city
Alice;30;NYC
Bob;25;LA`;
      const result = await parseWithWasm(csv, { delimiter: ';' });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: 'Alice', age: 30, city: 'NYC' });
    });

    it('should handle type conversion', async () => {
      const csv = `name,age,active,score
Alice,30,true,98.5
Bob,25,false,87.3`;
      const result = await parseWithWasm(csv, { convertTypes: true }) as any[];

      expect(result[0].age).toBe(30);
      expect(result[0].active).toBe(true);
      expect(result[0].score).toBe(98.5);
      expect(result[1].age).toBe(25);
      expect(result[1].active).toBe(false);
      expect(result[1].score).toBe(87.3);
    });

    it('should disable type conversion when requested', async () => {
      const csv = `name,age,active
Alice,30,true`;
      const result = await parseWithWasm(csv, { convertTypes: false }) as any[];

      expect(result[0].age).toBe('30');
      expect(result[0].active).toBe('true');
    });
  });

  describe('Stringify with WASM', () => {
    it('should stringify array of objects', async () => {
      const data = [
        { name: 'Alice', age: 30, city: 'NYC' },
        { name: 'Bob', age: 25, city: 'LA' },
      ];
      const csv = await stringifyWithWasm(data);

      expect(csv).toContain('name,age,city');
      expect(csv).toContain('Alice,30,NYC');
      expect(csv).toContain('Bob,25,LA');
    });

    it('should stringify without header', async () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const csv = await stringifyWithWasm(data, { header: false });

      expect(csv).not.toContain('name,age');
      expect(csv).toContain('Alice,30');
      expect(csv).toContain('Bob,25');
    });

    it('should handle fields with commas', async () => {
      const data = [{ name: 'Alice', address: '123 Main St, NYC' }];
      const csv = await stringifyWithWasm(data);

      expect(csv).toContain('"123 Main St, NYC"');
    });

    it('should handle fields with quotes', async () => {
      const data = [{ name: 'Alice', quote: 'She said "Hello"' }];
      const csv = await stringifyWithWasm(data);

      expect(csv).toContain('""Hello""');
    });

    it('should handle different delimiters', async () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const csv = await stringifyWithWasm(data, { delimiter: ';' });

      expect(csv).toContain('name;age');
      expect(csv).toContain('Alice;30');
    });

    it('should handle array of arrays', async () => {
      const data = [
        ['Alice', '30', 'NYC'],
        ['Bob', '25', 'LA'],
      ];
      const csv = await stringifyWithWasm(data);

      expect(csv).toContain('Alice,30,NYC');
      expect(csv).toContain('Bob,25,LA');
    });

    it('should handle quote all option', async () => {
      const data = [{ name: 'Alice', age: 30 }];
      const csv = await stringifyWithWasm(data, { quoteAll: true });

      expect(csv).toContain('"Alice"');
      expect(csv).toContain('"30"');
    });
  });

  describe('Round-trip', () => {
    it('should handle simple data round-trip', async () => {
      const original = [
        { name: 'Alice', age: 30, city: 'NYC' },
        { name: 'Bob', age: 25, city: 'LA' },
      ];
      const csv = await stringifyWithWasm(original);
      const parsed = await parseWithWasm(csv);

      expect(parsed).toEqual(original);
    });

    it('should handle fields with commas round-trip', async () => {
      const original = [
        { name: 'Alice', address: '123 Main St, NYC' },
        { name: 'Bob', address: '456 Oak Ave, LA' },
      ];
      const csv = await stringifyWithWasm(original);
      const parsed = await parseWithWasm(csv);

      expect(parsed).toEqual(original);
    });

    it('should handle fields with quotes round-trip', async () => {
      const original = [
        { name: 'Alice', quote: 'She said "Hello"' },
        { name: 'Bob', quote: 'He said "Goodbye"' },
      ];
      const csv = await stringifyWithWasm(original);
      const parsed = await parseWithWasm(csv);

      expect(parsed).toEqual(original);
    });
  });

  describe('Fallback Behavior', () => {
    it('should fall back to TypeScript if WASM fails', async () => {
      // Even if WASM is not available, these should work via TypeScript fallback
      const csv = `name,age\nAlice,30`;
      const result = await parseWithWasm(csv);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ name: 'Alice', age: 30 });

      const data = [{ name: 'Alice', age: 30 }];
      const csvOut = await stringifyWithWasm(data);

      expect(csvOut).toContain('name,age');
      expect(csvOut).toContain('Alice,30');
    });
  });
});
