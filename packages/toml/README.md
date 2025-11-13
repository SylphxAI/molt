# @sylphx/molt-toml

[![npm version](https://badge.fury.io/js/@sylphx%2Fmolt-toml.svg)](https://www.npmjs.com/package/@sylphx/molt-toml)
[![CI](https://github.com/sylphx/molt/workflows/CI/badge.svg)](https://github.com/sylphx/molt/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)

**Fast and robust TOML transformer** - Full TOML v1.0.0 · Type-safe · Zero dependencies

---

## Why molt-toml?

✅ **Full TOML v1.0.0 support** - All features including nested arrays, multiline strings, dates
🔥 **Zero dependencies** - Lightweight and secure
🎯 **Type-safe** - Full TypeScript support with strict types
🛡️ **Production-ready** - 83 passing tests covering all TOML features
⚡ **Fast parsing** - Efficient state machine parser

```typescript
import { molt } from '@sylphx/molt-toml'

// Parse TOML to JavaScript
const config = molt(`
  title = "TOML Example"

  [database]
  server = "192.168.1.1"
  ports = [8000, 8001, 8002]
  enabled = true
`)

// config.database.server === "192.168.1.1"
// config.database.ports === [8000, 8001, 8002]
```

---

## Features

### 📝 Full TOML v1.0.0 Support

All TOML features are fully supported:

```toml
# Scalars
string = "Hello, World!"
integer = 42
float = 3.14
boolean = true
date = 2024-01-15T10:30:00Z

# Arrays
numbers = [1, 2, 3]
strings = ["red", "yellow", "green"]

# Tables
[server]
host = "localhost"
port = 8080

# Nested tables
[database.connection]
server = "192.168.1.1"
port = 5432

# Array of tables
[[products]]
name = "Hammer"
sku = 738594937

[[products]]
name = "Nail"
sku = 284758393

# Inline tables
point = { x = 1, y = 2, z = 3 }

# Multiline strings
description = """
Line 1
Line 2
Line 3"""

# Literal strings (no escaping)
path = 'C:\Users\nodejs\templates'

# Dotted keys
a.b.c = "nested value"
```

### 🎯 Type Preservation

Native JavaScript types are preserved:

```typescript
import { molt, stringifyTOML } from '@sylphx/molt-toml'

const config = {
  created: new Date('2024-01-15T10:30:00Z'),
  server: {
    host: 'localhost',
    port: 8080,
  },
  tags: ['rust', 'config'],
}

const toml = stringifyTOML(config)
const parsed = molt(toml)

parsed.created instanceof Date  // true
```

### ⚙️ Flexible Formatting

Control output format with options:

```typescript
import { stringifyTOML } from '@sylphx/molt-toml'

const data = { point: { x: 1, y: 2 } }

// Inline tables for small objects
const inline = stringifyTOML(data, { maxInlineKeys: 5 })
// point = { x = 1, y = 2 }

// Regular tables
const regular = stringifyTOML(data, { inlineTables: false })
// [point]
// x = 1
// y = 2

// Quote all keys
const quoted = stringifyTOML(data, { quoteKeys: true })
// ["point"]
// "x" = 1
// "y" = 2
```

---

## Installation

```bash
bun add @sylphx/molt-toml
# or
npm install @sylphx/molt-toml
# or
pnpm add @sylphx/molt-toml
```

---

## API

### ⚡ Unified API (Recommended)

#### `molt(input, options?)`

Parse TOML string to JavaScript object.

```typescript
import { molt } from '@sylphx/molt-toml'

const config = molt(`
  title = "My App"

  [server]
  host = "localhost"
  port = 8080
`)
```

**Options:**

```typescript
interface ParseTOMLOptions {
  parseDates?: boolean    // Convert date strings to Date objects (default: true)
  maxSize?: number        // Maximum input size in bytes (default: 10MB)
}
```

**Example:**

```typescript
// Keep dates as strings
const config = molt(toml, { parseDates: false })

// Limit input size
const config = molt(toml, { maxSize: 1024 * 1024 }) // 1MB
```

### 📦 Stringify

#### `stringifyTOML(value, options?)`

Serialize JavaScript object to TOML string.

```typescript
import { stringifyTOML } from '@sylphx/molt-toml'

const toml = stringifyTOML({
  title: 'My App',
  server: {
    host: 'localhost',
    port: 8080,
  },
})
```

**Options:**

```typescript
interface StringifyTOMLOptions {
  inlineTables?: boolean     // Use inline tables for small objects (default: true)
  maxInlineKeys?: number     // Max keys for inline tables (default: 0)
  quoteKeys?: boolean        // Quote all string keys (default: false)
  indent?: number            // Indentation spaces (default: 2)
}
```

**Example:**

```typescript
// Inline tables for objects with up to 3 keys
const toml = stringifyTOML(data, { maxInlineKeys: 3 })

// Never use inline tables
const toml = stringifyTOML(data, { inlineTables: false })

// Quote all keys
const toml = stringifyTOML(data, { quoteKeys: true })
```

### 🔧 Class API

```typescript
import { MoltTOML } from '@sylphx/molt-toml'

// Parse
const data = MoltTOML.parse(tomlString)

// Stringify
const toml = MoltTOML.stringify(data)
```

### 🚨 Error Handling

```typescript
import { molt, TOMLError, ParseError } from '@sylphx/molt-toml'

try {
  const data = molt(invalidToml)
} catch (err) {
  if (err instanceof ParseError) {
    console.error(`Parse error at line ${err.line}: ${err.message}`)
  } else if (err instanceof TOMLError) {
    console.error(`TOML error: ${err.message}`)
  }
}
```

---

## Use Cases

### 1. Configuration Files

```typescript
import { molt } from '@sylphx/molt-toml'
import fs from 'fs'

// Read Cargo.toml
const cargo = molt(fs.readFileSync('Cargo.toml', 'utf8'))
console.log(cargo.package.name, cargo.package.version)

// Read config.toml
const config = molt(fs.readFileSync('config.toml', 'utf8'))
```

### 2. Generate Configuration

```typescript
import { stringifyTOML } from '@sylphx/molt-toml'
import fs from 'fs'

const config = {
  package: {
    name: 'my-app',
    version: '0.1.0',
    edition: '2021',
  },
  dependencies: {
    serde: '1.0',
    tokio: '1.0',
  },
}

fs.writeFileSync('Cargo.toml', stringifyTOML(config))
```

### 3. Type-Safe Config with Validation

```typescript
import { molt } from '@sylphx/molt-toml'
import { z } from 'zod'

const configSchema = z.object({
  server: z.object({
    host: z.string(),
    port: z.number().min(1).max(65535),
  }),
  database: z.object({
    url: z.string().url(),
  }),
})

const config = molt(fs.readFileSync('config.toml', 'utf8'))
const validated = configSchema.parse(config)
```

---

## Supported TOML Features

| Feature | Parsing | Stringifying |
|---------|---------|--------------|
| Scalars (string, number, boolean) | ✅ | ✅ |
| Dates (RFC 3339) | ✅ | ✅ |
| Arrays | ✅ | ✅ |
| Tables `[table]` | ✅ | ✅ |
| Nested tables `[a.b.c]` | ✅ | ✅ |
| Array of tables `[[array]]` | ✅ | ✅ |
| Nested array of tables `[[a.b]]` | ✅ | ✅ |
| Inline tables `{ x = 1 }` | ✅ | ✅ |
| Dotted keys `a.b.c = 1` | ✅ | ✅ |
| Multiline strings `"""..."""` | ✅ | ✅ |
| Literal strings `'...'` | ✅ | ✅ |
| Multiline literal `'''...'''` | ✅ | ✅ |
| Comments | ✅ | ❌ |
| String escaping | ✅ | ✅ |
| Integer formats (hex, oct, bin) | ✅ | ❌ |

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

`@sylphx/molt-toml` is part of the **molt data transformation stack**:

- **@sylphx/molt-json** - JSON transformer
- **@sylphx/molt-xml** - XML transformer
- **@sylphx/molt-yaml** - YAML transformer
- **@sylphx/molt-toml** - TOML transformer (this package)
- **@sylphx/molt-csv** - CSV transformer
- **@sylphx/molt** - Meta package with all formats

See the [monorepo root](../..) for more information.

---

## License

MIT © [Sylphx](../../LICENSE)

---

## TOML Specification

This package implements [TOML v1.0.0](https://toml.io/en/v1.0.0).
