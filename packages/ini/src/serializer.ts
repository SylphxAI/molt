/**
 * INI Serializer
 *
 * Fast INI format serializer with formatting options
 */

import type { SerializeINIOptions, INIData } from './types.js';

/**
 * Serialize object to INI string
 *
 * @param data - Object to serialize
 * @param options - Serialization options
 * @returns INI string
 */
export function serializeINI(data: INIData, options: SerializeINIOptions = {}): string {
  const {
    sections = true,
    whitespace = ' = ',
    lineEnding = '\n',
    sortSections = false,
    sortKeys = false,
    headerComment,
  } = options;

  const lines: string[] = [];

  // Add header comment
  if (headerComment) {
    const commentLines = headerComment.split('\n');
    for (const line of commentLines) {
      lines.push(`; ${line}`);
    }
    lines.push('');
  }

  // Get section names
  let sectionNames = Object.keys(data);
  if (sortSections) {
    sectionNames = sectionNames.sort();
  }

  for (let i = 0; i < sectionNames.length; i++) {
    const sectionName = sectionNames[i]!;
    const sectionData = data[sectionName]!;

    // Add section header (skip for empty section name if not using sections)
    if (sections && sectionName) {
      if (i > 0) {
        lines.push(''); // Empty line before section
      }
      lines.push(`[${sectionName}]`);
    }

    // Get keys
    let keys = Object.keys(sectionData);
    if (sortKeys) {
      keys = keys.sort();
    }

    // Add key-value pairs
    for (const key of keys) {
      const value = sectionData[key];
      const serializedValue = serializeValue(value);
      lines.push(`${key}${whitespace}${serializedValue}`);
    }
  }

  return lines.join(lineEnding);
}

/**
 * Serialize value to string
 */
function serializeValue(value: unknown): string {
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
    if (
      value.includes('\n') ||
      value.includes(';') ||
      value.includes('#') ||
      value.includes('=') ||
      value.includes('\\') ||
      value.startsWith(' ') ||
      value.endsWith(' ')
    ) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }

  // Fallback to JSON stringify
  return JSON.stringify(value);
}
