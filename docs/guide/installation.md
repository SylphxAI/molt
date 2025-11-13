# Installation Guide

This guide covers installation and setup for all Molt packages.

## Prerequisites

- **Node.js**: 16.x or later
- **Package Manager**: npm, pnpm, yarn, or Bun

## Package Manager Options

### npm

```bash
npm install @sylphx/molt-json
npm install @sylphx/molt-yaml
npm install @sylphx/molt-toml
npm install @sylphx/molt-csv
npm install @sylphx/molt-xml
```

### pnpm

```bash
pnpm add @sylphx/molt-json
pnpm add @sylphx/molt-yaml
pnpm add @sylphx/molt-toml
pnpm add @sylphx/molt-csv
pnpm add @sylphx/molt-xml
```

### yarn

```bash
yarn add @sylphx/molt-json
yarn add @sylphx/molt-yaml
yarn add @sylphx/molt-toml
yarn add @sylphx/molt-csv
yarn add @sylphx/molt-xml
```

### Bun

```bash
bun add @sylphx/molt-json
bun add @sylphx/molt-yaml
bun add @sylphx/molt-toml
bun add @sylphx/molt-csv
bun add @sylphx/molt-xml
```

## Module Formats

All Molt packages are available in multiple module formats:

- **CommonJS** (.cjs) - For Node.js require
- **ES Modules** (.mjs) - For modern JavaScript
- **TypeScript** (.ts) - Type definitions included

Your package manager will automatically select the appropriate format.

## TypeScript Support

All packages include full TypeScript support out of the box. Just import and use:

```typescript
import { molt, stringify } from '@sylphx/molt-json'

const data = molt('{ name: "Alice" }')
const json = stringify(data)
```

## Per-Package Installation

### molt-json

```bash
npm install @sylphx/molt-json
```

The fastest JSON transformer with dirty input support and type preservation.

**Usage**:
```typescript
import { molt, stringify } from '@sylphx/molt-json'
```

### molt-yaml

```bash
npm install @sylphx/molt-yaml
```

Ultra-fast YAML parser and stringifier.

**Usage**:
```typescript
import { parse, stringify } from '@sylphx/molt-yaml'
```

### molt-toml

```bash
npm install @sylphx/molt-toml
```

High-performance TOML parser and stringifier.

**Usage**:
```typescript
import { parse, stringify } from '@sylphx/molt-toml'
```

### molt-csv

```bash
npm install @sylphx/molt-csv
```

Blazingly fast CSV parser and stringifier with WASM acceleration.

**Usage**:
```typescript
import { parse, stringify } from '@sylphx/molt-csv'
```

### molt-xml

```bash
npm install @sylphx/molt-xml
```

Competitive XML parser with dirty XML cleaning support.

**Usage**:
```typescript
import { parse, toObject } from '@sylphx/molt-xml'
```

## Monorepo Installation

For development or contribution, clone the repository:

```bash
git clone https://github.com/sylphx/molt.git
cd molt
bun install
```

## Verify Installation

Test your installation by importing and using a package:

```javascript
// test.js
import { molt } from '@sylphx/molt-json'

const data = molt('{ name: "Alice", age: 30 }')
console.log(data)
// Output: { name: "Alice", age: 30 }
```

Run with Node.js:

```bash
node test.js
```

## Troubleshooting

### Module not found errors

Ensure you're using the correct import path:

```typescript
// ✅ Correct
import { molt } from '@sylphx/molt-json'

// ❌ Incorrect
import { molt } from '@sylphx/molt'
```

### TypeScript errors

Ensure your `tsconfig.json` targets ES2020 or later:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "moduleResolution": "node"
  }
}
```

### Performance not as expected

Some performance features require optimization:

- Use production builds (not development)
- For molt-csv, ensure WASM modules are properly loaded
- Run benchmarks with the runtime (Bun) that matches your production environment

## Version Management

Check installed versions:

```bash
npm list @sylphx/molt-json
npm list @sylphx/molt-yaml
# etc.
```

Update to latest:

```bash
npm update @sylphx/molt-json
npm update @sylphx/molt-yaml
# etc.
```

## Platform Support

Molt packages are tested and supported on:

- ✅ Node.js 16.x+
- ✅ Bun 1.0+
- ✅ Deno (via npm imports)
- ✅ Browser (with bundler like Vite, webpack, or esbuild)

## Next Steps

- [Quick Start Examples](/guide/quick-start) - See common usage patterns
- [Performance Tips](/guide/performance) - Optimize your usage
- [Package Documentation](/packages/) - Deep dive into each package

---

**Ready to get started?** Check out the [Quick Start Guide](/guide/quick-start)!
