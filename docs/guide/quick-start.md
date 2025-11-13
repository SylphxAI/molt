# Quick Start Guide

Get up and running with Molt in minutes with practical examples for each format.

## JSON - Type-Preserving Transformer

### Installation

```bash
npm install @sylphx/molt-json
```

### Basic Usage

```typescript
import { molt, stringify } from '@sylphx/molt-json'

// Parse dirty JSON
const data = molt(`{
  name: 'Alice',
  age: 30,
  active: true,
}`)

console.log(data)
// Output: { name: 'Alice', age: 30, active: true }
```

### Type Preservation

```typescript
const json = stringify({
  created: new Date('2024-01-01'),
  id: 123456789012345678901n,
  tags: new Set(['javascript', 'performance']),
  config: new Map([['theme', 'dark']]),
  pattern: /^test$/i
})

const restored = molt(json)

console.log(restored.created instanceof Date)  // true
console.log(restored.id === 123456789012345678901n)  // true
console.log(restored.tags instanceof Set)  // true
console.log(restored.config instanceof Map)  // true
console.log(restored.pattern instanceof RegExp)  // true
```

### Dirty JSON Features

```typescript
// Unquoted keys
molt('{ name: "Alice", email: "alice@example.com" }')

// Single quotes
molt("{ user: 'Bob' }")

// JavaScript comments
molt(`{
  // User configuration
  theme: 'dark',  /* toggle dark mode */
  notifications: true
}`)

// Trailing commas
molt(`{
  items: [1, 2, 3,],
  tags: ["a", "b",],
}`)
```

### Validation

```typescript
import { molt } from '@sylphx/molt-json'
import { z } from 'zod'

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email()
})

const data = molt('{ name: "Alice", age: 30, email: "alice@test.com" }')
const validated = UserSchema.parse(data)
```

## YAML - Ultra-Fast Configuration

### Installation

```bash
npm install @sylphx/molt-yaml
```

### Basic Usage

```typescript
import { parse, stringify } from '@sylphx/molt-yaml'

const yaml = `
database:
  host: localhost
  port: 5432
  credentials:
    username: admin
    password: secret

cache:
  ttl: 3600
  enabled: true
`

const config = parse(yaml)
console.log(config.database.host)  // 'localhost'
console.log(config.cache.ttl)  // 3600
```

### Stringify YAML

```typescript
const config = {
  app: {
    name: 'MyApp',
    version: '1.0.0',
    debug: false
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  }
}

const yaml = stringify(config)
console.log(yaml)
```

### Lists and Arrays

```typescript
const yaml = `
items:
  - name: Item 1
    price: 10.99
  - name: Item 2
    price: 20.50

tags:
  - javascript
  - performance
  - yaml
`

const data = parse(yaml)
console.log(data.items[0].name)  // 'Item 1'
console.log(data.tags)  // ['javascript', 'performance', 'yaml']
```

### Anchors and Aliases

```typescript
const yaml = `
defaults: &defaults
  timeout: 30
  retries: 3

production:
  <<: *defaults
  workers: 10

development:
  <<: *defaults
  workers: 1
`

const config = parse(yaml)
console.log(config.production.timeout)  // 30 (from defaults)
```

## TOML - Configuration Files

### Installation

```bash
npm install @sylphx/molt-toml
```

### Basic Usage

```typescript
import { parse, stringify } from '@sylphx/molt-toml'

const toml = `
[package]
name = "my-app"
version = "1.0.0"
description = "My awesome app"

[dependencies]
react = "^18.0.0"
typescript = "^5.0.0"

[devDependencies]
vitest = "^0.34.0"
`

const config = parse(toml)
console.log(config.package.name)  // 'my-app'
console.log(config.dependencies.react)  // '^18.0.0'
```

### Tables and Nested Structures

```typescript
const toml = `
[database]
server = "192.168.1.1"
ports = [8001, 8001, 8002]
enabled = true

