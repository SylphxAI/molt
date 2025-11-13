/**
 * TOML Serializer
 *
 * Serializes JavaScript object to TOML string
 */

import type { StringifyTOMLOptions } from './types.js';

/**
 * Stringify JavaScript object to TOML string
 *
 * @param value - Value to stringify
 * @param options - Stringify options
 * @returns TOML string
 */
export function stringifyTOML(value: unknown, options: StringifyTOMLOptions = {}): string {
  const { inlineTables = true, maxInlineKeys = 0, quoteKeys = false } = options;

  const serializer = new TOMLSerializer(inlineTables, maxInlineKeys, quoteKeys);
  return serializer.stringify(value);
}

/**
 * TOML Serializer implementation
 */
class TOMLSerializer {
  private readonly inlineTables: boolean;
  private readonly maxInlineKeys: number;
  private readonly quoteKeys: boolean;

  constructor(inlineTables: boolean, maxInlineKeys: number, quoteKeys: boolean) {
    this.inlineTables = inlineTables;
    this.maxInlineKeys = maxInlineKeys;
    this.quoteKeys = quoteKeys;
  }

  stringify(value: unknown): string {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error('TOML root must be an object');
    }

    const obj = value as Record<string, unknown>;
    const lines: string[] = [];

    // First pass: root-level key-value pairs
    const tables: [string, unknown][] = [];
    for (const [key, val] of Object.entries(obj)) {
      if (this.isScalar(val)) {
        lines.push(`${this.formatKey(key)} = ${this.serializeValue(val)}`);
      } else if (Array.isArray(val)) {
        // Check if it's an array of tables (array of objects)
        const isArrayOfTables =
          val.length > 0 && val.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item) && !this.shouldBeInline(item));
        if (isArrayOfTables) {
          tables.push([key, val]);
        } else {
          lines.push(`${this.formatKey(key)} = ${this.serializeValue(val)}`);
        }
      } else if (this.shouldBeInline(val)) {
        lines.push(`${this.formatKey(key)} = ${this.serializeValue(val)}`);
      } else {
        tables.push([key, val]);
      }
    }

    // Add blank line between root keys and tables
    if (lines.length > 0 && tables.length > 0) {
      lines.push('');
    }

    // Second pass: tables
    for (const [key, val] of tables) {
      if (Array.isArray(val)) {
        // Array of tables
        for (const item of val) {
          if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
            lines.push(`[[${key}]]`);
            lines.push(...this.serializeTable(item as Record<string, unknown>));
            lines.push('');
          }
        }
      } else if (typeof val === 'object' && val !== null) {
        // Regular table
        lines.push(`[${key}]`);
        lines.push(...this.serializeTable(val as Record<string, unknown>, [key]));
        lines.push('');
      }
    }

    return lines.join('\n').trim();
  }

  private serializeTable(obj: Record<string, unknown>, path: string[] = []): string[] {
    const lines: string[] = [];
    const nestedTables: [string, unknown][] = [];

    // First: simple key-value pairs, arrays, and inline tables
    for (const [key, val] of Object.entries(obj)) {
      if (this.isScalar(val)) {
        lines.push(`${this.formatKey(key)} = ${this.serializeValue(val)}`);
      } else if (Array.isArray(val)) {
        // Check if it's an array of tables (array of objects)
        const isArrayOfTables =
          val.length > 0 && val.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item) && !this.shouldBeInline(item));
        if (isArrayOfTables) {
          nestedTables.push([key, val]);
        } else {
          lines.push(`${this.formatKey(key)} = ${this.serializeValue(val)}`);
        }
      } else if (this.shouldBeInline(val)) {
        lines.push(`${this.formatKey(key)} = ${this.serializeValue(val)}`);
      } else {
        nestedTables.push([key, val]);
      }
    }

    // Then: nested tables
    for (const [key, val] of nestedTables) {
      if (Array.isArray(val)) {
        // Array of tables
        const fullPath = [...path, key];
        for (const item of val) {
          if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
            lines.push('');
            lines.push(`[[${fullPath.join('.')}]]`);
            lines.push(...this.serializeTable(item as Record<string, unknown>, fullPath));
          }
        }
      } else if (typeof val === 'object' && val !== null) {
        // Nested table
        const fullPath = [...path, key];
        lines.push('');
        lines.push(`[${fullPath.join('.')}]`);
        lines.push(...this.serializeTable(val as Record<string, unknown>, fullPath));
      }
    }

    return lines;
  }

  private serializeValue(value: unknown): string {
    // Null/undefined
    if (value === null || value === undefined) {
      return '""';
    }

    // Boolean
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    // Number
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return String(value);
      }
      return value.toString();
    }

    // Date
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Array
    if (Array.isArray(value)) {
      return this.serializeArray(value);
    }

    // Inline table
    if (typeof value === 'object') {
      return this.serializeInlineTable(value as Record<string, unknown>);
    }

    // String
    return this.serializeString(String(value));
  }

  private serializeString(str: string): string {
    // Check if it needs multiline
    if (str.includes('\n')) {
      // Use multiline basic string
      const escaped = str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      return `"""\n${escaped}\n"""`;
    }

    // Check if it needs quoting
    const needsQuotes =
      str === '' ||
      /[\n\r\t\\"]/.test(str) ||
      str.startsWith('#') ||
      /^\d/.test(str) ||
      str === 'true' ||
      str === 'false';

    if (needsQuotes || true) {
      // Always quote strings in TOML for safety
      const escaped = str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      return `"${escaped}"`;
    }

    return str;
  }

  private serializeArray(arr: unknown[]): string {
    if (arr.length === 0) return '[]';

    // Check if all items are scalars (for compact format)
    const allScalars = arr.every((item) => this.isScalar(item));

    if (allScalars) {
      const items = arr.map((item) => this.serializeValue(item)).join(', ');
      return `[${items}]`;
    }

    // Complex items - use multiline
    const items = arr.map((item) => this.serializeValue(item));
    return `[\n  ${items.join(',\n  ')}\n]`;
  }

  private serializeInlineTable(obj: Record<string, unknown>): string {
    const pairs: string[] = [];
    for (const [key, val] of Object.entries(obj)) {
      if (this.isScalar(val)) {
        pairs.push(`${this.formatKey(key)} = ${this.serializeValue(val)}`);
      }
    }
    return `{ ${pairs.join(', ')} }`;
  }

  private formatKey(key: string): string {
    // Check if key needs quoting
    const needsQuotes =
      this.quoteKeys ||
      /[^a-zA-Z0-9_-]/.test(key) ||
      key === '' ||
      /^\d/.test(key);

    if (needsQuotes) {
      return `"${key}"`;
    }

    return key;
  }

  private isScalar(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'boolean') return true;
    if (typeof value === 'number') return true;
    if (typeof value === 'string') return true;
    if (value instanceof Date) return true;
    return false;
  }

  private shouldBeInline(value: unknown): boolean {
    if (!this.inlineTables) return false;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);

    // Check size
    if (keys.length > this.maxInlineKeys) return false;

    // Check all values are scalars
    return keys.every((key) => this.isScalar(obj[key]));
  }
}
