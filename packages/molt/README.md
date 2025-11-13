# @sylphx/molt

[![npm version](https://badge.fury.io/js/@sylphx%2Fmolt.svg)](https://www.npmjs.com/package/@sylphx/molt)
[![CI](https://github.com/sylphx/molt/workflows/CI/badge.svg)](https://github.com/sylphx/molt/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)

**Unified data transformation stack** - One package for JSON, XML, YAML, TOML, and CSV with auto-detection

---

## Why molt?

🎯 **One import for all formats** - JSON, XML, YAML, TOML, CSV from a single package
🔮 **Auto-detection** - Automatically detects format and transforms
🚀 **High performance** - Each format optimized for speed
🎨 **Type preservation** - Maintains JavaScript types across formats
🔥 **Dirty cleaning** - Handles malformed data gracefully
🌊 **Streaming** - Process large files efficiently
🛡️ **Production-ready** - Comprehensive test coverage
⚡ **Zero core dependencies** - Lightweight and secure

```typescript
import { molt } from '@sylphx/molt'

// Auto-detect and parse any format
const json = molt('{"name": "alice"}')
const xml = molt('<user name="alice"/>')
const yaml = molt('name: alice\nage: 30')
const toml = molt('[server]\nhost = "localhost"')
const csv = molt('name,age\nalice,30')

// All return JavaScript objects!
```

---

## Quick Start

### Installation

```bash
bun add @sylphx/molt
# or
npm install @sylphx/molt
# or
pnpm add @sylphx/molt
```

### Auto-Detection (Recommended)

```typescript
import { molt } from '@sylphx/molt'

// Automatically detects format
const data = molt(input)

// Explicit format
const data = molt(input, { format: 'json' })
```

### Format-Specific APIs

```typescript
import { MoltJSON, MoltXML, MoltYAML, MoltTOML, MoltCSV } from '@sylphx/molt'

// JSON
const json = MoltJSON.parse('{"name": "alice"}')
const str = MoltJSON.stringify(data)

// XML
const xml = MoltXML.parse('<user name="alice"/>')
const obj = MoltXML.toObject('<user><name>alice</name></user>')

// YAML
const yaml = MoltYAML.parse('name: alice')
const str = MoltYAML.stringify(data)

// TOML
const toml = MoltTOML.parse('[server]\nhost = "localhost"')
const str = MoltTOML.stringify(data)

// CSV
const csv = MoltCSV.parse('name,age\nalice,30')
const str = MoltCSV.stringify(data)
```

---

## Features

### 🔮 Auto-Detection

Automatically detect and parse any supported format:

```typescript
import { molt, detectFormat } from '@sylphx/molt'

// Detect format
const format = detectFormat(input)
// => 'json' | 'xml' | 'yaml' | 'toml' | 'csv'

// Parse with auto-detection
const data = molt(input)

// Parse with explicit format
const data = molt(input, { format: 'yaml' })
```

Detection rules:
- **XML**: Starts with `<` or `<?xml`
- **JSON**: Starts with `{` or `[`
- **YAML**: Starts with `---` or has `key: value` pattern
- **TOML**: Has `[section]` or `key = value` pattern
- **CSV**: Has commas and multiple lines
- **Default**: JSON for ambiguous input

### 🚀 JSON Transformer

World's fastest JSON transformer with dirty cleaning and type preservation:

```typescript
import { molt } from '@sylphx/molt-json'

// Parse dirty JSON
const data = molt(`{
  user: 'alice',        // ✅ Single quotes
  age: 30,              // ✅ Trailing comma
  joined: Date.now(),   // ✅ Reconstructs as Date
}`)

// Stringify with types
const json = molt.stringify({
  date: new Date(),
  id: 123456789012345678901n,  // BigInt
  tags: new Set(['a', 'b']),
  meta: new Map([['key', 'value']]),
})
```

**Performance**: 380x faster than dirty-json, 2.3x faster than superjson

**Features**:
- Dirty JSON cleaning (unquoted keys, single quotes, comments, trailing commas)
- Type preservation (Date, BigInt, Map, Set, RegExp, URL, Error, undefined, NaN)
- Streaming (NDJSON, JSON arrays)
- Schema validation (Zod, JSON Schema)
- Custom type transformers
- WASM acceleration

[📖 Full JSON docs](../json/README.md)

### 🏷️ XML Transformer

Fast XML parser with dirty cleaning and object conversion:

```typescript
import { molt } from '@sylphx/molt-xml'

// Parse XML to object
const data = molt(`
  <user>
    <name>Alice</name>
    <age>30</age>
  </user>
`)
// => { user: { name: 'Alice', age: '30' } }

// Clean dirty XML
import { MoltXML } from '@sylphx/molt-xml'
const clean = MoltXML.clean('<user name=alice>')
// => '<user name="alice"></user>'
```

**Features**:
- Dirty XML cleaning (unquoted attributes, unclosed tags)
- Object conversion (attributes, CDATA, mixed content)
- DOM API (XMLDocument navigation)
- Namespace support
- Comments and processing instructions

[📖 Full XML docs](../xml/README.md)

### 📝 YAML Transformer

Full YAML 1.2 support with anchors, aliases, and multi-documents:

```typescript
import { molt } from '@sylphx/molt-yaml'

const config = molt(`
  app: MyApp
  server:
    host: localhost
    port: 8080
  features:
    - auth
    - logging
`)

// Anchors and aliases
const yaml = molt(`
defaults: &defaults
  host: localhost
  port: 8080

dev:
  <<: *defaults
  debug: true
`)
```

**Features**:
- Full YAML 1.2 specification
- Anchors and aliases
- Merge keys `<<`
- Multi-document support
- Multi-line strings (`|` and `>`)
- Custom tags

[📖 Full YAML docs](../yaml/README.md)

### ⚙️ TOML Transformer

Full TOML v1.0.0 support for configuration files:

```typescript
import { molt } from '@sylphx/molt-toml'

const config = molt(`
  title = "TOML Example"

  [database]
  server = "192.168.1.1"
  ports = [8000, 8001, 8002]

  [[products]]
  name = "Hammer"
  sku = 738594937
`)
```

**Features**:
- Full TOML v1.0.0 specification
- Nested tables and arrays
- Inline tables
- Multiline strings
- Dotted keys
- Date/time support

[📖 Full TOML docs](../toml/README.md)

### 📊 CSV Transformer

Fast CSV parser with WASM acceleration and streaming:

```typescript
import { molt } from '@sylphx/molt-csv'

const data = molt(`
name,age,city
Alice,30,NYC
Bob,25,LA
`)
// => [
//   { name: 'Alice', age: 30, city: 'NYC' },
//   { name: 'Bob', age: 25, city: 'LA' }
// ]

// Stream large files
import { parseStream } from '@sylphx/molt-csv'
for await (const record of parseStream(stream)) {
  console.log(record)  // Process one at a time
}
```

**Features**:
- WASM acceleration (3.6x faster)
- Streaming support
- Type conversion
- Custom delimiters (TSV, etc.)
- Header handling

[📖 Full CSV docs](../csv/README.md)

---

## API

### Unified API

#### `molt(input, options?)`

Auto-detect format and parse:

```typescript
import { molt } from '@sylphx/molt'

const data = molt(input, {
  format: 'auto',  // 'auto' | 'json' | 'xml' | 'yaml' | 'toml' | 'csv'
  // ... format-specific options
})
```

#### `detectFormat(input)`

Detect data format:

```typescript
import { detectFormat } from '@sylphx/molt'

const format = detectFormat(input)
// => 'json' | 'xml' | 'yaml' | 'toml' | 'csv'
```

#### `transform(input, options?)`

Transform with explicit or auto format:

```typescript
import { transform } from '@sylphx/molt'

const data = transform(input, {
  format: 'json',
  // ... options
})
```

### Format-Specific Classes

Each format has a dedicated class with parse/stringify methods:

```typescript
import { MoltJSON, MoltXML, MoltYAML, MoltTOML, MoltCSV } from '@sylphx/molt'

// JSON
MoltJSON.parse(input, options)
MoltJSON.stringify(value, options)

// XML
MoltXML.parse(input, options)
MoltXML.toObject(input, options)
MoltXML.stringify(doc, options)
MoltXML.clean(input)

// YAML
MoltYAML.parse(input, options)
MoltYAML.stringify(value, options)

// TOML
MoltTOML.parse(input, options)
MoltTOML.stringify(value, options)

// CSV
MoltCSV.parse(input, options)
MoltCSV.stringify(data, options)
```

---

## Use Cases

### 1. Configuration Files

```typescript
import { molt } from '@sylphx/molt'
import fs from 'fs'

// Read any config format
const config = molt(fs.readFileSync('config.toml', 'utf8'))
const pkg = molt(fs.readFileSync('package.json', 'utf8'))
const docker = molt(fs.readFileSync('docker-compose.yml', 'utf8'))
```

### 2. API Data Transformation

```typescript
import { molt, MoltJSON } from '@sylphx/molt'

// Parse API response
const data = molt(response.body)

// Serialize with types
const json = MoltJSON.stringify({
  createdAt: new Date(),
  userId: 123456789012345678901n,
})
```

### 3. Data Pipeline

```typescript
import { molt, MoltJSON, MoltCSV } from '@sylphx/molt'

// Read YAML config
const config = molt(fs.readFileSync('config.yml', 'utf8'))

// Fetch JSON data
const data = molt(await fetch(config.apiUrl).then(r => r.text()))

// Export to CSV
const csv = MoltCSV.stringify(data)
fs.writeFileSync('export.csv', csv)
```

### 4. Multi-Format Support

```typescript
import { molt, detectFormat } from '@sylphx/molt'

async function loadConfig(path: string) {
  const content = fs.readFileSync(path, 'utf8')
  const format = detectFormat(content)

  console.log(`Detected ${format} format`)

  return molt(content)
}

// Works with any format!
const config1 = await loadConfig('config.json')
const config2 = await loadConfig('config.yaml')
const config3 = await loadConfig('config.toml')
```

---

## Package Structure

The `@sylphx/molt` package includes all format transformers:

| Package | Description | Size |
|---------|-------------|------|
| **@sylphx/molt** | Meta package (all formats) | ~200KB |
| @sylphx/molt-json | JSON transformer | ~50KB |
| @sylphx/molt-xml | XML transformer | ~40KB |
| @sylphx/molt-yaml | YAML transformer | ~45KB |
| @sylphx/molt-toml | TOML transformer | ~35KB |
| @sylphx/molt-csv | CSV transformer | ~30KB |

### Tree-Shaking

Modern bundlers (Vite, esbuild, Rollup) will tree-shake unused formats:

```typescript
// Only bundles JSON transformer
import { molt } from '@sylphx/molt-json'
```

### Individual Packages

For minimal bundle size, install only what you need:

```bash
bun add @sylphx/molt-json      # JSON only
bun add @sylphx/molt-xml       # XML only
bun add @sylphx/molt-yaml      # YAML only
bun add @sylphx/molt-toml      # TOML only
bun add @sylphx/molt-csv       # CSV only
```

---

## Performance

All transformers are optimized for production use:

| Format | Operation | Speed |
|--------|-----------|-------|
| JSON | Parse dirty JSON | **380x faster** than dirty-json |
| JSON | Type serialization | **2.3x faster** than superjson |
| CSV | Parse with WASM | **3.6x faster** than JavaScript |
| XML | Parse to object | Fast state machine parser |
| YAML | Parse anchors | Full spec support |
| TOML | Parse nested tables | RFC compliant |

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

### Development

```bash
# Install dependencies (from monorepo root)
cd ../..
bun install

# Build all packages
bun run build

# Run tests
bun test

# Lint and format
bun lint
bun format
```

---

## License

MIT © [Sylphx](../../LICENSE)

---

## Links

- [GitHub Repository](https://github.com/sylphx/molt)
- [npm Package](https://www.npmjs.com/package/@sylphx/molt)
- [Documentation](https://github.com/sylphx/molt#readme)
- [Issues](https://github.com/sylphx/molt/issues)
