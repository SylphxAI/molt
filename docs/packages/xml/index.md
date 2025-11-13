# molt-xml - Fast XML Parser with Dirty Input Support

**Competitive XML parser** with unique dirty XML cleaning capabilities.

## Overview

`@sylphx/molt-xml` is a high-performance XML parser that matches industry standards while offering unique features like dirty XML cleaning.

### Key Features

- 🏆 **Matches fastest parsers** (fast-xml-parser)
- 🧹 **Dirty XML cleaning** - Only library with this feature
- 🎯 **Flexible output** - DOM or object format
- 📊 **Full XML support** - Attributes, CDATA, comments, namespaces
- 🛡️ **Type-safe** - Full TypeScript support
- 📦 **Zero dependencies** - Pure implementation
- 🚀 **Streaming ready** - Handle large documents
- 🎓 **Well-tested** - Comprehensive test coverage

## Installation

```bash
npm install @sylphx/molt-xml
```

## Quick Start

### Parse XML

```typescript
import { parse, toObject } from '@sylphx/molt-xml'

const xml = `
<root>
  <user id="1">
    <name>Alice</name>
    <email>alice@example.com</email>
    <age>30</age>
  </user>
  <user id="2">
    <name>Bob</name>
    <email>bob@example.com</email>
    <age>25</age>
  </user>
</root>
`

// Get DOM
const doc = parse(xml)

// Convert to object
const obj = toObject(doc)
console.log(obj)
```

### Convert to JavaScript Objects

```typescript
import { parse, toObject } from '@sylphx/molt-xml'

const xml = `<config>
  <database host="localhost" port="5432">
    <credentials>
      <username>admin</username>
      <password>secret</password>
    </credentials>
  </database>
</config>`

const doc = parse(xml)
const config = toObject(doc)

console.log(config.config.database['@host'])  // 'localhost'
console.log(config.config.database.credentials.username)  // 'admin'
```

### Handle Dirty XML

```typescript
import { parse, toObject } from '@sylphx/molt-xml'

const dirtyXml = `
<root>
  <item>Missing closing tag
  <item>Unclosed element
  <empty>
</root>
`

// Clean and parse dirty XML
const doc = parse(dirtyXml, { cleanDirty: true })
const obj = toObject(doc)
```

## Performance

Benchmarks showing molt-xml competitiveness:

### Parsing Performance
| Test Case | molt-xml | vs fast-xml-parser | vs xml2js |
|-----------|----------|-------------------|-----------|
| Simple config | 102,975 ops/s | 1.01x (matched) | **1.47x faster** |
| Complex nested | 20,605 ops/s | **1.10x faster** | **1.06x faster** |
| CDATA sections | 86,232 ops/s | 0.66x | **1.23x faster** |

## XML Features

### Basic Elements

```typescript
import { parse, toObject } from '@sylphx/molt-xml'

const xml = `
<library>
  <book>
    <title>The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <year>1925</year>
  </book>
  <book>
    <title>To Kill a Mockingbird</title>
    <author>Harper Lee</author>
    <year>1960</year>
  </book>
</library>
`

const doc = parse(xml)
const library = toObject(doc)
```

### Attributes

```typescript
const xml = `
<root>
  <user id="1" role="admin" active="true">
    <name>Alice</name>
  </user>
  <user id="2" role="user" active="false">
    <name>Bob</name>
  </user>
</root>
`

const obj = toObject(parse(xml))
// Attributes prefixed with '@'
console.log(obj.root.user[0]['@id'])  // '1'
console.log(obj.root.user[0]['@role'])  // 'admin'
```

### Text Content

```typescript
const xml = `
<root>
  <item>Simple text</item>
  <paragraph>
    This is a paragraph with
    multiple lines and text.
  </paragraph>
</root>
`

const obj = toObject(parse(xml))
console.log(obj.root.item)  // 'Simple text'
```

### CDATA Sections

```typescript
const xml = `
<root>
  <script>
    <![CDATA[
      function example() {
        return "<tag>";
      }
    ]]>
  </script>
</root>
`

const obj = toObject(parse(xml))
```

### Comments

```typescript
const xml = `
<!-- Root configuration -->
<config>
  <!-- Database settings -->
  <database>
    <host>localhost</host>
  </database>
  <!-- Cache settings -->
  <cache>
    <ttl>3600</ttl>
  </cache>
</config>
`

const obj = toObject(parse(xml))
// Comments are preserved in DOM, excluded from object conversion
```

### Processing Instructions

```typescript
const xml = `
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="style.xsl"?>
<root>
  <item>Content</item>
</root>
`

const doc = parse(xml)
```

### Namespaces

```typescript
const xml = `
<root xmlns:app="http://example.com/app">
  <app:user>
    <app:name>Alice</app:name>
    <app:role>admin</app:role>
  </app:user>
</root>
`

const doc = parse(xml)
const obj = toObject(doc)
```

## API Reference

### `parse(input, options?)`

Parse XML into a DOM-like structure.

```typescript
function parse(
  input: string,
  options?: ParseOptions
): Document
```

**Options**:
- `cleanDirty?: boolean` - Clean dirty XML (default: false)
- `preserveComments?: boolean` - Keep comments (default: true)
- `trim?: boolean` - Trim whitespace (default: false)

