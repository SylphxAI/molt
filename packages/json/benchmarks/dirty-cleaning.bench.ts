import { parse as dirtyJsonParse } from 'dirty-json';
import { Bench } from 'tinybench';
import { bench, describe } from 'vitest';
import { HyperJSON } from '../src/index.js';

// Test data - various dirty JSON scenarios
const testCases = {
  small: `{user: 'alice', age: 30, active: true}`,
  medium: `{
    user: 'alice',
    email: 'alice@example.com',
    age: 30,
    active: true,
    // Comment here
    settings: {
      theme: 'dark',
      notifications: true,
      privacy: {
        shareData: false,
        cookies: true,
      }
    },
    tags: ['developer', 'typescript', 'javascript',],
    metadata: undefined,
  }`,
  large: `{
    users: [
      {id: 1, name: 'Alice', email: 'alice@example.com', active: true},
      {id: 2, name: 'Bob', email: 'bob@example.com', active: false},
      {id: 3, name: 'Charlie', email: 'charlie@example.com', active: true},
      {id: 4, name: 'David', email: 'david@example.com', active: true},
      {id: 5, name: 'Eve', email: 'eve@example.com', active: false},
    ],
    metadata: {
      total: 5,
      active: 3,
      // Last updated
      updated: '2024-01-01',
      stats: {
        byRole: {
          admin: 1,
          user: 4,
        },
        byStatus: {
          active: 3,
          inactive: 2,
        }
      }
    },
    config: {
      version: '1.0.0',
      features: ['auth', 'notifications', 'analytics',],
      experimental: {
        newUI: true,
        betaFeatures: false,
      }
    }
  }`,
};

describe('Dirty JSON Cleaning - Small Input', () => {
  const suite = new Bench({ time: 1000 });

  suite
    .add('HyperJSON.clean', () => {
      HyperJSON.clean(testCases.small);
    })
    .add('dirty-json', () => {
      dirtyJsonParse(testCases.small);
    });

  bench('Run benchmark', async () => {
    await suite.run();
    console.log('\n📊 Small Input Results:');
    console.table(
      suite.tasks.map((task) => ({
        Name: task.name,
        'Ops/sec': task.result?.hz?.toFixed(0) || 'N/A',
        Margin: `${task.result?.rme?.toFixed(2)}%` || 'N/A',
        'Mean (ms)': (task.result?.mean ? task.result.mean * 1000 : 0).toFixed(3),
      })),
    );

    const hyperJson = suite.tasks.find((t) => t.name === 'HyperJSON.clean');
    const dirtyJson = suite.tasks.find((t) => t.name === 'dirty-json');

    if (hyperJson?.result?.hz && dirtyJson?.result?.hz) {
      const speedup = hyperJson.result.hz / dirtyJson.result.hz;
      console.log(`\n🚀 HyperJSON is ${speedup.toFixed(1)}x faster than dirty-json\n`);
    }
  });
});

describe('Dirty JSON Cleaning - Medium Input', () => {
  const suite = new Bench({ time: 1000 });

  suite
    .add('HyperJSON.clean', () => {
      HyperJSON.clean(testCases.medium);
    })
    .add('dirty-json', () => {
      dirtyJsonParse(testCases.medium);
    });

  bench('Run benchmark', async () => {
    await suite.run();
    console.log('\n📊 Medium Input Results:');
    console.table(
      suite.tasks.map((task) => ({
        Name: task.name,
        'Ops/sec': task.result?.hz?.toFixed(0) || 'N/A',
        Margin: `${task.result?.rme?.toFixed(2)}%` || 'N/A',
        'Mean (ms)': (task.result?.mean ? task.result.mean * 1000 : 0).toFixed(3),
      })),
    );

    const hyperJson = suite.tasks.find((t) => t.name === 'HyperJSON.clean');
    const dirtyJson = suite.tasks.find((t) => t.name === 'dirty-json');

    if (hyperJson?.result?.hz && dirtyJson?.result?.hz) {
      const speedup = hyperJson.result.hz / dirtyJson.result.hz;
      console.log(`\n🚀 HyperJSON is ${speedup.toFixed(1)}x faster than dirty-json\n`);
    }
  });
});

describe('Dirty JSON Cleaning - Large Input', () => {
  const suite = new Bench({ time: 1000 });

  suite
    .add('HyperJSON.clean', () => {
      HyperJSON.clean(testCases.large);
    })
    .add('dirty-json', () => {
      dirtyJsonParse(testCases.large);
    });

  bench('Run benchmark', async () => {
    await suite.run();
    console.log('\n📊 Large Input Results:');
    console.table(
      suite.tasks.map((task) => ({
        Name: task.name,
        'Ops/sec': task.result?.hz?.toFixed(0) || 'N/A',
        Margin: `${task.result?.rme?.toFixed(2)}%` || 'N/A',
        'Mean (ms)': (task.result?.mean ? task.result.mean * 1000 : 0).toFixed(3),
      })),
    );

    const hyperJson = suite.tasks.find((t) => t.name === 'HyperJSON.clean');
    const dirtyJson = suite.tasks.find((t) => t.name === 'dirty-json');

    if (hyperJson?.result?.hz && dirtyJson?.result?.hz) {
      const speedup = hyperJson.result.hz / dirtyJson.result.hz;
      console.log(`\n🚀 HyperJSON is ${speedup.toFixed(1)}x faster than dirty-json\n`);
    }
  });
});
