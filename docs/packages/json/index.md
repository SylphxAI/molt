# molt-json - Type-Preserving JSON Transformer

**The world's fastest JSON transformer** with dirty input support, type preservation, and streaming capabilities.

## Overview

`@sylphx/molt-json` is an ultra-fast JSON parser and serializer that handles real-world, malformed JSON and preserves JavaScript types through serialization cycles.

### Key Features

- 🚀 **380x faster** than dirty-json at parsing malformed JSON
- 🔥 **2.3x faster** than superjson at type-preserving serialization
- 🧹 **Dirty JSON support** - Unquoted keys, comments, trailing commas
- 🎯 **Type preservation** - Date, BigInt, Map, Set, RegExp, Uint8Array
- 🌊 **Streaming API** - Process large files without memory overhead
- ✅ **Schema validation** - Compatible with Zod, JSON Schema
- 🛡️ **Zero dependencies** - Pure TypeScript implementation
- 📦 **Battle-tested** - 119+ test cases

## Installation

```bash
npm install @sylphx/molt-json
```

## Quick Start

### Parse Dirty JSON

```typescript
import { molt } from '@sylphx/molt-json'

const data = molt(`{
  user: 'alice',        // ✅ Unquoted keys
  email: 'alice@test.com', // ✅ Single quotes
  age: 30,              // ✅ Trailing comma
  active: true,
}`)

console.log(data)
// Output: { user: 'alice', email: 'alice@test.com', age: 30, active: true }
```

### Type Preservation

```typescript
import { molt, stringify } from '@sylphx/molt-json'

const original = {
  created: new Date('2024-01-01'),
  id: 123456789012345678901n,  // BigInt
  tags: new Set(['a', 'b']),
  config: new Map([['key', 'value']]),
  pattern: /^test$/i,
  data: new Uint8Array([1, 2, 3])
}

// Serialize with type metadata
const json = stringify(original)

// Deserialize and restore types
const restored = molt(json)

console.log(restored.created instanceof Date)  // true
console.log(restored.id === 123456789012345678901n)  // true
console.log(restored.tags instanceof Set)  // true
console.log(restored.config instanceof Map)  // true
console.log(restored.pattern instanceof RegExp)  // true
console.log(restored.data instanceof Uint8Array)  // true
```

## Performance

Benchmarks on 1.5KB malformed JSON with complex types:

| Library | Operations/sec | vs molt-json |
|---------|---------------|--------------|
| **molt-json** | **170,000** | **1x** (baseline) |
| superjson | 119,000 | 0.7x |
| dirty-json | 448 | **0.003x** (380x slower) |

### Why So Fast?

- **State machine parser** - No regex = no ReDoS vulnerability
- **Zero-copy strings** - Minimal memory allocation
- **Optimized type detection** - Priority-based type registry
- **Minimal overhead** - Small metadata footprint

## Supported Dirty JSON Features

### Unquoted Keys

```typescript
molt(`{
  name: 'Alice',
  age: 30,
  email: 'alice@test.com'
}`)
```

### Single Quotes

```typescript
molt(`{
  message: 'Hello, World!'
}`)
```

### JavaScript Comments

```typescript
molt(`{
  // This is a comment
  name: 'Alice',  /* inline comment */
  age: 30
}`)
```

### Trailing Commas

```typescript
molt(`{
  items: [1, 2, 3,],
  tags: ['a', 'b',],
}`)
```

### Mixed Formats

```typescript
molt(`{
  // Complex object
  user: { name: 'Alice', age: 30, },
  settings: new Map([['theme', 'dark']]),
  created: new Date(),
}`)
```

## Type Preservation Details

### Supported Types

- `Date` - JavaScript Date objects
- `BigInt` - Arbitrary precision integers
- `Map` - Key-value collections
- `Set` - Unique value collections
- `RegExp` - Regular expressions
- `Uint8Array` - Byte arrays
- `Error` - Error objects with stack traces
- Custom classes - Via type registry

### How It Works

The `stringify` function adds metadata about types:

```typescript
const json = stringify({
  date: new Date('2024-01-01'),
  bigint: 123n
})

// Produces something like:
// {
//   "date": {"__type": "Date", "value": "2024-01-01T00:00:00.000Z"},
//   "bigint": {"__type": "BigInt", "value": "123"}
// }
```

