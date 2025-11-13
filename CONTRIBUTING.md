# Contributing to molt-json

First off, thank you for considering contributing to molt-json! It's people like you that make molt-json such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include code samples and test cases**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Follow the TypeScript styleguide (enforced by Biome)
- Include tests for new features
- Update documentation for API changes
- End all files with a newline
- Ensure all tests pass
- Update CHANGELOG.md

## Development Setup

### Prerequisites

- Bun >= 1.0

### Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/molt.git
cd molt

# Install dependencies
bun install

# Run tests
bun test

# Run tests in watch mode
bun test

# Run benchmarks
bun bench

# Build
bun run build

# Lint
bun lint

# Format
bun format
```

## Project Structure

```
molt/
├── src/                    # Source code
│   ├── index.ts           # Main entry point
│   ├── cleaner.ts         # Dirty JSON cleaner
│   ├── serializer.ts      # Type serialization
│   ├── registry.ts        # Type registry
│   ├── streaming.ts       # Streaming API
│   ├── validation.ts      # Schema validation
│   └── types.ts           # TypeScript types
├── tests/                 # Test files
├── benchmarks/            # Performance benchmarks
├── examples/              # Usage examples
├── dist/                  # Build output (git-ignored)
└── docs/                  # Documentation (future)
```

## Coding Style

We use Biome for linting and formatting. The configuration is in `biome.json`.

### Key Points

- Use TypeScript strict mode
- Prefer functional programming patterns
- Write self-documenting code with clear names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Use async/await over callbacks
- Prefer const over let, never use var

### Naming Conventions

- **Files**: kebab-case (e.g., `dirty-json.ts`)
- **Classes**: PascalCase (e.g., `molt-json`)
- **Functions/Variables**: camelCase (e.g., `parseJSON`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_SIZE`)
- **Types/Interfaces**: PascalCase (e.g., `TypedJSON`)

## Testing

We use Vitest for testing. All new features should include tests.

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { molt-json } from '../src/index.js';

describe('Feature Name', () => {
  it('should do something specific', () => {
    const result = molt-json.parse('...');
    expect(result).toEqual({ ... });
  });

  it('should handle edge cases', () => {
    expect(() => molt-json.parse('invalid')).toThrow();
  });
});
```

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/cleaner.test.ts

# Run with coverage
bun test --coverage

# Run with UI
bun test:ui
```

## Benchmarks

Performance is critical for molt-json. All performance-impacting changes should include benchmarks.

### Running Benchmarks

```bash
# Run all benchmarks
bun bench

# Run specific benchmark
bun vitest bench benchmarks/dirty-cleaning.bench.ts --run
```

### Writing Benchmarks

```typescript
import { describe, bench } from 'vitest';
import { molt-json } from '../src/index.js';

describe('Feature Benchmark', () => {
  bench('operation description', () => {
    molt-json.parse('...');
  });
});
```

## Documentation

- Update README.md for user-facing changes
- Add examples for new features
- Update CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/)
- Add JSDoc comments for public APIs

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Test changes
- **chore**: Build process or auxiliary tool changes

### Examples

```
feat(streaming): add parseJSONArray function
fix(cleaner): handle escaped quotes in strings
docs(readme): add streaming API examples
perf(serializer): optimize type detection
test(validation): add Zod adapter tests
```

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a git tag: `git tag v0.x.0`
4. Push tag: `git push origin v0.x.0`
5. GitHub Actions will automatically publish to npm

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
