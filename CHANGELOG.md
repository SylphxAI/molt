# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-11-13

### 🎉 Initial Release

**@sylphx/molt-json** - The world's fastest JSON transformer with dirty cleaning, type preservation, and streaming.

#### Core Features

**🚀 High Performance**
- **380x faster** than dirty-json for malformed JSON parsing
- **2.3x faster** than superjson for type-preserving serialization
- State machine-based parser (no regex, no ReDoS vulnerability)
- Zero-copy string processing optimizations
- 170,000 ops/sec on real-world 1.5KB dirty JSON

**🔥 Dirty JSON Parsing**
- Handle unquoted object keys
- Support single-quoted strings
- Strip JavaScript-style comments (`//` and `/* */`)
- Remove trailing commas in objects and arrays
- Process mixed malformed formats
- Safe and robust error handling

**🎯 Type Preservation**
- `Date` - Full date/time serialization
- `BigInt` - Large integers beyond Number.MAX_SAFE_INTEGER
- `Map` - Key-value maps with any key type
- `Set` - Unique value collections
- `RegExp` - Regular expressions with flags
- `undefined`, `NaN`, `Infinity`, `-Infinity`
- `URL`, `Error` objects
- Custom class transformers

**🌊 Streaming Support**
- `parseStream()` - Auto-detect format streaming parser
- `parseNDJSON()` - Optimized for newline-delimited JSON
- `parseJSONArray()` - Stream JSON array elements without loading into memory
- Support for `ReadableStream<Uint8Array>` and `AsyncIterable<string>`
- Type reconstruction in streaming contexts
- Memory-efficient processing of multi-GB files

**✅ Schema Validation**
- `ZodAdapter` - First-class Zod integration
- `JSONSchemaAdapter` - Support for AJV and JSON Schema validators
- `SimpleSchemaValidator` - Zero-dependency validation
- Safe parsing with error handling
- Validation combined with type reconstruction
- Custom error messages

**🔌 Extensibility**
- `CustomTypeTransformer` interface for custom classes
- Global type registration with `registerCustom()`
- Per-call custom types
- Priority-based type detection
- Built-in transformer registry

#### Developer Experience

- **TypeScript-first** - Full type safety and IntelliSense
- **Zero dependencies** - Core library has no runtime dependencies
- **Comprehensive tests** - 119 tests covering all features
- **Detailed examples** - 6 example files demonstrating all capabilities
- **API documentation** - Complete API reference
- **ES Module and CommonJS** - Dual package support

#### Documentation

- Complete API documentation in README
- 6 detailed example files covering:
  1. Basic usage
  2. Dirty JSON parsing
  3. Type preservation
  4. Streaming
  5. Schema validation
  6. Custom types
- Performance benchmarks
- Contributing guidelines
- MIT License

#### Performance Benchmarks

**Dirty JSON Cleaning (1.5KB input):**
- molt-json: 170,000 ops/sec
- dirty-json: 448 ops/sec
- **380x faster** 🚀

**Type Serialization (complex object):**
- molt-json: 278,000 ops/sec
- superjson: 119,000 ops/sec
- **2.3x faster** 🔥

**Type Deserialization (complex object):**
- molt-json: 487,000 ops/sec
- superjson: 400,000 ops/sec
- **1.2x faster** ⚡

#### Technical Implementation

- State machine tokenizer for dirty JSON parsing
- Path-based type metadata system (superjson-compatible)
- Custom type registry with priority queue
- Async generator-based streaming
- Schema adapter pattern for validation frameworks
- Optimized serialization with metadata caching

---

## [Unreleased]

### Planned Features

- 🚀 **@sylphx/molt-xml** - XML transformer with dirty XML cleaning
- 🌊 **@sylphx/molt-yaml** - YAML parser with streaming support
- 📦 **@sylphx/molt** - Meta package for all formats
- ⚡ **WASM acceleration** - Optional performance boost for critical paths
- 🎨 **Pretty-printing** - Syntax-highlighted output
- 🔍 **JSON path queries** - Query and transform with JSON path
- 🌐 **Browser-optimized build** - Smaller bundle for web
- 📱 **React Native compatibility** - Mobile support
- 🔧 **CLI tool** - Command-line JSON processing

---

[0.1.0]: https://github.com/sylphx/molt/releases/tag/v0.1.0
