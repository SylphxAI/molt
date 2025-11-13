/**
 * Benchmark: WASM vs TypeScript performance comparison
 */

import { describe, bench, beforeAll } from 'vitest';
import { Bench } from 'tinybench';
import { clean } from '../src/cleaner.js';
import { cleanWithWasm, initWasm, isWasmAvailable, disableWasm } from '../src/wasm-loader.js';

// Test data: realistic dirty JSON with various features
const smallDirtyJson = `{
  // User profile
  name: 'Alice',
  email: "alice@example.com",
  age: 30,
  active: true,
  tags: ['developer', 'typescript',],
}`;

const mediumDirtyJson = `{
  // API Response
  status: 'success',
  data: {
    users: [
      {id: 1, name: 'Bob', email: 'bob@example.com', role: 'admin',},
      {id: 2, name: 'Charlie', email: 'charlie@example.com', role: 'user',},
      {id: 3, name: 'Diana', email: 'diana@example.com', role: 'moderator',},
    ],
    /* Metadata */
    total: 3,
    page: 1,
    perPage: 10,
  },
  timestamp: 1699900000000,
}`;

const largeDirtyJson = `{
  // Large dataset
  items: [
    ${Array.from({ length: 100 }, (_, i) => `{id: ${i}, name: 'Item ${i}', value: ${i * 10}, active: ${i % 2 === 0}, tags: ['tag${i}', 'category${i % 5}',],}`).join(',\n    ')}
  ],
  metadata: {
    total: 100,
    /* Query info */
    query: 'all',
    filters: {
      active: true,
      minValue: 0,
      maxValue: 1000,
    },
  },
}`;

describe('WASM vs TypeScript Performance', () => {
  beforeAll(async () => {
    // Warm up WASM
    try {
      await initWasm();
      if (isWasmAvailable()) {
        console.log('✅ WASM initialized successfully');
        // Warm up call
        await cleanWithWasm(smallDirtyJson);
      } else {
        console.log('⚠️  WASM not available, benchmarks will use TypeScript only');
      }
    } catch (error) {
      console.log('⚠️  WASM initialization failed:', error);
    }
  });

  describe('Small Input (< 1KB)', () => {
    bench('TypeScript', () => {
      clean(smallDirtyJson);
    });

    bench('WASM', async () => {
      if (isWasmAvailable()) {
        await cleanWithWasm(smallDirtyJson);
      }
    });

    bench('Run comparison', async (b) => {
      const bench = new Bench({ time: 1000 });

      bench
        .add('TypeScript clean', () => {
          clean(smallDirtyJson);
        })
        .add('WASM cleanWithWasm', async () => {
          if (isWasmAvailable()) {
            await cleanWithWasm(smallDirtyJson);
          } else {
            clean(smallDirtyJson);
          }
        });

      await bench.run();

      console.log('\n📊 Small Input Performance:');
      console.table(
        bench.tasks.map((task) => ({
          Name: task.name,
          'Ops/sec': task.result?.hz?.toFixed(0) || 'N/A',
          'Margin': `${task.result?.rme?.toFixed(2)}%` || 'N/A',
          'Mean (ms)': (task.result?.mean ? task.result.mean * 1000 : 0).toFixed(3),
        })),
      );

      if (bench.tasks.length === 2 && bench.tasks[0].result && bench.tasks[1].result) {
        const tsHz = bench.tasks[0].result.hz || 0;
        const wasmHz = bench.tasks[1].result.hz || 0;
        const speedup = wasmHz / tsHz;
        console.log(`\n🚀 WASM is ${speedup.toFixed(1)}x ${speedup > 1 ? 'faster' : 'slower'} than TypeScript\n`);
      }
    });
  });

  describe('Medium Input (~1KB)', () => {
    bench('TypeScript', () => {
      clean(mediumDirtyJson);
    });

    bench('WASM', async () => {
      if (isWasmAvailable()) {
        await cleanWithWasm(mediumDirtyJson);
      }
    });

    bench('Run comparison', async (b) => {
      const bench = new Bench({ time: 1000 });

      bench
        .add('TypeScript clean', () => {
          clean(mediumDirtyJson);
        })
        .add('WASM cleanWithWasm', async () => {
          if (isWasmAvailable()) {
            await cleanWithWasm(mediumDirtyJson);
          } else {
            clean(mediumDirtyJson);
          }
        });

      await bench.run();

      console.log('\n📊 Medium Input Performance:');
      console.table(
        bench.tasks.map((task) => ({
          Name: task.name,
          'Ops/sec': task.result?.hz?.toFixed(0) || 'N/A',
          'Margin': `${task.result?.rme?.toFixed(2)}%` || 'N/A',
          'Mean (ms)': (task.result?.mean ? task.result.mean * 1000 : 0).toFixed(3),
        })),
      );

      if (bench.tasks.length === 2 && bench.tasks[0].result && bench.tasks[1].result) {
        const tsHz = bench.tasks[0].result.hz || 0;
        const wasmHz = bench.tasks[1].result.hz || 0;
        const speedup = wasmHz / tsHz;
        console.log(`\n🚀 WASM is ${speedup.toFixed(1)}x ${speedup > 1 ? 'faster' : 'slower'} than TypeScript\n`);
      }
    });
  });

  describe('Large Input (~10KB)', () => {
    bench('TypeScript', () => {
      clean(largeDirtyJson);
    });

    bench('WASM', async () => {
      if (isWasmAvailable()) {
        await cleanWithWasm(largeDirtyJson);
      }
    });

    bench('Run comparison', async (b) => {
      const bench = new Bench({ time: 1000 });

      bench
        .add('TypeScript clean', () => {
          clean(largeDirtyJson);
        })
        .add('WASM cleanWithWasm', async () => {
          if (isWasmAvailable()) {
            await cleanWithWasm(largeDirtyJson);
          } else {
            clean(largeDirtyJson);
          }
        });

      await bench.run();

      console.log('\n📊 Large Input Performance:');
      console.table(
        bench.tasks.map((task) => ({
          Name: task.name,
          'Ops/sec': task.result?.hz?.toFixed(0) || 'N/A',
          'Margin': `${task.result?.rme?.toFixed(2)}%` || 'N/A',
          'Mean (ms)': (task.result?.mean ? task.result.mean * 1000 : 0).toFixed(3),
        })),
      );

      if (bench.tasks.length === 2 && bench.tasks[0].result && bench.tasks[1].result) {
        const tsHz = bench.tasks[0].result.hz || 0;
        const wasmHz = bench.tasks[1].result.hz || 0;
        const speedup = wasmHz / tsHz;
        console.log(`\n🚀 WASM is ${speedup.toFixed(1)}x ${speedup > 1 ? 'faster' : 'slower'} than TypeScript\n`);
      }
    });
  });
});
