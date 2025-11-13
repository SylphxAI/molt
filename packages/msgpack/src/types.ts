/**
 * MessagePack Parser and Serializer Types
 */

/**
 * Decode options for MessagePack
 */
export interface DecodeOptions {
  /**
   * Maximum depth for nested structures
   * @default 100
   */
  maxDepth?: number;

  /**
   * Maximum length for strings
   * @default 1_000_000
   */
  maxStrLength?: number;

  /**
   * Maximum length for binary data
   * @default 10_000_000
   */
  maxBinLength?: number;

  /**
   * Maximum length for arrays
   * @default 100_000
   */
  maxArrayLength?: number;

  /**
   * Maximum length for maps
   * @default 100_000
   */
  maxMapLength?: number;

  /**
   * Maximum size for extension data
   * @default 1_000_000
   */
  maxExtLength?: number;
}

/**
 * Encode options for MessagePack
 */
export interface EncodeOptions {
  /**
   * Use canonical format (sort map keys)
   * @default false
   */
  canonical?: boolean;

  /**
   * Force map format for objects
   * @default true
   */
  forceMap?: boolean;

  /**
   * Encode BigInt as extension type
   * @default true
   */
  bigIntAsExtension?: boolean;

  /**
   * Encode Date as extension type
   * @default true
   */
  dateAsExtension?: boolean;

  /**
   * Maximum depth for nested structures
   * @default 100
   */
  maxDepth?: number;
}

/**
 * MessagePack extension type
 */
export interface ExtensionType {
  type: number;
  data: Uint8Array;
}

/**
 * Decode error
 */
export class DecodeError extends Error {
  constructor(
    message: string,
    public readonly offset?: number
  ) {
    super(offset !== undefined ? `${message} at offset ${offset}` : message);
    this.name = 'DecodeError';
  }
}

/**
 * Encode error
 */
export class EncodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncodeError';
  }
}
