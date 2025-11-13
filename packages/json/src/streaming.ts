/**
 * Streaming API for parsing large JSON files
 */

import { cleanDirtyJSON } from './cleaner.js';
import { deserialize } from './serializer.js';
import type { CustomTypeTransformer, ParseOptions, TypedJSON } from './types.js';
import { ParseError } from './types.js';

/**
 * Parse a stream of JSON values
 * Supports:
 * - NDJSON (newline-delimited JSON)
 * - JSON arrays (streaming array elements)
 * - Concatenated JSON values
 */
export async function* parseStream(
  input: ReadableStream<Uint8Array> | AsyncIterable<string>,
  options: ParseOptions = {},
): AsyncGenerator<unknown, void, undefined> {
  const { cleanDirty = true, parseTypes = true, customTypes } = options;

  const decoder = new TextDecoder();
  let buffer = '';
  let depth = 0;
  let currentValue = '';
  let inString = false;
  let escaped = false;

  // Convert ReadableStream to AsyncIterable if needed
  const iterable =
    'getReader' in input
      ? (async function* () {
          const reader = input.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              yield decoder.decode(value, { stream: true });
            }
          } finally {
            reader.releaseLock();
          }
        })()
      : input;

  for await (const chunk of iterable) {
    buffer += chunk;

    // Process buffer
    let pos = 0;
    while (pos < buffer.length) {
      const char = buffer[pos];

      // Track string state
      if (!escaped && char === '"') {
        inString = !inString;
      }
      escaped = !escaped && char === '\\';

      // Skip processing inside strings
      if (inString) {
        currentValue += char;
        pos++;
        continue;
      }

      // Track depth
      if (char === '{' || char === '[') {
        if (depth === 0) {
          currentValue = '';
        }
        currentValue += char;
        depth++;
        pos++;
        continue;
      }

      if (char === '}' || char === ']') {
        currentValue += char;
        depth--;

        if (depth === 0) {
          // Complete value found
          const value = currentValue.trim();
          if (value) {
            yield* processValue(value, cleanDirty, parseTypes, customTypes);
          }
          currentValue = '';
        }
        pos++;
        continue;
      }

      // Handle top-level values and NDJSON
      if (depth === 0) {
        if (char === '\n') {
          // NDJSON: newline-delimited
          const value = currentValue.trim();
          if (value) {
            yield* processValue(value, cleanDirty, parseTypes, customTypes);
          }
          currentValue = '';
          pos++;
          continue;
        }

        if (char === ',' || char === ' ' || char === '\t' || char === '\r') {
          // Skip whitespace and commas between values
          const value = currentValue.trim();
          if (value) {
            yield* processValue(value, cleanDirty, parseTypes, customTypes);
            currentValue = '';
          }
          pos++;
          continue;
        }
      }

      currentValue += char;
      pos++;
    }

    // Clear processed buffer
    buffer = '';
  }

  // Process any remaining value
  const value = currentValue.trim();
  if (value) {
    yield* processValue(value, cleanDirty, parseTypes, customTypes);
  }
}

/**
 * Check if a value is a JSON array and yield its elements
 */
function* yieldArrayElements(value: unknown): Generator<unknown, void, undefined> {
  if (Array.isArray(value)) {
    for (const element of value) {
      yield element;
    }
  } else {
    yield value;
  }
}

/**
 * Process a single JSON value
 */
