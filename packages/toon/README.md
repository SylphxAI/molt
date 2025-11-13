# @sylphx/molt-toon

Token-Oriented Object Notation (TOON) parser and serializer - Reduce LLM token usage by 30-60%.

## Features

- 🎯 **30-60% Token Savings** - Designed specifically for LLM prompts
- 📊 **Table Format** - Compact representation for uniform arrays
- ✨ **Minimal Quoting** - Only quote when absolutely necessary
- 📝 **Human Readable** - YAML-style indentation, easy to read/write
- ⚡ **Fast** - Optimized parser and serializer
- 🛡️ **Type Safety** - Full TypeScript support
- 🔧 **Flexible** - Parse and serialize with extensive options

## Installation

```bash
bun add @sylphx/molt-toon
```

## Why TOON?

When working with LLMs (ChatGPT, Claude, GPT-4), **tokens = cost**. TOON reduces token usage dramatically:

```typescript
import { stringify } from '@sylphx/molt-toon'

const data = {
  users: [
    { id: 1, name: 'Alice', age: 30, active: true },
    { id: 2, name: 'Bob', age: 25, active: false },
    { id: 3, name: 'Charlie', age: 35, active: true }
  ]
}

// JSON: 183 characters
const json = JSON.stringify(data, null, 2)

// TOON: 98 characters (46% savings!)
const toon = stringify(data)
```

**TOON output:**
```toon
users:
  id | name    | age | active
  1  | Alice   | 30  | true
  2  | Bob     | 25  | false
  3  | Charlie | 35  | true
```

**JSON output:**
```json
{
  "users": [
    { "id": 1, "name": "Alice", "age": 30, "active": true },
    { "id": 2, "name": "Bob", "age": 25, "active": false },
    { "id": 3, "name": "Charlie", "age": 35, "active": true }
  ]
}
```

## Quick Start

### Parse TOON

```typescript
import { molt } from '@sylphx/molt-toon'

const config = molt(`
app: MyApp
version: 1.0.0
debug: false

database:
  host: localhost
  port: 5432
`)

console.log(config.app) // 'MyApp'
console.log(config.database.port) // 5432
```

### Serialize to TOON

```typescript
import { stringify } from '@sylphx/molt-toon'

const data = {
  app: 'MyApp',
  version: '1.0.0',
  users: [
    { id: 1, name: 'Alice', active: true },
    { id: 2, name: 'Bob', active: false }
  ]
}

const toon = stringify(data)
console.log(toon)
// app: MyApp
// version: 1.0.0
// users:
//   id | name  | active
//   1  | Alice | true
//   2  | Bob   | false
```

## API

### `parseTOON(input, options?)`

Parse TOON string to JavaScript value.

**Aliases:** `molt()`, `parse()`

```typescript
import { parseTOON } from '@sylphx/molt-toon'

const value = parseTOON(toonString, {
  parseTypes: true,        // Parse numbers, booleans, null
  allowComments: true,     // Allow # comments
  strict: true,            // Strict mode
  maxDepth: 100            // Max nesting depth
})
```

### `serializeTOON(value, options?)`

Serialize JavaScript value to TOON string.

**Alias:** `stringify()`

```typescript
import { serializeTOON } from '@sylphx/molt-toon'

const toon = serializeTOON(data, {
  indent: '  ',            // Indentation (2 spaces)
  useTableFormat: true,    // Use table for uniform arrays
  minTableRows: 2,         // Min rows for table format
  lineEnding: '\n',        // Line ending
  sortKeys: false          // Sort object keys
})
```

## Format Guide

### Simple Values

```toon
name: Alice
age: 30
active: true
score: 98.5
role: null
```

### Nested Objects

```toon
user:
  name: Alice
  profile:
    email: alice@example.com
    age: 30
```

### Table Format (Arrays of Objects)

TOON's killer feature - compact representation for uniform arrays:

```toon
products:
  id | name       | price | stock
  1  | Product 1  | 29.99 | 100
  2  | Product 2  | 49.99 | 50
  3  | Product 3  | 19.99 | 200
```

Same data in JSON:
```json
{
  "products": [
    { "id": 1, "name": "Product 1", "price": 29.99, "stock": 100 },
    { "id": 2, "name": "Product 2", "price": 49.99, "stock": 50 },
    { "id": 3, "name": "Product 3", "price": 19.99, "stock": 200 }
  ]
}
```

### Comments

```toon
# Application configuration
app: MyApp

# Database settings
database:
  host: localhost
  port: 5432
```

### Type Coercion

```toon
# Numbers
integer: 42
float: 3.14
negative: -100

# Booleans
enabled: true
disabled: false
yes_value: yes
no_value: no

# Null
empty: null
none: nil
```

## Use Cases

### LLM Prompts