Then `molt` (or `parse`) restores the original types:

```typescript
const restored = molt(json)
restored.date instanceof Date  // true
typeof restored.bigint === 'bigint'  // true
```

## API Reference

### `molt(input, options?)`

Parse dirty JSON or type-preserved JSON.

```typescript
function molt<T = any>(
  input: string,
  options?: ParseOptions
): T
```

**Options**:
- `strict?: boolean` - Throw on invalid JSON (default: false)
- `allowComments?: boolean` - Allow JS comments (default: true)
- `allowTrailingCommas?: boolean` - Allow trailing commas (default: true)
- `allowUnquotedKeys?: boolean` - Allow unquoted keys (default: true)

### `stringify(value, options?)`

Stringify with type preservation.

```typescript
function stringify(
  value: any,
  options?: StringifyOptions
): string
```

**Options**:
- `pretty?: boolean` - Pretty-print output (default: false)
- `indent?: number` - Indent size (default: 2)
- `preserveTypes?: boolean` - Preserve types (default: true)

### `parse(input, options?)`

Parse JSON without dirty input support (pure JSON).

```typescript
function parse<T = any>(
  input: string,
  options?: ParseOptions
): T
```

## Schema Validation

Molt integrates seamlessly with validation libraries:

### Zod

```typescript
import { molt } from '@sylphx/molt-json'
import { z } from 'zod'

const UserSchema = z.object({
  name: z.string(),
  age: z.number().positive(),
  email: z.string().email()
})

const data = molt('{ name: "Alice", age: 30, email: "alice@test.com" }')
const validated = UserSchema.parse(data)
```

### JSON Schema

```typescript
import { molt } from '@sylphx/molt-json'
import Ajv from 'ajv'

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  },
  required: ['name', 'age']
}

const ajv = new Ajv()
const validate = ajv.compile(schema)

const data = molt('{ name: "Alice", age: 30 }')
if (validate(data)) {
  console.log('Valid!')
} else {
  console.log('Invalid:', validate.errors)
}
```

## Error Handling

```typescript
import { molt } from '@sylphx/molt-json'

try {
  const data = molt('{ invalid ]')
} catch (error) {
  console.error('Parse error at position:', error.position)
  console.error('Message:', error.message)
}
```

Error objects include:
- `message` - Error description
- `position` - Character position in input
- `line` - Line number
- `column` - Column number

## Streaming (Advanced)

For very large JSON files, use the streaming API:

```typescript
import { createReadStream } from 'fs'
import { createMoltStream } from '@sylphx/molt-json'

const stream = createReadStream('large.json')
const moltStream = createMoltStream()

stream.pipe(moltStream)

moltStream.on('data', (obj) => {
  console.log('Parsed object:', obj)
})

moltStream.on('error', (err) => {
  console.error('Stream error:', err)
})
```

## Comparison with Alternatives

### vs Native JSON

```typescript
// ❌ Native fails on dirty JSON
JSON.parse('{ key: "value" }')  // SyntaxError

// ✅ molt handles it
molt('{ key: "value" }')  // Works!
```

### vs dirty-json

```typescript
// molt is 380x faster
molt(dirtyJson)  // 170,000 ops/sec
dirtyJson.parse(dirtyJson)  // 448 ops/sec
```

### vs superjson

```typescript
// molt is 2.3x faster at serialization
molt.stringify(data)  // 610,000 ops/sec
superjson.stringify(data)  // 250,000 ops/sec
```

## Best Practices

1. **Use `stringify` for round-trip serialization** - Preserves types
2. **Use `molt` for parsing dirty JSON** - Handles real-world data
3. **Validate after parsing** - Use Zod or JSON Schema
4. **Handle errors** - JSON can be invalid
5. **Consider streaming** - For files larger than 100MB

## Resources

- [Quick Start Guide](/guide/quick-start#json---type-preserving-transformer)
- [Installation Guide](/guide/installation#molt-json)
- [Benchmarks](/benchmarks#json-package-hyperjson)
- [GitHub Repository](https://github.com/sylphx/molt)

---

**Next**: Explore [other packages](/packages/) or check the [Benchmarks](/benchmarks)
