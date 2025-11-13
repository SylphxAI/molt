import { bench, describe } from 'vitest';
import { parseCSV, stringifyCSV } from '../src/index.js';
import Papa from 'papaparse';
import { parse } from 'csv-parse/sync';
import { csvParse, csvFormat } from 'd3-dsv';
import { stringify } from 'csv-stringify/sync';

/**
 * CSV Parsing Benchmarks vs Competitors
 *
 * Comparing against popular CSV parsers:
 * - papaparse (most popular)
 * - csv-parse (from csv project)
 * - d3-dsv (d3's csv parser)
 */

// Sample CSV documents
const simpleCSV = `name,age,city
Alice,30,NYC
Bob,25,LA
Charlie,35,Chicago
David,28,Seattle
Eve,32,Boston`;

const largeCSV = Array.from(
  { length: 1000 },
  (_, i) =>
    `${i},Item ${i},Description for item ${i},${(Math.random() * 1000).toFixed(2)},${Math.random() > 0.5}`
).join('\n');

const complexCSV = `id,name,email,joined,role,active,department,salary,location
1,Alice Smith,alice@example.com,2024-01-15,admin,true,Engineering,120000,NYC
2,Bob Johnson,bob@example.com,2024-02-20,user,true,Marketing,85000,LA
3,Charlie Brown,charlie@example.com,2024-03-10,moderator,false,Sales,95000,Chicago
4,David Lee,david@example.com,2024-04-05,user,true,Engineering,110000,Seattle
5,Eve Williams,eve@example.com,2024-05-12,admin,true,HR,100000,Boston
6,Frank Miller,frank@example.com,2024-06-18,user,false,Engineering,105000,Austin
7,Grace Davis,grace@example.com,2024-07-22,moderator,true,Marketing,90000,Denver
8,Henry Garcia,henry@example.com,2024-08-30,user,true,Sales,88000,Miami
9,Iris Martinez,iris@example.com,2024-09-14,admin,false,Engineering,125000,Portland
10,Jack Wilson,jack@example.com,2024-10-25,user,true,HR,95000,Phoenix`;

const quotedCSV = `name,description,tags
"Product A","Description with ""quotes"" and, commas","tag1,tag2,tag3"
"Product B","Simple description","tag1"
"Product C","Multi-line
description
with newlines","tag1,tag2"
"Product D","Description with, commas, and ""quotes""","tag1,tag2,tag3,tag4"`;

const tsvData = `name\tage\tcity\tsalary
Alice\t30\tNYC\t120000
Bob\t25\tLA\t85000
Charlie\t35\tChicago\t95000
David\t28\tSeattle\t110000
Eve\t32\tBoston\t100000`;

describe('CSV Parsing Performance', () => {
  bench('molt-csv: simple CSV (5 rows)', () => {
    parseCSV(simpleCSV);
  });

  bench('molt-csv: complex CSV (10 rows, 9 columns)', () => {
    parseCSV(complexCSV);
  });

  bench('molt-csv: large CSV (1000 rows)', () => {
    parseCSV(largeCSV);
  });

  bench('molt-csv: quoted fields', () => {
    parseCSV(quotedCSV);
  });

  bench('molt-csv: TSV format', () => {
    parseCSV(tsvData, { delimiter: '\t' });
  });

  bench('molt-csv: with type parsing', () => {
    parseCSV(complexCSV, { parseTypes: true });
  });

  // Competitors (install with: bun add -D papaparse csv-parse d3-dsv)
  // Uncomment when packages are installed:

  bench('papaparse: simple CSV', () => {
    Papa.parse(simpleCSV, { header: true });
  });
  bench('papaparse: complex CSV', () => {
    Papa.parse(complexCSV, { header: true });
  });
  bench('papaparse: large CSV', () => {
    Papa.parse(largeCSV, { header: true });
  });
  bench('papaparse: quoted fields', () => {
    Papa.parse(quotedCSV, { header: true });
  });

  bench('csv-parse: simple CSV', () => {
    parse(simpleCSV, { columns: true });
  });
  bench('csv-parse: complex CSV', () => {
    parse(complexCSV, { columns: true });
  });
  bench('csv-parse: large CSV', () => {
    parse(largeCSV, { columns: true });
  });
  bench('csv-parse: quoted fields', () => {
    parse(quotedCSV, { columns: true });
  });

  bench('d3-dsv: simple CSV', () => {
    csvParse(simpleCSV);
  });
  bench('d3-dsv: complex CSV', () => {
    csvParse(complexCSV);
  });
  bench('d3-dsv: large CSV', () => {
    csvParse(largeCSV);
  });
});

