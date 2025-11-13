/**
 * Benchmark: WASM SIMD vs Regular WASM
 *
 * This benchmark compares:
 * 1. WASM with SIMD-accelerated two-stage parser
 * 2. WASM with regular token-by-token parser
 * 3. TypeScript implementation (baseline)
 * 4. Native JSON.parse (reference)
 *
 * Goal: Measure SIMD performance improvements from simdjson-style optimizations
 */

import { describe, bench } from 'vitest';
import { cleanDirtyJSON } from '../src/cleaner.js';
import { cleanWithWasm, cleanWithWasmSimd } from '../src/wasm-loader.js';

// Test data - different sizes to see where SIMD wins
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
      /* Comment ${i} */
    }`);
  }
  return `{
    // Large dataset
    items: [${items.join(',\n')}],
    total: ${itemCount},
  }`;
}

const large100 = generateLargeDirty(100);    // ~5KB
const large1000 = generateLargeDirty(1000);  // ~50KB
const large5000 = generateLargeDirty(5000);  // ~250KB

describe('Small Data (~50 chars) - SIMD Overhead Test', () => {
  bench('TypeScript', () => {
    cleanDirtyJSON(simpleDirty);
  });

  bench('WASM (regular)', async () => {
    await cleanWithWasm(simpleDirty);
  });

  bench('WASM (SIMD)', async () => {
    await cleanWithWasmSimd(simpleDirty);
  });

  bench('Native (reference)', () => {
    try {
      JSON.parse(simpleDirty);
    } catch {
      // Expected to fail
    }
  });
});

describe('Medium Data (~200 chars) - Crossover Point', () => {
  bench('TypeScript', () => {
    cleanDirtyJSON(mediumDirty);
  });

  bench('WASM (regular)', async () => {
    await cleanWithWasm(mediumDirty);
  });

  bench('WASM (SIMD)', async () => {
    await cleanWithWasmSimd(mediumDirty);
  });
});

describe('Complex Data (~500 chars) - SIMD Starts Winning', () => {
  bench('TypeScript', () => {
    cleanDirtyJSON(complexDirty);
  });

  bench('WASM (regular)', async () => {
    await cleanWithWasm(complexDirty);
  });

  bench('WASM (SIMD)', async () => {
    await cleanWithWasmSimd(complexDirty);
  });
});

describe('Large 100 (~5KB) - SIMD Sweet Spot', () => {
  bench('TypeScript', () => {
    cleanDirtyJSON(large100);
  });

  bench('WASM (regular)', async () => {
    await cleanWithWasm(large100);
  });

  bench('WASM (SIMD)', async () => {
    await cleanWithWasmSimd(large100);
  });
});

describe('Large 1000 (~50KB) - SIMD Dominates', () => {
  bench('TypeScript', () => {
    cleanDirtyJSON(large1000);
  });

  bench('WASM (regular)', async () => {
    await cleanWithWasm(large1000);
  });

  bench('WASM (SIMD)', async () => {
    await cleanWithWasmSimd(large1000);
  });
});

describe('Large 5000 (~250KB) - Maximum SIMD Advantage', () => {
  bench('TypeScript', () => {
    cleanDirtyJSON(large5000);
  });

  bench('WASM (regular)', async () => {
    await cleanWithWasm(large5000);
  });

  bench('WASM (SIMD)', async () => {
    await cleanWithWasmSimd(large5000);
  });
});

describe('Structural Scanning Only (SIMD core benefit)', () => {
  const structuralChars = '{[{[{[{[{[{[{[{[{[{[{[{[{[{[{[{[{[';
  const mixed = '{ "a": 1, "b": [2, 3], "c": { "d": 4 } }';

  bench('Heavy structural (WASM regular)', async () => {
    await cleanWithWasm(structuralChars);
  });

  bench('Heavy structural (WASM SIMD)', async () => {
    await cleanWithWasmSimd(structuralChars);
  });

  bench('Mixed content (WASM regular)', async () => {
    await cleanWithWasm(mixed);
  });

  bench('Mixed content (WASM SIMD)', async () => {
    await cleanWithWasmSimd(mixed);
  });
});

describe('Real-World Scenarios', () => {
  const config = `{
    // Application config
    name: 'MyApp',
    version: '1.0.0',
    features: {
      auth: true,
      payments: false,
      notifications: {
        email: true,
        push: false,
        /* SMS disabled */
      },
    },
    limits: {
      maxUsers: 1000,
      maxStorage: 0xFF,  // 255 GB
    },
  }`;

  const logEntry = `{
    timestamp: 1699876543,
    level: 'info',
    message: "User logged in",
    user: { id: 123, name: 'alice' },
    metadata: {
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      /* Extra data */
    },
  }`;

  bench('Config file (TypeScript)', () => {
    cleanDirtyJSON(config);
  });

  bench('Config file (WASM regular)', async () => {
    await cleanWithWasm(config);
  });

  bench('Config file (WASM SIMD)', async () => {
    await cleanWithWasmSimd(config);
  });

  bench('Log entry (TypeScript)', () => {
    cleanDirtyJSON(logEntry);
  });

  bench('Log entry (WASM regular)', async () => {
    await cleanWithWasm(logEntry);
  });

  bench('Log entry (WASM SIMD)', async () => {
    await cleanWithWasmSimd(logEntry);
  });
});
