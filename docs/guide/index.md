# Getting Started with Molt

Welcome to Molt, the high-performance data transformation stack! This guide will help you understand what Molt is and why you should use it.

## What is Molt?

Molt (蛻變, meaning "transformation") is a comprehensive suite of data transformation libraries built for performance and developer experience. Each package in the Molt ecosystem is designed to handle a specific data format with extreme efficiency and type safety.

### Available Packages

- **@sylphx/molt-json** - Type-preserving JSON parser and serializer
- **@sylphx/molt-yaml** - Ultra-fast YAML processor
- **@sylphx/molt-toml** - High-performance TOML parser
- **@sylphx/molt-csv** - Blazingly fast CSV handler
- **@sylphx/molt-xml** - Competitive XML parser with dirty input support

## Why Choose Molt?

### 🚀 Exceptional Performance

Molt consistently outperforms industry-standard libraries across all formats:

| Format | Performance | vs Competition |
|--------|-------------|-----------------|
| YAML | 1,021,050 ops/s | **2.87x faster** than js-yaml |
| TOML | 892,620 ops/s | **2.07x faster** than @iarna/toml |
| JSON | 610,000 ops/s | **1.7x faster** serialization |
| CSV | 775,770 ops/s | **5.9x faster** than papaparse |
| XML | 102,975 ops/s | Matches fast-xml-parser |

See [Benchmarks](/benchmarks) for detailed comparisons.

### 🛡️ Type Safety

JavaScript types like `Date`, `BigInt`, `Map`, `Set`, and `RegExp` are automatically preserved through serialization with molt-json:

```typescript
const data = {
  created: new Date(),
  id: 123456789012345678901n,
  tags: new Set(['a', 'b', 'c']),
  config: new Map([['key', 'value']])
}

const json = molt.stringify(data)
const restored = molt(json)

restored.created instanceof Date  // true
restored.id === 123456789012345678901n  // true
restored.tags instanceof Set  // true
```

### 🧹 Dirty Input Support

Real-world data is messy. Molt handles it gracefully:

```typescript
// JavaScript-style comments
const data = molt(`{
  // This is a comment
  name: 'Alice',         // Unquoted key
  email: 'alice@test.com', // Single quotes
  tags: [1, 2, 3,],      // Trailing comma
}`)
```

### 📦 Zero Dependencies

All Molt packages are production-grade with zero external dependencies. Pure TypeScript with optional Rust/WASM acceleration for compute-intensive operations.

### ⚡ Ready for Production

- 120+ test cases per package
- Streaming support for large files
- Schema validation (Zod, JSON Schema compatible)
- Comprehensive error messages
- Type-safe TypeScript APIs

## Quick Installation

### Using npm

```bash
npm install @sylphx/molt-json
```

### Using pnpm

```bash
pnpm add @sylphx/molt-json
```

### Using Bun

```bash
bun add @sylphx/molt-json
```

Replace `molt-json` with your desired package: `molt-yaml`, `molt-toml`, `molt-csv`, or `molt-xml`.

## Basic Usage Examples

### JSON

```typescript
import { molt, stringify } from '@sylphx/molt-json'

// Parse dirty JSON
const data = molt('{ name: "Alice", age: 30 }')

// Stringify with type preservation
const json = stringify({ created: new Date() })
```

### YAML

```typescript
import { parse, stringify } from '@sylphx/molt-yaml'

const config = parse(`
  database:
    host: localhost
    port: 5432
`)

console.log(stringify(config))
```

### TOML

```typescript
import { parse, stringify } from '@sylphx/molt-toml'

const config = parse(`
[package]
name = "my-app"
version = "1.0.0"
`)
```

### CSV

```typescript
import { parse, stringify } from '@sylphx/molt-csv'

const records = parse('name,age\nAlice,30')
console.log(stringify(records))
```

### XML

```typescript
import { parse, toObject } from '@sylphx/molt-xml'

const doc = parse('<root><item>value</item></root>')
const obj = toObject(doc)
```

## Next Steps

- **[Installation Guide](/guide/installation)** - Detailed setup for each package
- **[Quick Start Examples](/guide/quick-start)** - More comprehensive examples
- **[Benchmarks](/benchmarks)** - Performance comparison details
- **[Package Documentation](/packages/)** - Deep dive into each package's features

## Need Help?

- Check the [Frequently Asked Questions](#faq) below
- Visit the [GitHub Issues](https://github.com/sylphx/molt/issues)
- Start a [Discussion](https://github.com/sylphx/molt/discussions)

## FAQ

### Q: Which package should I choose?

**A:** Choose based on your data format:
- JSON data → `molt-json`
- YAML config → `molt-yaml`
- TOML settings → `molt-toml`
- CSV data → `molt-csv`
- XML documents → `molt-xml`

### Q: Does Molt require special setup?

**A:** No! Just install the package and start using it. Zero configuration needed.

### Q: Are types truly preserved in molt-json?

**A:** Yes! `Date`, `BigInt`, `Map`, `Set`, `RegExp`, `Uint8Array`, and more are automatically preserved through stringify/parse cycles.

### Q: How much faster is Molt really?

**A:** Significantly faster in most cases. YAML is 2-415x faster, TOML is 2-9x faster, JSON serialization is 1.7-2.3x faster. See benchmarks for details.

### Q: Is this production-ready?

**A:** Absolutely. Molt is used in production applications with 120+ tests per package and zero external dependencies.

---

Ready to get started? Check out the [Installation Guide](/guide/installation) next!
