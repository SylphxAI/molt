# @sylphx/molt-xml

[![npm version](https://badge.fury.io/js/@sylphx%2Fmolt-xml.svg)](https://www.npmjs.com/package/@sylphx/molt-xml)
[![CI](https://github.com/sylphx/molt/workflows/CI/badge.svg)](https://github.com/sylphx/molt/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)

**Fast and robust XML transformer** - Dirty cleaning · Type preservation · Object conversion · Zero dependencies

---

## Why molt-xml?

🔥 **Handles dirty XML** - Fixes malformed XML automatically
🎯 **Type-safe** - Full TypeScript support with strict types
🔄 **Bidirectional** - Parse to DOM or objects, stringify back to XML
🛡️ **Production-ready** - Comprehensive test coverage
⚡ **Fast parsing** - Efficient state machine parser
🌊 **Streaming support** - Process large XML files efficiently

```typescript
import { molt } from '@sylphx/molt-xml'

// Parse dirty XML to JavaScript object
const data = molt('<user name=alice age=30/>')
// => { '@name': 'alice', '@age': '30' }

// Clean dirty XML
import { MoltXML } from '@sylphx/molt-xml'
const clean = MoltXML.clean('<user name=alice>')
// => '<user name="alice"></user>'
```

---

## Features

### 🔥 Dirty XML Cleaning

Handle real-world malformed XML:

```typescript
import { MoltXML } from '@sylphx/molt-xml'

// Missing quotes
const clean1 = MoltXML.clean('<user name=alice age=30/>')
// => '<user name="alice" age="30"/>'

// Unclosed tags
const clean2 = MoltXML.clean('<div><p>Hello</div>')
// => '<div><p>Hello</p></div>'

// Mixed issues
const dirty = '<config port=8080 enabled=true><server host=localhost></config>'
const clean3 = MoltXML.clean(dirty)
```

### 📦 Parse to Objects

Convert XML to JavaScript objects:

```typescript
import { molt } from '@sylphx/molt-xml'

const xml = `
  <user>
    <name>Alice</name>
    <age>30</age>
    <tags>
      <tag>developer</tag>
      <tag>typescript</tag>
    </tags>
  </user>
`

const data = molt(xml)
/*
{
  user: {
    name: 'Alice',
    age: '30',
    tags: {
      tag: ['developer', 'typescript']
    }
  }
}
*/
```

### 🏗️ Parse to DOM

Get structured XMLDocument:

```typescript
import { MoltXML } from '@sylphx/molt-xml'

const doc = MoltXML.parse('<root><item id="1">Hello</item></root>')

// Navigate DOM
doc.root.children[0]  // XMLElement
doc.root.children[0].attributes.id  // "1"
doc.root.children[0].children[0]  // Text node
```

### ✍️ Stringify

Convert XMLDocument back to XML:

```typescript
import { MoltXML } from '@sylphx/molt-xml'

const doc = MoltXML.parse('<root><item>Hello</item></root>')
const xml = MoltXML.stringify(doc, {
  pretty: true,
  indent: 2,
})
```

---

## Installation

```bash
bun add @sylphx/molt-xml
# or
npm install @sylphx/molt-xml
# or
pnpm add @sylphx/molt-xml
```

---

## API

### ⚡ Unified API (Recommended)

#### `molt(input, options?)`

Parse XML string to JavaScript object.

```typescript
import { molt } from '@sylphx/molt-xml'

const data = molt('<user name="alice" age="30"/>')
// => { '@name': 'alice', '@age': '30' }
```

**Options:**

```typescript
interface ParseXMLOptions {
  cleanDirty?: boolean     // Clean dirty XML before parsing (default: true)
  preserveWhitespace?: boolean  // Preserve whitespace in text (default: false)
  parseTypes?: boolean     // Auto-convert types (numbers, booleans) (default: false)
  maxSize?: number         // Maximum input size in bytes
}
```

### 🏗️ DOM API

#### `MoltXML.parse(input, options?)`

Parse XML to XMLDocument:

```typescript
import { MoltXML } from '@sylphx/molt-xml'

const doc = MoltXML.parse(`
  <root>
    <item id="1">Hello</item>
  </root>
`)

// Access DOM
doc.root.name  // 'root'
doc.root.children[0].attributes  // { id: '1' }
```

#### `MoltXML.toObject(input, options?)`

Parse XML directly to object (same as `molt()`):

```typescript
import { MoltXML } from '@sylphx/molt-xml'

const obj = MoltXML.toObject('<user><name>Alice</name></user>')
```

#### `MoltXML.stringify(doc, options?)`

Stringify XMLDocument to XML string:

```typescript
import { MoltXML } from '@sylphx/molt-xml'

const doc = MoltXML.parse('<root/>')
const xml = MoltXML.stringify(doc, {
  pretty: true,
  indent: 2,
  xmlDeclaration: true,
})
```

**Options:**

```typescript
interface StringifyXMLOptions {
  pretty?: boolean         // Pretty print (default: false)
  indent?: number          // Indentation spaces (default: 2)
  xmlDeclaration?: boolean // Include <?xml?> declaration (default: false)
}
```

### 🧹 Clean API

#### `MoltXML.clean(input, maxSize?)`

Clean dirty XML to valid XML:

```typescript
import { MoltXML } from '@sylphx/molt-xml'

const clean = MoltXML.clean('<user name=alice age=30/>')
// => '<user name="alice" age="30"/>'
```

### 🚨 Error Handling

```typescript
import { MoltXML, XMLError, ParseError, ValidationError } from '@sylphx/molt-xml'

try {
  const data = molt(invalidXml)
} catch (err) {
  if (err instanceof ParseError) {
    console.error(`Parse error: ${err.message}`)
  } else if (err instanceof ValidationError) {
    console.error(`Validation error: ${err.message}`)
  } else if (err instanceof XMLError) {
    console.error(`XML error: ${err.message}`)
  }
}
```

---

## Use Cases

### 1. Parse Configuration Files

```typescript
import { molt } from '@sylphx/molt-xml'
import fs from 'fs'

// Read pom.xml (Maven)
const pom = molt(fs.readFileSync('pom.xml', 'utf8'))
console.log(pom.project.groupId, pom.project.artifactId)

// Read web.config
const config = molt(fs.readFileSync('web.config', 'utf8'))
```

### 2. API Response Handling

```typescript
import { molt } from '@sylphx/molt-xml'

// Handle XML from APIs
const response = await fetch('https://api.example.com/data.xml')
const xml = await response.text()
const data = molt(xml, {
  cleanDirty: true,
  parseTypes: true,
})
```

### 3. Data Transformation

```typescript
import { molt, MoltXML } from '@sylphx/molt-xml'

// XML to Object
const obj = molt('<users><user id="1"><name>Alice</name></user></users>')

// Process data
const processed = {
  ...obj.users,
  timestamp: new Date().toISOString(),
}

// Back to XML (via JSON)
import { stringifyTOML } from '@sylphx/molt-toml'
const toml = stringifyTOML(processed)
```

### 4. Clean Dirty XML

```typescript
import { MoltXML } from '@sylphx/molt-xml'
import fs from 'fs'

// Read dirty XML from external source
const dirty = fs.readFileSync('dirty.xml', 'utf8')

// Clean and save
const clean = MoltXML.clean(dirty)
fs.writeFileSync('clean.xml', clean)
```

---

## Supported XML Features

| Feature | Parsing | Stringifying |
|---------|---------|--------------|
| Elements | ✅ | ✅ |
| Attributes | ✅ | ✅ |
| Text content | ✅ | ✅ |
| CDATA sections | ✅ | ✅ |
| Comments | ✅ | ✅ |
| Processing instructions | ✅ | ✅ |
| XML declaration | ✅ | ✅ |
| Namespaces | ✅ | ✅ |
| Self-closing tags | ✅ | ✅ |
| Mixed content | ✅ | ✅ |
| Dirty XML (unquoted attrs) | ✅ | ❌ |
| Type conversion | ✅ | ❌ |

---

## Object Conversion

XML is converted to JavaScript objects with these conventions:

```typescript
// Attributes use @ prefix
'<user id="1"/>' => { '@id': '1' }

// Text content uses # key
'<name>Alice</name>' => { name: 'Alice' }

// Mixed content preserves structure
'<p>Hello <b>world</b>!</p>' => {
  p: [
    'Hello ',
    { b: 'world' },
    '!'
  ]
}

// Multiple children with same name become array
`<tags>
  <tag>a</tag>
  <tag>b</tag>
</tags>` => { tags: { tag: ['a', 'b'] } }
```

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

`@sylphx/molt-xml` is part of the **molt data transformation stack**:

- **@sylphx/molt-json** - JSON transformer
- **@sylphx/molt-xml** - XML transformer (this package)
- **@sylphx/molt-yaml** - YAML transformer
- **@sylphx/molt-toml** - TOML transformer
- **@sylphx/molt-csv** - CSV transformer
- **@sylphx/molt** - Meta package with all formats

See the [monorepo root](../..) for more information.

---

## License

MIT © [Sylphx](../../LICENSE)
