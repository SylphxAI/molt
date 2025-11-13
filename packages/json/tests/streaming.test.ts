import { describe, expect, it } from 'vitest';
import { parseJSONArray, parseNDJSON, parseStream } from '../src/streaming.js';

// Helper to create async iterable from string
async function* stringToAsyncIterable(str: string, chunkSize = 10) {
  for (let i = 0; i < str.length; i += chunkSize) {
    yield str.slice(i, i + chunkSize);
  }
}

// Helper to create ReadableStream from string
function stringToReadableStream(str: string, chunkSize = 10): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let pos = 0;

  return new ReadableStream({
    pull(controller) {
      if (pos >= str.length) {
        controller.close();
        return;
      }

      const chunk = str.slice(pos, pos + chunkSize);
      controller.enqueue(encoder.encode(chunk));
      pos += chunkSize;
    },
  });
}

describe('parseNDJSON', () => {
  it('should parse newline-delimited JSON', async () => {
    const ndjson = `{"a":1}\n{"b":2}\n{"c":3}`;
    const results = [];

    for await (const value of parseNDJSON(stringToAsyncIterable(ndjson))) {
      results.push(value);
    }

    expect(results).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });

  it('should handle empty lines', async () => {
    const ndjson = `{"a":1}\n\n{"b":2}\n\n\n{"c":3}`;
    const results = [];

    for await (const value of parseNDJSON(stringToAsyncIterable(ndjson))) {
      results.push(value);
    }

    expect(results).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });

  it('should parse dirty NDJSON', async () => {
    const ndjson = `{a: 1, b: 'hello'}\n{c: 2, d: 'world'}`;
    const results = [];

    for await (const value of parseNDJSON(stringToAsyncIterable(ndjson))) {
      results.push(value);
    }

    expect(results).toEqual([
      { a: 1, b: 'hello' },
      { c: 2, d: 'world' },
    ]);
  });

  it('should handle typed JSON in NDJSON', async () => {
    const date = new Date('2024-01-01');
    const typedJSON1 = JSON.stringify({
      json: date.toISOString(),
      meta: { values: { '': 'Date' } },
    });
    const typedJSON2 = JSON.stringify({
      json: '123',
      meta: { values: { '': 'bigint' } },
    });

    const ndjson = `${typedJSON1}\n${typedJSON2}`;
    const results = [];

    for await (const value of parseNDJSON(stringToAsyncIterable(ndjson))) {
      results.push(value);
    }

    expect(results[0]).toEqual(date);
    expect(results[1]).toEqual(123n);
  });

  it('should work with ReadableStream', async () => {
    const ndjson = `{"a":1}\n{"b":2}\n{"c":3}`;
    const stream = stringToReadableStream(ndjson);
    const results = [];

    for await (const value of parseNDJSON(stream)) {
      results.push(value);
    }

    expect(results).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });
});

describe('parseJSONArray', () => {
  it('should parse JSON array elements', async () => {
    const json = `[{"a":1},{"b":2},{"c":3}]`;
    const results = [];

    for await (const value of parseJSONArray(stringToAsyncIterable(json))) {
      results.push(value);
    }

    expect(results).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });

  it('should handle nested arrays', async () => {
    const json = `[{"arr":[1,2,3]},{"arr":[4,5,6]}]`;
    const results = [];

    for await (const value of parseJSONArray(stringToAsyncIterable(json))) {
      results.push(value);
    }

    expect(results).toEqual([{ arr: [1, 2, 3] }, { arr: [4, 5, 6] }]);
  });

  it('should handle nested objects', async () => {
    const json = `[{"nested":{"a":1}},{"nested":{"b":2}}]`;
    const results = [];

    for await (const value of parseJSONArray(stringToAsyncIterable(json))) {
      results.push(value);
    }

    expect(results).toEqual([{ nested: { a: 1 } }, { nested: { b: 2 } }]);
  });

  it('should parse dirty JSON array', async () => {
    const json = `[{a: 1, b: 'hello'}, {c: 2, d: 'world'}]`;
    const results = [];

    for await (const value of parseJSONArray(stringToAsyncIterable(json))) {
      results.push(value);
    }

    expect(results).toEqual([
      { a: 1, b: 'hello' },
      { c: 2, d: 'world' },
    ]);
  });

  it('should handle arrays with whitespace', async () => {
    const json = `[
      {"a":1},
      {"b":2},
      {"c":3}
    ]`;
    const results = [];

    for await (const value of parseJSONArray(stringToAsyncIterable(json))) {
      results.push(value);
    }

    expect(results).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });

  it('should work with ReadableStream', async () => {
    const json = `[{"a":1},{"b":2},{"c":3}]`;
    const stream = stringToReadableStream(json);
    const results = [];

    for await (const value of parseJSONArray(stream)) {
      results.push(value);
    }

    expect(results).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });
});

describe('parseStream', () => {
  it('should parse concatenated JSON objects', async () => {
    const json = `{"a":1}{"b":2}{"c":3}`;
    const results = [];

    for await (const value of parseStream(stringToAsyncIterable(json))) {
      results.push(value);
    }

    expect(results).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });

  it('should parse NDJSON format', async () => {
    const json = `{"a":1}\n{"b":2}\n{"c":3}`;
    const results = [];

    for await (const value of parseStream(stringToAsyncIterable(json))) {
      results.push(value);
    }

    expect(results).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });

  it('should parse JSON array', async () => {
    const json = `[{"a":1},{"b":2},{"c":3}]`;
    const results = [];

    for await (const value of parseStream(stringToAsyncIterable(json))) {
      results.push(value);
    }

    expect(results).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });

  it('should handle mixed formats', async () => {
    const json = `{"a":1}\n[{"b":2},{"c":3}]\n{"d":4}`;
    const results = [];

    for await (const value of parseStream(stringToAsyncIterable(json))) {
      results.push(value);
    }

    expect(results).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }]);
  });

  it('should parse dirty JSON stream', async () => {
    const json = `{a: 1}\n{b: 'hello', c: true}`;
    const results = [];

    for await (const value of parseStream(stringToAsyncIterable(json))) {
      results.push(value);
    }

    expect(results).toEqual([{ a: 1 }, { b: 'hello', c: true }]);
  });

  it('should handle strings with special characters', async () => {
    const json = `{"text":"hello\\nworld"}{"value":123}`;
    const results = [];

    for await (const value of parseStream(stringToAsyncIterable(json))) {
      results.push(value);
    }

    expect(results).toEqual([{ text: 'hello\nworld' }, { value: 123 }]);
  });

  it('should work with ReadableStream', async () => {
    const json = `{"a":1}{"b":2}{"c":3}`;
    const stream = stringToReadableStream(json);
    const results = [];

    for await (const value of parseStream(stream)) {
      results.push(value);
    }

    expect(results).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });

  it('should handle large objects split across chunks', async () => {
    const largeObj = {
      data: 'a'.repeat(100),
      nested: {
        value: 123,
        array: [1, 2, 3, 4, 5],
      },
    };
    const json = JSON.stringify(largeObj);
    const results = [];

    for await (const value of parseStream(stringToAsyncIterable(json, 5))) {
      results.push(value);
    }

    expect(results).toEqual([largeObj]);
  });
});
