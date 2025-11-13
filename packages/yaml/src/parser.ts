/**
 * YAML Parser
 *
 * Parses YAML string to JavaScript object
 */

import type { ParseYAMLOptions } from './types.js';
import { ParseError } from './types.js';

/**
 * Parse YAML string to JavaScript object
 *
 * @param input - YAML string
 * @param options - Parse options
 * @returns Parsed object
 */
export function parseYAML(input: string, options: ParseYAMLOptions = {}): unknown {
  const { maxSize = 100 * 1024 * 1024, parseDates = true } = options;

  // Size check
  if (input.length > maxSize) {
    throw new ParseError(`Input size ${input.length} exceeds maximum ${maxSize}`);
  }

  const parser = new YAMLParser(input, { parseDates });
  return parser.parse();
}

/**
 * YAML Parser implementation
 */
class YAMLParser {
  private lines: string[];
  private currentLine = 0;
  private readonly parseDates: boolean;

  constructor(input: string, options: { parseDates: boolean }) {
    // Normalize line endings and split
    this.lines = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    this.parseDates = options.parseDates;
  }

  parse(): unknown {
    const result = this.parseValue(0);
    return result;
  }

  private parseValue(baseIndent: number): unknown {
    // Skip empty lines and comments
    this.skipEmptyLines();

    if (this.currentLine >= this.lines.length) {
      return null;
    }

    const line = this.lines[this.currentLine]!;
    const indent = this.getIndent(line);
    const content = line.trim();

    // Check indent level
    if (indent < baseIndent) {
      return null;
    }

    // Array item
    if (content.startsWith('- ') || content === '-') {
      return this.parseArray(indent);
    }

    // Object or scalar
    if (content.includes(':')) {
      const colonIndex = content.indexOf(':');
      const afterColon = content.slice(colonIndex + 1);

      // Check if this is actually a scalar (not a key-value pair)
      // YAML requires space after colon for key-value pairs
      // Also check if it looks like a date or other scalar value
      const isScalar =
        afterColon.length > 0 && afterColon[0] !== ' ' || // No space after colon
        /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/.test(content); // ISO date

      if (isScalar) {
        return this.parseScalar(content);
      }

      // Object
      if (!afterColon.trim() || this.isNextLineIndented(indent)) {
        return this.parseObject(indent);
      }

      // Single key-value pair (return as object)
      return this.parseObject(indent);
    }

    // Scalar value
    return this.parseScalar(content);
  }

  private parseObject(baseIndent: number): Record<string, unknown> {
    const obj: Record<string, unknown> = {};

    while (this.currentLine < this.lines.length) {
      this.skipEmptyLines();

      if (this.currentLine >= this.lines.length) {
        break;
      }

      const line = this.lines[this.currentLine]!;
      const indent = this.getIndent(line);
      const content = line.trim();

      // End of this object level
      if (indent < baseIndent) {
        break;
      }

      // Skip if deeper indent (handled by nested parsing)
      // Exception: at root level (baseIndent=0), be lenient with inconsistent indentation
      if (indent > baseIndent && baseIndent > 0) {
        break;
      }

      // Parse array item at same level
      if (content.startsWith('- ') || content === '-') {
        // This is an array at the same level, stop parsing object
        break;
      }

      // Parse key-value pair
      if (content.includes(':')) {
        const colonIndex = content.indexOf(':');
        const key = content.slice(0, colonIndex).trim();
        const valueStr = content.slice(colonIndex + 1).trim();

        this.currentLine++;

        if (!valueStr) {
          // Value on next line or nested object
          const nextIndent = this.peekNextIndent();
          if (nextIndent > indent) {
            obj[key] = this.parseValue(nextIndent);
          } else {
            obj[key] = null;
          }
        } else if (valueStr.startsWith('- ')) {
          // Inline array
          this.currentLine--; // Go back to parse array
          const savedLine = this.currentLine;
          this.currentLine++; // Skip key line
          obj[key] = this.parseArray(indent + 2);
          if (this.currentLine === savedLine + 1) {
            // Didn't advance, parse inline
            obj[key] = [this.parseScalar(valueStr.slice(2))];
          }
        } else {
          // Scalar value
          obj[key] = this.parseScalar(valueStr);
        }
      } else {
        // Invalid line, skip
        this.currentLine++;
      }
    }

    return obj;
  }

