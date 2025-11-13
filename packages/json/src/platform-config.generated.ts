// Auto-generated platform-specific configuration
// Generated on: 2025-11-13T03:39:16.808Z
// Platform: darwin arm64
// Runtime: v24.3.0

import { cleanDirtyJSON } from './cleaner.js';
import { cleanWithWasm, cleanWithWasmSimd } from './wasm-loader.js';
import type { EngineStrategy } from './engine-selector.js';

export const PLATFORM_STRATEGIES: EngineStrategy[] = [
  { minSize: 0, maxSize: Infinity, clean: cleanDirtyJSON, name: 'TypeScript' }
];

export const BENCHMARK_RESULTS = [
  {
    "size": 100,
    "typescript": 0.0023735830000000007,
    "fastest": "typescript"
  },
  {
    "size": 500,
    "typescript": 0.0021123329999999997,
    "fastest": "typescript"
  },
  {
    "size": 1000,
    "typescript": 0.003395419999999998,
    "fastest": "typescript"
  },
  {
    "size": 5000,
    "typescript": 0.015488330000000002,
    "fastest": "typescript"
  },
  {
    "size": 10000,
    "typescript": 0.029199999999999983,
    "fastest": "typescript"
  },
  {
    "size": 50000,
    "typescript": 0.11842090000000009,
    "fastest": "typescript"
  },
  {
    "size": 100000,
    "typescript": 0.28842089999999987,
    "fastest": "typescript"
  }
];
