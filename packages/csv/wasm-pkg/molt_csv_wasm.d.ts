/* tslint:disable */
/* eslint-disable */
/**
 * Parse CSV string to JSON array
 *
 * Returns a JSON string representing an array of objects (with header)
 * or an array of arrays (without header).
 *
 * # Arguments
 * * `input` - CSV string to parse
 * * `delimiter` - Field delimiter (default: ',')
 * * `has_header` - Whether first row is header (default: true)
 * * `convert_types` - Convert strings to numbers/booleans (default: true)
 */
export function parse_csv(input: string, delimiter?: string | null, has_header?: boolean | null, convert_types?: boolean | null): string;
/**
 * Stringify JSON array to CSV string
 *
 * Takes a JSON string (array of objects or array of arrays) and returns CSV.
 *
 * # Arguments
 * * `json_input` - JSON string to stringify
 * * `delimiter` - Field delimiter (default: ',')
 * * `include_header` - Whether to include header row (default: true)
 * * `quote_all` - Quote all fields (default: false)
 */
export function stringify_csv(json_input: string, delimiter?: string | null, include_header?: boolean | null, quote_all?: boolean | null): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly parse_csv: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly stringify_csv: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export: (a: number, b: number) => number;
  readonly __wbindgen_export2: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export3: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