  private parseArray(baseIndent: number): unknown[] {
    const arr: unknown[] = [];

    while (this.currentLine < this.lines.length) {
      this.skipEmptyLines();

      if (this.currentLine >= this.lines.length) {
        break;
      }

      const line = this.lines[this.currentLine]!;
      const indent = this.getIndent(line);
      const content = line.trim();

      // End of this array level
      if (indent < baseIndent) {
        break;
      }

      // Skip if deeper indent (handled by nested parsing)
      if (indent > baseIndent) {
        break;
      }

      // Array item
      if (content.startsWith('- ') || content === '-') {
        const valueStr = content === '-' ? '' : content.slice(2).trim();
        this.currentLine++;

        if (!valueStr) {
          // Value on next line
          const nextIndent = this.peekNextIndent();
          if (nextIndent > indent) {
            arr.push(this.parseValue(nextIndent));
          } else {
            arr.push(null);
          }
        } else if (valueStr.startsWith('- ')) {
          // Nested array starting inline (e.g., "- - 1")
          // Parse the inline first item
          const firstItem = this.parseScalar(valueStr.slice(2).trim());
          const nestedArr: unknown[] = [firstItem];

          // Check if there are more items on subsequent lines at higher indent
          while (this.currentLine < this.lines.length) {
            const nextLine = this.lines[this.currentLine];
            if (!nextLine) break;

            const nextIndent = this.getIndent(nextLine);
            const nextContent = nextLine.trim();

            // More items at higher indent
            if (nextIndent > indent && (nextContent.startsWith('- ') || nextContent === '-')) {
              this.currentLine++;
              const itemStr = nextContent === '-' ? '' : nextContent.slice(2).trim();
              if (itemStr) {
                nestedArr.push(this.parseScalar(itemStr));
              } else {
                // Item value on next line
                const nextNextIndent = this.peekNextIndent();
                if (nextNextIndent > nextIndent) {
                  nestedArr.push(this.parseValue(nextNextIndent));
                } else {
                  nestedArr.push(null);
                }
              }
            } else {
              break;
            }
          }

          arr.push(nestedArr);
        } else if (
          valueStr.includes(':') &&
          // Check if it's a quoted string (not an object)
          !((valueStr.startsWith('"') && valueStr.endsWith('"')) || (valueStr.startsWith("'") && valueStr.endsWith("'")))
        ) {
          // Inline object
          const obj: Record<string, unknown> = {};
          const colonIndex = valueStr.indexOf(':');
          const key = valueStr.slice(0, colonIndex).trim();
          const val = valueStr.slice(colonIndex + 1).trim();
          obj[key] = val ? this.parseScalar(val) : null;

          // Check for more properties
          const nextIndent = this.peekNextIndent();
          if (nextIndent > indent) {
            const nested = this.parseObject(nextIndent);
            Object.assign(obj, nested);
          }

          arr.push(obj);
        } else {
          // Scalar value
          arr.push(this.parseScalar(valueStr));
        }
      } else {
        // Not an array item, stop
        break;
      }
    }

    return arr;
  }

  private parseScalar(value: string): unknown {
    // Empty object literal
    if (value === '{}') {
      return {};
    }

    // Empty array literal
    if (value === '[]') {
      return [];
    }

    // Null
    if (value === 'null' || value === '~' || value === '') {
      return null;
    }

    // Boolean
    if (value === 'true' || value === 'yes' || value === 'on') {
      return true;
    }
    if (value === 'false' || value === 'no' || value === 'off') {
      return false;
    }

    // Number
    if (/^-?\d+$/.test(value)) {
      return parseInt(value, 10);
    }
    if (/^-?\d+\.\d+$/.test(value)) {
      return parseFloat(value);
    }

    // Date (ISO 8601)
    if (
      this.parseDates &&
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/.test(
        value
      )
    ) {
      return new Date(value);
    }

    // String (remove quotes if present)
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }

    return value;
  }

  private skipEmptyLines(): void {
    while (this.currentLine < this.lines.length) {
      const line = this.lines[this.currentLine]!;
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) {
        this.currentLine++;
      } else {
        break;
      }
    }
  }

  private getIndent(line: string): number {
    let indent = 0;
    for (const char of line) {
      if (char === ' ') {
        indent++;
      } else if (char === '\t') {
        indent += 2; // Treat tab as 2 spaces
      } else {
        break;
      }
    }
    return indent;
  }

  private peekNextIndent(): number {
    let nextLine = this.currentLine;
    while (nextLine < this.lines.length) {
      const line = this.lines[nextLine]!;
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        return this.getIndent(line);
      }
      nextLine++;
    }
    return 0;
  }

  private isNextLineIndented(baseIndent: number): boolean {
    const nextIndent = this.peekNextIndent();
    return nextIndent > baseIndent;
  }
}
