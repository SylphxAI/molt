# molt-yaml - Ultra-Fast YAML Processor

**The fastest YAML parser in the ecosystem** with 2-415x performance advantage.

## Overview

`@sylphx/molt-yaml` is a high-performance YAML parser and stringifier. It dominates the YAML space with consistent 2-400x faster performance than competing libraries.

### Key Features

- 🥇 **2-415x faster** than competitors (js-yaml, yaml)
- 🚀 **1,021,050 ops/sec** on simple config parsing
- 📊 **Multi-document support** - 415x faster than yaml library
- 🔄 **Full round-trip** - Parse and stringify with fidelity
- ✅ **Anchors & aliases** - Complete YAML 1.1 support
- 🛡️ **Type-safe** - Full TypeScript support
- 📦 **Zero dependencies** - Lightweight and fast
- 🎯 **Battle-tested** - Comprehensive test coverage

## Installation

```bash
npm install @sylphx/molt-yaml
```

## Quick Start

### Parse YAML

```typescript
import { parse } from '@sylphx/molt-yaml'

const yaml = `
database:
  host: localhost
  port: 5432
  ssl: true

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
import { stringify } from '@sylphx/molt-yaml'

const config = {
  database: {
    host: 'localhost',
    port: 5432,
    ssl: true
  },
  cache: {
    ttl: 3600,
    enabled: true
  }
}

const yaml = stringify(config)
console.log(yaml)
```

### Multi-Document YAML

```typescript
import { parse } from '@sylphx/molt-yaml'

const yaml = `
---
name: Document 1
value: 1
---
name: Document 2
value: 2
---
name: Document 3
value: 3
`

// molt-yaml supports multi-document parsing
const docs = parse(yaml, { multiDocument: true })
console.log(docs)  // Array of 3 documents
```

## Performance

Benchmarks showing molt-yaml dominance:

### Parsing Performance
| Test Case | molt-yaml | vs js-yaml | vs yaml |
|-----------|-----------|------------|---------|
| Simple config | 1,021,050 ops/s | **2.87x faster** | **32.8x faster** |
| Complex nested | 203,271 ops/s | **2.44x faster** | **26.6x faster** |
| Anchors/aliases | 355,821 ops/s | **3.56x faster** | **36.6x faster** |
| Multi-document | 4,950,074 ops/s | - | **415x faster** 🔥 |

### Serialization Performance
| Test Case | molt-yaml | vs js-yaml | vs yaml |
|-----------|-----------|------------|---------|
| Simple stringify | 1,281,438 ops/s | **3.98x faster** | **15.8x faster** |
| Complex stringify | 173,377 ops/s | **2.49x faster** | **8.14x faster** |

## YAML Features

### Basic Data Types

```typescript
import { parse } from '@sylphx/molt-yaml'

const yaml = `
string: "Hello, World!"
number: 42
float: 3.14
boolean: true
null_value: null
list: [1, 2, 3]
`

const data = parse(yaml)
```

### Maps and Objects

```typescript
const yaml = `
person:
  name: Alice
  age: 30
  email: alice@example.com

address:
  street: 123 Main St
  city: New York
  zip: 10001
`

const data = parse(yaml)
console.log(data.person.name)  // 'Alice'
console.log(data.address.zip)  // '10001'
```

### Lists and Arrays

```typescript
const yaml = `
# List of numbers
numbers: [1, 2, 3, 4, 5]

# List of objects
users:
  - name: Alice
    age: 30
  - name: Bob
    age: 25

# Mixed types
mixed:
  - string
  - 42
  - true
  - null
`

const data = parse(yaml)
console.log(data.numbers)  // [1, 2, 3, 4, 5]
console.log(data.users[0].name)  // 'Alice'
```

### Anchors and Aliases

```typescript
const yaml = `
defaults: &defaults
  timeout: 30
  retries: 3
  debug: false

production:
  <<: *defaults
  workers: 10
  environment: prod

development:
  <<: *defaults
  workers: 1
  environment: dev
`

