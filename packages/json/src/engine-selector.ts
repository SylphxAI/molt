/**
 * Smart engine selector - automatically chooses the best implementation
 * based on data size, platform, and runtime capabilities
 */

import { cleanDirtyJSON as tsClean } from './cleaner.js';
import { cleanWithWasm, cleanWithWasmSimd, isWasmAvailable } from './wasm-loader.js';

/**
 * Engine selection strategy
 */
export interface EngineStrategy {
  /** Minimum data size (bytes) to use this engine */
  minSize: number;
  /** Maximum data size (bytes) to use this engine (Infinity for no limit) */
  maxSize: number;
  /** Clean function */
  clean: (input: string) => Promise<string> | string;
  /** Engine name for debugging */
  name: string;
}

/**
 * Default engine strategies (can be customized)
 */
const DEFAULT_STRATEGIES: EngineStrategy[] = [
  {
    minSize: 0,
    maxSize: 5000, // < 5KB: TypeScript is fastest
    clean: (input) => tsClean(input),
    name: 'TypeScript',
  },
  {
    minSize: 5000,
    maxSize: 100000, // 5KB - 100KB: Regular WASM is competitive
    clean: cleanWithWasm,
    name: 'WASM',
  },
  {
    minSize: 100000,
    maxSize: Infinity, // > 100KB: Try SIMD (may help on some platforms)
    clean: cleanWithWasmSimd,
    name: 'WASM-SIMD',
  },
];

/**
 * Runtime performance cache
 * Stores actual measured performance for different engines on this platform
 */
interface PerformanceCache {
  [engine: string]: {
    avgTime: number; // Average time in ms
    samples: number;
  };
}

let perfCache: PerformanceCache = {};
let customStrategies: EngineStrategy[] | null = null;

/**
 * Select the best engine for the given input
 *
 * @param input - Input string to clean
 * @param strategies - Custom strategies (optional)
 * @returns Selected engine strategy
 */
function selectEngine(
  input: string,
  strategies: EngineStrategy[] = customStrategies || DEFAULT_STRATEGIES
): EngineStrategy {
  const size = input.length;

  // Find matching strategy based on size
  for (const strategy of strategies) {
    if (size >= strategy.minSize && size < strategy.maxSize) {
      return strategy;
    }
  }

  // Fallback to TypeScript (first strategy or default)
  const fallback = strategies[0] || DEFAULT_STRATEGIES[0];
  if (!fallback) {
    throw new Error('No engine strategies available');
  }
  return fallback;
}

/**
 * Smart clean with automatic engine selection
 *
 * Automatically chooses the best implementation based on:
 * - Input size
 * - Platform capabilities (WASM availability)
 * - Learned performance (if enabled)
 *
 * @param input - Dirty JSON string to clean
 * @param options - Options
 * @returns Clean JSON string
 */
export async function smartClean(
  input: string,
  options: {
    /** Custom engine strategies */
    strategies?: EngineStrategy[];
    /** Enable performance learning (measures and adapts) */
    learn?: boolean;
    /** Force specific engine */
    forceEngine?: 'typescript' | 'wasm' | 'wasm-simd';
  } = {}
): Promise<string> {
  // Force specific engine if requested
  if (options.forceEngine) {
    switch (options.forceEngine) {
      case 'typescript':
        return tsClean(input);
      case 'wasm':
        return cleanWithWasm(input);
      case 'wasm-simd':
        return cleanWithWasmSimd(input);
    }
  }

  // Check WASM availability first
  const wasmAvailable = isWasmAvailable();
  const strategies = options.strategies || customStrategies || DEFAULT_STRATEGIES;

  // Filter strategies based on WASM availability
  const availableStrategies = wasmAvailable
    ? strategies
    : strategies.filter((s) => s.name === 'TypeScript');

  // Select engine
  const engine = selectEngine(input, availableStrategies);

  // Execute with performance tracking if learning is enabled
  if (options.learn) {
    const start = performance.now();
    const result = await engine.clean(input);
    const duration = performance.now() - start;

    // Update performance cache
    const cache = perfCache[engine.name] || { avgTime: 0, samples: 0 };
    cache.avgTime = (cache.avgTime * cache.samples + duration) / (cache.samples + 1);
    cache.samples += 1;
    perfCache[engine.name] = cache;

    return result;
  }

  // Execute without tracking
  return engine.clean(input);
}

/**
 * Smart clean (synchronous version)
 *
 * Always uses TypeScript implementation for sync operation.
 * For WASM, use the async version.
 *
 * @param input - Dirty JSON string to clean
 * @returns Clean JSON string
 */
export function smartCleanSync(input: string): string {
  return tsClean(input);
}

/**
 * Get performance statistics
 *
 * Returns measured performance for each engine on this platform.
 * Only available if learning is enabled.
 */
export function getPerformanceStats(): PerformanceCache {
  return { ...perfCache };
}

