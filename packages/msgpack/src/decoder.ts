/**
 * MessagePack Decoder
 *
 * High-performance MessagePack binary decoder
 */

import type { DecodeOptions } from './types.js';
import { DecodeError } from './types.js';

const textDecoder = new TextDecoder();

/**
 * Decode MessagePack binary data to JavaScript value
 *
 * @param data - MessagePack binary data
 * @param options - Decode options
 * @returns Decoded value
 */
export function decode(data: Uint8Array | ArrayBuffer, options: DecodeOptions = {}): unknown {
  const {
    maxDepth = 100,
    maxStrLength = 1_000_000,
    maxBinLength = 10_000_000,
    maxArrayLength = 100_000,
    maxMapLength = 100_000,
    maxExtLength = 1_000_000,
  } = options;

  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const decoder = new Decoder(bytes, {
    maxDepth,
    maxStrLength,
    maxBinLength,
    maxArrayLength,
    maxMapLength,
    maxExtLength,
  });

  return decoder.decode();
}

/**
 * MessagePack Decoder implementation
 */
class Decoder {
  private pos = 0;
  private depth = 0;
  private readonly view: DataView;

  constructor(
    private readonly data: Uint8Array,
    private readonly options: Required<DecodeOptions>
  ) {
    this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  }

  decode(): unknown {
    const byte = this.readByte();

    // Positive fixint: 0x00 - 0x7f
    if (byte <= 0x7f) {
      return byte;
    }

    // Negative fixint: 0xe0 - 0xff
    if (byte >= 0xe0) {
      return byte - 0x100;
    }

    // fixmap: 0x80 - 0x8f
    if (byte >= 0x80 && byte <= 0x8f) {
      return this.decodeMap(byte - 0x80);
    }

    // fixarray: 0x90 - 0x9f
    if (byte >= 0x90 && byte <= 0x9f) {
      return this.decodeArray(byte - 0x90);
    }

    // fixstr: 0xa0 - 0xbf
    if (byte >= 0xa0 && byte <= 0xbf) {
      return this.decodeString(byte - 0xa0);
    }

    switch (byte) {
      case 0xc0: // nil
        return null;
      case 0xc2: // false
        return false;
      case 0xc3: // true
        return true;

      // Integers
      case 0xcc: // uint8
        return this.readByte();
      case 0xcd: // uint16
        return this.readUint16();
      case 0xce: // uint32
        return this.readUint32();
      case 0xcf: // uint64
        return this.readUint64();
      case 0xd0: // int8
        return this.readInt8();
      case 0xd1: // int16
        return this.readInt16();
      case 0xd2: // int32
        return this.readInt32();
      case 0xd3: // int64
        return this.readInt64();

      // Floats
      case 0xca: // float32
        return this.readFloat32();
      case 0xcb: // float64
        return this.readFloat64();

      // Strings
      case 0xd9: // str8
        return this.decodeString(this.readByte());
      case 0xda: // str16
        return this.decodeString(this.readUint16());
      case 0xdb: // str32
        return this.decodeString(this.readUint32());

      // Binary
      case 0xc4: // bin8
        return this.decodeBinary(this.readByte());
      case 0xc5: // bin16
        return this.decodeBinary(this.readUint16());
      case 0xc6: // bin32
        return this.decodeBinary(this.readUint32());

      // Arrays
      case 0xdc: // array16
        return this.decodeArray(this.readUint16());
      case 0xdd: // array32
        return this.decodeArray(this.readUint32());

      // Maps
      case 0xde: // map16
        return this.decodeMap(this.readUint16());
      case 0xdf: // map32
        return this.decodeMap(this.readUint32());

      // Extensions
      case 0xd4: // fixext1
        return this.decodeExtension(1);
      case 0xd5: // fixext2
        return this.decodeExtension(2);
      case 0xd6: // fixext4
        return this.decodeExtension(4);
      case 0xd7: // fixext8
        return this.decodeExtension(8);
      case 0xd8: // fixext16
        return this.decodeExtension(16);
      case 0xc7: // ext8
        return this.decodeExtension(this.readByte());
      case 0xc8: // ext16
        return this.decodeExtension(this.readUint16());
      case 0xc9: // ext32
        return this.decodeExtension(this.readUint32());

      default:
        throw new DecodeError(`Unknown format byte: 0x${byte.toString(16)}`, this.pos - 1);
    }
  }

  private readByte(): number {
    if (this.pos >= this.data.length) {
      throw new DecodeError('Unexpected end of data', this.pos);
    }
    return this.data[this.pos++]!;
  }

