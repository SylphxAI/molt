# molt-csv - Blazingly Fast CSV Handler

**Top-tier CSV parser** with 2-7x performance advantage and WASM acceleration.

## Overview

`@sylphx/molt-csv` is a high-performance CSV parser and stringifier. It's competitive with the fastest libraries while providing excellent type conversion and WASM acceleration options.

### Key Features

- 🚀 **5.9x faster** than papaparse on simple CSVs
- 🏆 **2.7x faster** than csv-parse on large files
- 🔧 **Type conversion** - Automatic number, boolean, and date conversion
- ⚡ **WASM acceleration** - Optional WebAssembly for large files
- 🛡️ **Type-safe** - Full TypeScript support
- 📊 **Streaming support** - Process large files efficiently
- 📦 **Zero dependencies** - Pure implementation
- 🎯 **RFC 4180 compliant** - Proper CSV specification support

## Installation

```bash
npm install @sylphx/molt-csv
```

## Quick Start

### Parse CSV

```typescript
import { parse } from '@sylphx/molt-csv'

const csv = `
name,age,city,country
Alice,30,New York,USA
Bob,25,London,UK
Charlie,35,Paris,France
`

const records = parse(csv)
console.log(records)
// [
//   { name: 'Alice', age: '30', city: 'New York', country: 'USA' },
//   { name: 'Bob', age: '25', city: 'London', country: 'UK' },
//   { name: 'Charlie', age: '35', city: 'Paris', country: 'France' }
// ]
```

### Stringify CSV

```typescript
import { stringify } from '@sylphx/molt-csv'

const records = [
  { name: 'Alice', age: 30, city: 'New York' },
  { name: 'Bob', age: 25, city: 'London' }
]

const csv = stringify(records)
console.log(csv)
// name,age,city
// Alice,30,New York
// Bob,25,London
```

### Type Conversion

```typescript
import { parse } from '@sylphx/molt-csv'

const csv = `
id,name,active,score
1,Alice,true,95.5
2,Bob,false,87.3
3,Charlie,true,92.1
`

const records = parse(csv, {
  columns: {
    id: Number,
    active: Boolean,
    score: Number
  }
})

console.log(records[0])
// { id: 1, name: 'Alice', active: true, score: 95.5 }
```

## Performance

Benchmarks showing molt-csv competitiveness:

### Parsing Performance
| Test Case | molt-csv | vs papaparse | vs csv-parse | vs d3-dsv |
|-----------|----------|--------------|--------------|-----------|
| Simple (5 rows) | 775,770 ops/s | **5.9x faster** | **7.0x faster** | 0.96x |
| Complex (10r×9c) | 105,992 ops/s | **2.84x faster** | **4.29x faster** | 0.57x |
| Large (1000 rows) | 1,591 ops/s | **1.39x faster** | **2.53x faster** | 0.40x |
| Quoted fields | 418,311 ops/s | **7.65x faster** | **5.84x faster** | 1.0x |

### Serialization Performance
| Test Case | molt-csv | vs papaparse | vs csv-parse | vs d3-dsv |
|-----------|----------|--------------|--------------|-----------|
| Simple (5 rows) | 637,435 ops/s | **1.52x faster** | **1.37x faster** | 0.83x |
| Complex (10r×9c) | 133,509 ops/s | **1.83x faster** | **1.27x faster** | 0.77x |

## CSV Features

### Basic Parsing

```typescript
import { parse } from '@sylphx/molt-csv'

const csv = `name,email,age
Alice,alice@example.com,30
Bob,bob@example.com,25
Charlie,charlie@example.com,35`

const records = parse(csv)
```

### Quoted Fields

```typescript
const csv = `
name,description,price
"Product A","Contains, commas and ""quotes""",19.99
"Product B","Normal description",29.99
`

const records = parse(csv)
console.log(records[0])
// {
//   name: 'Product A',
//   description: 'Contains, commas and "quotes"',
//   price: '29.99'
// }
```

### Custom Delimiters

```typescript
const tsv = `
name	age	city
Alice	30	New York
Bob	25	London
`

const records = parse(tsv, { delimiter: '\t' })
```

### Headers Configuration

```typescript
const csv = `
Alice,alice@example.com,30
Bob,bob@example.com,25
Charlie,charlie@example.com,35
`

const records = parse(csv, {
  headers: ['name', 'email', 'age']
})

console.log(records[0])
// { name: 'Alice', email: 'alice@example.com', age: '30' }
```

### Type Conversion

```typescript
const csv = `
id,username,active,balance,joined
1,alice,true,1500.50,2024-01-15
2,bob,false,2300.75,2024-02-20
`

const records = parse(csv, {
  columns: {
    id: Number,
    active: Boolean,
    balance: Number,
    joined: (val) => new Date(val)
  }
})

console.log(records[0])
// {
//   id: 1,
//   username: 'alice',
//   active: true,
//   balance: 1500.50,
//   joined: Date(2024-01-15)
// }
```

