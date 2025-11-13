import { bench, describe } from 'vitest';
import { parseTOON, serializeTOON } from '../src/index.js';

// Test data
const simpleObj = {
  app: 'MyApp',
  version: '1.0.0',
  debug: false,
  port: 8080,
};

const tableData = {
  users: [
    { id: 1, name: 'Alice Smith', age: 30, active: true, role: 'admin' },
    { id: 2, name: 'Bob Jones', age: 25, active: false, role: 'user' },
    { id: 3, name: 'Charlie Brown', age: 35, active: true, role: 'user' },
    { id: 4, name: 'Diana Prince', age: 28, active: true, role: 'admin' },
    { id: 5, name: 'Eve Anderson', age: 32, active: false, role: 'user' },
  ],
};

const nestedObj = {
  config: {
    app: 'MyApp',
    version: '1.0.0',
    database: {
      host: 'localhost',
      port: 5432,
      name: 'myapp',
      pool: {
        min: 2,
        max: 10,
      },
    },
    server: {
      host: '0.0.0.0',
      port: 8080,
      workers: 4,
    },
  },
};

const complexData = {
  success: true,
  timestamp: 1234567890,
  data: [
    { id: 1, name: 'Product 1', price: 29.99, stock: 100, tags: ['new', 'featured'] },
    { id: 2, name: 'Product 2', price: 49.99, stock: 50, tags: ['sale'] },
    { id: 3, name: 'Product 3', price: 19.99, stock: 200, tags: ['popular'] },
  ],
  meta: {
    total: 3,
    page: 1,
    perPage: 10,
    hasMore: false,
  },
};

// Pre-serialized data for parse benchmarks
const simpleTOON = serializeTOON(simpleObj);
const tableTOON = serializeTOON(tableData);
const nestedTOON = serializeTOON(nestedObj);
const complexTOON = serializeTOON(complexData);

const simpleJSON = JSON.stringify(simpleObj);
const tableJSON = JSON.stringify(tableData);
const nestedJSON = JSON.stringify(nestedObj);
const complexJSON = JSON.stringify(complexData);

describe('TOON vs JSON - Serialization', () => {
  describe('Serialize simple object', () => {
    bench('TOON', () => {
      serializeTOON(simpleObj);
    });

    bench('JSON', () => {
      JSON.stringify(simpleObj);
    });

    bench('JSON (formatted)', () => {
      JSON.stringify(simpleObj, null, 2);
    });
  });

  describe('Serialize table data', () => {
    bench('TOON (table format)', () => {
      serializeTOON(tableData);
    });

    bench('JSON', () => {
      JSON.stringify(tableData);
    });

    bench('JSON (formatted)', () => {
      JSON.stringify(tableData, null, 2);
    });
  });

  describe('Serialize nested object', () => {
    bench('TOON', () => {
      serializeTOON(nestedObj);
    });

    bench('JSON', () => {
      JSON.stringify(nestedObj);
    });

    bench('JSON (formatted)', () => {
      JSON.stringify(nestedObj, null, 2);
    });
  });

  describe('Serialize complex data', () => {
    bench('TOON', () => {
      serializeTOON(complexData);
    });

    bench('JSON', () => {
      JSON.stringify(complexData);
    });

    bench('JSON (formatted)', () => {
      JSON.stringify(complexData, null, 2);
    });
  });
});

describe('TOON vs JSON - Parsing', () => {
  describe('Parse simple object', () => {
    bench('TOON', () => {
      parseTOON(simpleTOON);
    });

    bench('JSON', () => {
      JSON.parse(simpleJSON);
    });
  });

  describe('Parse table data', () => {
    bench('TOON', () => {
      parseTOON(tableTOON);
    });

    bench('JSON', () => {
      JSON.parse(tableJSON);
    });
  });

  describe('Parse nested object', () => {
    bench('TOON', () => {
      parseTOON(nestedTOON);
    });

    bench('JSON', () => {
      JSON.parse(nestedJSON);
    });
  });

  describe('Parse complex data', () => {
    bench('TOON', () => {
      parseTOON(complexTOON);
    });

    bench('JSON', () => {
      JSON.parse(complexJSON);
    });
  });
});

describe('TOON - Size Comparison', () => {
  describe('Simple object size', () => {
    bench('measure TOON size', () => {
      const toon = serializeTOON(simpleObj);
      return toon.length;
    });

    bench('measure JSON size', () => {
      const json = JSON.stringify(simpleObj);
      return json.length;
    });
  });

  describe('Table data size', () => {
    bench('measure TOON size', () => {
      const toon = serializeTOON(tableData);
      return toon.length;
    });

    bench('measure JSON size', () => {
      const json = JSON.stringify(tableData);
      return json.length;
    });

    bench('measure JSON (formatted) size', () => {
      const json = JSON.stringify(tableData, null, 2);
      return json.length;
    });
  });
});
