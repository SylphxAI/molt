import superjson from 'superjson';
import { Bench } from 'tinybench';
import { bench, describe } from 'vitest';
import { HyperJSON } from '../src/index.js';

// Test data - various typed JSON scenarios
const testData = {
  simple: {
    date: new Date('2024-01-01T00:00:00.000Z'),
    bigInt: 123456789012345678901n,
    set: new Set([1, 2, 3, 4, 5]),
  },
  complex: {
    user: 'alice',
    created: new Date('2024-01-01T00:00:00.000Z'),
    updated: new Date('2024-02-01T00:00:00.000Z'),
    score: 999999999999999n,
    tags: new Set(['typescript', 'javascript', 'node']),
    metadata: new Map([
      ['theme', 'dark'],
      ['lang', 'en'],
      ['notifications', true],
    ]),
    settings: {
      notifications: true,
      privacy: {
        shareData: false,
        lastUpdated: new Date('2024-03-01T00:00:00.000Z'),
      },
    },
  },
  nested: {
    users: [
      {
        id: 1,
        name: 'Alice',
        joined: new Date('2024-01-01'),
        balance: 1000000000000000n,
        permissions: new Set(['read', 'write', 'delete']),
      },
      {
        id: 2,
        name: 'Bob',
        joined: new Date('2024-01-15'),
        balance: 2000000000000000n,
        permissions: new Set(['read', 'write']),
      },
      {
        id: 3,
        name: 'Charlie',
        joined: new Date('2024-02-01'),
        balance: 3000000000000000n,
        permissions: new Set(['read']),
      },
    ],
    metadata: new Map([
      ['total', 3],
      ['created', new Date('2024-01-01')],
      ['tags', new Set(['active', 'verified'])],
    ]),
  },
};

describe('Typed JSON Serialization - Simple Data', () => {
  const suite = new Bench({ time: 1000 });

  suite
    .add('HyperJSON.serialize', () => {
      HyperJSON.serialize(testData.simple);
    })
    .add('superjson.serialize', () => {
      superjson.serialize(testData.simple);
    });

  bench('Run benchmark', async () => {
    await suite.run();
    console.log('\n📊 Simple Data Serialization:');
    console.table(
      suite.tasks.map((task) => ({
        Name: task.name,
        'Ops/sec': task.result?.hz?.toFixed(0) || 'N/A',
        Margin: `${task.result?.rme?.toFixed(2)}%` || 'N/A',
        'Mean (ms)': (task.result?.mean ? task.result.mean * 1000 : 0).toFixed(3),
      })),
    );

    const hyperJson = suite.tasks.find((t) => t.name === 'HyperJSON.serialize');
    const superJson = suite.tasks.find((t) => t.name === 'superjson.serialize');

    if (hyperJson?.result?.hz && superJson?.result?.hz) {
      const speedup = hyperJson.result.hz / superJson.result.hz;
      console.log(`\n🚀 HyperJSON is ${speedup.toFixed(1)}x faster than superjson\n`);
    }
  });
});

describe('Typed JSON Deserialization - Simple Data', () => {
  const hyperSerialized = HyperJSON.serialize(testData.simple);
  const superSerialized = superjson.serialize(testData.simple);

  const suite = new Bench({ time: 1000 });

  suite
    .add('HyperJSON.deserialize', () => {
      HyperJSON.deserialize(hyperSerialized);
    })
    .add('superjson.deserialize', () => {
      superjson.deserialize(superSerialized);
    });

  bench('Run benchmark', async () => {
    await suite.run();
    console.log('\n📊 Simple Data Deserialization:');
    console.table(
      suite.tasks.map((task) => ({
        Name: task.name,
        'Ops/sec': task.result?.hz?.toFixed(0) || 'N/A',
        Margin: `${task.result?.rme?.toFixed(2)}%` || 'N/A',
        'Mean (ms)': (task.result?.mean ? task.result.mean * 1000 : 0).toFixed(3),
      })),
    );

    const hyperJson = suite.tasks.find((t) => t.name === 'HyperJSON.deserialize');
    const superJson = suite.tasks.find((t) => t.name === 'superjson.deserialize');

    if (hyperJson?.result?.hz && superJson?.result?.hz) {
      const speedup = hyperJson.result.hz / superJson.result.hz;
      console.log(`\n🚀 HyperJSON is ${speedup.toFixed(1)}x faster than superjson\n`);
    }
  });
});