### Custom Type Converters

```typescript
const records = parse(csv, {
  columns: {
    id: Number,
    tags: (val) => val.split(';'),
    metadata: JSON.parse,
    price: (val) => parseFloat(val)
  }
})
```

## API Reference

### `parse(input, options?)`

Parse CSV into JavaScript objects.

```typescript
function parse(
  input: string,
  options?: ParseOptions
): Record<string, any>[]
```

**Options**:
- `delimiter?: string` - Field delimiter (default: ',')
- `headers?: string[]` - Column headers
- `columns?: Record<string, Function>` - Type converters per column
- `skip_empty_lines?: boolean` - Skip empty lines (default: true)
- `trim?: boolean` - Trim values (default: false)

### `stringify(records, options?)`

Stringify JavaScript objects to CSV.

```typescript
function stringify(
  records: Record<string, any>[],
  options?: StringifyOptions
): string
```

**Options**:
- `delimiter?: string` - Field delimiter (default: ',')
- `header?: boolean` - Include header row (default: true)
- `columns?: string[]` - Specific columns to include
- `quote?: boolean` - Quote fields (default: true)

## Common Patterns

### Reading CSV Files

```typescript
import { readFileSync } from 'fs'
import { parse } from '@sylphx/molt-csv'

const csv = readFileSync('data.csv', 'utf-8')
const records = parse(csv)
```

### Writing CSV Files

```typescript
import { writeFileSync } from 'fs'
import { stringify } from '@sylphx/molt-csv'

const records = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
]

const csv = stringify(records)
writeFileSync('output.csv', csv)
```

### Data Analysis Pipeline

```typescript
import { parse } from '@sylphx/molt-csv'

const csv = readFileSync('sales.csv', 'utf-8')

const records = parse(csv, {
  columns: {
    date: (val) => new Date(val),
    amount: Number,
    quantity: Number
  }
})

// Filter and transform
const filtered = records
  .filter(r => r.amount > 100)
  .map(r => ({
    ...r,
    totalValue: r.amount * r.quantity
  }))

const output = stringify(filtered)
```

### Database Bulk Insert

```typescript
import { parse } from '@sylphx/molt-csv'

const csv = readFileSync('users.csv', 'utf-8')

const records = parse(csv, {
  columns: {
    id: Number,
    age: Number
  }
})

// Insert into database
for (const record of records) {
  await db.users.insert(record)
}
```

### Combining Multiple CSVs

```typescript
import { parse, stringify } from '@sylphx/molt-csv'

const csv1 = readFileSync('file1.csv', 'utf-8')
const csv2 = readFileSync('file2.csv', 'utf-8')

const records1 = parse(csv1)
const records2 = parse(csv2)

const combined = [...records1, ...records2]
const output = stringify(combined)
```

## Advanced Features

### WASM Acceleration

For very large files, WASM can help:

```typescript
import { parse } from '@sylphx/molt-csv/wasm'

// Uses WebAssembly implementation
const records = parse(largeCSV)
```

### Streaming Large Files

```typescript
import { createReadStream } from 'fs'
import { createParseStream } from '@sylphx/molt-csv'

const stream = createReadStream('huge.csv')
const csvStream = createParseStream()

stream.pipe(csvStream)

csvStream.on('data', (record) => {
  console.log('Processing:', record)
})
```

## Error Handling

```typescript
import { parse } from '@sylphx/molt-csv'

try {
  const records = parse(csv, { strict: true })
} catch (error) {
  console.error('CSV parse error at line:', error.line)
  console.error('Message:', error.message)
}
```

## Comparison with Alternatives

### molt-csv vs papaparse

```typescript
// molt-csv is 5.9x faster on simple CSVs
import { parse } from '@sylphx/molt-csv'

const records = parse(csv)
```

### molt-csv vs csv-parse

```typescript
// molt-csv is 7x faster and has better type support
import { parse } from '@sylphx/molt-csv'

const records = parse(csv, {
  columns: { id: Number }
})
```

## Best Practices

1. **Always specify column types** - Enables automatic conversion
2. **Use headers option** - Makes data more readable
3. **Handle errors gracefully** - CSV can have inconsistencies
4. **Consider streaming** - For files larger than 10MB
5. **Validate data after parsing** - Use schema validation

## Resources

- [Quick Start Guide](/guide/quick-start#csv---data-processing)
- [Installation Guide](/guide/installation#molt-csv)
- [Benchmarks](/benchmarks#csv-package)
- [GitHub Repository](https://github.com/sylphx/molt)

---

**Next**: Explore [other packages](/packages/) or check the [Benchmarks](/benchmarks)
