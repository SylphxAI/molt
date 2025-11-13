import { bench, describe } from 'vitest';
import { encode, decode } from '../src/index.js';
import * as msgpackOfficial from '@msgpack/msgpack';
import * as msgpackLite from 'msgpack-lite';

// Test data
const simpleObj = {
  id: 12345,
  name: 'Alice Smith',
  email: 'alice@example.com',
  active: true,
};

const complexObj = {
  id: 12345,
  username: 'alice_smith',
  email: 'alice@example.com',
  active: true,
  profile: {
    firstName: 'Alice',
    lastName: 'Smith',
    age: 28,
    interests: ['coding', 'music', 'travel'],
  },
  settings: {
    notifications: true,
    theme: 'dark',
  },
  metadata: {
    created: 1234567890,
    updated: 1234567900,
  },
};

const arrayData = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: `User ${i}`,
  active: i % 2 === 0,
}));

const nestedData = {
  level1: {
    level2: {
      level3: {
        level4: {
          level5: {
            value: 'deep nested',
            numbers: [1, 2, 3, 4, 5],
          },
        },
      },
    },
  },
};

// Pre-encoded data for decode benchmarks
const simpleEncoded = encode(simpleObj);
const complexEncoded = encode(complexObj);
const arrayEncoded = encode(arrayData);
const nestedEncoded = encode(nestedData);

const simpleEncodedOfficial = msgpackOfficial.encode(simpleObj);
const complexEncodedOfficial = msgpackOfficial.encode(complexObj);
const arrayEncodedOfficial = msgpackOfficial.encode(arrayData);

const simpleEncodedLite = msgpackLite.encode(simpleObj);
const complexEncodedLite = msgpackLite.encode(complexObj);
const arrayEncodedLite = msgpackLite.encode(arrayData);

describe('MessagePack Encoding Benchmarks', () => {
  describe('Encode simple object', () => {
    bench('molt-msgpack', () => {
      encode(simpleObj);
    });

    bench('@msgpack/msgpack', () => {
      msgpackOfficial.encode(simpleObj);
    });

    bench('msgpack-lite', () => {
      msgpackLite.encode(simpleObj);
    });

    bench('JSON.stringify (baseline)', () => {
      JSON.stringify(simpleObj);
    });
  });

  describe('Encode complex object', () => {
    bench('molt-msgpack', () => {
      encode(complexObj);
    });

    bench('@msgpack/msgpack', () => {
      msgpackOfficial.encode(complexObj);
    });

    bench('msgpack-lite', () => {
      msgpackLite.encode(complexObj);
    });

    bench('JSON.stringify (baseline)', () => {
      JSON.stringify(complexObj);
    });
  });

  describe('Encode array of objects', () => {
    bench('molt-msgpack', () => {
      encode(arrayData);
    });

    bench('@msgpack/msgpack', () => {
      msgpackOfficial.encode(arrayData);
    });

    bench('msgpack-lite', () => {
      msgpackLite.encode(arrayData);
    });

    bench('JSON.stringify (baseline)', () => {
      JSON.stringify(arrayData);
    });
  });

  describe('Encode nested structure', () => {
    bench('molt-msgpack', () => {
      encode(nestedData);
    });

    bench('@msgpack/msgpack', () => {
      msgpackOfficial.encode(nestedData);
    });

    bench('msgpack-lite', () => {
      msgpackLite.encode(nestedData);
    });

    bench('JSON.stringify (baseline)', () => {
      JSON.stringify(nestedData);
    });
  });
});

describe('MessagePack Decoding Benchmarks', () => {
  describe('Decode simple object', () => {
    bench('molt-msgpack', () => {
      decode(simpleEncoded);
    });

    bench('@msgpack/msgpack', () => {
      msgpackOfficial.decode(simpleEncodedOfficial);
    });

    bench('msgpack-lite', () => {
      msgpackLite.decode(simpleEncodedLite);
    });

    bench('JSON.parse (baseline)', () => {
      JSON.parse(JSON.stringify(simpleObj));
    });
  });

  describe('Decode complex object', () => {
    bench('molt-msgpack', () => {
      decode(complexEncoded);
    });

    bench('@msgpack/msgpack', () => {
      msgpackOfficial.decode(complexEncodedOfficial);
    });

    bench('msgpack-lite', () => {
      msgpackLite.decode(complexEncodedLite);
    });

    bench('JSON.parse (baseline)', () => {
      JSON.parse(JSON.stringify(complexObj));
    });
  });

  describe('Decode array of objects', () => {
    bench('molt-msgpack', () => {
      decode(arrayEncoded);
    });

    bench('@msgpack/msgpack', () => {
      msgpackOfficial.decode(arrayEncodedOfficial);
    });

    bench('msgpack-lite', () => {
      msgpackLite.decode(arrayEncodedLite);
    });

    bench('JSON.parse (baseline)', () => {
      JSON.parse(JSON.stringify(arrayData));
    });
  });

  describe('Decode nested structure', () => {
    bench('molt-msgpack', () => {
      decode(nestedEncoded);
    });

    bench('@msgpack/msgpack', () => {
      msgpackOfficial.decode(nestedEncodedOfficial);
    });

    bench('msgpack-lite', () => {
      msgpackLite.decode(nestedEncodedLite);
    });

    bench('JSON.parse (baseline)', () => {
      JSON.parse(JSON.stringify(nestedData));
    });
  });
});

describe('MessagePack Round-trip Benchmarks', () => {
  describe('Round-trip simple object', () => {
    bench('molt-msgpack', () => {
      decode(encode(simpleObj));
    });

    bench('@msgpack/msgpack', () => {
      msgpackOfficial.decode(msgpackOfficial.encode(simpleObj));
    });

    bench('msgpack-lite', () => {
      msgpackLite.decode(msgpackLite.encode(simpleObj));
    });

    bench('JSON (baseline)', () => {
      JSON.parse(JSON.stringify(simpleObj));
    });
  });

  describe('Round-trip complex object', () => {
    bench('molt-msgpack', () => {
      decode(encode(complexObj));
    });

    bench('@msgpack/msgpack', () => {
      msgpackOfficial.decode(msgpackOfficial.encode(complexObj));
    });

    bench('msgpack-lite', () => {
      msgpackLite.decode(msgpackLite.encode(complexObj));
    });

    bench('JSON (baseline)', () => {
      JSON.parse(JSON.stringify(complexObj));
    });
  });
});
