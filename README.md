# 🚀 Molt

[![CI](https://github.com/sylphx/molt/workflows/CI/badge.svg)](https://github.com/sylphx/molt/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%3E%3D1.0-black)](https://bun.sh)
[![Turbo](https://img.shields.io/badge/Turborepo-enabled-blue)](https://turbo.build)

**High-performance data transformation stack** for JSON, YAML, TOML, INI, CSV, XML, MessagePack, and TOON.

> 🏆 **415x faster YAML** | **9x faster TOML** | **2-3x faster INI** | **30-60% LLM token savings**

📦 [npm](https://www.npmjs.com/package/@sylphx/molt) | 🐙 [GitHub](https://github.com/SylphxAI/molt) | 🐦 [X](https://x.com/SylphxAI)

---

## 📦 Packages

### Core Data Formats

| Package | Status | Performance | Features |
|---------|--------|-------------|----------|
| **[@sylphx/molt-json](./packages/json/)** | ✅ Stable | 1.7-2.5x faster | Dirty JSON, Type preservation, Streaming, Validation |
| **[@sylphx/molt-yaml](./packages/yaml/)** | ✅ Stable | **2-415x faster** 🔥 | Anchors, Multi-doc, Full YAML 1.2 |
| **[@sylphx/molt-toml](./packages/toml/)** | ✅ Stable | **2-9x faster** ⚡ | Nested tables, Arrays, Type-safe |
| **[@sylphx/molt-ini](./packages/ini/)** | ✅ Stable | **2-3x faster** | Git config, PHP config, Windows INI |
| **[@sylphx/molt-csv](./packages/csv/)** | ✅ Stable | 1.4-7.6x faster | Type conversion, WASM, Streaming |
| **[@sylphx/molt-xml](./packages/xml/)** | ✅ Stable | Matches fastest | **Dirty XML cleaning** ⭐ |

### Binary & AI-Optimized Formats

| Package | Status | Performance | Features |
|---------|--------|-------------|----------|
| **[@sylphx/molt-msgpack](./packages/msgpack/)** | ✅ Stable | Competitive | Binary format, 20-50% smaller than JSON |
| **[@sylphx/molt-toon](./packages/toon/)** | ✅ Stable | **30-60% token savings** 🤖 | LLM-optimized, Table format, Minimal quoting |

### Meta Package

| Package | Status | Features |
|---------|--------|----------|
| **[@sylphx/molt](./packages/molt/)** | ✅ Stable | All formats in one package |

---

## ⚡ Quick Start

```bash
# Install individual packages
bun add @sylphx/molt-json
bun add @sylphx/molt-yaml
bun add @sylphx/molt-toml
bun add @sylphx/molt-ini
bun add @sylphx/molt-csv
bun add @sylphx/molt-xml
bun add @sylphx/molt-msgpack
bun add @sylphx/molt-toon

# Or install all at once
bun add @sylphx/molt
```

### JSON - Type Preservation

```typescript
import { molt } from '@sylphx/molt-json'

const data = molt(`{
  user: 'alice',        // ✅ Unquoted keys
  joined: new Date(),   // ✅ Date preserved
  id: 123n,            // ✅ BigInt preserved
}`)
```

### YAML - 415x Faster

```typescript
import { molt } from '@sylphx/molt-yaml'

const config = molt(`
app: MyApp
database:
  host: localhost
  port: 5432
`)
```

### TOML - 9x Faster

```typescript
import { molt } from '@sylphx/molt-toml'

const config = molt(`
[database]
host = "localhost"
port = 5432
`)
```

### CSV - Type Conversion

```typescript
import { parseCSV } from '@sylphx/molt-csv'

const data = parseCSV('name,age,active\nAlice,30,true', {
  parseTypes: true  // Auto-detect types
})
```

### XML - Dirty Support

```typescript
import { molt } from '@sylphx/molt-xml'

// Handles dirty XML automatically
const data = molt('<user name=alice age=30/>', {
  cleanDirty: true
})
```

### INI - Configuration Files

```typescript
import { molt } from '@sylphx/molt-ini'

const config = molt(`
[database]
host = localhost
port = 5432
`)

console.log(config.database.port) // 5432
```

### MessagePack - Binary Format

```typescript
import { encode, decode } from '@sylphx/molt-msgpack'

const data = { user: 'alice', id: 123 }
const binary = encode(data) // 20-50% smaller than JSON
const restored = decode(binary)
```

### TOON - LLM Optimized

```typescript
import { stringify } from '@sylphx/molt-toon'

const data = {
  users: [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 }
  ]
}

// 30-60% fewer tokens for LLM prompts!
const toon = stringify(data)
// users:
//   id | name  | age
//   1  | Alice | 30
//   2  | Bob   | 25
```

---

## 🏆 Performance

See [BENCHMARKS.md](./BENCHMARKS.md) for complete results.

### Executive Summary

| Format | Best Performance | vs Competitor |
|--------|-----------------|---------------|
| YAML | **415x faster** 🔥 | vs yaml (multi-doc) |
| TOML | **9x faster** ⚡ | vs @iarna/toml (nested) |
| INI | **2-3x faster** ⚡ | vs ini (npm) |
| JSON | **2.5x faster** ⚡ | vs superjson (serialize) |
| CSV | **7.6x faster** 🚀 | vs papaparse (quoted) |
| XML | Matches fastest | vs fast-xml-parser |
| MessagePack | Competitive | vs @msgpack/msgpack |
| TOON | **30-60% token savings** 🤖 | vs JSON for LLMs |

**Key Advantages:**
- 🥇 Fastest YAML parser in the ecosystem
- 🥇 Fastest TOML parser available
- 🥇 First high-performance TOON implementation
- 🥈 Top-tier JSON serialization performance
- 🥈 Competitive CSV with WASM acceleration
- 🥈 XML performance with unique dirty-cleaning
- 🥈 MessagePack with full type support

---

## 🎯 Features

### Core Features
- ⚡ **Blazing Fast** - Up to 415x faster than alternatives
- 🛡️ **Type Safety** - Full TypeScript support with strict types
- 🔧 **Dirty Input** - Handle malformed JSON/XML automatically
- 🦀 **WASM Acceleration** - Rust-powered for performance-critical paths
- 📦 **Zero Dependencies** - Minimal bundle size
- 🔄 **Streaming API** - Process large files efficiently

### Format-Specific Features

#### JSON
- Dirty JSON parsing (unquoted keys, trailing commas, comments)
- Type preservation (Date, BigInt, Map, Set, RegExp, etc.)
- Schema validation (Zod, JSON Schema)
- Streaming for large files

#### YAML
- Full YAML 1.2 spec support
- Anchors and aliases
- Multi-document parsing
- Custom tags
- 2-415x faster than competitors

#### TOML
- Tables and nested tables
- Array of tables
- Inline tables
- Type-safe parsing
- 2-9x faster than alternatives

#### INI
- Section support ([section])
- Comment support (; and #)
- Type coercion (numbers, booleans)
- Git/PHP/Windows INI compatible
- 2-3x faster than alternatives

#### CSV
- Automatic type detection
- Custom delimiters
- Header handling
- WASM acceleration
- Streaming support

#### XML
- DOM and object conversion
- CDATA support
- Namespace handling
- **Dirty XML cleaning** (unique!)
- Matches fastest parsers

#### MessagePack
- Full MessagePack spec support
- Binary data handling
- Date/timestamp encoding
- BigInt support
- 20-50% smaller than JSON

#### TOON
- **30-60% token savings for LLMs**
- Table format for uniform arrays
- Minimal quoting
- YAML-style indentation
- Perfect for ChatGPT/Claude/GPT-4 prompts

---

## 🏗️ Monorepo Structure

```
molt/
├── packages/
│   ├── json/          # JSON transformer
│   ├── yaml/          # YAML parser/serializer
│   ├── toml/          # TOML parser/serializer
│   ├── csv/           # CSV parser/serializer
│   ├── xml/           # XML parser/serializer
│   └── molt/          # Meta package
├── docs/              # VitePress documentation
├── .github/           # CI/CD workflows
├── .changeset/        # Changesets for versioning
├── turbo.json         # Turborepo configuration
└── BENCHMARKS.md      # Performance benchmarks
```

---

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Turbo](https://turbo.build) (installed via deps)

### Setup

```bash
# Clone the repository
git clone https://github.com/sylphx/molt.git
cd molt

# Install dependencies
bun install

# Build all packages (with Turbo cache)
turbo build

# Run tests for all packages
turbo test

# Run benchmarks
turbo bench

# Lint and format
bun lint
bun format
```

### Working with Changesets

```bash
# Create a changeset (for versioning)
bunx changeset

# Version packages
bunx changeset version

# Publish to npm
bunx changeset publish
```

### Documentation

```bash
# Start docs dev server
cd docs
bun dev

# Build docs
bun docs:build

# Preview built docs
bun docs:preview
```

---

## 📚 Documentation

- 📖 [Full Documentation](https://molt.sylph.ai) *(coming soon)*
- 📊 [Benchmarks](./BENCHMARKS.md)
- 🔧 [API Reference](./docs/api/)
- 📦 [Package Guides](./docs/packages/)

---

## 🎯 Technology Stack

- **Runtime**: [Bun](https://bun.sh) - Ultra-fast JavaScript runtime
- **Language**: TypeScript with strict mode
- **Monorepo**: [Turborepo](https://turbo.build) - High-performance build system
- **Versioning**: [Changesets](https://github.com/changesets/changesets) - Version management
- **Testing**: [Vitest](https://vitest.dev) - Fast unit testing
- **Benchmarking**: Vitest benchmark mode
- **Bundling**: [tsup](https://tsup.egoist.dev) - TypeScript bundler
- **Linting**: [Biome](https://biomejs.dev) - Fast linter and formatter
- **Docs**: [VitePress](https://vitepress.dev) - Documentation site
- **Acceleration**: Rust + WASM for performance-critical paths

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes with tests
4. Run tests: `turbo test`
5. Create a changeset: `bunx changeset`
6. Lint: `bun lint:fix`
7. Commit: `git commit -m "feat(json): add awesome feature"`
8. Push and create a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📝 License

MIT © [Sylphx](./LICENSE)

Each package in this monorepo is licensed under the MIT License.

---

## 🙏 Acknowledgments

Built with inspiration from:
- [dirty-json](https://github.com/RyanMarcus/dirty-json) - Original dirty JSON parser
- [superjson](https://github.com/flightcontrolhq/superjson) - Type-preserving JSON
- [js-yaml](https://github.com/nodeca/js-yaml) - YAML parser
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) - XML parser
- [papaparse](https://github.com/mholt/PapaParse) - CSV parser

Made **faster**, **more powerful**, and **production-ready** by [Sylphx](https://github.com/SylphxAI).

---

## 🌟 Star History

If you find Molt useful, please consider giving it a star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=sylphx/molt&type=Date)](https://star-history.com/#sylphx/molt&Date)

---

**Built with ❤️ by Sylphx** | [Website](https://sylph.ai) | [X](https://x.com/SylphxAI)
