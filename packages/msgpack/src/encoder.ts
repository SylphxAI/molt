/**
 * MessagePack Encoder
 *
 * High-performance MessagePack binary encoder
 */

import type { EncodeOptions } from './types.js';
import { EncodeError } from './types.js';

const textEncoder = new TextEncoder();

/**
 * Encode JavaScript value to MessagePack binary data
 *
 * @param value - Value to encode
 * @param options - Encode options
 * @returns MessagePack binary data
 */
export function encode(value: unknown, options: EncodeOptions = {}): Uint8Array {
  const {
    canonical = false,
    forceMap = true,
    bigIntAsExtension = true,
    dateAsExtension = true,
    maxDepth = 100,
  } = options;

  const encoder = new Encoder({
    canonical,
    forceMap,
    bigIntAsExtension,
    dateAsExtension,
    maxDepth,
  });

  return encoder.encode(value);
}

/**
 * MessagePack Encoder implementation
 */
class Encoder {
  private buffer: number[] = [];
  private depth = 0;

  constructor(private readonly options: Required<EncodeOptions>) {}

  encode(value: unknown): Uint8Array {
    this.encodeValue(value);
    return new Uint8Array(this.buffer);
  }

  private encodeValue(value: unknown): void {
    // Null/undefined
    if (value === null || value === undefined) {
      this.buffer.push(0xc0); // nil
      return;
    }

    // Boolean
    if (typeof value === 'boolean') {
      this.buffer.push(value ? 0xc3 : 0xc2);
      return;
    }

    // Number
    if (typeof value === 'number') {
      this.encodeNumber(value);
      return;
    }

    // BigInt
    if (typeof value === 'bigint') {
      this.encodeBigInt(value);
      return;
    }

    // String
    if (typeof value === 'string') {
      this.encodeString(value);
      return;
    }

    // Date
    if (value instanceof Date) {
      if (this.options.dateAsExtension) {
        this.encodeDate(value);
      } else {
        this.encodeNumber(value.getTime());
      }
      return;
    }

    // Uint8Array (binary)
    if (value instanceof Uint8Array) {
      this.encodeBinary(value);
      return;
    }

    // Array
    if (Array.isArray(value)) {
      this.encodeArray(value);
      return;
    }

    // Object/Map
    if (typeof value === 'object') {
      this.encodeObject(value);
      return;
    }

    throw new EncodeError(`Cannot encode type: ${typeof value}`);
  }

  private encodeNumber(value: number): void {
    // Integer
    if (Number.isInteger(value)) {
      // Positive fixint: 0-127
      if (value >= 0 && value <= 0x7f) {
        this.buffer.push(value);
        return;
      }

      // Negative fixint: -32 to -1
      if (value >= -32 && value < 0) {
        this.buffer.push(value & 0xff);
        return;
      }

      // uint8: 0-255
      if (value >= 0 && value <= 0xff) {
        this.buffer.push(0xcc, value);
        return;
      }

      // uint16: 0-65535
      if (value >= 0 && value <= 0xffff) {
        this.buffer.push(0xcd);
        this.writeUint16(value);
        return;
      }

      // uint32
      if (value >= 0 && value <= 0xffffffff) {
        this.buffer.push(0xce);
        this.writeUint32(value);
        return;
      }

      // int8: -128 to 127
      if (value >= -128 && value <= 127) {
        this.buffer.push(0xd0, value & 0xff);
        return;
      }

      // int16
      if (value >= -32768 && value <= 32767) {
        this.buffer.push(0xd1);
        this.writeInt16(value);
        return;
      }

      // int32
      if (value >= -2147483648 && value <= 2147483647) {
        this.buffer.push(0xd2);
        this.writeInt32(value);
        return;
      }

      // int64 (as float64 if out of int32 range)
      this.buffer.push(0xcb);
      this.writeFloat64(value);
      return;
    }

    // Float
    // Use float32 if it can represent the value accurately
    if (Math.fround(value) === value) {
      this.buffer.push(0xca);
      this.writeFloat32(value);
    } else {
      this.buffer.push(0xcb);
      this.writeFloat64(value);
    }
  }

  private encodeBigInt(value: bigint): void {
    if (this.options.bigIntAsExtension) {
      // Encode as extension type 0x42 ('B' for BigInt)
      const str = value.toString();
      const bytes = textEncoder.encode(str);
      this.encodeExtension(0x42, bytes);
    } else {
      // Try to fit in int64
      if (value >= -0x8000000000000000n && value <= 0x7fffffffffffffffn) {
        this.buffer.push(0xd3);
        this.writeInt64(value);
      } else if (value >= 0n && value <= 0xffffffffffffffffn) {
        this.buffer.push(0xcf);
        this.writeUint64(value);
      } else {
        throw new EncodeError(`BigInt out of range: ${value}`);
      }
    }
  }

  private encodeString(value: string): void {
    const bytes = textEncoder.encode(value);
    const length = bytes.length;

    // fixstr: 0-31
    if (length <= 31) {
      this.buffer.push(0xa0 | length);
    }
    // str8: 0-255
    else if (length <= 0xff) {
      this.buffer.push(0xd9, length);
    }
    // str16
    else if (length <= 0xffff) {
      this.buffer.push(0xda);
      this.writeUint16(length);
    }
    // str32
    else {
      this.buffer.push(0xdb);
      this.writeUint32(length);
    }

    this.buffer.push(...bytes);
  }