const config = parse(yaml)
console.log(config.production.timeout)  // 30 (inherited from defaults)
console.log(config.production.workers)  // 10 (overridden)
```

### Multiline Strings

```typescript
const yaml = `
# Literal block scalar (preserves newlines)
description: |
  This is a description
  that spans multiple lines
  and preserves formatting

# Folded block scalar (joins lines)
summary: >
  This is a summary
  that spans multiple lines
  but gets folded into
  a single line

# Quoted string
quoted: "Line 1\nLine 2"
`

const data = parse(yaml)
```

### Comments

```typescript
const yaml = `
# This is a comment
name: Alice  # inline comment
age: 30      # another inline comment

# Lists also support comments
items:
  - item1  # first item
  - item2  # second item
`

const data = parse(yaml)
```

## API Reference

### `parse(input, options?)`

Parse YAML into JavaScript objects.

```typescript
function parse<T = any>(
  input: string,
  options?: ParseOptions
): T | T[]
```

**Options**:
- `multiDocument?: boolean` - Parse multiple documents (default: false)
- `strict?: boolean` - Strict parsing mode (default: false)
- `schema?: 'json' | 'core'` - YAML schema (default: 'core')

### `stringify(value, options?)`

Stringify JavaScript objects to YAML.

```typescript
function stringify(
  value: any,
  options?: StringifyOptions
): string
```

**Options**:
- `indent?: number` - Indentation size (default: 2)
- `lineWidth?: number` - Maximum line width (default: 80)
- `sortKeys?: boolean` - Sort object keys (default: false)
- `schema?: 'json' | 'core'` - YAML schema (default: 'core')

## Common Patterns

### Configuration Files

```typescript
import { readFileSync } from 'fs'
import { parse } from '@sylphx/molt-yaml'

const yaml = readFileSync('config.yaml', 'utf-8')
const config = parse(yaml)

// Use configuration
console.log(config.server.port)
console.log(config.database.url)
```

### Docker Compose Files

```typescript
const yaml = `
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    environment:
      NODE_ENV: production

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
`

const compose = parse(yaml)
console.log(compose.services.web.ports)  // ['80:80']
```

### Kubernetes Manifests

```typescript
const yaml = `
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
    - name: my-container
      image: my-image:latest
      ports:
        - containerPort: 8080
      env:
        - name: DEBUG
          value: "true"
`

const manifest = parse(yaml)
console.log(manifest.metadata.name)  // 'my-pod'
```

## Error Handling

```typescript
import { parse } from '@sylphx/molt-yaml'

try {
  const data = parse('invalid: : yaml:')
} catch (error) {
  console.error('Parse error:', error.message)
  console.error('Line:', error.line)
  console.error('Column:', error.column)
}
```

## Comparison with Alternatives

### molt-yaml vs js-yaml

```typescript
// Same API, but molt-yaml is 2.87x faster
import { parse } from '@sylphx/molt-yaml'

const data = parse(yaml)
```

### mult-yaml vs yaml

```typescript
// molt-yaml is 32.8x faster on simple configs
// 415x faster on multi-document parsing!
import { parse } from '@sylphx/molt-yaml'

const docs = parse(yaml, { multiDocument: true })
```

## Best Practices

1. **Use for config files** - It's what YAML is designed for
2. **Validate after parsing** - Schema validation recommended
3. **Prefer literal block scalars** - For multi-line strings
4. **Use anchors wisely** - Reduces duplication in config
5. **Keep YAML readable** - Avoid excessive nesting

## Resources

- [Quick Start Guide](/guide/quick-start#yaml---ultra-fast-configuration)
- [Installation Guide](/guide/installation#molt-yaml)
- [Benchmarks](/benchmarks#yaml-package)
- [GitHub Repository](https://github.com/sylphx/molt)

---

**Next**: Explore [other packages](/packages/) or check the [Benchmarks](/benchmarks)
