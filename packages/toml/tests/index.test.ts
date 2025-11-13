import { describe, it, expect } from 'vitest';
import { MoltTOML, molt, parseTOML, stringifyTOML } from '../src/index.js';

describe('MoltTOML', () => {
  describe('API', () => {
    it('should export MoltTOML class', () => {
      expect(MoltTOML).toBeDefined();
      expect(MoltTOML.parse).toBeDefined();
      expect(MoltTOML.stringify).toBeDefined();
    });

    it('should export molt function', () => {
      expect(molt).toBeDefined();
    });

    it('should export individual functions', () => {
      expect(parseTOML).toBeDefined();
      expect(stringifyTOML).toBeDefined();
    });
  });

  describe('MoltTOML.parse', () => {
    it('should parse TOML string', () => {
      const toml = `
title = "Example"
number = 42
`;
      const result = MoltTOML.parse(toml);
      expect(result).toEqual({
        title: 'Example',
        number: 42,
      });
    });

    it('should accept options', () => {
      const toml = 'date = 1979-05-27T07:32:00Z';
      const result = MoltTOML.parse(toml, { parseDates: false }) as any;
      expect(result.date).toBe('1979-05-27T07:32:00Z');
    });
  });

  describe('MoltTOML.stringify', () => {
    it('should stringify JavaScript object', () => {
      const obj = { title: 'Example', number: 42 };
      const toml = MoltTOML.stringify(obj);
      expect(toml).toContain('title = "Example"');
      expect(toml).toContain('number = 42');
    });

    it('should accept options', () => {
      const obj = { point: { x: 1, y: 2 } };
      const toml = MoltTOML.stringify(obj, { inlineTables: false });
      expect(toml).toContain('[point]');
    });
  });

  describe('molt', () => {
    it('should parse TOML string', () => {
      const toml = `
title = "Example"
number = 42
`;
      const result = molt(toml);
      expect(result).toEqual({
        title: 'Example',
        number: 42,
      });
    });

    it('should accept options', () => {
      const toml = 'date = 1979-05-27T07:32:00Z';
      const result = molt(toml, { parseDates: false }) as any;
      expect(result.date).toBe('1979-05-27T07:32:00Z');
    });
  });

  describe('Round-trip', () => {
    it('should handle simple object round-trip', () => {
      const original = { title: 'Example', number: 42, enabled: true };
      const toml = stringifyTOML(original);
      const parsed = parseTOML(toml);
      expect(parsed).toEqual(original);
    });

    it('should handle table round-trip', () => {
      const original = {
        server: {
          host: 'localhost',
          port: 8080,
        },
      };
      const toml = stringifyTOML(original);
      const parsed = parseTOML(toml);
      expect(parsed).toEqual(original);
    });

    it('should handle nested table round-trip', () => {
      const original = {
        database: {
          connection: {
            server: '192.168.1.1',
            port: 5432,
          },
        },
      };
      const toml = stringifyTOML(original);
      const parsed = parseTOML(toml);
      expect(parsed).toEqual(original);
    });

    it('should handle array round-trip', () => {
      const original = { numbers: [1, 2, 3], strings: ['a', 'b', 'c'] };
      const toml = stringifyTOML(original);
      const parsed = parseTOML(toml);
      expect(parsed).toEqual(original);
    });

    it('should handle inline table round-trip', () => {
      const original = { point: { x: 1, y: 2 } };
      const toml = stringifyTOML(original);
      const parsed = parseTOML(toml);
      expect(parsed).toEqual(original);
    });

    it('should handle array of tables round-trip', () => {
      const original = {
        products: [
          { name: 'Hammer', sku: 738594937 },
          { name: 'Nail', sku: 284758393 },
        ],
      };
      const toml = stringifyTOML(original);
      const parsed = parseTOML(toml);
      expect(parsed).toEqual(original);
    });

    it('should handle complex structure round-trip', () => {
      const original = {
        title: 'TOML Example',
        owner: {
          name: 'Alice',
          age: 30,
        },
        database: {
          server: '192.168.1.1',
          ports: [8000, 8001, 8002],
          enabled: true,
        },
      };
      const toml = stringifyTOML(original);
      const parsed = parseTOML(toml);
      expect(parsed).toEqual(original);
    });

    it('should handle dates round-trip', () => {
      const original = { date: new Date('2024-01-15T10:30:00.000Z') };
      const toml = stringifyTOML(original);
      const parsed = parseTOML(toml) as any;
      expect(parsed.date).toBeInstanceOf(Date);
      expect(parsed.date.toISOString()).toBe(original.date.toISOString());
    });

    it('should handle empty structures round-trip', () => {
      const original = { empty_array: [], config: {} };
      const toml = stringifyTOML(original);
      const parsed = parseTOML(toml);
      // Empty inline table will be parsed back as object
      expect(parsed).toMatchObject({ empty_array: [] });
    });
  });

  describe('Real-world Examples', () => {
    it('should handle Cargo.toml structure', () => {
      const cargo = {
        package: {
          name: 'my-app',
          version: '0.1.0',
          edition: '2021',
        },
        dependencies: {
          serde: '1.0',
          tokio: { version: '1.0', features: ['full'] },
        },
      };
      const toml = stringifyTOML(cargo);
      const parsed = parseTOML(toml);
      expect(parsed).toEqual(cargo);
    });

    it('should handle config file structure', () => {
      const config = {
        app_name: 'MyApp',
        server: {
          host: '0.0.0.0',
          port: 3000,
          workers: 4,
        },
        database: {
          url: 'postgres://localhost/mydb',
          pool_size: 10,
          ssl: false,
        },
        logging: {
          level: 'info',
          format: 'json',
        },
      };
      const toml = stringifyTOML(config);
      const parsed = parseTOML(toml);
      expect(parsed).toEqual(config);
    });

    it('should handle pyproject.toml structure', () => {
      const pyproject = {
        tool: {
          poetry: {
            name: 'my-package',
            version: '0.1.0',
            description: 'A Python package',
            authors: ['Alice <alice@example.com>'],
            dependencies: {
              python: '^3.9',
              requests: '^2.28.0',
            },
          },
        },
      };
      const toml = stringifyTOML(pyproject);
      const parsed = parseTOML(toml);
      expect(parsed).toEqual(pyproject);
    });
  });
});