### `toObject(doc, options?)`

Convert XML DOM to JavaScript object.

```typescript
function toObject(
  doc: Document,
  options?: ToObjectOptions
): Record<string, any>
```

**Options**:
- `attributePrefix?: string` - Attribute prefix (default: '@')
- `textKey?: string` - Text content key (default: '#text')
- `ignoreAttributes?: boolean` - Skip attributes (default: false)
- `ignoreComments?: boolean` - Skip comments (default: true)

### `stringify(doc, options?)`

Stringify XML DOM back to string.

```typescript
function stringify(
  doc: Document,
  options?: StringifyOptions
): string
```

## Common Patterns

### Parsing Configuration Files

```typescript
import { readFileSync } from 'fs'
import { parse, toObject } from '@sylphx/molt-xml'

const xml = readFileSync('config.xml', 'utf-8')
const doc = parse(xml)
const config = toObject(doc)

console.log(config.configuration.database.host)
```

### SVG Document Processing

```typescript
const svgXml = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="red" />
  <rect x="10" y="10" width="30" height="30" fill="blue" />
</svg>
`

const doc = parse(svgXml)
const svg = toObject(doc)

console.log(svg.svg['@width'])  // '100'
console.log(svg.svg.circle['@r'])  // '40'
```

### HTML Parsing

```typescript
const html = `
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <h1>Welcome</h1>
    <p>This is a paragraph</p>
  </body>
</html>
`

const doc = parse(html)
const page = toObject(doc)
```

### SOAP Message Handling

```typescript
const soap = `
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetUserResponse xmlns="http://example.com/service">
      <user>
        <id>1</id>
        <name>Alice</name>
      </user>
    </GetUserResponse>
  </soap:Body>
</soap:Envelope>
`

const doc = parse(soap)
const envelope = toObject(doc)
```

### RSS Feed Parsing

```typescript
const rss = `
<rss version="2.0">
  <channel>
    <title>My Blog</title>
    <link>https://example.com</link>
    <item>
      <title>First Post</title>
      <link>https://example.com/post1</link>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>
`

const doc = parse(rss)
const feed = toObject(doc)
```

## Dirty XML Cleaning

Molt-xml is the only major XML library with dirty XML support:

```typescript
import { parse, toObject } from '@sylphx/molt-xml'

// Malformed XML with missing closing tags
const dirtyXml = `
<root>
  <user>
    <name>Alice
    <email>alice@example.com
  <user>
    <name>Bob
</root>
`

// Enable cleaning
const doc = parse(dirtyXml, { cleanDirty: true })
const obj = toObject(doc)

// Missing tags are automatically closed
console.log(obj.root.user)  // Array of users, properly structured
```

**Dirty XML features supported:**
- Missing closing tags
- Improperly nested elements
- Unclosed attributes
- Malformed declarations
- Extra whitespace handling

## Error Handling

```typescript
import { parse } from '@sylphx/molt-xml'

try {
  const doc = parse(malformedXml)
} catch (error) {
  console.error('Parse error:', error.message)
  console.error('Position:', error.position)
}
```

## Comparison with Alternatives

### molt-xml vs fast-xml-parser

```typescript
// Same performance, with dirty XML support
import { parse, toObject } from '@sylphx/molt-xml'

const obj = toObject(parse(xml))
```

### molt-xml vs xml2js

```typescript
// molt-xml is faster and cleaner API
import { parse, toObject } from '@sylphx/molt-xml'

const obj = toObject(parse(xml))
// vs xml2js which requires more configuration
```

### Unique: Dirty XML Support

```typescript
// Only molt-xml can handle dirty XML
const dirtyDoc = parse(malformedXml, { cleanDirty: true })
const obj = toObject(dirtyDoc)
```

## Best Practices

1. **Use toObject for simple cases** - Easier to work with than DOM
2. **Keep XML readable** - Proper indentation matters
3. **Handle namespaces** - Important for complex documents
4. **Validate before parsing** - Invalid XML can cause issues
5. **Use dirty cleaning cautiously** - It's a fallback mechanism

## Tips and Tricks

### Selective Attribute Handling

```typescript
const obj = toObject(doc, {
  ignoreAttributes: false,  // Keep attributes
  attributePrefix: '$'       // Use different prefix
})
```

### Custom Text Content Key

```typescript
const obj = toObject(doc, {
  textKey: '__text'  // Change from '#text' to '__text'
})
```

### Building XML Programmatically

```typescript
const builder = {
  root: {
    user: [
      { '@id': '1', name: 'Alice', email: 'alice@test.com' },
      { '@id': '2', name: 'Bob', email: 'bob@test.com' }
    ]
  }
}

// You can manually construct objects compatible with molt-xml
```

## Resources

- [Quick Start Guide](/guide/quick-start#xml---document-processing)
- [Installation Guide](/guide/installation#molt-xml)
- [Benchmarks](/benchmarks#xml-package)
- [GitHub Repository](https://github.com/sylphx/molt)

---

**Next**: Explore [other packages](/packages/) or check the [Benchmarks](/benchmarks)
