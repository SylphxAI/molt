# @sylphx/molt-json Examples

This directory contains comprehensive examples demonstrating all features of molt-json.

## Running Examples

All examples can be run directly with tsx or ts-node:

```bash
# Using tsx (recommended)
npx tsx examples/01-basic-usage.ts

# Or with ts-node
npx ts-node examples/01-basic-usage.ts
```

## Examples

### 1. Basic Usage (`01-basic-usage.ts`)
Introduction to molt-json's core functionality:
- Parsing dirty JSON
- Type preservation during stringify/parse
- Working with Dates, BigInt, Map, Set, RegExp

### 2. Dirty JSON (`02-dirty-json.ts`)
Handling malformed JSON inputs:
- Unquoted object keys
- Single quotes instead of double quotes
- Trailing commas
- JavaScript-style comments
- Mixed dirty JSON features
- Cleaning dirty JSON to valid JSON

### 3. Typed JSON (`03-typed-json.ts`)
Preserving JavaScript types through JSON:
- Date objects
- BigInt numbers
- Map and Set collections
- RegExp patterns
- Special values (undefined, NaN, Infinity)
- Complex nested structures with mixed types

### 4. Streaming (`04-streaming.ts`)
Processing large JSON files efficiently:
- NDJSON (Newline-Delimited JSON)
- JSON array streaming
- Auto-format detection
- Type reconstruction in streams
- Chunked processing
- Error handling in streams

### 5. Schema Validation (`05-schema-validation.ts`)
Validating JSON data against schemas:
- Basic Zod validation
- Error detection and reporting
- Simple schema validation (zero dependencies)
- Nested schema structures
- Safe parsing (no exceptions)
- Type reconstruction with validation
- Custom error messages

### 6. Custom Types (`06-custom-types.ts`)
Extending molt-json with your own types:
- Simple custom class transformation
- Complex classes with nested custom types
- Custom types in data structures
- Per-call custom types (non-global)
- Registering and unregistering transformers

## Best Practices

1. **Performance**: Use streaming API for files > 10MB
2. **Validation**: Always validate untrusted input with schemas
3. **Custom Types**: Register global types once at app startup
4. **Error Handling**: Use `safeParse` for user input validation
5. **Type Safety**: Use TypeScript generics for better type inference

## Next Steps

- Read the [main README](../README.md) for API documentation
- Check the [test files](../tests/) for more usage patterns
- Run [benchmarks](../benchmarks/) to see performance metrics
