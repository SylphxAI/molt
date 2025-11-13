/**
 * WASM loader with automatic fallback to TypeScript implementation
 *
 * This module dynamically loads the WASM module if available, otherwise
 * falls back to the pure TypeScript implementation for maximum compatibility.
 */

import { parseCSV as tsParse } from './parser.js';
import { stringifyCSV as tsStringify } from './serializer.js';
import type { ParseCSVOptions, StringifyCSVOptions } from './types.js';

/**
 * WASM module interface
 */
interface WasmModule {
  parse_csv: (
    input: string,
    delimiter?: string,
    has_header?: boolean,
    convert_types?: boolean
  ) => string;
  stringify_csv: (
    json_input: string,
    delimiter?: string,
    include_header?: boolean,
    quote_all?: boolean
  ) => string;
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
      const importWasm = new Function('path', 'return import(path)');
      const wasmPath = '@sylphx/molt-csv/wasm-pkg/molt_csv_wasm.js';
      const wasm = (await importWasm(wasmPath)) as WasmModule;
      wasmModule = wasm;
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
 * Parse CSV using WASM (with automatic fallback to TypeScript)
 *
 * This function will automatically use WASM if available, otherwise it will
 * fall back to the pure TypeScript implementation.
 *
 * @param input - CSV string to parse
 * @param options - Parse options
 * @returns Parsed data
 */
export async function parseWithWasm(input: string, options: ParseCSVOptions = {}): Promise<unknown[]> {
  const { delimiter = ',', header = true, convertTypes = true, maxSize = 100 * 1024 * 1024 } = options;

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
      const jsonString = wasmModule.parse_csv(input, delimiter, header, convertTypes);
      return JSON.parse(jsonString);
    } catch (error) {
      // WASM failed, fall back to TypeScript
      console.warn('WASM execution failed, falling back to TypeScript:', error);
      useWasm = false;
    }
  }

  // Fallback to TypeScript implementation
  return tsParse(input, options);
}

/**
 * Stringify data to CSV using WASM (with automatic fallback to TypeScript)
 *
 * @param data - Data to stringify
 * @param options - Stringify options
 * @returns CSV string
 */
export async function stringifyWithWasm(
  data: unknown[],
  options: StringifyCSVOptions = {}
): Promise<string> {
  const { delimiter = ',', header = true, quoteAll = false } = options;

  // Try to initialize WASM if not already done
  if (!wasmModule && useWasm) {
    await initWasm();
  }

  // Use WASM if available
  if (wasmModule) {
    try {
      const jsonString = JSON.stringify(data);
      return wasmModule.stringify_csv(jsonString, delimiter, header, quoteAll);
    } catch (error) {
      // WASM failed, fall back to TypeScript
      console.warn('WASM execution failed, falling back to TypeScript:', error);
      useWasm = false;
    }
  }

  // Fallback to TypeScript implementation
  return tsStringify(data, options);
}

/**
 * Parse CSV synchronously using TypeScript implementation
 * This always uses the TypeScript implementation, never WASM
 *
 * @param input - CSV string to parse
 * @param options - Parse options
 * @returns Parsed data
 */
export function parseSync(input: string, options: ParseCSVOptions = {}): unknown[] {
  return tsParse(input, options);
}

/**
 * Stringify synchronously using TypeScript implementation
 * This always uses the TypeScript implementation, never WASM
 *
 * @param data - Data to stringify
 * @param options - Stringify options
 * @returns CSV string
 */
export function stringifySync(data: unknown[], options: StringifyCSVOptions = {}): string {
  return tsStringify(data, options);
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