/**
 * Reset performance cache
 *
 * Clears learned performance data. Useful for benchmarking.
 */
export function resetPerformanceCache(): void {
  perfCache = {};
}

/**
 * Set custom engine strategies
 *
 * Allows fine-tuning engine selection thresholds based on
 * your specific workload and platform.
 *
 * @param strategies - Custom strategies
 *
 * @example
 * ```typescript
 * // Use WASM for all sizes > 1KB
 * setEngineStrategies([
 *   { minSize: 0, maxSize: 1000, clean: cleanDirtyJSON, name: 'TypeScript' },
 *   { minSize: 1000, maxSize: Infinity, clean: cleanWithWasm, name: 'WASM' },
 * ]);
 * ```
 */
export function setEngineStrategies(strategies: EngineStrategy[]): void {
  customStrategies = strategies;
}

/**
 * Reset to default engine strategies
 */
export function resetEngineStrategies(): void {
  customStrategies = null;
}

/**
 * Benchmark engines on current platform
 *
 * Runs benchmarks to determine optimal crossover points.
 * Returns recommended strategies for this platform.
 *
 * @param sampleSizes - Data sizes to test (bytes)
 * @returns Recommended strategies
 */
export async function benchmarkEngines(
  sampleSizes: number[] = [100, 500, 1000, 5000, 10000, 50000, 100000]
): Promise<{
  strategies: EngineStrategy[];
  results: Array<{
    size: number;
    typescript: number;
    wasm?: number;
    wasmSimd?: number;
    fastest: string;
  }>;
}> {
  const results: Array<{
    size: number;
    typescript: number;
    wasm?: number;
    wasmSimd?: number;
    fastest: string;
  }> = [];

  // Generate test data
  const testData = sampleSizes.map((size) => {
    const data = { name: 'test', value: 'x'.repeat(Math.floor(size / 2)) };
    return JSON.stringify(data).replace(/"/g, "'"); // Make it dirty
  });

  // Benchmark each size
  for (let i = 0; i < testData.length; i++) {
    const input = testData[i]!;
    const size = sampleSizes[i]!;
    const iterations = size < 1000 ? 1000 : size < 10000 ? 100 : 10;

    // Warmup
    for (let j = 0; j < 10; j++) {
      tsClean(input);
      if (isWasmAvailable()) {
        await cleanWithWasm(input);
        await cleanWithWasmSimd(input);
      }
    }

    // Benchmark TypeScript
    let start = performance.now();
    for (let j = 0; j < iterations; j++) {
      tsClean(input);
    }
    const tsTime = (performance.now() - start) / iterations;

    const result: {
      size: number;
      typescript: number;
      wasm?: number;
      wasmSimd?: number;
      fastest: string;
    } = {
      size,
      typescript: tsTime,
      fastest: 'typescript',
    };

    // Benchmark WASM if available
    if (isWasmAvailable()) {
      start = performance.now();
      for (let j = 0; j < iterations; j++) {
        await cleanWithWasm(input);
      }
      const wasmTime = (performance.now() - start) / iterations;
      result.wasm = wasmTime;

      start = performance.now();
      for (let j = 0; j < iterations; j++) {
        await cleanWithWasmSimd(input);
      }
      const wasmSimdTime = (performance.now() - start) / iterations;
      result.wasmSimd = wasmSimdTime;

      // Determine fastest
      const times = [
        { name: 'typescript', time: tsTime },
        { name: 'wasm', time: wasmTime },
        { name: 'wasm-simd', time: wasmSimdTime },
      ];
      times.sort((a, b) => a.time - b.time);
      result.fastest = times[0]!.name;
    }

    results.push(result);
  }

  // Generate strategies based on results
  const strategies: EngineStrategy[] = [];
  let lastCrossover = 0;
  let lastEngine = 'typescript';

  for (const result of results) {
    if (result.fastest !== lastEngine) {
      // Crossover point found
      strategies.push({
        minSize: lastCrossover,
        maxSize: result.size,
        clean:
          lastEngine === 'typescript'
            ? tsClean
            : lastEngine === 'wasm'
              ? cleanWithWasm
              : cleanWithWasmSimd,
        name: lastEngine === 'typescript' ? 'TypeScript' : lastEngine === 'wasm' ? 'WASM' : 'WASM-SIMD',
      });
      lastCrossover = result.size;
      lastEngine = result.fastest;
    }
  }

  // Add final strategy
  strategies.push({
    minSize: lastCrossover,
    maxSize: Infinity,
    clean:
      lastEngine === 'typescript'
        ? tsClean
        : lastEngine === 'wasm'
          ? cleanWithWasm
          : cleanWithWasmSimd,
    name: lastEngine === 'typescript' ? 'TypeScript' : lastEngine === 'wasm' ? 'WASM' : 'WASM-SIMD',
  });

  return { strategies, results };
}
