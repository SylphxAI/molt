/**
 * YAML Serializer
 *
 * Serializes JavaScript object to YAML string
 */

import type { StringifyYAMLOptions } from './types.js';

/**
 * Stringify JavaScript object to YAML string
 *
 * @param value - Value to stringify
 * @param options - Stringify options
 * @returns YAML string
 */
export function stringifyYAML(value: unknown, options: StringifyYAMLOptions = {}): string {
  const { indent = 2, quoteStrings = 'minimal' } = options;

  const serializer = new YAMLSerializer(indent, quoteStrings);
  return serializer.stringify(value, 0).trim();
}

/**
 * YAML Serializer implementation
 */
class YAMLSerializer {
  private readonly indentSize: number;
  private readonly quoteStrings: 'always' | 'minimal' | 'never';

  constructor(indent: number, quoteStrings: 'always' | 'minimal' | 'never') {
    this.indentSize = indent;
    this.quoteStrings = quoteStrings;
  }

  stringify(value: unknown, depth: number): string {
    const indent = ' '.repeat(depth * this.indentSize);

    // Null
    if (value === null || value === undefined) {
      return 'null';
    }

    // Boolean
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    // Number
    if (typeof value === 'number') {
      return String(value);
    }

    // Date
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Array
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '[]';
      }

      return value
        .map((item) => {
          const serialized = this.stringify(item, depth + 1);
          if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
            // Nested object
            const lines = serialized.split('\n');
            if (lines.length === 1) {
              return `${indent}- ${serialized}`;
            }
            return `${indent}-\n${lines.map((l) => `${indent}  ${l}`).join('\n')}`;
          }
          return `${indent}- ${serialized}`;
        })
        .join('\n');
    }

    // Object
    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);

      if (keys.length === 0) {
        return '{}';
      }

      return keys
        .map((key) => {
          const val = obj[key];
          const serialized = this.stringify(val, depth + 1);

          // Nested object or array
          if ((typeof val === 'object' && val !== null) || Array.isArray(val)) {
            if (Array.isArray(val) && val.length === 0) {
              return `${indent}${key}: []`;
            }
            if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) {
              return `${indent}${key}: {}`;
            }

            const lines = serialized.split('\n');
            return `${indent}${key}:\n${lines.join('\n')}`;
          }

          // Scalar value
          return `${indent}${key}: ${serialized}`;
        })
        .join('\n');
    }

    // String
    const str = String(value);
    return this.serializeString(str);
  }

  private serializeString(value: string): string {
    // Always quote
    if (this.quoteStrings === 'always') {
      return `"${this.escapeString(value)}"`;
    }

    // Never quote
    if (this.quoteStrings === 'never') {
      return value;
    }

    // Minimal quoting (only when necessary)
    // Quote if: contains special chars, looks like number/bool, starts with special char, contains control chars
    const needsQuotes =
      /[:#\[\]{}|>@`"'\n\r\t\\]/.test(value) ||
      /^(true|false|yes|no|on|off|null|~)$/i.test(value) ||
      /^-?\d+(\.\d+)?$/.test(value) ||
      /^\s|\s$/.test(value) ||
      value === '';

    if (needsQuotes) {
      return `"${this.escapeString(value)}"`;
    }

    return value;
  }

  private escapeString(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }
}
