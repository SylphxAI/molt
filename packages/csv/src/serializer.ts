/**
 * CSV Serializer
 *
 * Serializes JavaScript array to CSV string
 */

import type { StringifyCSVOptions } from './types.js';

/**
 * Stringify JavaScript array to CSV string
 *
 * @param data - Array of objects or arrays
 * @param options - Stringify options
 * @returns CSV string
 */
export function stringifyCSV(data: unknown[], options: StringifyCSVOptions = {}): string {
  const { delimiter = ',', header = true, quoteAll = false, lineEnding = '\n', columns } = options;

  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const serializer = new CSVSerializer(delimiter, header, quoteAll, lineEnding, columns);
  return serializer.stringify(data);
}

/**
 * CSV Serializer implementation
 */
class CSVSerializer {
  private readonly delimiter: string;
  private readonly header: boolean;
  private readonly quoteAll: boolean;
  private readonly lineEnding: string;
  private readonly columns?: string[];

  constructor(
    delimiter: string,
    header: boolean,
    quoteAll: boolean,
    lineEnding: string,
    columns?: string[]
  ) {
    this.delimiter = delimiter;
    this.header = header;
    this.quoteAll = quoteAll;
    this.lineEnding = lineEnding;
    this.columns = columns;
  }

  stringify(data: unknown[]): string {
    if (data.length === 0) {
      return '';
    }

    const firstRow = data[0];

    // Check if data is array of arrays or array of objects
    if (Array.isArray(firstRow)) {
      return this.stringifyArrays(data as unknown[][]);
    }

    if (typeof firstRow === 'object' && firstRow !== null) {
      return this.stringifyObjects(data as Record<string, unknown>[]);
    }

    throw new Error('Data must be array of objects or array of arrays');
  }

  private stringifyArrays(data: unknown[][]): string {
    const lines: string[] = [];

    for (const row of data) {
      const fields = row.map((field) => this.serializeField(String(field ?? '')));
      lines.push(fields.join(this.delimiter));
    }

    return lines.join(this.lineEnding);
  }

  private stringifyObjects(data: Record<string, unknown>[]): string {
    const lines: string[] = [];

    // Determine columns
    const columns = this.columns || this.getColumns(data);

    // Add header row
    if (this.header) {
      const headerFields = columns.map((col) => this.serializeField(col));
      lines.push(headerFields.join(this.delimiter));
    }

    // Add data rows
    for (const obj of data) {
      const fields = columns.map((col) => {
        const value = obj[col];
        return this.serializeField(this.valueToString(value));
      });
      lines.push(fields.join(this.delimiter));
    }

    return lines.join(this.lineEnding);
  }

  private getColumns(data: Record<string, unknown>[]): string[] {
    // Collect all unique keys from all objects
    const columnSet = new Set<string>();

    for (const obj of data) {
      for (const key of Object.keys(obj)) {
        columnSet.add(key);
      }
    }

    return Array.from(columnSet);
  }

  private valueToString(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    if (typeof value === 'number') {
      return String(value);
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
  }

  private serializeField(field: string): string {
    // Check if field needs quoting
    const needsQuotes =
      this.quoteAll ||
      field.includes(this.delimiter) ||
      field.includes('"') ||
      field.includes('\n') ||
      field.includes('\r');

    if (!needsQuotes) {
      return field;
    }

    // Escape quotes by doubling them
    const escaped = field.replace(/"/g, '""');
    return `"${escaped}"`;
  }
}
