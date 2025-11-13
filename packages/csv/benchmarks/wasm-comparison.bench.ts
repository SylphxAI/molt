import { bench, describe } from 'vitest';
import { parseCSV } from '../src/parser.js';
import { stringifyCSV } from '../src/serializer.js';
import { parseWithWasm, stringifyWithWasm, initWasm } from '../src/wasm-loader.js';

// Generate test data
function generateData(rows: number) {
  const data = [];
  for (let i = 0; i < rows; i++) {
    data.push({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: 20 + (i % 50),
      city: `City ${i % 10}`,
      active: i % 2 === 0,
      score: 50 + (i % 50) + Math.random() * 10,
      description: `This is a longer description field for user ${i} with some text`,
    });
  }
  return data;
}

// Generate CSV strings
const smallData = generateData(100);
const mediumData = generateData(1000);
const largeData = generateData(10000);

const smallCsv = stringifyCSV(smallData);
const mediumCsv = stringifyCSV(mediumData);
const largeCsv = stringifyCSV(largeData);

// Initialize WASM before benchmarks
await initWasm();

describe('CSV Parsing Performance', () => {
  describe('Small CSV (100 rows)', () => {
    bench('TypeScript parser', () => {
      parseCSV(smallCsv);
    });

    bench('WASM parser', async () => {
      await parseWithWasm(smallCsv);
    });
  });

  describe('Medium CSV (1,000 rows)', () => {
    bench('TypeScript parser', () => {
      parseCSV(mediumCsv);
    });

    bench('WASM parser', async () => {
      await parseWithWasm(mediumCsv);
    });
  });

  describe('Large CSV (10,000 rows)', () => {
    bench('TypeScript parser', () => {
      parseCSV(largeCsv);
    });

    bench('WASM parser', async () => {
      await parseWithWasm(largeCsv);
    });
  });
});

describe('CSV Stringifying Performance', () => {
  describe('Small data (100 rows)', () => {
    bench('TypeScript stringify', () => {
      stringifyCSV(smallData);
    });

    bench('WASM stringify', async () => {
      await stringifyWithWasm(smallData);
    });
  });

  describe('Medium data (1,000 rows)', () => {
    bench('TypeScript stringify', () => {
      stringifyCSV(mediumData);
    });

    bench('WASM stringify', async () => {
      await stringifyWithWasm(mediumData);
    });
  });

  describe('Large data (10,000 rows)', () => {
    bench('TypeScript stringify', () => {
      stringifyCSV(largeData);
    });

    bench('WASM stringify', async () => {
      await stringifyWithWasm(largeData);
    });
  });
});