describe('Typed JSON Serialization - Complex Data', () => {
  const suite = new Bench({ time: 1000 });

  suite
    .add('HyperJSON.serialize', () => {
      HyperJSON.serialize(testData.complex);
    })
    .add('superjson.serialize', () => {
      superjson.serialize(testData.complex);
    });

  bench('Run benchmark', async () => {
    await suite.run();
    console.log('\n📊 Complex Data Serialization:');
    console.table(
      suite.tasks.map((task) => ({
        Name: task.name,
        'Ops/sec': task.result?.hz?.toFixed(0) || 'N/A',
        Margin: `${task.result?.rme?.toFixed(2)}%` || 'N/A',
        'Mean (ms)': (task.result?.mean ? task.result.mean * 1000 : 0).toFixed(3),
      })),
    );

    const hyperJson = suite.tasks.find((t) => t.name === 'HyperJSON.serialize');
    const superJson = suite.tasks.find((t) => t.name === 'superjson.serialize');

    if (hyperJson?.result?.hz && superJson?.result?.hz) {
      const speedup = hyperJson.result.hz / superJson.result.hz;
      console.log(`\n🚀 HyperJSON is ${speedup.toFixed(1)}x faster than superjson\n`);
    }
  });
});

describe('Typed JSON Deserialization - Complex Data', () => {
  const hyperSerialized = HyperJSON.serialize(testData.complex);
  const superSerialized = superjson.serialize(testData.complex);

  const suite = new Bench({ time: 1000 });

  suite
    .add('HyperJSON.deserialize', () => {
      HyperJSON.deserialize(hyperSerialized);
    })
    .add('superjson.deserialize', () => {
      superjson.deserialize(superSerialized);
    });

  bench('Run benchmark', async () => {
    await suite.run();
    console.log('\n📊 Complex Data Deserialization:');
    console.table(
      suite.tasks.map((task) => ({
        Name: task.name,
        'Ops/sec': task.result?.hz?.toFixed(0) || 'N/A',
        Margin: `${task.result?.rme?.toFixed(2)}%` || 'N/A',
        'Mean (ms)': (task.result?.mean ? task.result.mean * 1000 : 0).toFixed(3),
      })),
    );

    const hyperJson = suite.tasks.find((t) => t.name === 'HyperJSON.deserialize');
    const superJson = suite.tasks.find((t) => t.name === 'superjson.deserialize');

    if (hyperJson?.result?.hz && superJson?.result?.hz) {
      const speedup = hyperJson.result.hz / superJson.result.hz;
      console.log(`\n🚀 HyperJSON is ${speedup.toFixed(1)}x faster than superjson\n`);
    }
  });
});

describe('Typed JSON Round-trip - Nested Data', () => {
  const suite = new Bench({ time: 1000 });

  suite
    .add('HyperJSON stringify+parse', () => {
      const json = HyperJSON.stringify(testData.nested);
      HyperJSON.parse(json);
    })
    .add('superjson stringify+parse', () => {
      const json = superjson.stringify(testData.nested);
      superjson.parse(json);
    });

  bench('Run benchmark', async () => {
    await suite.run();
    console.log('\n📊 Nested Data Round-trip:');
    console.table(
      suite.tasks.map((task) => ({
        Name: task.name,
        'Ops/sec': task.result?.hz?.toFixed(0) || 'N/A',
        Margin: `${task.result?.rme?.toFixed(2)}%` || 'N/A',
        'Mean (ms)': (task.result?.mean ? task.result.mean * 1000 : 0).toFixed(3),
      })),
    );

    const hyperJson = suite.tasks.find((t) => t.name === 'HyperJSON stringify+parse');
    const superJson = suite.tasks.find((t) => t.name === 'superjson stringify+parse');

    if (hyperJson?.result?.hz && superJson?.result?.hz) {
      const speedup = hyperJson.result.hz / superJson.result.hz;
      console.log(`\n🚀 HyperJSON is ${speedup.toFixed(1)}x faster than superjson\n`);
    }
  });
});
