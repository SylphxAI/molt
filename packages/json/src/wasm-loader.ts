/**
 * WASM loader with automatic fallback to TypeScript implementation
 *
 * This module dynamically loads the WASM module if available, otherwise
 * falls back to the pure TypeScript implementation for maximum compatibility.
 */

import { cleanDirtyJSON as tsClean } from './cleaner.js';

/**
 * WASM module interface
 */
interface WasmModule {
  clean_dirty_json: (input: string) => string;
  clean_dirty_json_simd?: (input: string) => string;
}

/**
 * WASM loader state
 */
let wasmModule: WasmModule | null = null;
let wasmLoadPromise: Promise<WasmModule | null> | null = null;
let useWasm = true;

/**
 * Initialize WASM module asynchronously
 * This is called automatically on first use, but can be called manually for preloading
 */
export async function initWasm(): Promise<boolean> {
  if (!useWasm) {
    return false;
  }

  if (wasmModule) {
    return true;
  }

  if (wasmLoadPromise) {
    await wasmLoadPromise;
    return wasmModule !== null;
  }

  wasmLoadPromise = (async () => {
    try {
      // Try to load WASM module using dynamic import
      // The path should be resolved relative to the package root
      // We use eval + dynamic import to prevent bundlers from trying to bundle WASM
      const importWasm = new Function('path', 'return import(path)');
      const wasmPath = '@sylphx/molt-json/wasm-pkg/molt_json_wasm.js';
      const wasm = await importWasm(wasmPath);
      wasmModule = wasm as WasmModule;
      return wasmModule;
    } catch (error) {
      // WASM not available or failed to load, use TypeScript fallback
      if (typeof process !== 'undefined' && process.env?.DEBUG) {
        console.warn('WASM module not available, using TypeScript fallback:', error);
      }
      useWasm = false;
      return null;
    }
  })();

  await wasmLoadPromise;
  return wasmModule !== null;
}

/**
 * Clean dirty JSON using WASM (with automatic fallback to TypeScript)
 *
 * This function will automatically use WASM if available, otherwise it will
 * fall back to the pure TypeScript implementation. The first call may be
 * slightly slower due to WASM initialization, but subsequent calls will be fast.
 *
 * @param input - Dirty JSON string to clean
 * @param maxSize - Maximum input size in bytes (default: 100MB)
 * @returns Valid JSON string
 */
export async function cleanWithWasm(input: string, maxSize = 100 * 1024 * 1024): Promise<string> {
  // Size check
  if (input.length > maxSize) {
    throw new Error(`Input size ${input.length} exceeds maximum ${maxSize}`);
  }

  // Try to initialize WASM if not already done
  if (!wasmModule && useWasm) {
    await initWasm();
  }

  // Use WASM if available
  if (wasmModule) {
    try {
      return wasmModule.clean_dirty_json(input);
    } catch (error) {
      // WASM failed, fall back to TypeScript
      console.warn('WASM execution failed, falling back to TypeScript:', error);
      useWasm = false;
    }
  }

  // Fallback to TypeScript implementation
  return tsClean(input, maxSize);
}

/**
 * Clean dirty JSON synchronously using TypeScript implementation
 * This always uses the TypeScript implementation, never WASM
 *
 * @param input - Dirty JSON string to clean
 * @param maxSize - Maximum input size in bytes (default: 100MB)
 * @returns Valid JSON string
 */
export function cleanSync(input: string, maxSize = 100 * 1024 * 1024): string {
  return tsClean(input, maxSize);
}

/**
 * Check if WASM is available and initialized
 */
export function isWasmAvailable(): boolean {
  return wasmModule !== null;
}

/**
 * Check if WASM is enabled (will attempt to load if not disabled)
 */
export function isWasmEnabled(): boolean {
  return useWasm;
}

/**
 * Disable WASM and force using TypeScript implementation
 * Useful for debugging or when WASM is causing issues
 */
export function disableWasm(): void {
  useWasm = false;
  wasmModule = null;
}

/**
 * Enable WASM (default)
 * This will attempt to load WASM on next use
 */
export function enableWasm(): void {
  useWasm = true;
}

/**
 * Clean dirty JSON using WASM with SIMD acceleration (with automatic fallback)
 *
 * This function uses the SIMD-optimized two-stage parser for better performance
 * on large inputs. Falls back to regular WASM or TypeScript if SIMD is not available.
 *
 * @param input - Dirty JSON string to clean
 * @param maxSize - Maximum input size in bytes (default: 100MB)
 * @returns Valid JSON string
 */
export async function cleanWithWasmSimd(input: string, maxSize = 100 * 1024 * 1024): Promise<string> {
  // Size check
  if (input.length > maxSize) {
    throw new Error(`Input size ${input.length} exceeds maximum ${maxSize}`);
  }

  // Try to initialize WASM if not already done
  if (!wasmModule && useWasm) {
    await initWasm();
  }

  // Use WASM SIMD if available
  if (wasmModule?.clean_dirty_json_simd) {
    try {
      return wasmModule.clean_dirty_json_simd(input);
    } catch (error) {
      console.warn('WASM SIMD failed, falling back:', error);
    }
  }

  // Fallback to regular WASM or TypeScript
  return cleanWithWasm(input, maxSize);
}
