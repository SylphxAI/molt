# @sylphx/molt-yaml

[![npm version](https://badge.fury.io/js/@sylphx%2Fmolt-yaml.svg)](https://www.npmjs.com/package/@sylphx/molt-yaml)
[![CI](https://github.com/sylphx/molt/workflows/CI/badge.svg)](https://github.com/sylphx/molt/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)

**Fast and robust YAML transformer** - Full YAML 1.2 · Type preservation · Zero dependencies

---

## Why molt-yaml?

✅ **Full YAML 1.2 support** - All features including anchors, aliases, multi-documents
🔥 **Zero dependencies** - Lightweight and secure
🎯 **Type-safe** - Full TypeScript support with strict types
🛡️ **Production-ready** - Comprehensive test coverage
⚡ **Fast parsing** - Efficient parser implementation

```typescript
import { molt } from '@sylphx/molt-yaml'

// Parse YAML to JavaScript
const config = molt(`
  app: MyApp
  server:
    host: localhost
    port: 8080
  features:
    - auth
    - logging
    - metrics
`)

// config.server.port === 8080
// config.features === ['auth', 'logging', 'metrics']
```

---

## Features

### 📝 Full YAML 1.2 Support

All YAML features are fully supported:

```yaml
# Scalars
string: Hello, World!
integer: 42
float: 3.14
boolean: true
null_value: null
date: 2024-01-15

# Collections
list:
  - item1
  - item2
  - item3

inline_list: [1, 2, 3]

object:
  key1: value1
  key2: value2

inline_object: {x: 1, y: 2}

# Nested structures
users:
  - name: Alice
    age: 30
    roles:
      - admin
      - developer
  - name: Bob
    age: 25
    roles:
      - user

# Multi-line strings
description: |
  This is a multi-line
  string that preserves
  newlines.

folded: >
  This is a folded
  string that joins
  lines with spaces.

# Anchors and aliases
defaults: &defaults
  host: localhost
  port: 8080

development:
  <<: *defaults
  debug: true

production:
  <<: *defaults
  debug: false

# Multiple documents
---
document: 1
---
document: 2
```

### 🎯 Type Preservation

Native JavaScript types are preserved:

```typescript
import { molt, stringifyYAML } from '@sylphx/molt-yaml'

const data = {
  created: new Date('2024-01-15T10:30:00Z'),
  config: {
    port: 8080,
    enabled: true,
  },
  tags: ['typescript', 'yaml'],
}

const yaml = stringifyYAML(data)
const parsed = molt(yaml)

parsed.created instanceof Date  // true
```

### ⚙️ Flexible Formatting

Control output format with options:

```typescript
import { stringifyYAML } from '@sylphx/molt-yaml'

const data = {
  users: [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
  ],
}

// Compact format
const compact = stringifyYAML(data, {
  indent: 2,
  flowLevel: 1,
})

// Expanded format
const expanded = stringifyYAML(data, {
  indent: 2,
  flowLevel: -1,
})
```

---

## Installation

```bash
bun add @sylphx/molt-yaml
# or
npm install @sylphx/molt-yaml
# or
pnpm add @sylphx/molt-yaml
```

---

## API

### ⚡ Unified API (Recommended)

#### `molt(input, options?)`

Parse YAML string to JavaScript object.

```typescript
import { molt } from '@sylphx/molt-yaml'

const config = molt(`
  name: MyApp
  version: 1.0.0
`)
```

**Options:**

```typescript
interface ParseYAMLOptions {
  schema?: 'core' | 'json' | 'failsafe'  // YAML schema (default: 'core')
  strict?: boolean        // Strict mode (default: false)
  maxDepth?: number       // Maximum nesting depth (default: 100)
  maxSize?: number        // Maximum input size in bytes
}
```

**Example:**

```typescript
// Use JSON schema (no dates, binary, etc.)
const config = molt(yaml, { schema: 'json' })

// Strict mode (no duplicate keys, etc.)
const config = molt(yaml, { strict: true })

// Limit nesting depth
const config = molt(yaml, { maxDepth: 50 })
```

### 📦 Stringify

#### `stringifyYAML(value, options?)`

Serialize JavaScript object to YAML string.

```typescript
import { stringifyYAML } from '@sylphx/molt-yaml'

const yaml = stringifyYAML({
  app: 'MyApp',
  server: {
    host: 'localhost',
    port: 8080,
  },
})
```

**Options:**

```typescript
interface StringifyYAMLOptions {
  indent?: number         // Indentation spaces (default: 2)
  flowLevel?: number      // Flow level for collections (default: -1)
  lineWidth?: number      // Max line width (default: 80)
  sortKeys?: boolean      // Sort object keys (default: false)
  noRefs?: boolean        // Disable anchors/aliases (default: false)
}
```

**Example:**

```typescript
// Compact inline format
const yaml = stringifyYAML(data, {
  flowLevel: 0,
  lineWidth: 120,
})

// Sort keys alphabetically
const yaml = stringifyYAML(data, {
  sortKeys: true,
})

// Disable anchors and aliases
const yaml = stringifyYAML(data, {
  noRefs: true,
})
```

### 🔧 Class API

```typescript
import { MoltYAML } from '@sylphx/molt-yaml'

// Parse
const data = MoltYAML.parse(yamlString)

// Stringify
const yaml = MoltYAML.stringify(data)
```

### 🚨 Error Handling

```typescript
import { molt, YAMLError, ParseError } from '@sylphx/molt-yaml'

try {
  const data = molt(invalidYaml)
} catch (err) {
  if (err instanceof ParseError) {
    console.error(`Parse error at line ${err.line}: ${err.message}`)
  } else if (err instanceof YAMLError) {
    console.error(`YAML error: ${err.message}`)
  }
}
```

---

## Use Cases

### 1. Configuration Files

```typescript
import { molt } from '@sylphx/molt-yaml'
import fs from 'fs'

// Read .github/workflows/ci.yml
const workflow = molt(fs.readFileSync('.github/workflows/ci.yml', 'utf8'))
console.log(workflow.name, workflow.on)

// Read docker-compose.yml
const compose = molt(fs.readFileSync('docker-compose.yml', 'utf8'))
console.log(compose.services)

// Read Kubernetes manifest
const deployment = molt(fs.readFileSync('deployment.yaml', 'utf8'))
```

### 2. Generate Configuration

```typescript
import { stringifyYAML } from '@sylphx/molt-yaml'
import fs from 'fs'

const config = {
  version: '3.8',
  services: {
    web: {
      image: 'nginx:latest',
      ports: ['80:80'],
      volumes: ['./html:/usr/share/nginx/html'],
    },
    db: {
      image: 'postgres:14',
      environment: {
        POSTGRES_PASSWORD: 'secret',
      },
    },
  },
}

fs.writeFileSync('docker-compose.yml', stringifyYAML(config))
```

### 3. Multi-Document YAML

```typescript
import { parseYAML } from '@sylphx/molt-yaml'

const yaml = `
---
kind: Deployment
metadata:
  name: app
---
kind: Service
metadata:
  name: app-service
`

const docs = parseYAML(yaml, { multi: true })
// Returns array of documents
```

### 4. Type-Safe Config with Validation

```typescript
import { molt } from '@sylphx/molt-yaml'
import { z } from 'zod'

const configSchema = z.object({
  app: z.object({
    name: z.string(),
    port: z.number().min(1).max(65535),
  }),
  database: z.object({
    host: z.string(),
    port: z.number(),
  }),
})

const config = molt(fs.readFileSync('config.yml', 'utf8'))
const validated = configSchema.parse(config)
```

---

## Supported YAML Features

| Feature | Parsing | Stringifying |
|---------|---------|--------------|
| Scalars (string, number, boolean, null) | ✅ | ✅ |
| Dates | ✅ | ✅ |
| Lists (block and flow) | ✅ | ✅ |
| Maps (block and flow) | ✅ | ✅ |
| Nested structures | ✅ | ✅ |
| Multi-line strings (`\|` and `>`) | ✅ | ✅ |
| Comments | ✅ | ❌ |
| Anchors and aliases | ✅ | ✅ |
| Merge keys `<<` | ✅ | ✅ |
| Multi-document | ✅ | ✅ |
| Custom tags | ✅ | ✅ |
| Binary data | ✅ | ✅ |

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

### Development

```bash
# Install dependencies (from monorepo root)
cd ../..
bun install

# Run tests
bun test

# Build
bun run build

# Lint and format
bun lint
bun format
```

---

## Part of molt Family

`@sylphx/molt-yaml` is part of the **molt data transformation stack**:

- **@sylphx/molt-json** - JSON transformer
- **@sylphx/molt-xml** - XML transformer
- **@sylphx/molt-yaml** - YAML transformer (this package)
- **@sylphx/molt-toml** - TOML transformer
- **@sylphx/molt-csv** - CSV transformer
- **@sylphx/molt** - Meta package with all formats

See the [monorepo root](../..) for more information.

---

## License

MIT © [Sylphx](../../LICENSE)

---

## YAML Specification

This package implements [YAML 1.2](https://yaml.org/spec/1.2/spec.html).