function* processValue(
  value: string,
  cleanDirty: boolean,
  parseTypes: boolean,
  customTypes?: CustomTypeTransformer[],
): Generator<unknown, void, undefined> {
  try {
    let jsonString = value;

    // Clean dirty JSON if enabled
    if (cleanDirty) {
      jsonString = cleanDirtyJSON(value);
    }

    // Parse JSON
    const parsed = JSON.parse(jsonString);

    // Reconstruct types if enabled
    if (parseTypes) {
      // Check if it's TypedJSON format
      if (
        parsed &&
        typeof parsed === 'object' &&
        'json' in parsed &&
        ('meta' in parsed || Object.keys(parsed).length === 1)
      ) {
        const deserialized = deserialize(parsed as TypedJSON, customTypes);
        // If result is an array, yield elements individually
        yield* yieldArrayElements(deserialized);
        return;
      }
    }

    // If parsed value is an array, yield elements individually
    yield* yieldArrayElements(parsed);
  } catch (error) {
    // Skip invalid values or throw based on options
    if (error instanceof SyntaxError) {
      throw new ParseError(`Invalid JSON: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Parse NDJSON (newline-delimited JSON)
 * More efficient for strict NDJSON format
 */
export async function* parseNDJSON(
  input: ReadableStream<Uint8Array> | AsyncIterable<string>,
  options: ParseOptions = {},
): AsyncGenerator<unknown, void, undefined> {
  const { cleanDirty = true, parseTypes = true, customTypes } = options;

  const decoder = new TextDecoder();
  let buffer = '';

  // Convert ReadableStream to AsyncIterable if needed
  const iterable =
    'getReader' in input
      ? (async function* () {
          const reader = input.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              yield decoder.decode(value, { stream: true });
            }
          } finally {
            reader.releaseLock();
          }
        })()
      : input;

  for await (const chunk of iterable) {
    buffer += chunk;

    // Split by newlines
    const lines = buffer.split('\n');

    // Keep last incomplete line in buffer
    buffer = lines.pop() || '';

    // Process complete lines
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue; // Skip empty lines

      try {
        let jsonString = trimmed;

        // Clean dirty JSON if enabled
        if (cleanDirty) {
          jsonString = cleanDirtyJSON(trimmed);
        }

        // Parse JSON
        const parsed = JSON.parse(jsonString);

        // Reconstruct types if enabled
        if (parseTypes) {
          // Check if it's TypedJSON format
          if (
            parsed &&
            typeof parsed === 'object' &&
            'json' in parsed &&
            ('meta' in parsed || Object.keys(parsed).length === 1)
          ) {
            yield deserialize(parsed as TypedJSON, customTypes);
            continue;
          }
        }

        yield parsed;
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new ParseError(`Invalid NDJSON line: ${error.message}`);
        }
        throw error;
      }
    }
  }

  // Process remaining buffer
  const trimmed = buffer.trim();
  if (trimmed) {
    try {
      let jsonString = trimmed;

      if (cleanDirty) {
        jsonString = cleanDirtyJSON(trimmed);
      }

      const parsed = JSON.parse(jsonString);

      if (parseTypes) {
        if (
          parsed &&
          typeof parsed === 'object' &&
          'json' in parsed &&
          ('meta' in parsed || Object.keys(parsed).length === 1)
        ) {
          yield deserialize(parsed as TypedJSON, customTypes);
          return;
        }
      }

      yield parsed;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new ParseError(`Invalid NDJSON line: ${error.message}`);
      }
      throw error;
    }
  }
}

/**
 * Parse a JSON array in streaming fashion
 * Yields each element of the array without loading the entire array into memory
 */
export async function* parseJSONArray(
  input: ReadableStream<Uint8Array> | AsyncIterable<string>,
  options: ParseOptions = {},
): AsyncGenerator<unknown, void, undefined> {
  const { cleanDirty = true, parseTypes = true, customTypes } = options;

  const decoder = new TextDecoder();
  let buffer = '';
  let depth = 0;
  let currentValue = '';
  let inString = false;
  let escaped = false;
  let inArray = false;

  // Convert ReadableStream to AsyncIterable if needed
  const iterable =
    'getReader' in input
      ? (async function* () {
          const reader = input.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              yield decoder.decode(value, { stream: true });
            }
          } finally {
            reader.releaseLock();
          }
        })()
      : input;

  for await (const chunk of iterable) {
    buffer += chunk;

    let pos = 0;
    while (pos < buffer.length) {
      const char = buffer[pos];

      // Track string state
      if (!escaped && char === '"') {
        inString = !inString;
      }
      escaped = !escaped && char === '\\';

      // Skip processing inside strings
      if (inString) {
        currentValue += char;
        pos++;
        continue;
      }

      // Start of array
      if (!inArray && char === '[') {
        inArray = true;
        pos++;
        continue;
      }

      // End of array
      if (inArray && depth === 0 && char === ']') {
        // Process last value if any
        const value = currentValue.trim();
        if (value) {
          yield* processValue(value, cleanDirty, parseTypes, customTypes);
        }
        return;
      }

      // Track depth for nested structures
      if (char === '{' || char === '[') {
        if (depth === 0) {
          currentValue = '';
        }
        currentValue += char;
        depth++;
        pos++;
        continue;
      }

      if (char === '}' || char === ']') {
        currentValue += char;
        depth--;

        if (depth === 0) {
          // Complete element found
          const value = currentValue.trim();
          if (value) {
            yield* processValue(value, cleanDirty, parseTypes, customTypes);
          }
          currentValue = '';
        }
        pos++;
        continue;
      }

      // Handle top-level array elements
      if (inArray && depth === 0) {
        if (char === ',') {
          // Element separator
          const value = currentValue.trim();
          if (value) {
            yield* processValue(value, cleanDirty, parseTypes, customTypes);
          }
          currentValue = '';
          pos++;
          continue;
        }

        if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
          // Skip whitespace
          pos++;
          continue;
        }
      }

      currentValue += char;
      pos++;
    }

    // Clear processed buffer
    buffer = '';
  }
}