describe('CSV Serialization Performance', () => {
  const simpleData = [
    { name: 'Alice', age: 30, city: 'NYC' },
    { name: 'Bob', age: 25, city: 'LA' },
    { name: 'Charlie', age: 35, city: 'Chicago' },
    { name: 'David', age: 28, city: 'Seattle' },
    { name: 'Eve', age: 32, city: 'Boston' },
  ];

  const complexData = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    joined: `2024-0${(i % 9) + 1}-15`,
    role: i % 3 === 0 ? 'admin' : 'user',
    active: i % 2 === 0,
    department: ['Engineering', 'Marketing', 'Sales'][i % 3],
    salary: 80000 + i * 5000,
    location: ['NYC', 'LA', 'Chicago', 'Seattle', 'Boston'][i % 5],
  }));

  const largeData = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `Description for item ${i}`,
    price: (Math.random() * 1000).toFixed(2),
    inStock: Math.random() > 0.5,
  }));

  bench('molt-csv: stringify simple (5 rows)', () => {
    stringifyCSV(simpleData);
  });

  bench('molt-csv: stringify complex (10 rows, 9 columns)', () => {
    stringifyCSV(complexData);
  });

  bench('molt-csv: stringify large (1000 rows)', () => {
    stringifyCSV(largeData);
  });

  bench('molt-csv: stringify with custom options', () => {
    stringifyCSV(simpleData, { delimiter: '\t', quoteAll: true });
  });

  // Competitors
  bench('papaparse: stringify simple', () => {
    Papa.unparse(simpleData);
  });
  bench('papaparse: stringify complex', () => {
    Papa.unparse(complexData);
  });
  bench('papaparse: stringify large', () => {
    Papa.unparse(largeData);
  });

  bench('csv-stringify: simple', () => {
    stringify(simpleData, { header: true });
  });
  bench('csv-stringify: complex', () => {
    stringify(complexData, { header: true });
  });
  bench('csv-stringify: large', () => {
    stringify(largeData, { header: true });
  });

  bench('d3-dsv: stringify simple', () => {
    csvFormat(simpleData);
  });
  bench('d3-dsv: stringify complex', () => {
    csvFormat(complexData);
  });
  bench('d3-dsv: stringify large', () => {
    csvFormat(largeData);
  });
});

describe('CSV Round-trip Performance', () => {
  const data = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    value: Math.random() * 1000,
  }));

  bench('molt-csv: parse → stringify → parse', () => {
    const csv = stringifyCSV(data);
    const parsed = parseCSV(csv);
    stringifyCSV(parsed);
  });

  bench('papaparse: parse → stringify → parse', () => {
    const csv = Papa.unparse(data);
    const parsed = Papa.parse(csv, { header: true }).data;
    Papa.unparse(parsed);
  });
});

describe('CSV Type Conversion Overhead', () => {
  const typedCSV = `id,value,active,created
1,123.45,true,2024-01-15
2,678.90,false,2024-02-20
3,234.56,true,2024-03-10`;

  bench('molt-csv: parse without types', () => {
    parseCSV(typedCSV);
  });

  bench('molt-csv: parse with types', () => {
    parseCSV(typedCSV, { parseTypes: true });
  });
});

describe('CSV Memory Efficiency', () => {
  // Generate very large CSV (10k rows)
  const veryLargeCSV = [
    'id,name,email,value,active',
    ...Array.from(
      { length: 10000 },
      (_, i) => `${i},User${i},user${i}@example.com,${Math.random() * 1000},${i % 2 === 0}`
    ),
  ].join('\n');

  bench('molt-csv: parse 10k rows', () => {
    parseCSV(veryLargeCSV);
  });

  bench('papaparse: parse 10k rows', () => {
    Papa.parse(veryLargeCSV, { header: true });
  });

  bench('csv-parse: parse 10k rows', () => {
    parse(veryLargeCSV, { columns: true });
  });
});