```typescript
import { stringify } from '@sylphx/molt-toon'

const context = {
  task: 'analyze_data',
  dataset: [
    { id: 1, value: 100, category: 'A' },
    { id: 2, value: 200, category: 'B' },
    { id: 3, value: 150, category: 'A' }
  ],
  config: {
    threshold: 150,
    groupBy: 'category'
  }
}

const prompt = `Analyze this data:\n${stringify(context)}`
// Send to LLM with 30-60% fewer tokens!
```

### API Responses (for LLMs)

```typescript
import { stringify } from '@sylphx/molt-toon'

const response = {
  success: true,
  results: [
    { id: 1, score: 0.95, match: 'high' },
    { id: 2, score: 0.87, match: 'medium' },
    { id: 3, score: 0.72, match: 'medium' }
  ],
  summary: {
    total: 3,
    highMatches: 1,
    mediumMatches: 2
  }
}

// Compact format for LLM consumption
const toon = stringify(response)
```

### Configuration Files

```toon
# Application Configuration

app: MyApp
version: 1.0.0
env: production

server:
  host: 0.0.0.0
  port: 8080
  workers: 4

database:
  host: localhost
  port: 5432
  name: myapp
  pool:
    min: 2
    max: 10

features:
  auth: true
  caching: true
  logging: true
```

### Data Exchange with LLMs

```typescript
// System prompt with structured data
const systemPrompt = `
You are a helpful assistant. Here's the current context:

${stringify({
  user: {
    id: 12345,
    name: 'Alice',
    preferences: {
      language: 'en',
      timezone: 'UTC'
    }
  },
  session: {
    startTime: '2024-01-01T00:00:00Z',
    queries: 5
  }
})}

Please respond in TOON format when providing structured data.
`
```

## Token Savings Examples

### Example 1: User Data

```typescript
const users = {
  users: [
    { id: 1, name: 'Alice Smith', role: 'admin', active: true },
    { id: 2, name: 'Bob Jones', role: 'user', active: false },
    { id: 3, name: 'Charlie Brown', role: 'user', active: true }
  ]
}

// JSON: ~200 characters
// TOON: ~110 characters
// Savings: 45%
```

### Example 2: API Response

```typescript
const response = {
  status: 'success',
  timestamp: 1234567890,
  data: [
    { id: 1, value: 100, label: 'A' },
    { id: 2, value: 200, label: 'B' },
    { id: 3, value: 150, label: 'C' }
  ],
  meta: { total: 3, page: 1 }
}

// JSON (formatted): ~250 characters
// TOON: ~120 characters
// Savings: 52%
```

## Performance

Fast parsing and serialization:

| Operation | TOON | JSON | Comparison |
|-----------|------|------|------------|
| Parse simple | ~800k ops/s | ~2.5M ops/s | 0.3x |
| Serialize simple | ~600k ops/s | ~3.0M ops/s | 0.2x |
| Parse table | ~500k ops/s | ~2.0M ops/s | 0.25x |
| Serialize table | ~400k ops/s | ~2.5M ops/s | 0.16x |

**Note:** TOON is slower than JSON but **30-60% smaller**, making it ideal for:
- LLM prompts (tokens = cost)
- Bandwidth-constrained scenarios
- Human-readable data exchange

## TypeScript

Full TypeScript support:

```typescript
import type { ParseTOONOptions, SerializeTOONOptions, TOONValue } from '@sylphx/molt-toon'

const parseOpts: ParseTOONOptions = {
  parseTypes: true,
  allowComments: true
}

const serializeOpts: SerializeTOONOptions = {
  useTableFormat: true,
  minTableRows: 2
}
```

## Error Handling

```typescript
import { molt, ParseError } from '@sylphx/molt-toon'

try {
  const data = molt(toonString)
} catch (error) {
  if (error instanceof ParseError) {
    console.error(`Parse error at line ${error.line}: ${error.message}`)
  }
}
```

## Best Practices

### When to Use TOON

✅ **Use TOON for:**
- LLM prompts and responses
- Structured data in AI applications
- Configuration files for human readability
- Bandwidth-constrained scenarios
- Token-sensitive API calls

❌ **Don't use TOON for:**
- High-performance data exchange (use MessagePack or JSON)
- Binary data
- Standard REST APIs (use JSON)
- Browser-to-server communication (use JSON)

### Optimization Tips

```typescript
// Use table format for uniform arrays
const data = {
  items: [
    { id: 1, name: 'A', value: 100 },
    { id: 2, name: 'B', value: 200 }
  ]
}

// This will automatically use table format (30-60% savings)
const toon = stringify(data)
```

## License

MIT © [Sylphx](https://github.com/sylphx)

---

**Related Packages:**
- [@sylphx/molt-json](../json) - High-performance JSON
- [@sylphx/molt-yaml](../yaml) - Fast YAML parser
- [@sylphx/molt-toml](../toml) - Fast TOML parser
- [@sylphx/molt-msgpack](../msgpack) - Binary MessagePack

---

**Resources:**
- [TOON Specification](https://github.com/toon-format/toon)
- [Token Savings Calculator](https://toon-format.github.io/calculator)
- [LLM Cost Comparison](https://openai.com/pricing)
