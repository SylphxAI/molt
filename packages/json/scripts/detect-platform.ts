#!/usr/bin/env bun
/**
 * Platform Detection Script
 *
 * Benchmarks engines on the current platform and provides
 * optimal configuration recommendations.
 */

import { benchmarkEngines } from '../src/engine-selector.js';

async function main() {
  console.log('\n🔍 Detecting optimal engines for this platform...\n');
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Runtime: ${process.version || 'Bun ' + Bun.version}\n`);

  const { strategies, results } = await benchmarkEngines();

  console.log('📊 Benchmark Results:\n');
  console.log('Size (bytes) | TypeScript (ms) | WASM (ms) | WASM-SIMD (ms) | Fastest');
  console.log('-------------|-----------------|-----------|----------------|--------');

  for (const result of results) {
    const size = result.size.toString().padStart(12);
    const ts = result.typescript.toFixed(4).padStart(16);
    const wasm = result.wasm ? result.wasm.toFixed(4).padStart(9) : '      N/A';
    const simd = result.wasmSimd ? result.wasmSimd.toFixed(4).padStart(14) : '           N/A';
    const fastest = result.fastest.padEnd(8);
    console.log(`${size} | ${ts} | ${wasm} | ${simd} | ${fastest}`);
  }

  console.log('\n✅ Recommended Strategies:\n');
  for (const strategy of strategies) {
    const min = strategy.minSize.toString().padStart(8);
    const max = strategy.maxSize === Infinity ? '      ∞' : strategy.maxSize.toString().padStart(8);
    console.log(`  ${min} - ${max}: ${strategy.name}`);
  }

  console.log('\n💡 Configuration Code:\n');
  console.log('```typescript');
  console.log("import { setEngineStrategies, smartClean } from '@sylphx/molt-json';");
  console.log("import { cleanDirtyJSON, cleanWithWasm, cleanWithWasmSimd } from '@sylphx/molt-json';");
  console.log('');
  console.log('// Apply platform-specific strategies');
  console.log('setEngineStrategies([');
  for (let i = 0; i < strategies.length; i++) {
    const s = strategies[i];
    const cleanFn =
      s.name === 'TypeScript' ? 'cleanDirtyJSON' : s.name === 'WASM' ? 'cleanWithWasm' : 'cleanWithWasmSimd';
    const maxStr = s.maxSize === Infinity ? 'Infinity' : s.maxSize;
    const comma = i < strategies.length - 1 ? ',' : '';
    console.log(
      `  { minSize: ${s.minSize}, maxSize: ${maxStr}, clean: ${cleanFn}, name: '${s.name}' }${comma}`
    );
  }
  console.log(']);');
  console.log('');
  console.log('// Now use smartClean for automatic engine selection');
  console.log('const result = await smartClean(dirtyJson);');
  console.log('```\n');

  // Performance comparison
  console.log('📈 Performance Comparison:\n');
  for (const result of results) {
    if (result.wasm && result.wasmSimd) {
      const tsBase = result.typescript;
      const wasmVsTs = ((tsBase / result.wasm - 1) * 100).toFixed(1);
      const simdVsTs = ((tsBase / result.wasmSimd - 1) * 100).toFixed(1);
      const simdVsWasm = ((result.wasm / result.wasmSimd - 1) * 100).toFixed(1);

      console.log(`Size ${result.size} bytes:`);
      console.log(`  WASM vs TypeScript:      ${wasmVsTs}%`);
      console.log(`  SIMD vs TypeScript:      ${simdVsTs}%`);
      console.log(`  SIMD vs WASM (regular):  ${simdVsWasm}%`);
      console.log('');
    }
  }

  // Save configuration file
  const configCode = `// Auto-generated platform-specific configuration
// Generated on: ${new Date().toISOString()}
// Platform: ${process.platform} ${process.arch}
// Runtime: ${process.version || 'Bun ' + Bun.version}

import { cleanDirtyJSON } from './cleaner.js';
import { cleanWithWasm, cleanWithWasmSimd } from './wasm-loader.js';
import type { EngineStrategy } from './engine-selector.js';

export const PLATFORM_STRATEGIES: EngineStrategy[] = [
${strategies
  .map((s, i) => {
    const cleanFn =
      s.name === 'TypeScript' ? 'cleanDirtyJSON' : s.name === 'WASM' ? 'cleanWithWasm' : 'cleanWithWasmSimd';
    const maxStr = s.maxSize === Infinity ? 'Infinity' : s.maxSize;
    const comma = i < strategies.length - 1 ? ',' : '';
    return `  { minSize: ${s.minSize}, maxSize: ${maxStr}, clean: ${cleanFn}, name: '${s.name}' }${comma}`;
  })
  .join('\n')}
];

export const BENCHMARK_RESULTS = ${JSON.stringify(results, null, 2)};
`;

  await Bun.write('./src/platform-config.generated.ts', configCode);

  console.log('✅ Configuration saved to: src/platform-config.generated.ts\n');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
