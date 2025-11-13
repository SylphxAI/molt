/**
 * INI Parser
 *
 * Fast INI format parser with support for sections, comments, and type coercion
 */

import type { ParseINIOptions, INIData } from './types.js';
import { ParseError } from './types.js';

/**
 * Parse INI string to object
 *
 * @param input - INI string
 * @param options - Parse options
 * @returns Parsed object
 */
export function parseINI(input: string, options: ParseINIOptions = {}): INIData {
  const {
    allowSections = true,
    allowComments = true,
    commentPrefixes = [';', '#'],
    parseTypes = true,
    multiLine = false,
    trim = true,
    allowDuplicates = true,
    inlineComments = false,
  } = options;

  const result: INIData = {};
  let currentSection = '';
  const lines = input.split(/\r?\n/);
  let lineNumber = 0;

  for (let i = 0; i < lines.length; i++) {
    lineNumber = i + 1;
    let line = lines[i]!;

    // Skip empty lines
    if (!line || (trim && !line.trim())) {
      continue;
    }

    if (trim) {
      line = line.trim();
    }

    // Skip comment lines
    if (allowComments && commentPrefixes.some((prefix) => line.startsWith(prefix))) {
      continue;
    }

    // Parse section header [section]
    if (allowSections && line.startsWith('[') && line.endsWith(']')) {
      currentSection = line.slice(1, -1);
      if (trim) {
        currentSection = currentSection.trim();
      }
      if (!result[currentSection]) {
        result[currentSection] = {};
      }
      continue;
    }

    // Parse key-value pair
    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) {
      // No = found, skip or throw based on strictness
      continue;
    }

    let key = line.slice(0, equalIndex);
    let value = line.slice(equalIndex + 1);

    if (trim) {
      key = key.trim();
      value = value.trim();
    }

    // Handle inline comments
    if (allowComments && inlineComments) {
      for (const prefix of commentPrefixes) {
        const commentIndex = value.indexOf(prefix);
        if (commentIndex !== -1) {
          value = value.slice(0, commentIndex);
          if (trim) {
            value = value.trim();
          }
          break;
        }
      }
    }

    // Handle multi-line values
    if (multiLine && value.endsWith('\\')) {
      const multiLineValue: string[] = [value.slice(0, -1)];
      while (i + 1 < lines.length) {
        i++;
        lineNumber++;
        let nextLine = lines[i]!;
        if (trim) {
          nextLine = nextLine.trim();
        }
        if (nextLine.endsWith('\\')) {
          multiLineValue.push(nextLine.slice(0, -1));
        } else {
          multiLineValue.push(nextLine);
          break;
        }
      }
      value = multiLineValue.join('\n');
    }

    // Parse typed values
    let parsedValue: string | number | boolean | null = value;
    if (parseTypes) {
      parsedValue = parseValue(value);
    }

    // Store value
    const section = currentSection || '';
    if (!result[section]) {
      result[section] = {};
    }

    // Handle duplicates
    if (!allowDuplicates && key in result[section]!) {
      throw new ParseError(`Duplicate key "${key}"`, lineNumber);
    }

    result[section]![key] = parsedValue;
  }

  return result;
}

/**
 * Parse value to appropriate type
 */
function parseValue(value: string): string | number | boolean | null {
  // Null/undefined
  if (value === 'null' || value === 'nil' || value === 'undefined') {
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
    return Number.parseInt(value, 10);
  }
  if (/^-?\d+\.\d+$/.test(value)) {
    return Number.parseFloat(value);
  }

  // Quoted string - remove quotes
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
