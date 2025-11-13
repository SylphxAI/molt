# 🚀 Release Checklist

This document outlines the release process for molt packages.

## ✅ Pre-Release Checklist

### Infrastructure ✅ COMPLETE
- [x] Turborepo configuration (`turbo.json`)
- [x] Changesets configuration (`.changeset/config.json`)
- [x] GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- [x] GitHub Actions Release workflow (`.github/workflows/release.yml`)
- [x] VitePress documentation site (`docs/`)
- [x] Comprehensive benchmarks (`BENCHMARKS.md`)
- [x] Updated README with all packages

### Package Status
| Package | Tests | Benchmarks | Docs | Status |
|---------|-------|------------|------|--------|
| molt-json | ✅ | ✅ | ✅ | Ready |
| molt-yaml | ✅ | ✅ | ✅ | Ready |
| molt-toml | ✅ | ✅ | ✅ | Ready |
| molt-csv | ✅ | ✅ | ✅ | Ready |
| molt-xml | ✅ | ✅ | ✅ | Ready |
| molt (meta) | ✅ | N/A | ✅ | Ready |

---

## 📋 Release Process

### 1. Create Changesets

For each package you want to release, create a changeset:

```bash
bunx changeset
```

Follow the prompts:
- Select packages to include
- Choose bump type (major/minor/patch)
- Write a summary of changes

**Example changeset for initial release:**

```bash
# Run changeset command
bunx changeset

# Select all packages that should be released
# Choose: minor (0.1.0 -> 0.2.0) or patch (0.1.0 -> 0.1.1)
# Summary: "Initial public release with all format support"
```

### 2. Version Packages

Update package versions based on changesets:

```bash
bunx changeset version
```

This will:
- Update package.json versions
- Update CHANGELOG.md files
- Remove consumed changesets

### 3. Build and Test

Ensure everything builds and tests pass:

```bash
# Build all packages
bun build

# Run all tests
bun test

# Run benchmarks (optional)
bun bench

# Lint code
bun lint
```

### 4. Commit Version Changes

```bash
git add .
git commit -m "chore: version packages"
git push
```

### 5. Publish to npm

**Manual publish:**

```bash
bun release
```

This will:
- Build all packages with Turbo
- Run `changeset publish`
- Publish to npm registry

**Automated publish via GitHub Actions:**

1. Push to `main` branch
2. GitHub Actions will:
   - Create a "Version Packages" PR
   - When merged, automatically publish to npm

---

## 🔐 npm Authentication

### Setup npm Token

1. Create npm token at https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Add to GitHub repository secrets:
   - Go to Settings → Secrets and variables → Actions
   - Add `NPM_TOKEN` secret

### Local Authentication

```bash
npm login
# Or use npm token
npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN
```

---

## 📝 Package Scope

All packages are published under `@sylphx/` scope:
- `@sylphx/molt-json`
- `@sylphx/molt-yaml`
- `@sylphx/molt-toml`
- `@sylphx/molt-csv`
- `@sylphx/molt-xml`
- `@sylphx/molt`

Ensure you have permissions to publish to the `@sylphx` scope on npm.

---

## 🚀 Post-Release Tasks

### 1. Verify Published Packages

```bash
# Check each package on npm
npm view @sylphx/molt-json
npm view @sylphx/molt-yaml
npm view @sylphx/molt-toml
npm view @sylphx/molt-csv
npm view @sylphx/molt-xml
npm view @sylphx/molt
```

### 2. Test Installation

```bash
# Create test directory
mkdir test-molt && cd test-molt
bun init -y

# Test installation
bun add @sylphx/molt

# Test imports
echo "import { molt } from '@sylphx/molt-json'; console.log('OK')" > test.js
bun test.js
```

### 3. Update Documentation Site

```bash
# Build and deploy docs
bun docs:build

# Deploy to hosting (Vercel, Netlify, GitHub Pages, etc.)
```

### 4. Announce Release

- [ ] Create GitHub Release with changelog
- [ ] Post on Twitter/X
- [ ] Share on relevant communities (Reddit, Discord, etc.)
- [ ] Update project website

---

## 🔄 Subsequent Releases

For future releases, follow the same process:

1. Make changes and add tests
2. Create changesets: `bunx changeset`
3. Version packages: `bunx changeset version`
4. Build and test: `bun build && bun test`
5. Commit and push
6. GitHub Actions will handle publishing

---

## 🐛 Troubleshooting

### Build Failures

```bash
# Clean and rebuild
bun clean
bun install
bun build
```

### Test Failures

```bash
# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage
```

### Publishing Errors

```bash
# Check npm authentication
npm whoami

# Verify package.json is correct
cat packages/*/package.json

# Manually publish a single package
cd packages/json
npm publish --access public
```

---

## 📊 Performance Metrics

Current benchmark results (ready for marketing):

| Format | Best Case | Achievement |
|--------|-----------|-------------|
| YAML | 415x faster | 🔥 Multi-document parsing |
| TOML | 9x faster | ⚡ Nested tables |
| JSON | 2.5x faster | ⚡ Serialization |
| CSV | 7.6x faster | 🚀 Quoted fields |
| XML | Matches fastest | ⭐ + Dirty cleaning |

---

**Ready to release! 🎉**
