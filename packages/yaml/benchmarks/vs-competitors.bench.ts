import { bench, describe } from 'vitest';
import { parseYAML, stringifyYAML } from '../src/index.js';

/**
 * YAML Parsing Benchmarks vs Competitors
 *
 * Comparing against popular YAML parsers:
 * - js-yaml (most popular)
 * - yaml (newer, better spec support)
 */

// Sample YAML documents
const simpleYAML = `
app: MyApp
version: 1.0.0
server:
  host: localhost
  port: 8080
  enabled: true
`;

const complexYAML = `
app: Production App
version: 2.5.0

database:
  host: db.example.com
  port: 5432
  credentials:
    username: admin
    password: secret
  replicas:
    - host: replica1.example.com
      port: 5432
    - host: replica2.example.com
      port: 5432
    - host: replica3.example.com
      port: 5432

cache:
  type: redis
  ttl: 3600
  nodes:
    - redis1.example.com:6379
    - redis2.example.com:6379
    - redis3.example.com:6379

features:
  - authentication
  - logging
  - metrics
  - tracing
  - caching
`;

const anchorsYAML = `
defaults: &defaults
  host: localhost
  port: 8080
  timeout: 30
  retries: 3

development:
  <<: *defaults
  debug: true
  log_level: debug

production:
  <<: *defaults
  debug: false
  log_level: error
  replicas: 3

staging:
  <<: *defaults
  debug: true
  log_level: info
  replicas: 2
`;

const multiDocYAML = `
---
kind: Deployment
metadata:
  name: app
spec:
  replicas: 3
---
kind: Service
metadata:
  name: app-service
spec:
  type: LoadBalancer
  ports:
    - port: 80
---
kind: ConfigMap
metadata:
  name: app-config
data:
  config.yml: |
    app: MyApp
    version: 1.0.0
`;

const multilineYAML = `
description: |
  This is a long description
  that spans multiple lines
  and preserves newlines
  for better readability.

folded: >
  This is a folded string
  that will be joined into
  a single line with spaces
  between the words.

literal: |
  Line 1
  Line 2
  Line 3
  Line 4
  Line 5
`;

describe('YAML Parsing Performance', () => {
  bench('molt-yaml: simple config', () => {
    parseYAML(simpleYAML);
  });

  bench('molt-yaml: complex nested', () => {
    parseYAML(complexYAML);
  });

  bench('molt-yaml: anchors and aliases', () => {
    parseYAML(anchorsYAML);
  });

  bench('molt-yaml: multi-document', () => {
    parseYAML(multiDocYAML);
  });

  bench('molt-yaml: multiline strings', () => {
    parseYAML(multilineYAML);
  });

  // Competitors (install with: bun add -D js-yaml yaml)
  // Uncomment when packages are installed:

  // import jsyaml from 'js-yaml';
  // bench('js-yaml: simple config', () => {
  //   jsyaml.load(simpleYAML);
  // });
  // bench('js-yaml: complex nested', () => {
  //   jsyaml.load(complexYAML);
  // });
  // bench('js-yaml: anchors and aliases', () => {
  //   jsyaml.load(anchorsYAML);
  // });
  // bench('js-yaml: multiline strings', () => {
  //   jsyaml.load(multilineYAML);
  // });

  // import YAML from 'yaml';
  // bench('yaml: simple config', () => {
  //   YAML.parse(simpleYAML);
  // });
  // bench('yaml: complex nested', () => {
  //   YAML.parse(complexYAML);
  // });
  // bench('yaml: anchors and aliases', () => {
  //   YAML.parse(anchorsYAML);
  // });
  // bench('yaml: multi-document', () => {
  //   YAML.parseAllDocuments(multiDocYAML);
  // });
  // bench('yaml: multiline strings', () => {
  //   YAML.parse(multilineYAML);
  // });
});

describe('YAML Serialization Performance', () => {
  const simpleObj = {
    app: 'MyApp',
    version: '1.0.0',
    server: {
      host: 'localhost',
      port: 8080,
      enabled: true,
    },
  };

  const complexObj = {
    app: 'Production App',
    version: '2.5.0',
    database: {
      host: 'db.example.com',
      port: 5432,
      credentials: {
        username: 'admin',
        password: 'secret',
      },
      replicas: [
        { host: 'replica1.example.com', port: 5432 },
        { host: 'replica2.example.com', port: 5432 },
        { host: 'replica3.example.com', port: 5432 },
      ],
    },
    cache: {
      type: 'redis',
      ttl: 3600,
      nodes: [
        'redis1.example.com:6379',
        'redis2.example.com:6379',
        'redis3.example.com:6379',
      ],
    },
    features: ['authentication', 'logging', 'metrics', 'tracing', 'caching'],
  };

  bench('molt-yaml: stringify simple', () => {
    stringifyYAML(simpleObj);
  });

  bench('molt-yaml: stringify complex', () => {
    stringifyYAML(complexObj);
  });

  // Competitors
  // import jsyaml from 'js-yaml';
  // bench('js-yaml: stringify simple', () => {
  //   jsyaml.dump(simpleObj);
  // });
  // bench('js-yaml: stringify complex', () => {
  //   jsyaml.dump(complexObj);
  // });

  // import YAML from 'yaml';
  // bench('yaml: stringify simple', () => {
  //   YAML.stringify(simpleObj);
  // });
  // bench('yaml: stringify complex', () => {
  //   YAML.stringify(complexObj);
  // });
});

describe('YAML Round-trip Performance', () => {
  bench('molt-yaml: parse → stringify → parse', () => {
    const parsed = parseYAML(complexYAML);
    const stringified = stringifyYAML(parsed);
    parseYAML(stringified);
  });

  // bench('js-yaml: parse → stringify → parse', () => {
  //   const parsed = jsyaml.load(complexYAML);
  //   const stringified = jsyaml.dump(parsed);
  //   jsyaml.load(stringified);
  // });

  // bench('yaml: parse → stringify → parse', () => {
  //   const parsed = YAML.parse(complexYAML);
  //   const stringified = YAML.stringify(parsed);
  //   YAML.parse(stringified);
  // });
});

describe('YAML Large Document Performance', () => {
  // Generate large YAML document
  const items = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `Description for item ${i}`,
    price: Math.random() * 1000,
    inStock: Math.random() > 0.5,
    tags: ['tag1', 'tag2', 'tag3'],
  }));

  const largeYAML = stringifyYAML({ items });

  bench('molt-yaml: parse 1000 items', () => {
    parseYAML(largeYAML);
  });

  // bench('js-yaml: parse 1000 items', () => {
  //   jsyaml.load(largeYAML);
  // });

  // bench('yaml: parse 1000 items', () => {
  //   YAML.parse(largeYAML);
  // });
});
