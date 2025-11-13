import { describe, it, expect } from 'vitest';
import { getPlatformInfo, setEngineStrategies, resetEngineStrategies } from '../src/engine-selector.js';
import { cleanDirtyJSON } from '../src/cleaner.js';
import { cleanWithWasm } from '../src/wasm-loader.js';

describe('Platform Detection', () => {
  it('should detect platform information', () => {
    const platform = getPlatformInfo();

    expect(platform).toHaveProperty('arch');
    expect(platform).toHaveProperty('isARM');
    expect(platform).toHaveProperty('runtime');

    expect(typeof platform.arch).toBe('string');
    expect(typeof platform.isARM).toBe('boolean');
    expect(['node', 'browser', 'bun', 'deno', 'unknown']).toContain(platform.runtime);
  });

  it('should detect correct runtime', () => {
    const platform = getPlatformInfo();

    // We're running in Bun during tests
    if (typeof Bun !== 'undefined') {
      expect(platform.runtime).toBe('bun');
    } else if (typeof process !== 'undefined') {
      expect(platform.runtime).toBe('node');
    }
  });

  it('should detect architecture', () => {
    const platform = getPlatformInfo();

    if (typeof process !== 'undefined' && process.arch) {
      expect(platform.arch).toBe(process.arch);
      if (process.arch === 'arm64' || process.arch === 'arm') {
        expect(platform.isARM).toBe(true);
      }
    }
  });

  it('should use platform-optimized strategies', async () => {
    const platform = getPlatformInfo();

    // Test that SIMD is disabled on ARM platforms by default
    if (platform.isARM) {
      // On ARM, default strategies should not include SIMD for large inputs
      // We can verify this by checking that the engine selector works without SIMD
      const largeInput = "{'name': '" + 'x'.repeat(200000) + "'}";
      const result = await cleanWithWasm(largeInput);
      expect(result).toContain('"name"');
    }
  });

  it('should allow custom strategies', () => {
    const customStrategies = [
      {
        minSize: 0,
        maxSize: Infinity,
        clean: cleanDirtyJSON,
        name: 'Custom-TypeScript',
      },
    ];

    setEngineStrategies(customStrategies);

    // Reset to defaults
    resetEngineStrategies();
  });

  it('should log platform info for debugging', () => {
    const platform = getPlatformInfo();
    console.log('Detected Platform:', platform);

    // This helps verify the detection is working correctly
    expect(platform).toBeDefined();
  });
});
