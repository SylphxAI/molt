---
layout: home

hero:
  name: "Molt"
  text: "蛻變 - Data Transformation Stack"
  tagline: High-performance data transformation libraries for JSON, XML, YAML, TOML, and CSV
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
- **molt-csv**: Highly competitive CSV parsing (top-tier performance)
- **molt-xml**: Matches fastest parsers with unique dirty XML support

### 🚀 Get Started in Seconds

Install individual packages for only what you need:

```bash
# JSON transformation
npm install @sylphx/molt-json

# YAML processing
npm install @sylphx/molt-yaml

# TOML configuration
npm install @sylphx/molt-toml

# CSV data handling
npm install @sylphx/molt-csv

# XML parsing
npm install @sylphx/molt-xml
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
