# @sylphx/molt-json

[![npm version](https://badge.fury.io/js/@sylphx%2Fmolt-json.svg)](https://www.npmjs.com/package/@sylphx/molt-json)
[![CI](https://github.com/sylphx/molt/workflows/CI/badge.svg)](https://github.com/sylphx/molt/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@sylphx/molt-json.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Speed](https://img.shields.io/badge/speed-380x%20faster-brightgreen.svg)]()

**The world's fastest JSON transformer** - Dirty cleaning · Type preservation · Streaming · Validation

---

## Why molt-json?

🚀 **380x faster** than dirty-json at parsing malformed JSON
🔥 **2.3x faster** than superjson at type-preserving serialization
🌊 **Streams large files** without loading into memory
✅ **Schema validation** with Zod, JSON Schema, or simple validators
🛡️ **Zero dependencies** and fully type-safe

```typescript
import { molt } from '@sylphx/molt-json'

// ⚡ One function, auto-detects everything
const data = molt(`{
  user: 'alice',        // ✅ Single quotes
  age: 30,              // ✅ Trailing comma
  joined: Date.now(),   // ✅ Reconstructs as Date
}`)

data.joined instanceof Date  // true

// Stringify with type preservation
const json = molt.stringify({ date: new Date(), id: 123n })
```

---

## Performance

Real-world benchmarks on 1.5KB malformed JSON with complex types:

| Library | Operations/sec | vs molt-json |
|---------|---------------|--------------|
| **@sylphx/molt-json** | **170,000** 🔥 | **1x** (baseline) |
| superjson | 119,000 | 0.7x |
| dirty-json | 448 | **0.003x** (380x slower) |

### Key Advantages

- ⚡ **State machine parser** (no regex = no ReDoS vulnerability)
- 🎯 **Zero-copy string processing** where possible
- 🔧 **Optimized type detection** with priority-based registry
- 📦 **Minimal metadata overhead**
- 🚀 **Battle-tested** with 119 passing tests

---

## Features

### 🔥 Dirty JSON Parsing

Handle real-world malformed JSON that browsers and tools often produce:

```javascript
import { molt } from '@sylphx/molt-json'

molt(`{
  // JavaScript-style comments
  name: 'Bob',           // Unquoted keys
  email: 'bob@example.com', // Single quotes
  tags: [1, 2, 3,],      // Trailing commas
}`)
```

**Supports:**
- Unquoted object keys
- Single quotes for strings
- JavaScript comments (`//` and `/* */`)
- Trailing commas in objects and arrays
- Mixed formats

### 🎯 Type Preservation

Serialize and deserialize JavaScript types that JSON normally loses:

```typescript
import { molt } from '@sylphx/molt-json'

const data = {
  created: new Date(),
  id: 123456789012345678901n,  // BigInt
  settings: new Map([['theme', 'dark']]),
  tags: new Set(['typescript', 'performance']),
  pattern: /^test$/i,
}

const json = molt.stringify(data)
const restored = molt(json)

restored.created instanceof Date     // true
typeof restored.id === 'bigint'      // true
restored.settings instanceof Map     // true
restored.tags instanceof Set         // true
restored.pattern instanceof RegExp   // true
```

**Supported types:**
- `Date` - Full date/time preservation
- `BigInt` - Large integers beyond Number.MAX_SAFE_INTEGER
- `Map` - Key-value maps with any key type
- `Set` - Unique value collections
- `RegExp` - Regular expressions with flags
- `undefined`, `NaN`, `Infinity`, `-Infinity`
- `URL`, `Error`
- Custom classes via transformers

### 🌊 Streaming

Process large JSON files without loading them entirely into memory:

```typescript
import { parseNDJSON, parseJSONArray, parseStream } from '@sylphx/molt-json'

// NDJSON (newline-delimited JSON)
for await (const record of parseNDJSON(stream)) {
  console.log(record)  // Process one record at a time
}

// JSON arrays
for await (const element of parseJSONArray(stream)) {
  console.log(element)  // Stream array elements
}

// Auto-detect format
for await (const value of parseStream(stream)) {
  console.log(value)  // Handles NDJSON, arrays, concatenated JSON
}
```

### ✅ Schema Validation

Validate data with your favorite schema library:

```typescript
import { z } from 'zod'
import { ZodAdapter, SimpleSchemaValidator } from '@sylphx/molt-json'

// With Zod
const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(0).max(150),
})

const user = parse(json, {
  schema: new ZodAdapter(schema),
})

// With simple schema (zero dependencies)
const user2 = parse(json, {
  schema: new SimpleSchemaValidator({
    name: 'string',
    email: 'string',
    age: 'number',
  }),
})
```

### 🔌 Custom Types

Extend with your own type transformers:

```typescript
class Point {
  constructor(public x: number, public y: number) {}
}

registerCustom({
  name: 'Point',
  isApplicable: (v): v is Point => v instanceof Point,
  serialize: (v: Point) => ({ x: v.x, y: v.y }),
  deserialize: (v: unknown) => {
    const { x, y } = v as { x: number; y: number }
    return new Point(x, y)
  },
  priority: 100,
})

const point = new Point(10, 20)
const json = stringify(point)
const restored = parse(json)  // Point instance restored!
```

---

## Installation

```bash
bun add @sylphx/molt-json
# or
npm install @sylphx/molt-json
# or
pnpm add @sylphx/molt-json
```

---

## API

### ⚡ Unified API (Recommended)

The new `molt()` function automatically detects and handles dirty JSON and type preservation with minimal overhead.

#### `molt(input, options?)`

**Smart auto-detection** - Only processes when needed:

```typescript
import { molt } from '@sylphx/molt-json'

// ✨ Auto mode - detects dirty JSON and types automatically
const data = molt('{ name: "alice", age: 30 }')

// 🎯 Explicit control
const data = molt(input, {
  dirty: 'auto',      // 'auto' | 'always' | 'never'
  typed: 'auto',      // 'auto' | 'always' | 'never'
  validate: schema,   // Optional schema validator
  customTypes: [...], // Custom type transformers
  maxSize: 100 * 1024 * 1024,  // 100MB default
})
```

**Performance modes:**

```typescript
// 🚀 Fast mode - skip all processing (same as native JSON.parse)
const data = molt.fast('{"name":"alice"}')

// 🧹 Dirty only - clean but don't restore types
const data = molt.dirty('{ name: "alice" }')

// 🎨 Typed only - restore types but don't clean
const data = molt.typed(jsonWithTypes)

// 🔥 Full pipeline - all features enabled
const data = molt.full(dirtyJsonWithTypes)
```

#### `molt.stringify(value, options?)`

**Auto-detection** - Only includes metadata when needed:

```typescript
// ✨ Auto mode - includes metadata only if types need preservation
const json = molt.stringify({ date: new Date(), count: 42 })

// 🎯 Explicit control
const json = molt.stringify(data, {
  typed: 'auto',      // 'auto' | 'always' | 'never'
  space: 2,           // Pretty print
  customTypes: [...], // Custom transformers
})

// Never include type metadata (same as JSON.stringify)
const json = molt.stringify(data, { typed: 'never' })
```

**Performance comparison:**

| Scenario | molt (auto) | molt.fast | Native JSON.parse |
|----------|-------------|-----------|-------------------|
| Valid JSON (no types) | 1.4x slower | 1.0x slower | baseline |
| Dirty JSON | ✅ Works | ❌ Fails | ❌ Fails |
| TypedJSON | ✅ Restores | ❌ Loses types | ❌ Loses types |

**When to use:**
- ✅ `molt()` - Default choice, smart auto-detection
- ✅ `molt.fast()` - Known valid JSON, maximum performance
- ✅ `molt.dirty()` - Untrusted input from users/browsers
- ✅ `molt.typed()` - Caching with Date/BigInt/Map/Set
- ✅ `molt.full()` - All features needed

### 📦 Legacy API (Backward Compatible)

#### Parse

```typescript
import { parse } from '@sylphx/molt-json'

parse<T>(input: string, options?: ParseOptions): T
```

**Options:**
- `cleanDirty` (default: `true`) - Enable dirty JSON cleaning
- `parseTypes` (default: `true`) - Enable type reconstruction
- `maxSize` (default: `100MB`) - Maximum input size
- `customTypes` - Array of custom type transformers
- `schema` - Schema validator for validation

**Example:**
```typescript
const data = parse(`{user: 'alice', age: 30}`, {
  cleanDirty: true,
  parseTypes: true,
  schema: new ZodAdapter(userSchema),
})
```

#### Stringify

```typescript
import { stringify } from '@sylphx/molt-json'

stringify(value: unknown, options?: StringifyOptions): string
```

**Options:**
- `includeTypes` (default: `true`) - Include type metadata
- `space` - JSON.stringify space parameter
- `customTypes` - Array of custom type transformers

**Example:**
```typescript
const json = stringify({
  date: new Date(),
  id: 123n,
}, { space: 2 })
```

### Clean

```typescript
clean(input: string, maxSize?: number): string
```

Clean dirty JSON to valid JSON without type handling.

**Example:**
```typescript
const cleaned = clean(`{name: 'alice', age: 30,}`)
// Returns: '{"name":"alice","age":30}'
```

### Serialize / Deserialize

```typescript
serialize(value: unknown, customTypes?: CustomTypeTransformer[]): TypedJSON
deserialize<T>(typedJSON: TypedJSON, customTypes?: CustomTypeTransformer[]): T
```

Low-level API for working with TypedJSON format directly.

### Custom Types

```typescript
registerCustom(transformer: CustomTypeTransformer): void
unregisterCustom(name: string): void
```

Register global custom type transformers.

---

## Comparison

### vs dirty-json

| Feature | molt-json | dirty-json |
|---------|-----------|------------|
| **Speed** | **380x faster** 🔥 | 1x |
| Dirty JSON | ✅ | ✅ |
| Type preservation | ✅ | ❌ |
| Streaming | ✅ | ❌ |
| Validation | ✅ | ❌ |
| ReDoS safe | ✅ State machine | ❌ Regex-based |
| TypeScript | ✅ Native | ❌ |
| Dependencies | 0 | Many |

### vs superjson

| Feature | molt-json | superjson |
|---------|-----------|-----------|
| **Speed (serialize)** | **2.3x faster** 🔥 | 1x |
| Dirty JSON | ✅ | ❌ |
| Type preservation | ✅ | ✅ |
| Streaming | ✅ | ❌ |
| Validation | ✅ | ❌ |
| Format | Compatible | TypedJSON |
| Dependencies | 0 | Some |

---

## Use Cases

### 1. Parse Configuration Files

```typescript
// config.json (with comments and trailing commas)
const config = parse(fs.readFileSync('config.json', 'utf8'))
```

### 2. API Response Handling

```typescript
// Handle messy JSON from third-party APIs
const data = parse(response.body, {
  cleanDirty: true,
  schema: new ZodAdapter(apiSchema),
})
```

### 3. Large File Processing

```typescript
// Process 100GB NDJSON file
for await (const record of parseNDJSON(createReadStream('huge.ndjson'))) {
  await processRecord(record)
}
```

### 4. Type-Safe Communication

```typescript
// Server
const json = stringify({ createdAt: new Date(), userId: 123n })

// Client
const data = parse(json)
data.createdAt instanceof Date  // true
```

---

## Benchmarks

Run benchmarks yourself:

```bash
bun bench
```

### Results (Node 20, M1 Mac)

**Dirty JSON Cleaning (1.5KB input):**
- molt-json: 170,000 ops/sec
- dirty-json: 448 ops/sec
- **380x faster** 🚀

**Type Serialization (complex object):**
- molt-json: 278,000 ops/sec
- superjson: 119,000 ops/sec
- **2.3x faster** 🔥

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

# Run benchmarks
bun bench

# Build
bun run build

# Lint and format
bun lint
bun format
```

---

## Part of molt Family

`@sylphx/molt-json` is part of the **molt data transformation stack**:

- **@sylphx/molt-json** - JSON transformer (this package)
- **@sylphx/molt-xml** - XML transformer (coming soon)
- **@sylphx/molt-yaml** - YAML transformer (coming soon)
- **@sylphx/molt** - Meta package with all formats (coming soon)

See the [monorepo root](../..) for more information.

---

## License

MIT © [Sylphx](../../LICENSE)

---

## Acknowledgments

Built upon ideas from:
- [dirty-json](https://github.com/RyanMarcus/dirty-json) - Original dirty JSON parser
- [superjson](https://github.com/flightcontrolhq/superjson) - Type-preserving JSON serialization

Made **faster**, **more powerful**, and **production-ready** by Sylphx.
