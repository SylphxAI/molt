/**
 * Benchmark: Unified Molt API vs Native JSON.parse
 *
 * This benchmark demonstrates the performance characteristics of the
 * new unified molt() API with smart detection compared to native JSON.parse
 * and the old HyperJSON API.
 */

import { describe, bench } from 'vitest';
import { molt } from '../src/molt.js';
import { HyperJSON } from '../src/index.js';
import { serialize } from '../src/serializer.js';

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

const dirtyJson = `{
  // User data
  name: 'alice',
  age: 30,
  tags: ['dev', 'ts',],
  active: true
}`;

const typedData = {
  created: new Date('2024-01-01'),
  id: 123456789012345678901n,
  count: 42,
  active: true,
};
const typedJson = JSON.stringify(serialize(typedData));

describe('Simple Valid JSON', () => {
  bench('Native JSON.parse (baseline)', () => {
    JSON.parse(simpleValidJson);
  });

  bench('molt.fast (no processing)', () => {
    molt.fast(simpleValidJson);
  });

  bench('molt (auto mode)', () => {
    molt(simpleValidJson);
  });

  bench('molt (explicit never/never)', () => {
    molt(simpleValidJson, { dirty: 'never', typed: 'never' });
  });

  bench('HyperJSON.parse (old API)', () => {
    HyperJSON.parse(simpleValidJson);
  });
});

describe('Complex Valid JSON', () => {
  bench('Native JSON.parse (baseline)', () => {
    JSON.parse(complexValidJson);
  });

  bench('molt.fast (no processing)', () => {
    molt.fast(complexValidJson);
  });

  bench('molt (auto mode)', () => {
    molt(complexValidJson);
  });

  bench('molt (explicit never/never)', () => {
    molt(complexValidJson, { dirty: 'never', typed: 'never' });
  });

  bench('HyperJSON.parse (old API)', () => {
    HyperJSON.parse(complexValidJson);
  });
});

describe('Dirty JSON', () => {
  bench('Native JSON.parse (FAILS)', () => {
    try {
      JSON.parse(dirtyJson);
    } catch {
      // Expected to fail
    }
  });

  bench('molt (auto mode)', () => {
    molt(dirtyJson);
  });

  bench('molt.dirty (explicit clean)', () => {
    molt.dirty(dirtyJson);
  });

  bench('molt (explicit always/never)', () => {
    molt(dirtyJson, { dirty: 'always', typed: 'never' });
  });

  bench('HyperJSON.parse (old API)', () => {
    HyperJSON.parse(dirtyJson);
  });
});

describe('Typed JSON', () => {
  bench('Native JSON.parse (loses types)', () => {
    JSON.parse(typedJson);
  });

  bench('molt (auto mode)', () => {
    molt(typedJson);
  });

  bench('molt.typed (explicit restore)', () => {
    molt.typed(typedJson);
  });

  bench('molt (explicit never/always)', () => {
    molt(typedJson, { dirty: 'never', typed: 'always' });
  });

  bench('HyperJSON.parse (old API)', () => {
    HyperJSON.parse(typedJson);
  });
});

describe('Auto Detection Overhead', () => {
  // Measure the overhead of auto detection for different scenarios
  const scenarios = [
    { name: 'Tiny (50B)', data: '{"a":1}' },
    { name: 'Small (500B)', data: JSON.stringify({ items: Array(10).fill({ id: 1, name: 'test' }) }) },
    { name: 'Medium (5KB)', data: JSON.stringify({ items: Array(100).fill({ id: 1, name: 'test' }) }) },
    { name: 'Large (50KB)', data: JSON.stringify({ items: Array(1000).fill({ id: 1, name: 'test' }) }) },
  ];

  for (const { name, data } of scenarios) {
    describe(name, () => {
      bench('Native JSON.parse', () => {
        JSON.parse(data);
      });

      bench('molt (auto detection)', () => {
        molt(data);
      });

      bench('molt.fast (no detection)', () => {
        molt.fast(data);
      });

      bench('Overhead %', () => {
        // This will show the relative overhead
        const native = JSON.parse(data);
        const withDetection = molt(data);
        return native === withDetection;
      });
    });
  }
});

describe('Stringify Performance', () => {
  const simpleObj = { name: 'alice', age: 30, active: true };
  const complexObj = {
    users: Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
    })),
  };

  describe('Simple Object (no types)', () => {
    bench('Native JSON.stringify', () => {
      JSON.stringify(simpleObj);
    });

    bench('molt.stringify (auto)', () => {
      molt.stringify(simpleObj);
    });

    bench('molt.stringify (never)', () => {
      molt.stringify(simpleObj, { typed: 'never' });
    });

    bench('HyperJSON.stringify (old API)', () => {
      HyperJSON.stringify(simpleObj);
    });
  });

  describe('Complex Object (no types)', () => {
    bench('Native JSON.stringify', () => {
      JSON.stringify(complexObj);
    });

    bench('molt.stringify (auto)', () => {
      molt.stringify(complexObj);
    });

    bench('molt.stringify (never)', () => {
      molt.stringify(complexObj, { typed: 'never' });
    });

    bench('HyperJSON.stringify (old API)', () => {
      HyperJSON.stringify(complexObj);
    });
  });

  describe('Typed Object', () => {
    bench('Native JSON.stringify (loses types)', () => {
      JSON.stringify(typedData);
    });

    bench('molt.stringify (auto)', () => {
      molt.stringify(typedData);
    });

    bench('molt.stringify (always)', () => {
      molt.stringify(typedData, { typed: 'always' });
    });

    bench('HyperJSON.stringify (old API)', () => {
      HyperJSON.stringify(typedData);
    });
  });
});

describe('Round-trip Performance', () => {
  const data = {
    user: {
      name: 'alice',
      createdAt: new Date('2024-01-01'),
      id: 123456789012345678901n,
    },
    items: Array.from({ length: 50 }, (_, i) => ({
      id: i,
      timestamp: new Date(`2024-01-${(i % 28) + 1}`),
      value: BigInt(i) * 1000n,
    })),
  };

  bench('molt round-trip (auto)', () => {
    const json = molt.stringify(data);
    molt(json);
  });

  bench('molt round-trip (explicit always)', () => {
    const json = molt.stringify(data, { typed: 'always' });
    molt(json, { typed: 'always' });
  });

  bench('molt.typed + molt.stringify', () => {
    const json = molt.stringify(data);
    molt.typed(json);
  });

  bench('HyperJSON round-trip (old API)', () => {
    const json = HyperJSON.stringify(data);
    HyperJSON.parse(json);
  });

  bench('Native round-trip (loses types)', () => {
    const json = JSON.stringify(data);
    JSON.parse(json);
  });
});

describe('Detection Function Performance', () => {
  const validJson = '{"name":"alice","age":30}';
  const dirtyJson = "{ name: 'alice', age: 30 }";
  const typedObj = { json: { date: '2024-01-01' }, meta: { values: { '.date': 'Date' } } };
  const normalObj = { name: 'alice', age: 30 };

  bench('detectDirty (valid JSON)', () => {
    molt(validJson);
  });

  bench('detectDirty (dirty JSON)', () => {
    molt(dirtyJson);
  });

  bench('hasTypeMetadata (typed)', () => {
    molt(JSON.stringify(typedObj));
  });

  bench('hasTypeMetadata (normal)', () => {
    molt(JSON.stringify(normalObj));
  });
});
