/**
 * Benchmark: molt-json vs Node.js native JSON.parse
 *
 * This benchmark measures the overhead of our implementation
 * compared to V8's highly optimized native JSON parser.
 */

import { describe, bench } from 'vitest';
import { HyperJSON } from '../src/index.js';
import { cleanDirtyJSON } from '../src/cleaner.js';
import { serialize, deserialize } from '../src/serializer.js';

// Test data
const simpleValidJson = '{"name":"alice","age":30,"active":true}';
const complexValidJson = JSON.stringify({
  users: Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `User ${i}`,
    email: `user${i}@example.com`,
    active: i % 2 === 0,
  })),
  total: 100,
  page: 1,
});

const typedData = {
  created: new Date('2024-01-01'),
  id: 123456789012345678901n,
  count: 42,
  active: true,
};
const typedJson = JSON.stringify(serialize(typedData));

const dirtyJson = `{
  // Comment
  name: 'alice',
  age: 30,
  tags: ['dev', 'ts',],
}`;

describe('vs Native JSON.parse', () => {
  describe('Simple Valid JSON', () => {
    bench('Native JSON.parse (baseline)', () => {
      JSON.parse(simpleValidJson);
    });

    bench('HyperJSON.parse (no dirty, no types)', () => {
      HyperJSON.parse(simpleValidJson, { cleanDirty: false, parseTypes: false });
    });

    bench('HyperJSON.parse (with dirty check)', () => {
      HyperJSON.parse(simpleValidJson, { cleanDirty: true, parseTypes: false });
    });

    bench('HyperJSON.parse (full pipeline)', () => {
      HyperJSON.parse(simpleValidJson);
    });
  });

  describe('Complex Valid JSON', () => {
    bench('Native JSON.parse (baseline)', () => {
      JSON.parse(complexValidJson);
    });

    bench('HyperJSON.parse (no dirty, no types)', () => {
      HyperJSON.parse(complexValidJson, { cleanDirty: false, parseTypes: false });
    });

    bench('HyperJSON.parse (full pipeline)', () => {
      HyperJSON.parse(complexValidJson);
    });
  });

  describe('Dirty JSON (Native fails)', () => {
    bench('Native JSON.parse (FAILS)', () => {
      try {
        JSON.parse(dirtyJson);
      } catch {
        // Expected to fail
      }
    });

    bench('Clean + Native parse', () => {
      const cleaned = cleanDirtyJSON(dirtyJson);
      JSON.parse(cleaned);
    });

    bench('HyperJSON.parse (handles dirty)', () => {
      HyperJSON.parse(dirtyJson);
    });
  });

  describe('Typed JSON', () => {
    bench('Native JSON.parse (loses types)', () => {
      JSON.parse(typedJson);
    });

    bench('Native + manual type restoration', () => {
      const obj = JSON.parse(typedJson);
      deserialize(obj);
    });

    bench('HyperJSON.parse (auto restore types)', () => {
      HyperJSON.parse(typedJson);
    });
  });
});

describe('vs Native JSON.stringify', () => {
  const simpleObj = { name: 'alice', age: 30, active: true };
  const complexObj = {
    users: Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
    })),
  };

  describe('Simple Object (no types)', () => {
    bench('Native JSON.stringify (baseline)', () => {
      JSON.stringify(simpleObj);
    });

    bench('HyperJSON.stringify (no types)', () => {
      HyperJSON.stringify(simpleObj, { includeTypes: false });
    });

    bench('HyperJSON.stringify (with type check)', () => {
      HyperJSON.stringify(simpleObj, { includeTypes: true });
    });
  });

  describe('Complex Object (no types)', () => {
    bench('Native JSON.stringify (baseline)', () => {
      JSON.stringify(complexObj);
    });

    bench('HyperJSON.stringify (no types)', () => {
      HyperJSON.stringify(complexObj, { includeTypes: false });
    });
  });

  describe('Typed Object', () => {
    bench('Native JSON.stringify (loses types)', () => {
      JSON.stringify(typedData);
    });

    bench('Serialize + Native stringify', () => {
      const typed = serialize(typedData);
      JSON.stringify(typed);
    });

    bench('HyperJSON.stringify (preserves types)', () => {
      HyperJSON.stringify(typedData);
    });
  });
});

describe('Overhead Analysis', () => {
  // Measure overhead at different sizes
  const sizes = [10, 100, 1000, 10000];

  for (const size of sizes) {
    const data = JSON.stringify({
      items: Array.from({ length: size }, (_, i) => ({
        id: i,
        value: i * 10,
      })),
    });

    describe(`${size} items (~${Math.floor(data.length / 1024)}KB)`, () => {
      bench('Native JSON.parse', () => {
        JSON.parse(data);
      });

      bench('HyperJSON.parse (minimal)', () => {
        HyperJSON.parse(data, { cleanDirty: false, parseTypes: false });
      });

      bench('HyperJSON.parse (full)', () => {
        HyperJSON.parse(data);
      });
    });
  }
});
