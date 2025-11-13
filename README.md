# molt

[![CI](https://github.com/sylphx/molt/workflows/CI/badge.svg)](https://github.com/sylphx/molt/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%3E%3D1.0-black)](https://bun.sh)

**High-performance data transformation stack** for JSON, XML, YAML and more.

---

## 🚀 Overview

**molt** (蛻變 = transformation) is a monorepo containing ultra-fast data transformation libraries built with cutting-edge technology. Each package is designed for maximum performance, type safety, and developer experience.

### Packages

- **[@sylphx/molt-json](./packages/json/)** - The fastest JSON transformer (380x faster!)
  - Dirty JSON parsing (unquoted keys, comments, trailing commas)
  - Type preservation (Date, BigInt, Map, Set, RegExp, etc.)
  - Streaming API for large files
  - Schema validation (Zod, JSON Schema)
  - Zero dependencies

- **@sylphx/molt-xml** *(coming soon)* - Lightning-fast XML parser and transformer
- **@sylphx/molt-yaml** *(coming soon)* - High-performance YAML processor
- **@sylphx/molt** *(coming soon)* - Meta package with all formats

---

## 📦 Installation

Install individual packages:

```bash
# JSON transformer
bun add @sylphx/molt-json

# Or with npm/pnpm
npm install @sylphx/molt-json
pnpm add @sylphx/molt-json
```

---

## ⚡ Quick Start

### JSON Transformer

```typescript
import { parse, stringify } from '@sylphx/molt-json'

// Parse dirty JSON with type preservation
const data = parse(`{
  user: 'alice',        // ✅ Unquoted keys
  age: 30,              // ✅ Trailing comma
  joined: new Date(),   // ✅ Date preserved
}`)

data.joined instanceof Date  // true

// Stringify with type metadata
const json = stringify({
  created: new Date(),
  id: 123456789012345678901n,  // BigInt
  settings: new Map([['theme', 'dark']]),
})
```

See [@sylphx/molt-json](./packages/json/) for full documentation.

---

## 🏗️ Monorepo Structure

```
molt/
├── packages/
│   ├── json/          # @sylphx/molt-json - JSON transformer
│   ├── xml/           # @sylphx/molt-xml (coming soon)
│   ├── yaml/          # @sylphx/molt-yaml (coming soon)
│   └── molt/          # @sylphx/molt - Meta package (coming soon)
├── wasm/              # Shared WASM acceleration modules
├── .github/           # CI/CD workflows
├── biome.json         # Linting and formatting config
├── bunfig.toml        # Bun workspace configuration
└── package.json       # Workspace root
```

---

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh) >= 1.0

### Setup

```bash
# Clone the repository
git clone https://github.com/SylphxAI/molt.git
cd molt

# Install dependencies
bun install

# Run tests for all packages
bun test

# Build all packages
bun run build

# Run benchmarks
bun bench

# Lint and format
bun lint
bun format
```

### Working with Packages

```bash
# Run tests for specific package
cd packages/json
bun test

# Run benchmarks for specific package
cd packages/json
bun bench

# Build specific package
cd packages/json
bun run build
```

---

## 🎯 Technology Stack

- **Runtime**: [Bun](https://bun.sh) - Ultra-fast JavaScript runtime
- **Language**: TypeScript with strict mode
- **Testing**: [Vitest](https://vitest.dev) - Fast unit testing
- **Bundling**: [tsup](https://tsup.egoist.dev) - TypeScript bundler
- **Linting**: [Biome](https://biomejs.dev) - Fast linter and formatter
- **Acceleration**: Rust + WASM for performance-critical paths

---

## 📊 Performance

### molt-json Benchmarks

Real-world benchmarks on 1.5KB malformed JSON with complex types:

| Library | Operations/sec | Speedup |
|---------|---------------|---------|
| **@sylphx/molt-json** | **170,000** 🔥 | 1x (baseline) |
| superjson | 119,000 | 0.7x |
| dirty-json | 448 | **0.003x** (380x slower) |

See individual packages for detailed benchmarks.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes with tests
4. Run tests: `bun test`
5. Lint: `bun lint:fix`
6. Commit: `git commit -m "feat(json): add awesome feature"`
7. Push and create a Pull Request

---

## 📝 License

MIT © [Sylphx](./LICENSE)

Each package in this monorepo is licensed under the MIT License.

---

## 🙏 Acknowledgments

Built with inspiration from:
- [dirty-json](https://github.com/RyanMarcus/dirty-json) - Original dirty JSON parser
- [superjson](https://github.com/flightcontrolhq/superjson) - Type-preserving JSON serialization

Made **faster**, **more powerful**, and **production-ready** by [Sylphx](https://github.com/SylphxAI).

---

## 📚 Resources

- [Documentation](./packages/json/README.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)
- [Issues](https://github.com/SylphxAI/molt/issues)
- [Discussions](https://github.com/SylphxAI/molt/discussions)

---

**Built with ❤️ by Sylphx**
