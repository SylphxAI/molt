/**
 * Benchmark: WASM vs TypeScript vs Native
 *
 * This benchmark compares:
 * 1. Native JSON.parse (V8 baseline)
 * 2. TypeScript implementation (dirty cleaning)
 * 3. WASM implementation (Rust compiled)
 *
 * Goal: See if WASM can beat TypeScript, and how close we get to native
 */

import { describe, bench } from 'vitest';
import { cleanDirtyJSON } from '../src/cleaner.js';
import { cleanWithWasm, disableWasm, enableWasm } from '../src/wasm-loader.js';

// Test data - different sizes and complexity
const simpleValid = '{"name":"alice","age":30,"active":true}';

const simpleDirty = `{ name: 'alice', age: 30, active: true }`;

const mediumDirty = `{
  // User profile
  name: 'alice',
  email: 'alice@example.com',
  age: 30,
  tags: ['developer', 'typescript',],
  settings: {
    theme: 'dark',
    notifications: true,
  },
}`;

const complexDirty = `{
  // API response
  users: [
    { id: 1, name: 'alice', email: 'alice@example.com', active: true, },
    { id: 2, name: 'bob', email: 'bob@example.com', active: false, },
    { id: 3, name: 'charlie', email: 'charlie@example.com', active: true, },
    { id: 4, name: 'david', email: 'david@example.com', active: true, },
    { id: 5, name: 'eve', email: 'eve@example.com', active: false, },
  ],
  total: 5,
  page: 1,
  /* Metadata */
  hasMore: true,
}`;

// Generate large dirty JSON
function generateLargeDirty(itemCount: number): string {
  const items = [];
  for (let i = 0; i < itemCount; i++) {
    items.push(`{
      id: ${i},
      name: 'User ${i}',
      email: 'user${i}@example.com',
      score: ${Math.random() * 100},
      active: ${i % 2 === 0},
    }`);
  }
  return `{
    // Large dataset
    items: [${items.join(',\n')}],
    total: ${itemCount},
  }`;
}

const large100 = generateLargeDirty(100);
const large1000 = generateLargeDirty(1000);

describe('Simple Valid JSON (Native baseline)', () => {
  bench('Native JSON.parse', () => {
    JSON.parse(simpleValid);
  });

  bench('TypeScript (unnecessary clean)', () => {
    const cleaned = cleanDirtyJSON(simpleValid);
    JSON.parse(cleaned);
  });

  bench('WASM (unnecessary clean)', async () => {
    const cleaned = await cleanWithWasm(simpleValid);
    JSON.parse(cleaned);
  });
});

describe('Simple Dirty JSON', () => {
  bench('Native JSON.parse (FAILS)', () => {
    try {
      JSON.parse(simpleDirty);
    } catch {
      // Expected to fail
    }
  });

  bench('TypeScript clean + parse', () => {
    const cleaned = cleanDirtyJSON(simpleDirty);
    JSON.parse(cleaned);
  });

  bench('WASM clean + parse', async () => {
    const cleaned = await cleanWithWasm(simpleDirty);
    JSON.parse(cleaned);
  });
});

describe('Medium Dirty JSON (~200 chars)', () => {
  bench('TypeScript clean + parse', () => {
    const cleaned = cleanDirtyJSON(mediumDirty);
    JSON.parse(cleaned);
  });

  bench('WASM clean + parse', async () => {
    const cleaned = await cleanWithWasm(mediumDirty);
    JSON.parse(cleaned);
  });

  bench('Speedup ratio', () => {
    // This will show relative performance
    const tsStart = Date.now();
    const tsResult = cleanDirtyJSON(mediumDirty);
    JSON.parse(tsResult);
    const tsTime = Date.now() - tsStart;
    return tsTime;
  });
});

describe('Complex Dirty JSON (~500 chars)', () => {
  bench('TypeScript clean + parse', () => {
    const cleaned = cleanDirtyJSON(complexDirty);
    JSON.parse(cleaned);
  });

  bench('WASM clean + parse', async () => {
    const cleaned = await cleanWithWasm(complexDirty);
    JSON.parse(cleaned);
  });
});

describe('Large Dirty JSON - 100 items (~5KB)', () => {
  bench('TypeScript clean + parse', () => {
    const cleaned = cleanDirtyJSON(large100);
    JSON.parse(cleaned);
  });

  bench('WASM clean + parse', async () => {
    const cleaned = await cleanWithWasm(large100);
    JSON.parse(cleaned);
  });

  bench('Native JSON.parse (if it were valid)', () => {
    // Baseline: what if the data were already clean?
    const cleaned = cleanDirtyJSON(large100);
    JSON.parse(cleaned);
  });
});

describe('Large Dirty JSON - 1000 items (~50KB)', () => {
  bench('TypeScript clean + parse', () => {
    const cleaned = cleanDirtyJSON(large1000);
    JSON.parse(cleaned);
  });

  bench('WASM clean + parse', async () => {
    const cleaned = await cleanWithWasm(large1000);
    JSON.parse(cleaned);
  });
});

describe('Cleaning Only (no parse)', () => {
  describe('Simple', () => {
    bench('TypeScript clean', () => {
      cleanDirtyJSON(simpleDirty);
    });

    bench('WASM clean', async () => {
      await cleanWithWasm(simpleDirty);
    });
  });

  describe('Medium', () => {
    bench('TypeScript clean', () => {
      cleanDirtyJSON(mediumDirty);
    });

    bench('WASM clean', async () => {
      await cleanWithWasm(mediumDirty);
    });
  });

  describe('Complex', () => {
    bench('TypeScript clean', () => {
      cleanDirtyJSON(complexDirty);
    });

    bench('WASM clean', async () => {
      await cleanWithWasm(complexDirty);
    });
  });

  describe('Large 100', () => {
    bench('TypeScript clean', () => {
      cleanDirtyJSON(large100);
    });

    bench('WASM clean', async () => {
      await cleanWithWasm(large100);
    });
  });

  describe('Large 1000', () => {
    bench('TypeScript clean', () => {
      cleanDirtyJSON(large1000);
    });

    bench('WASM clean', async () => {
      await cleanWithWasm(large1000);
    });
  });
});

describe('WASM Overhead Analysis', () => {
  bench('WASM initialization cost', async () => {
    disableWasm();
    enableWasm();
    await cleanWithWasm(simpleDirty);
  });

  bench('TypeScript (no init needed)', () => {
    cleanDirtyJSON(simpleDirty);
  });
});
