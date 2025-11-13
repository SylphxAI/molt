/**
 * Platform Detection Benchmark
 *
 * Automatically benchmarks engines on the current platform
 * and provides optimal configuration recommendations.
 */

import { describe, test } from 'vitest';
import { benchmarkEngines } from '../src/engine-selector.js';

describe('Platform Engine Detection', () => {
  test('Benchmark and recommend optimal strategies', async () => {
    console.log('\n🔍 Detecting optimal engines for this platform...\n');
    console.log(`Platform: ${process.platform}`);
    console.log(`Architecture: ${process.arch}`);
    console.log(`Runtime: ${process.version}\n`);

    const { strategies, results } = await benchmarkEngines();

    console.log('📊 Benchmark Results:\n');
    console.log('Size (bytes) | TypeScript | WASM | WASM-SIMD | Fastest');
    console.log('-------------|------------|------|-----------|--------');

    for (const result of results) {
      const ts = result.typescript.toFixed(3).padEnd(10);
      const wasm = result.wasm ? result.wasm.toFixed(3).padEnd(4) : 'N/A '.padEnd(4);
      const simd = result.wasmSimd ? result.wasmSimd.toFixed(3).padEnd(9) : 'N/A      '.padEnd(9);
      const fastest = result.fastest.padEnd(8);
      console.log(
        `${result.size.toString().padEnd(12)} | ${ts} | ${wasm} | ${simd} | ${fastest}`
      );
    }

    console.log('\n✅ Recommended Strategies:\n');
    for (const strategy of strategies) {
      const min = strategy.minSize.toString().padEnd(8);
      const max =
        strategy.maxSize === Infinity ? '∞' : strategy.maxSize.toString().padEnd(8);
      console.log(`  ${min} - ${max}: ${strategy.name}`);
    }

    console.log('\n💡 Usage:\n');
    console.log('```typescript');
    console.log("import { setEngineStrategies } from '@sylphx/molt-json';");
    console.log('');
    console.log('// Apply platform-specific strategies');
    console.log('setEngineStrategies([');
    for (let i = 0; i < strategies.length; i++) {
      const s = strategies[i];
      const maxStr = s.maxSize === Infinity ? 'Infinity' : s.maxSize;
      const comma = i < strategies.length - 1 ? ',' : '';
      console.log(
        `  { minSize: ${s.minSize}, maxSize: ${maxStr}, clean: ${s.name.toLowerCase().replace('-', '')}, name: '${s.name}' }${comma}`
      );
    }
    console.log(']);');
    console.log('```\n');

    // Export strategies to file
    const configCode = `// Auto-generated platform-specific configuration
// Generated on: ${new Date().toISOString()}
// Platform: ${process.platform} ${process.arch}
// Runtime: ${process.version}

import { cleanDirtyJSON } from './cleaner.js';
import { cleanWithWasm, cleanWithWasmSimd } from './wasm-loader.js';
import type { EngineStrategy } from './engine-selector.js';

export const PLATFORM_STRATEGIES: EngineStrategy[] = [
${strategies
  .map((s, i) => {
    const cleanFn =
      s.name === 'TypeScript'
        ? 'cleanDirtyJSON'
        : s.name === 'WASM'
          ? 'cleanWithWasm'
          : 'cleanWithWasmSimd';
    const maxStr = s.maxSize === Infinity ? 'Infinity' : s.maxSize;
    const comma = i < strategies.length - 1 ? ',' : '';
    return `  { minSize: ${s.minSize}, maxSize: ${maxStr}, clean: ${cleanFn}, name: '${s.name}' }${comma}`;
  })
  .join('\n')}
];

export const BENCHMARK_RESULTS = ${JSON.stringify(results, null, 2)};
`;

    const fs = await import('fs/promises');
    await fs.writeFile(
      './src/platform-config.generated.ts',
      configCode,
      'utf-8'
    );

    console.log('✅ Configuration saved to: src/platform-config.generated.ts\n');
  }, 120000); // 2 minute timeout
});
