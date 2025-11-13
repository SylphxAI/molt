---
layout: home

hero:
  name: "Molt"
  text: "Data Transformation Stack"
  tagline: High-performance data transformation for JSON, YAML, TOML, INI, CSV, XML, MessagePack, and TOON
  image:
    src: /logo.svg
    alt: Molt
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View Benchmarks
      link: /benchmarks

features:
  - icon: "⚡"
    title: "Performance"
    details: "415x faster YAML, 9x faster TOML, 2.5x faster JSON. Built for speed with Rust + WASM acceleration."
  - icon: "🛡️"
    title: "Type Safety"
    details: "Preserve JavaScript types like Date, BigInt, Map, Set, and RegExp through serialization."
  - icon: "🧹"
    title: "Dirty Input Support"
    details: "Parse real-world malformed JSON with unquoted keys, comments, and trailing commas."
  - icon: "🚀"
    title: "WASM Acceleration"
    details: "Zero-copy parsing and optimized algorithms powered by Rust WebAssembly modules."
  - icon: "📦"
    title: "Zero Dependencies"
    details: "Lightweight packages with no external dependencies for maximum compatibility."
  - icon: "🎯"
    title: "Developer Experience"
    details: "Simple APIs, comprehensive error messages, and detailed TypeScript support."
---

## Why Choose Molt?

Molt is a comprehensive data transformation stack built for performance-critical applications. Each package is optimized for real-world use cases with battle-tested algorithms and zero compromise on reliability.

### 🏆 Performance Leaders

- **molt-yaml**: Dominates YAML parsing (2-415x faster)
- **molt-toml**: Clear TOML performance winner (2-9x faster)
- **molt-json**: Best-in-class JSON serialization (1.7-2.3x faster)
- **molt-ini**: Fast INI configuration (2-3x faster)
- **molt-csv**: Highly competitive CSV parsing (top-tier performance)
- **molt-xml**: Matches fastest parsers with unique dirty XML support
- **molt-msgpack**: Competitive binary format (20-50% smaller than JSON)
- **molt-toon**: LLM-optimized format (30-60% token savings)

### 🚀 Get Started in Seconds

Install individual packages for only what you need:

```bash
# JSON transformation
npm install @sylphx/molt-json

# YAML processing
npm install @sylphx/molt-yaml

# TOML configuration
npm install @sylphx/molt-toml

# INI configuration
npm install @sylphx/molt-ini

# CSV data handling
npm install @sylphx/molt-csv

# XML parsing
npm install @sylphx/molt-xml

# MessagePack binary format
npm install @sylphx/molt-msgpack

# TOON (LLM-optimized)
npm install @sylphx/molt-toon

# Or install all formats
npm install @sylphx/molt
```

### 💪 Production Ready

- 120+ comprehensive test cases per package
- Type-safe TypeScript APIs with strict mode
- Streaming support for large files
- Schema validation (Zod, JSON Schema)
- Battle-tested by real-world applications

## Quick Examples

### JSON with Type Preservation

```typescript
import { molt } from '@sylphx/molt-json'

const data = molt(`{
  user: 'alice',
  joined: new Date(),
  settings: new Map([['theme', 'dark']])
}`)

// Types are preserved!
data.joined instanceof Date  // true
```

### YAML Ultra-Fast

```typescript
import { parse, stringify } from '@sylphx/molt-yaml'

const config = parse(`
  database:
    host: localhost
    port: 5432
    credentials:
      username: admin
      password: secret
`)

console.log(stringify(config))
```

### TOML Configuration

```typescript
import { parse } from '@sylphx/molt-toml'

const toml = parse(`
[package]
name = "my-app"
version = "1.0.0"

[dependencies]
react = "^18.0.0"
`)
```

### CSV Data Processing

```typescript
import { parse, stringify } from '@sylphx/molt-csv'

const records = parse(`
name,age,city
Alice,30,New York
Bob,25,San Francisco
`)

stringify(records)
```

### INI Configuration

```typescript
import { molt } from '@sylphx/molt-ini'

const config = molt(`
[database]
host = localhost
port = 5432

[server]
timeout = 30
`)

console.log(config.database.port) // 5432
```

### MessagePack Binary

```typescript
import { encode, decode } from '@sylphx/molt-msgpack'

const data = { user: 'alice', score: 9999 }

// Encode to binary (20-50% smaller than JSON)
const binary = encode(data)

// Decode back to JavaScript
const restored = decode(binary)
```

### TOON for LLMs

```typescript
import { stringify } from '@sylphx/molt-toon'

const data = {
  users: [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' }
  ]
}

// 30-60% fewer tokens!
console.log(stringify(data))
// Output:
// users:
//   id | name  | role
//   1  | Alice | admin
//   2  | Bob   | user
```

## All Packages

| Package | Purpose | Performance | Key Features |
|---------|---------|-------------|--------------|
| **@sylphx/molt-json** | JSON with types | 1.7-2.5x faster | Type preservation, dirty JSON support |
| **@sylphx/molt-yaml** | YAML parsing | 2-415x faster | Full YAML 1.2, anchors, multi-doc |
| **@sylphx/molt-toml** | TOML config | 2-9x faster | Nested tables, arrays, type-safe |
| **@sylphx/molt-ini** | INI config | 2-3x faster | Git/PHP/Windows INI compatible |
| **@sylphx/molt-csv** | CSV data | Top-tier | Type detection, WASM acceleration |
| **@sylphx/molt-xml** | XML parsing | Matches fastest | Dirty XML cleaning, namespace support |
| **@sylphx/molt-msgpack** | Binary format | Competitive | 20-50% smaller, full type support |
| **@sylphx/molt-toon** | LLM-optimized | 30-60% tokens | Table format, minimal quoting |

## Documentation

- **[Guide](/guide/)** - Getting started and core concepts
- **[Installation](/guide/installation)** - Setup instructions for all packages
- **[Quick Start](/guide/quick-start)** - Common examples for each format
- **[Benchmarks](/benchmarks)** - Detailed performance comparisons
- **[Packages](/packages/)** - Individual package documentation

## Contributing

We welcome contributions! Check out our [Contributing Guide](https://github.com/sylphx/molt/blob/main/CONTRIBUTING.md) for details on how to help.

## License

MIT © [Sylphx](https://github.com/sylphx)

---

**Built with ❤️ for performance**