  private readUint16(): number {
    const value = this.view.getUint16(this.pos, false);
    this.pos += 2;
    return value;
  }

  private readUint32(): number {
    const value = this.view.getUint32(this.pos, false);
    this.pos += 4;
    return value;
  }

  private readUint64(): bigint {
    const value = this.view.getBigUint64(this.pos, false);
    this.pos += 8;
    return value;
  }

  private readInt8(): number {
    const value = this.view.getInt8(this.pos);
    this.pos += 1;
    return value;
  }

  private readInt16(): number {
    const value = this.view.getInt16(this.pos, false);
    this.pos += 2;
    return value;
  }

  private readInt32(): number {
    const value = this.view.getInt32(this.pos, false);
    this.pos += 4;
    return value;
  }

  private readInt64(): bigint {
    const value = this.view.getBigInt64(this.pos, false);
    this.pos += 8;
    return value;
  }

  private readFloat32(): number {
    const value = this.view.getFloat32(this.pos, false);
    this.pos += 4;
    return value;
  }

  private readFloat64(): number {
    const value = this.view.getFloat64(this.pos, false);
    this.pos += 8;
    return value;
  }

  private decodeString(length: number): string {
    if (length > this.options.maxStrLength) {
      throw new DecodeError(`String length ${length} exceeds max ${this.options.maxStrLength}`, this.pos);
    }

    const bytes = this.data.subarray(this.pos, this.pos + length);
    this.pos += length;
    return textDecoder.decode(bytes);
  }

  private decodeBinary(length: number): Uint8Array {
    if (length > this.options.maxBinLength) {
      throw new DecodeError(`Binary length ${length} exceeds max ${this.options.maxBinLength}`, this.pos);
    }

    const bytes = this.data.subarray(this.pos, this.pos + length);
    this.pos += length;
    return bytes;
  }

  private decodeArray(length: number): unknown[] {
    if (length > this.options.maxArrayLength) {
      throw new DecodeError(`Array length ${length} exceeds max ${this.options.maxArrayLength}`, this.pos);
    }

    this.depth++;
    if (this.depth > this.options.maxDepth) {
      throw new DecodeError(`Max depth ${this.options.maxDepth} exceeded`, this.pos);
    }

    const array: unknown[] = new Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = this.decode();
    }

    this.depth--;
    return array;
  }

  private decodeMap(length: number): Record<string, unknown> {
    if (length > this.options.maxMapLength) {
      throw new DecodeError(`Map length ${length} exceeds max ${this.options.maxMapLength}`, this.pos);
    }

    this.depth++;
    if (this.depth > this.options.maxDepth) {
      throw new DecodeError(`Max depth ${this.options.maxDepth} exceeded`, this.pos);
    }

    const map: Record<string, unknown> = {};
    for (let i = 0; i < length; i++) {
      const key = this.decode();
      const value = this.decode();

      // Convert key to string
      const keyStr = typeof key === 'string' ? key : String(key);
      map[keyStr] = value;
    }

    this.depth--;
    return map;
  }

  private decodeExtension(length: number): unknown {
    if (length > this.options.maxExtLength) {
      throw new DecodeError(`Extension length ${length} exceeds max ${this.options.maxExtLength}`, this.pos);
    }

    const type = this.readInt8();
    const data = this.data.subarray(this.pos, this.pos + length);
    this.pos += length;

    // Handle known extension types
    if (type === -1) {
      // Timestamp extension (type -1)
      return this.decodeTimestamp(data);
    }

    // Return raw extension data
    return { type, data };
  }

  private decodeTimestamp(data: Uint8Array): Date {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

    if (data.length === 4) {
      // 32-bit seconds
      const seconds = view.getUint32(0, false);
      return new Date(seconds * 1000);
    }

    if (data.length === 8) {
      // 64-bit: 30-bit nanoseconds + 34-bit seconds
      const high = view.getUint32(0, false);
      const low = view.getUint32(4, false);
      const nanoseconds = high >>> 2;
      const seconds = ((high & 0x3) * 0x100000000) + low;
      return new Date(seconds * 1000 + nanoseconds / 1_000_000);
    }

    if (data.length === 12) {
      // 96-bit: 32-bit nanoseconds + 64-bit seconds
      const nanoseconds = view.getUint32(0, false);
      const seconds = Number(view.getBigInt64(4, false));
      return new Date(seconds * 1000 + nanoseconds / 1_000_000);
    }

    throw new DecodeError(`Invalid timestamp length: ${data.length}`, this.pos);
  }
}