  private encodeBinary(value: Uint8Array): void {
    const length = value.length;

    // bin8
    if (length <= 0xff) {
      this.buffer.push(0xc4, length);
    }
    // bin16
    else if (length <= 0xffff) {
      this.buffer.push(0xc5);
      this.writeUint16(length);
    }
    // bin32
    else {
      this.buffer.push(0xc6);
      this.writeUint32(length);
    }

    this.buffer.push(...value);
  }

  private encodeArray(value: unknown[]): void {
    const length = value.length;

    this.depth++;
    if (this.depth > this.options.maxDepth) {
      throw new EncodeError(`Max depth ${this.options.maxDepth} exceeded`);
    }

    // fixarray: 0-15
    if (length <= 15) {
      this.buffer.push(0x90 | length);
    }
    // array16
    else if (length <= 0xffff) {
      this.buffer.push(0xdc);
      this.writeUint16(length);
    }
    // array32
    else {
      this.buffer.push(0xdd);
      this.writeUint32(length);
    }

    for (const item of value) {
      this.encodeValue(item);
    }

    this.depth--;
  }

  private encodeObject(value: object): void {
    const entries = Object.entries(value);
    let length = entries.length;

    // Sort keys if canonical
    if (this.options.canonical) {
      entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    }

    this.depth++;
    if (this.depth > this.options.maxDepth) {
      throw new EncodeError(`Max depth ${this.options.maxDepth} exceeded`);
    }

    // fixmap: 0-15
    if (length <= 15) {
      this.buffer.push(0x80 | length);
    }
    // map16
    else if (length <= 0xffff) {
      this.buffer.push(0xde);
      this.writeUint16(length);
    }
    // map32
    else {
      this.buffer.push(0xdf);
      this.writeUint32(length);
    }

    for (const [key, val] of entries) {
      this.encodeString(key);
      this.encodeValue(val);
    }

    this.depth--;
  }

  private encodeDate(value: Date): void {
    const time = value.getTime();
    const seconds = Math.floor(time / 1000);
    const nanoseconds = (time % 1000) * 1_000_000;

    // Timestamp extension (type -1)
    if (nanoseconds === 0 && seconds >= 0 && seconds <= 0xffffffff) {
      // 32-bit timestamp (4 bytes)
      this.buffer.push(0xd6, 0xff);
      this.writeUint32(seconds);
    } else if (seconds >= 0 && seconds <= 0x3ffffffff) {
      // 64-bit timestamp (8 bytes)
      this.buffer.push(0xd7, 0xff);
      const high = (nanoseconds << 2) | (seconds / 0x100000000);
      const low = seconds & 0xffffffff;
      this.writeUint32(high);
      this.writeUint32(low);
    } else {
      // 96-bit timestamp (12 bytes)
      this.buffer.push(0xc7, 12, 0xff);
      this.writeUint32(nanoseconds);
      this.writeInt64(BigInt(seconds));
    }
  }

  private encodeExtension(type: number, data: Uint8Array): void {
    const length = data.length;

    if (length === 1) {
      this.buffer.push(0xd4, type);
    } else if (length === 2) {
      this.buffer.push(0xd5, type);
    } else if (length === 4) {
      this.buffer.push(0xd6, type);
    } else if (length === 8) {
      this.buffer.push(0xd7, type);
    } else if (length === 16) {
      this.buffer.push(0xd8, type);
    } else if (length <= 0xff) {
      this.buffer.push(0xc7, length, type);
    } else if (length <= 0xffff) {
      this.buffer.push(0xc8);
      this.writeUint16(length);
      this.buffer.push(type);
    } else {
      this.buffer.push(0xc9);
      this.writeUint32(length);
      this.buffer.push(type);
    }

    this.buffer.push(...data);
  }

  private writeUint16(value: number): void {
    this.buffer.push((value >> 8) & 0xff, value & 0xff);
  }

  private writeUint32(value: number): void {
    this.buffer.push(
      (value >> 24) & 0xff,
      (value >> 16) & 0xff,
      (value >> 8) & 0xff,
      value & 0xff
    );
  }

  private writeUint64(value: bigint): void {
    const high = Number((value >> 32n) & 0xffffffffn);
    const low = Number(value & 0xffffffffn);
    this.writeUint32(high);
    this.writeUint32(low);
  }

  private writeInt16(value: number): void {
    this.writeUint16(value & 0xffff);
  }

  private writeInt32(value: number): void {
    this.writeUint32(value >>> 0);
  }

  private writeInt64(value: bigint): void {
    this.writeUint64(BigInt.asUintN(64, value));
  }

  private writeFloat32(value: number): void {
    const buffer = new ArrayBuffer(4);
    new DataView(buffer).setFloat32(0, value, false);
    const bytes = new Uint8Array(buffer);
    this.buffer.push(...bytes);
  }

  private writeFloat64(value: number): void {
    const buffer = new ArrayBuffer(8);
    new DataView(buffer).setFloat64(0, value, false);
    const bytes = new Uint8Array(buffer);
    this.buffer.push(...bytes);
  }
}
