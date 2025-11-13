# @sylphx/molt-csv

[![npm version](https://badge.fury.io/js/@sylphx%2Fmolt-csv.svg)](https://www.npmjs.com/package/@sylphx/molt-csv)
[![CI](https://github.com/sylphx/molt/workflows/CI/badge.svg)](https://github.com/sylphx/molt/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)

**Blazing fast CSV transformer** - Type preservation · Streaming · WASM acceleration · Zero dependencies

---

## Why molt-csv?

🚀 **WASM accelerated** - Optional Rust-powered parser for maximum performance
🌊 **Streaming support** - Process huge CSV files without loading into memory
🎯 **Type-safe** - Full TypeScript support with strict types
🔄 **Bidirectional** - Parse and stringify with ease
🛡️ **Production-ready** - Comprehensive test coverage
⚡ **Fast** - Efficient parsing for both small and large files

```typescript
import { molt } from '@sylphx/molt-csv'

// Parse CSV to array of objects
const data = molt(`
name,age,city
Alice,30,NYC
Bob,25,LA
`)

// data === [
//   { name: 'Alice', age: 30, city: 'NYC' },
//   { name: 'Bob', age: 25, city: 'LA' }
// ]
```

---

## Features

### 🚀 WASM Acceleration

Optional Rust-powered parser for extreme performance:

```typescript
import { parseWithWasm, enableWasm } from '@sylphx/molt-csv'

// Enable WASM globally
await enableWasm()

// Parse with WASM
const data = await parseWithWasm(csvString)

// Or use sync API after initialization
import { parseSync } from '@sylphx/molt-csv'
await initWasm()
const data = parseSync(csvString)
```

### 🌊 Streaming

Process large CSV files efficiently:

```typescript
import { parseStream } from '@sylphx/molt-csv'
import { createReadStream } from 'fs'

// Stream large CSV file
const stream = createReadStream('huge-data.csv')

for await (const record of parseStream(stream)) {
  console.log(record)  // Process one record at a time
  // Memory usage stays constant!
}
```

### 🎯 Type Preservation

Auto-detect and convert types:

```typescript
import { molt } from '@sylphx/molt-csv'

const csv = `
name,age,active,joined
Alice,30,true,2024-01-15
Bob,25,false,2024-02-20
`

const data = molt(csv, { parseTypes: true })

// data[0].age === 30 (number, not string)
// data[0].active === true (boolean, not string)
// data[0].joined instanceof Date  // true
```

### ⚙️ Flexible Options

Handle various CSV formats:

```typescript
import { molt } from '@sylphx/molt-csv'

// Tab-separated values (TSV)
const tsv = molt(data, {
  delimiter: '\t',
})

// Custom delimiter
const data = molt(csv, {
  delimiter: '|',
  quote: "'",
})

// No headers
const data = molt(csv, {
  headers: false,  // Returns array of arrays
})

// Custom headers
const data = molt(csv, {
  headers: ['name', 'age', 'city'],
})
```

---

## Installation

```bash
bun add @sylphx/molt-csv
# or
npm install @sylphx/molt-csv
# or
pnpm add @sylphx/molt-csv
```

---

## API

### ⚡ Unified API (Recommended)

#### `molt(input, options?)`

Parse CSV string to array of objects or arrays.

```typescript
import { molt } from '@sylphx/molt-csv'

const data = molt(`
name,age,city
Alice,30,NYC
Bob,25,LA
`)
```

**Options:**

```typescript
interface ParseCSVOptions {
  delimiter?: string       // Column delimiter (default: ',')
  quote?: string          // Quote character (default: '"')
  escape?: string         // Escape character (default: '"')
  headers?: boolean | string[]  // Use first row as headers (default: true)
  parseTypes?: boolean    // Auto-convert types (default: false)
  skipEmptyLines?: boolean  // Skip empty lines (default: true)
  trimValues?: boolean    // Trim whitespace from values (default: false)
  maxSize?: number        // Maximum input size in bytes
}
```

**Example:**

```typescript
// TSV (tab-separated)
const data = molt(tsv, { delimiter: '\t' })

// Custom headers
const data = molt(csv, {
  headers: ['id', 'name', 'email'],
})

// Type conversion
const data = molt(csv, {
  parseTypes: true,
  trimValues: true,
})

// Array of arrays (no headers)
const data = molt(csv, { headers: false })
```

### 📦 Stringify

#### `stringifyCSV(data, options?)`

Serialize JavaScript array to CSV string.

```typescript
import { stringifyCSV } from '@sylphx/molt-csv'

const csv = stringifyCSV([
  { name: 'Alice', age: 30, city: 'NYC' },
  { name: 'Bob', age: 25, city: 'LA' },
])
```

**Options:**

```typescript
interface StringifyCSVOptions {
  delimiter?: string      // Column delimiter (default: ',')
  quote?: string         // Quote character (default: '"')
  escape?: string        // Escape character (default: '"')
  headers?: boolean | string[]  // Include headers (default: true)
  quoteAll?: boolean     // Quote all values (default: false)
  lineEnding?: string    // Line ending (default: '\n')
}
```

**Example:**

```typescript
// TSV output
const tsv = stringifyCSV(data, { delimiter: '\t' })

// Custom headers
const csv = stringifyCSV(data, {
  headers: ['ID', 'Name', 'Email'],
})

// Quote all values
const csv = stringifyCSV(data, {
  quoteAll: true,
})

// Windows line endings
const csv = stringifyCSV(data, {
  lineEnding: '\r\n',
})
```

### 🚀 WASM API

#### `parseWithWasm(input, options?)`

Parse CSV using WASM-accelerated parser:

```typescript
import { parseWithWasm } from '@sylphx/molt-csv'

const data = await parseWithWasm(csvString, {
  delimiter: ',',
  parseTypes: true,
})
```

#### `enableWasm()` / `disableWasm()`

Control WASM usage globally:

```typescript
import { enableWasm, disableWasm, isWasmEnabled } from '@sylphx/molt-csv'

// Enable WASM globally
await enableWasm()

// Check if enabled
console.log(isWasmEnabled())  // true

// Disable WASM
disableWasm()
```

### 🌊 Streaming API

#### `parseStream(stream, options?)`

Parse CSV stream:

```typescript
import { parseStream } from '@sylphx/molt-csv'
import { createReadStream } from 'fs'

const stream = createReadStream('data.csv')

for await (const record of parseStream(stream)) {
  console.log(record)
}
```

### 🔧 Class API

```typescript
import { MoltCSV } from '@sylphx/molt-csv'

// Parse
const data = MoltCSV.parse(csvString)

// Stringify
const csv = MoltCSV.stringify(data)
```

### 🚨 Error Handling

```typescript
import { molt, CSVError, ParseError } from '@sylphx/molt-csv'

try {
  const data = molt(invalidCsv)
} catch (err) {
  if (err instanceof ParseError) {
    console.error(`Parse error at line ${err.line}: ${err.message}`)
  } else if (err instanceof CSVError) {
    console.error(`CSV error: ${err.message}`)
  }
}
```

---

## Use Cases

### 1. Import Data

```typescript
import { molt } from '@sylphx/molt-csv'
import fs from 'fs'

// Read CSV file
const csv = fs.readFileSync('users.csv', 'utf8')
const users = molt(csv, { parseTypes: true })

// Insert into database
for (const user of users) {
  await db.users.insert(user)
}
```

### 2. Export Data

```typescript
import { stringifyCSV } from '@sylphx/molt-csv'
import fs from 'fs'

// Fetch data
const users = await db.users.findMany()

// Export to CSV
const csv = stringifyCSV(users)
fs.writeFileSync('users.csv', csv)
```

### 3. Data Transformation

```typescript
import { molt, stringifyCSV } from '@sylphx/molt-csv'

// Read CSV
const data = molt(fs.readFileSync('input.csv', 'utf8'))

// Transform
const transformed = data.map(row => ({
  ...row,
  fullName: `${row.firstName} ${row.lastName}`,
  updatedAt: new Date().toISOString(),
}))

// Write CSV
fs.writeFileSync('output.csv', stringifyCSV(transformed))
```

### 4. Large File Processing

```typescript
import { parseStream } from '@sylphx/molt-csv'
import { createReadStream, createWriteStream } from 'fs'

const input = createReadStream('huge-input.csv')
const output = createWriteStream('processed.csv')

let count = 0

for await (const record of parseStream(input)) {
  // Process record
  const processed = {
    ...record,
    processed: true,
    timestamp: new Date().toISOString(),
  }

  // Write to output
  output.write(stringifyCSV([processed], { headers: count === 0 }))
  count++
}

console.log(`Processed ${count} records`)
```

### 5. API Response Formatting

```typescript
import { stringifyCSV } from '@sylphx/molt-csv'
import { Hono } from 'hono'

const app = new Hono()

app.get('/export/users', async (c) => {
  const users = await db.users.findMany()
  const csv = stringifyCSV(users)

  return c.text(csv, 200, {
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="users.csv"',
  })
})
```

---

## Performance

| Operation | JavaScript | WASM | Speedup |
|-----------|------------|------|---------|
| Parse 1MB CSV | ~50ms | ~15ms | **3.3x faster** |
| Parse 10MB CSV | ~500ms | ~140ms | **3.6x faster** |
| Stringify 10k records | ~30ms | ~25ms | **1.2x faster** |

*Benchmarks on M1 Mac, Node 20*

---

## Supported CSV Features

| Feature | Parsing | Stringifying |
|---------|---------|--------------|
| Comma delimiter | ✅ | ✅ |
| Custom delimiters (TSV, etc.) | ✅ | ✅ |
| Quoted values | ✅ | ✅ |
| Escaped quotes | ✅ | ✅ |
| Headers | ✅ | ✅ |
| Type conversion | ✅ | ❌ |
| Empty lines | ✅ | ✅ |
| Streaming | ✅ | ❌ |
| WASM acceleration | ✅ | ❌ |

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

# Build
bun run build

# Lint and format
bun lint
bun format
```

---

## Part of molt Family

`@sylphx/molt-csv` is part of the **molt data transformation stack**:

- **@sylphx/molt-json** - JSON transformer
- **@sylphx/molt-xml** - XML transformer
- **@sylphx/molt-yaml** - YAML transformer
- **@sylphx/molt-toml** - TOML transformer
- **@sylphx/molt-csv** - CSV transformer (this package)
- **@sylphx/molt** - Meta package with all formats

See the [monorepo root](../..) for more information.

---

## License

MIT © [Sylphx](../../LICENSE)
