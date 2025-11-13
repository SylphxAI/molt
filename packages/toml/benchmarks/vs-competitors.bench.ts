import { bench, describe } from 'vitest';
import { parseTOML, stringifyTOML } from '../src/index.js';

/**
 * TOML Parsing Benchmarks vs Competitors
 *
 * Comparing against popular TOML parsers:
 * - @iarna/toml (most popular npm package)
 * - smol-toml (lightweight alternative)
 */

// Sample TOML documents
const simpleTOML = `
title = "TOML Example"
version = "1.0.0"

[server]
host = "localhost"
port = 8080
enabled = true
`;

const nestedTOML = `
title = "Complex Config"

[database]
server = "192.168.1.1"
ports = [8000, 8001, 8002]
enabled = true

[database.connection]
max_retries = 5
timeout = 30

[[database.replicas]]
host = "replica1.example.com"
port = 5432

[[database.replicas]]
host = "replica2.example.com"
port = 5432

[cache]
ttl = 300
max_size = 1000
`;

const arrayOfTablesTOML = `
[[products]]
name = "Hammer"
sku = 738594937
color = "brown"

[[products]]
name = "Nail"
sku = 284758393
color = "grey"

[[products]]
name = "Screwdriver"
sku = 948576234
color = "red"

[[products]]
name = "Wrench"
sku = 837465928
color = "silver"
`;

describe('TOML Parsing Performance', () => {
  bench('molt-toml: simple config', () => {
    parseTOML(simpleTOML);
  });

  bench('molt-toml: nested tables', () => {
    parseTOML(nestedTOML);
  });

  bench('molt-toml: array of tables', () => {
    parseTOML(arrayOfTablesTOML);
  });

  // Competitors (install with: bun add -D @iarna/toml smol-toml)
  // Uncomment when packages are installed:

  // import TOML from '@iarna/toml';
  // bench('@iarna/toml: simple config', () => {
  //   TOML.parse(simpleTOML);
  // });
  // bench('@iarna/toml: nested tables', () => {
  //   TOML.parse(nestedTOML);
  // });
  // bench('@iarna/toml: array of tables', () => {
  //   TOML.parse(arrayOfTablesTOML);
  // });

  // import { parse as smolParse } from 'smol-toml';
  // bench('smol-toml: simple config', () => {
  //   smolParse(simpleTOML);
  // });
  // bench('smol-toml: nested tables', () => {
  //   smolParse(nestedTOML);
  // });
  // bench('smol-toml: array of tables', () => {
  //   smolParse(arrayOfTablesTOML);
  // });
});

describe('TOML Serialization Performance', () => {
  const simpleObj = {
    title: 'TOML Example',
    version: '1.0.0',
    server: {
      host: 'localhost',
      port: 8080,
      enabled: true,
    },
  };

  const nestedObj = {
    title: 'Complex Config',
    database: {
      server: '192.168.1.1',
      ports: [8000, 8001, 8002],
      enabled: true,
      connection: {
        max_retries: 5,
        timeout: 30,
      },
      replicas: [
        { host: 'replica1.example.com', port: 5432 },
        { host: 'replica2.example.com', port: 5432 },
      ],
    },
    cache: {
      ttl: 300,
      max_size: 1000,
    },
  };

  bench('molt-toml: stringify simple', () => {
    stringifyTOML(simpleObj);
  });

  bench('molt-toml: stringify nested', () => {
    stringifyTOML(nestedObj);
  });

  // Competitors
  // import TOML from '@iarna/toml';
  // bench('@iarna/toml: stringify simple', () => {
  //   TOML.stringify(simpleObj);
  // });
  // bench('@iarna/toml: stringify nested', () => {
  //   TOML.stringify(nestedObj);
  // });
});

describe('TOML Round-trip Performance', () => {
  bench('molt-toml: parse → stringify → parse', () => {
    const parsed = parseTOML(nestedTOML);
    const stringified = stringifyTOML(parsed);
    parseTOML(stringified);
  });

  // bench('@iarna/toml: parse → stringify → parse', () => {
  //   const parsed = TOML.parse(nestedTOML);
  //   const stringified = TOML.stringify(parsed);
  //   TOML.parse(stringified);
  // });
});
