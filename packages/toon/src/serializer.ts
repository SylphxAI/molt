/**
 * TOON Serializer
 *
 * Serialize JavaScript values to Token-Oriented Object Notation (TOON)
 */

import type { SerializeTOONOptions, TOONValue, TOONObject, TOONArray } from './types.js';

/**
 * Serialize JavaScript value to TOON string
 *
 * @param value - Value to serialize
 * @param options - Serialization options
 * @returns TOON string
 */
export function serializeTOON(value: TOONValue, options: SerializeTOONOptions = {}): string {
  const {
    indent = '  ',
    useTableFormat = true,
    minTableRows = 2,
    lineEnding = '\n',
    sortKeys = false,
  } = options;

  const serializer = new TOONSerializer({
    indent,
    useTableFormat,
    minTableRows,
    lineEnding,
    sortKeys,
  });

  return serializer.serialize(value);
}

/**
 * TOON Serializer implementation
 */
class TOONSerializer {
  private lines: string[] = [];

  constructor(private readonly options: Required<SerializeTOONOptions>) {}

  serialize(value: TOONValue): string {
    this.serializeValue(value, 0);
    return this.lines.join(this.options.lineEnding);
  }

  private serializeValue(value: TOONValue, indentLevel: number): void {
    if (value === null || value === undefined) {
      this.lines.push(this.getIndent(indentLevel) + 'null');
      return;
    }

    if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
      this.lines.push(this.getIndent(indentLevel) + this.serializePrimitive(value));
      return;
    }

    if (Array.isArray(value)) {
      this.serializeArray(value, indentLevel);
      return;
    }