[[database.connections]]
host = "localhost"
port = 5432

[[database.connections]]
host = "backup.example.com"
port = 5433
`

const config = parse(toml)
console.log(config.database.connections[0].host)  // 'localhost'
console.log(config.database.ports)  // [8001, 8001, 8002]
```

### Stringify TOML

```typescript
const config = {
  package: {
    name: 'my-app',
    version: '1.0.0'
  },
  dependencies: {
    react: '^18.0.0'
  }
}

const toml = stringify(config)
console.log(toml)
```

## CSV - Data Processing

### Installation

```bash
npm install @sylphx/molt-csv
```

### Basic Usage

```typescript
import { parse, stringify } from '@sylphx/molt-csv'

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

### Type Conversion

```typescript
const csv = `
id,name,active,score
1,Alice,true,95.5
2,Bob,false,87.3
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

### Stringify CSV

```typescript
const records = [
  { name: 'Alice', age: 30, city: 'New York' },
  { name: 'Bob', age: 25, city: 'London' },
  { name: 'Charlie', age: 35, city: 'Paris' }
]

const csv = stringify(records)
console.log(csv)
// name,age,city
// Alice,30,New York
// Bob,25,London
// Charlie,35,Paris
```

### Handling Quotes and Escapes

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
//   price: '19.99'
// }
```

## XML - Document Processing

### Installation

```bash
npm install @sylphx/molt-xml
```

### Basic Usage

```typescript
import { parse, toObject } from '@sylphx/molt-xml'

const xml = `
<root>
  <user id="1">
    <name>Alice</name>
    <email>alice@example.com</email>
  </user>
  <user id="2">
    <name>Bob</name>
    <email>bob@example.com</email>
  </user>
</root>
`

const doc = parse(xml)
console.log(doc)
```

### Convert to Object

```typescript
const xml = `
<config>
  <database>
    <host>localhost</host>
    <port>5432</port>
  </database>
  <cache enabled="true">
    <ttl>3600</ttl>
  </cache>
</config>
`

const obj = toObject(parse(xml))
console.log(obj)
// {
//   config: {
//     database: {
//       host: 'localhost',
//       port: '5432'
//     },
//     cache: {
//       '@enabled': 'true',
//       ttl: '3600'
//     }
//   }
// }
```

### Attributes

```typescript
const xml = `
<root>
  <item id="1" type="product">
    <name>Item 1</name>
  </item>
  <item id="2" type="service">
    <name>Item 2</name>
  </item>
</root>
`

const doc = parse(xml)
const obj = toObject(doc)
// Attributes are preserved with @ prefix
```

### Dirty XML Handling

```typescript
const dirtyXml = `
<root>
  <item>Missing closing tag
  <item>Unclosed element
</root>
`

// Enable dirty XML cleaning
const doc = parse(dirtyXml, { cleanDirty: true })
const obj = toObject(doc)
```

## Common Patterns

### Reading from Files

```typescript
import { readFileSync } from 'fs'
import { parse } from '@sylphx/molt-yaml'

const yaml = readFileSync('config.yaml', 'utf-8')
const config = parse(yaml)
```

### Writing to Files

```typescript
import { writeFileSync } from 'fs'
import { stringify } from '@sylphx/molt-json'

const data = { name: 'Alice', created: new Date() }
const json = stringify(data)
writeFileSync('data.json', json, 'utf-8')
```

### Error Handling

```typescript
import { molt } from '@sylphx/molt-json'

try {
  const data = molt('{ invalid json ]')
} catch (error) {
  console.error('Parse error:', error.message)
}
```

## Next Steps

- [Installation Guide](/guide/installation) - Setup for each package
- [Benchmarks](/benchmarks) - Performance comparisons
- [Package Documentation](/packages/) - Detailed API references
- [GitHub Repository](https://github.com/sylphx/molt) - Source code and issues

---

**Happy transforming!**
