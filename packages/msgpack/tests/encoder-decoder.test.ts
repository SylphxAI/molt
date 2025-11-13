import { describe, it, expect } from 'vitest';
import { encode, decode } from '../src/index.js';

describe('MessagePack Encoder & Decoder', () => {
  describe('Null and Boolean', () => {
    it('should encode/decode null', () => {
      const data = encode(null);
      expect(decode(data)).toBe(null);
    });

    it('should encode/decode true', () => {
      const data = encode(true);
      expect(decode(data)).toBe(true);
    });

    it('should encode/decode false', () => {
      const data = encode(false);
      expect(decode(data)).toBe(false);
    });
  });

  describe('Numbers', () => {
    it('should encode/decode positive fixint', () => {
      for (let i = 0; i <= 127; i++) {
        const data = encode(i);
        expect(decode(data)).toBe(i);
      }
    });

    it('should encode/decode negative fixint', () => {
      for (let i = -32; i < 0; i++) {
        const data = encode(i);
        expect(decode(data)).toBe(i);
      }
    });

    it('should encode/decode uint8', () => {
      const data = encode(255);
      expect(decode(data)).toBe(255);
    });

    it('should encode/decode uint16', () => {
      const data = encode(65535);
      expect(decode(data)).toBe(65535);
    });

    it('should encode/decode uint32', () => {
      const data = encode(4294967295);
      expect(decode(data)).toBe(4294967295);
    });

    it('should encode/decode int8', () => {
      const data = encode(-128);
      expect(decode(data)).toBe(-128);
    });

    it('should encode/decode int16', () => {
      const data = encode(-32768);
      expect(decode(data)).toBe(-32768);
    });

    it('should encode/decode int32', () => {
      const data = encode(-2147483648);
      expect(decode(data)).toBe(-2147483648);
    });

    it('should encode/decode float32', () => {
      const data = encode(3.14);
      const result = decode(data) as number;
      expect(result).toBeCloseTo(3.14, 2);
    });

    it('should encode/decode float64', () => {
      const data = encode(Math.PI);
      const result = decode(data) as number;
      expect(result).toBeCloseTo(Math.PI, 10);
    });
  });

  describe('Strings', () => {
    it('should encode/decode fixstr', () => {
      const str = 'hello';
      const data = encode(str);
      expect(decode(data)).toBe(str);
    });

    it('should encode/decode str8', () => {
      const str = 'a'.repeat(100);
      const data = encode(str);
      expect(decode(data)).toBe(str);
    });

    it('should encode/decode str16', () => {
      const str = 'a'.repeat(1000);
      const data = encode(str);
      expect(decode(data)).toBe(str);
    });

    it('should encode/decode unicode', () => {
      const str = 'Hello 世界 🌍';
      const data = encode(str);
      expect(decode(data)).toBe(str);
    });

    it('should encode/decode empty string', () => {
      const str = '';
      const data = encode(str);
      expect(decode(data)).toBe(str);
    });
  });

  describe('Binary', () => {
    it('should encode/decode binary data', () => {
      const binary = new Uint8Array([0x01, 0x02, 0x03, 0xff]);
      const data = encode(binary);
      const result = decode(data) as Uint8Array;
      expect(result).toEqual(binary);
    });

    it('should encode/decode empty binary', () => {
      const binary = new Uint8Array([]);
      const data = encode(binary);
      const result = decode(data) as Uint8Array;
      expect(result).toEqual(binary);
    });
  });

  describe('Arrays', () => {
    it('should encode/decode fixarray', () => {
      const array = [1, 2, 3, 4, 5];
      const data = encode(array);
      expect(decode(data)).toEqual(array);
    });

    it('should encode/decode array16', () => {
      const array = Array.from({ length: 100 }, (_, i) => i);
      const data = encode(array);
      expect(decode(data)).toEqual(array);
    });

    it('should encode/decode mixed types', () => {
      const array = [1, 'two', true, null, { key: 'value' }];
      const data = encode(array);
      expect(decode(data)).toEqual(array);
    });

    it('should encode/decode nested arrays', () => {
      const array = [[1, 2], [3, 4], [5, [6, 7]]];
      const data = encode(array);
      expect(decode(data)).toEqual(array);
    });

    it('should encode/decode empty array', () => {
      const array: unknown[] = [];
      const data = encode(array);
      expect(decode(data)).toEqual(array);
    });
  });

  describe('Objects', () => {
    it('should encode/decode simple object', () => {
      const obj = { name: 'Alice', age: 30 };
      const data = encode(obj);
      expect(decode(data)).toEqual(obj);
    });

    it('should encode/decode nested object', () => {
      const obj = {
        user: {
          name: 'Bob',
          profile: {
            email: 'bob@example.com',
          },
        },
      };
      const data = encode(obj);
      expect(decode(data)).toEqual(obj);
    });

    it('should encode/decode complex object', () => {
      const obj = {
        id: 12345,
        username: 'alice',
        active: true,
        tags: ['admin', 'user'],
        metadata: {
          created: 1234567890,
          updated: 1234567900,
        },
      };
      const data = encode(obj);
      expect(decode(data)).toEqual(obj);
    });

    it('should encode/decode empty object', () => {
      const obj = {};
      const data = encode(obj);
      expect(decode(data)).toEqual(obj);
    });
  });

  describe('Date', () => {
    it('should encode/decode Date as extension', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const data = encode(date);
      const result = decode(data) as Date;
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(date.getTime());
    });

    it('should encode/decode Date without extension', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const data = encode(date, { dateAsExtension: false });
      const result = decode(data) as number;
      expect(result).toBe(date.getTime());
    });
  });

  describe('Real-world data', () => {
    it('should encode/decode user data', () => {
      const userData = {
        id: 12345,
        username: 'alice_smith',
        email: 'alice@example.com',
        active: true,
        profile: {
          firstName: 'Alice',
          lastName: 'Smith',
          age: 28,
          interests: ['coding', 'music', 'travel'],
        },
        settings: {
          notifications: true,
          theme: 'dark',
        },
      };

      const data = encode(userData);
      expect(decode(data)).toEqual(userData);
    });

    it('should encode/decode API response', () => {
      const response = {
        success: true,
        data: [
          { id: 1, name: 'Product 1', price: 29.99 },
          { id: 2, name: 'Product 2', price: 49.99 },
          { id: 3, name: 'Product 3', price: 19.99 },
        ],
        meta: {
          total: 3,
          page: 1,
          perPage: 10,
        },
      };

      const data = encode(response);
      expect(decode(data)).toEqual(response);
    });

    it('should encode/decode game state', () => {
      const gameState = {
        player: {
          id: 'player123',
          name: 'Hero',
          level: 15,
          health: 100,
          mana: 50,
          position: { x: 120.5, y: 45.3, z: 0.0 },
          inventory: ['sword', 'potion', 'key'],
        },
        enemies: [
          { id: 'enemy1', type: 'goblin', health: 30 },
          { id: 'enemy2', type: 'orc', health: 50 },
        ],
      };

      const data = encode(gameState);
      const result = decode(data);
      expect(result).toEqual(gameState);
    });
  });

  describe('Size comparison', () => {
    it('should be more compact than JSON', () => {
      const obj = {
        id: 12345,
        username: 'alice_smith',
        email: 'alice@example.com',
        active: true,
        tags: ['admin', 'developer', 'user'],
      };

      const msgpackData = encode(obj);
      const jsonData = new TextEncoder().encode(JSON.stringify(obj));

      expect(msgpackData.length).toBeLessThan(jsonData.length);
    });
  });
});