    if (typeof value === 'object') {
      this.serializeObject(value as TOONObject, indentLevel);
      return;
    }
  }

  private serializeObject(obj: TOONObject, indentLevel: number): void {
    let keys = Object.keys(obj);

    if (this.options.sortKeys) {
      keys = keys.sort();
    }

    for (const key of keys) {
      const value = obj[key];
      const needsQuoting = this.needsQuoting(key);
      const quotedKey = needsQuoting ? `"${key}"` : key;

      // Skip undefined values
      if (value === undefined) {
        continue;
      }

      // Check if value is a uniform array (table format)
      if (
        Array.isArray(value) &&
        this.options.useTableFormat &&
        value.length >= this.options.minTableRows &&
        this.isUniformArray(value)
      ) {
        this.serializeTable(quotedKey, value as TOONObject[], indentLevel);
      }
      // Inline primitive value
      else if (this.isInlineValue(value)) {
        const serialized = this.serializeInlineValue(value);
        this.lines.push(`${this.getIndent(indentLevel)}${quotedKey}: ${serialized}`);
      }
      // Nested object or array
      else {
        this.lines.push(`${this.getIndent(indentLevel)}${quotedKey}:`);
        if (Array.isArray(value)) {
          this.serializeArray(value, indentLevel + 1);
        } else if (typeof value === 'object' && value !== null) {
          this.serializeObject(value as TOONObject, indentLevel + 1);
        }
      }
    }
  }

  private serializeArray(arr: TOONArray, indentLevel: number): void {
    // Check if uniform array (table format)
    if (
      this.options.useTableFormat &&
      arr.length >= this.options.minTableRows &&
      this.isUniformArray(arr)
    ) {
      this.serializeTableRows(arr as TOONObject[], indentLevel);
      return;
    }

    // Regular array - serialize each item
    for (const item of arr) {
      if (this.isInlineValue(item)) {
        const serialized = this.serializeInlineValue(item);
        this.lines.push(`${this.getIndent(indentLevel)}- ${serialized}`);
      } else {
        this.lines.push(`${this.getIndent(indentLevel)}-`);
        if (Array.isArray(item)) {
          this.serializeArray(item, indentLevel + 1);
        } else if (typeof item === 'object' && item !== null) {
          this.serializeObject(item as TOONObject, indentLevel + 1);
        }
      }
    }
  }

  private serializeTable(key: string, rows: TOONObject[], indentLevel: number): void {
    if (rows.length === 0) {
      this.lines.push(`${this.getIndent(indentLevel)}${key}: []`);
      return;
    }

    // Get column names from first row
    const columns = Object.keys(rows[0]!);

    // Calculate column widths
    const widths = this.calculateColumnWidths(columns, rows);

    // Write header
    const header = columns.map((col, i) => this.pad(col, widths[i]!)).join(' | ');
    this.lines.push(`${this.getIndent(indentLevel)}${key}:`);
    this.lines.push(`${this.getIndent(indentLevel + 1)}${header}`);

    // Write rows
    for (const row of rows) {
      const values = columns.map((col) => {
        const value = row[col];
        return value !== undefined ? this.serializeInlineValue(value) : 'null';
      });

      const line = values.map((val, i) => this.pad(val, widths[i]!)).join(' | ');
      this.lines.push(`${this.getIndent(indentLevel + 1)}${line}`);
    }
  }

  private serializeTableRows(rows: TOONObject[], indentLevel: number): void {
    if (rows.length === 0) {
      return;
    }

    // Get column names from first row
    const columns = Object.keys(rows[0]!);

    // Calculate column widths
    const widths = this.calculateColumnWidths(columns, rows);

    // Write header
    const header = columns.map((col, i) => this.pad(col, widths[i]!)).join(' | ');
    this.lines.push(`${this.getIndent(indentLevel)}${header}`);

    // Write rows
    for (const row of rows) {
      const values = columns.map((col) => {
        const value = row[col];
        return value !== undefined ? this.serializeInlineValue(value) : 'null';
      });

      const line = values.map((val, i) => this.pad(val, widths[i]!)).join(' | ');
      this.lines.push(`${this.getIndent(indentLevel)}${line}`);
    }
  }

  private serializeInlineValue(value: TOONValue): string {
    if (value === null || value === undefined) {
      return 'null';
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    if (typeof value === 'string') {
      // Quote if contains special characters
      if (this.needsQuoting(value)) {
        return `"${value.replace(/"/g, '\\"')}"`;
      }
      return value;
    }

    if (Array.isArray(value)) {
      return `[${value.map((v) => this.serializeInlineValue(v)).join(', ')}]`;
    }

    // Objects inline (not ideal for TOON but fallback)
    return JSON.stringify(value);
  }

  private serializePrimitive(value: boolean | number | string): string {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    if (this.needsQuoting(value)) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }

    return value;
  }

  private isInlineValue(value: TOONValue): boolean {
    return (
      value === null ||
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string' ||
      (Array.isArray(value) && value.every((item) => this.isPrimitive(item)))
    );
  }

  private isPrimitive(value: TOONValue): boolean {
    return (
      value === null ||
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string'
    );
  }

  private isUniformArray(arr: TOONArray): boolean {
    if (arr.length === 0) {
      return false;
    }

    // Check if all items are objects
    if (!arr.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item))) {
      return false;
    }

    // Check if all objects have the same keys
    const firstKeys = Object.keys((arr[0] as TOONObject)).sort();
    return arr.every((item) => {
      const keys = Object.keys(item as TOONObject).sort();
      return JSON.stringify(keys) === JSON.stringify(firstKeys);
    });
  }

  private calculateColumnWidths(columns: string[], rows: TOONObject[]): number[] {
    const widths: number[] = columns.map((col) => col.length);

    for (const row of rows) {
      columns.forEach((col, i) => {
        const value = row[col];
        const serialized = value !== undefined ? this.serializeInlineValue(value) : 'null';
        widths[i] = Math.max(widths[i]!, serialized.length);
      });
    }

    return widths;
  }

  private pad(value: string, width: number): string {
    return value + ' '.repeat(Math.max(0, width - value.length));
  }

  private needsQuoting(value: string): boolean {
    // Quote if contains special characters, starts/ends with space, or looks like a number/boolean
    return (
      value.includes(':') ||
      value.includes('|') ||
      value.includes('#') ||
      value.includes('\n') ||
      value.startsWith(' ') ||
      value.endsWith(' ') ||
      value === 'true' ||
      value === 'false' ||
      value === 'null' ||
      value === 'yes' ||
      value === 'no' ||
      /^-?\d+(\.\d+)?$/.test(value)
    );
  }

  private getIndent(level: number): string {
    return this.options.indent.repeat(level);
  }
}
