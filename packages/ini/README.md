# @sylphx/molt-ini

High-performance INI parser and serializer with full type support.

## Features

- ⚡ **Blazing Fast** - Optimized parser up to 3x faster than alternatives
- 🎯 **Type Coercion** - Automatic parsing of numbers, booleans, null
- 📝 **Section Support** - Full INI section syntax
- 💬 **Comment Support** - Semicolon and hash comments
- 🔧 **Flexible API** - Parse and serialize with extensive options
- 🛡️ **Type Safety** - Full TypeScript support
- 📦 **Zero Dependencies** - No external runtime dependencies

## Installation

```bash
bun add @sylphx/molt-ini
```

## Quick Start

### Parse INI

```typescript
import { molt } from '@sylphx/molt-ini'

const config = molt(`
[database]
host = localhost
port = 5432
enabled = true
timeout = 30.5
`)

console.log(config.database.port) // 5432 (number)
console.log(config.database.enabled) // true (boolean)
```

### Serialize to INI

```typescript
import { stringify } from '@sylphx/molt-ini'

const config = {
  database: {
    host: 'localhost',
    port: 5432,
    enabled: true
  }
}

const ini = stringify(config)
console.log(ini)
// [database]
// host = localhost
// port = 5432
// enabled = true
```

## API

### `parseINI(input, options?)`

Parse INI string to object.

**Aliases:** `molt()`, `parse()`

```typescript
import { parseINI } from '@sylphx/molt-ini'

const config = parseINI(iniString, {
  allowSections: true,      // Parse [section] headers
  allowComments: true,      // Allow ; and # comments
  parseTypes: true,         // Auto-convert types
  trim: true,               // Trim whitespace
  inlineComments: false,    // Allow inline comments
  multiLine: false          // Support multi-line values
})
```

### `serializeINI(data, options?)`

Serialize object to INI string.

**Alias:** `stringify()`

```typescript
import { serializeINI } from '@sylphx/molt-ini'

const ini = serializeINI(data, {
  sections: true,           // Include [section] headers
  whitespace: ' = ',        // Spacing around =
  lineEnding: '\n',         // Line ending style
  sortSections: false,      // Sort sections alphabetically
  sortKeys: false,          // Sort keys within sections
  headerComment: undefined  // Add header comment
})
```

## Examples

### Git Config

```typescript
import { molt } from '@sylphx/molt-ini'

const gitConfig = molt(`
[user]
name = Alice Smith
email = alice@example.com

[core]
editor = vim
autocrlf = true

[alias]
st = status
co = checkout
`)

console.log(gitConfig.user.name) // 'Alice Smith'
console.log(gitConfig.core.autocrlf) // true
```

### Database Config

```typescript
import { molt } from '@sylphx/molt-ini'

const dbConfig = molt(`
[database]
host = localhost
port = 5432
name = myapp
pool_min = 2
pool_max = 10
ssl = true
`)

console.log(dbConfig.database.port) // 5432
console.log(dbConfig.database.ssl) // true
```

### Application Settings

```typescript
import { stringify } from '@sylphx/molt-ini'

const settings = {
  app: {
    name: 'MyApp',
    version: '1.0.0',
    debug: false
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    workers: 4
  }
}

const ini = stringify(settings, {
  headerComment: 'Application Configuration',
  sortSections: true
})

console.log(ini)
// ; Application Configuration
//
// [app]
// name = MyApp
// version = 1.0.0
// debug = false
//
// [server]
// host = 0.0.0.0
// port = 8080
// workers = 4
```

## Type Coercion

When `parseTypes: true` (default):

```typescript
import { molt } from '@sylphx/molt-ini'

const config = molt(`
[types]
integer = 42
float = 3.14
bool_true = true
bool_false = false
bool_yes = yes
bool_no = no
null_value = null
string = "quoted string"
`)

// All values are properly typed:
config.types.integer    // number: 42
config.types.float      // number: 3.14
config.types.bool_true  // boolean: true
config.types.null_value // null
config.types.string     // string: "quoted string"
```

## Comments

```typescript
import { molt } from '@sylphx/molt-ini'

const config = molt(`
; This is a comment
# This is also a comment

[section]
key = value ; Inline comment (requires inlineComments: true)
`, { inlineComments: true })
```

## Performance

Benchmarked against popular INI parsers:

| Operation | molt-ini | ini (npm) | Speedup |
|-----------|----------|-----------|---------|
| Parse simple | ~500k ops/s | ~200k ops/s | **2.5x** |
| Parse sections | ~400k ops/s | ~150k ops/s | **2.7x** |
| Parse complex | ~300k ops/s | ~100k ops/s | **3x** |
| Serialize | ~600k ops/s | ~250k ops/s | **2.4x** |

*Results may vary by system and data complexity*

## Use Cases

- **Configuration Files** - Application settings, environment config
- **Git Config** - `.git/config`, `.gitconfig`, `.gitignore`
- **PHP Config** - `php.ini`, application settings
- **Windows INI** - Legacy Windows configuration files
- **systemd** - Service configuration files
- **Desktop Files** - Linux `.desktop` files

## TypeScript

Full TypeScript support with comprehensive type definitions:

```typescript
import type { INIData, ParseINIOptions, SerializeINIOptions } from '@sylphx/molt-ini'

const options: ParseINIOptions = {
  parseTypes: true,
  allowComments: true
}

const config: INIData = molt(iniString, options)
```

## Error Handling

```typescript
import { molt, ParseError } from '@sylphx/molt-ini'

try {
  const config = molt(invalidINI, { allowDuplicates: false })
} catch (error) {
  if (error instanceof ParseError) {
    console.error(`Parse error at line ${error.line}: ${error.message}`)
  }
}
```

## License

MIT © [Sylphx](https://github.com/sylphx)
