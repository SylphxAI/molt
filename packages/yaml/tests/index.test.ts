import { describe, it, expect } from 'vitest';
import { MoltYAML, molt, parseYAML, stringifyYAML } from '../src/index.js';

describe('MoltYAML', () => {
  describe('API', () => {
    it('should export MoltYAML class', () => {
      expect(MoltYAML).toBeDefined();
      expect(MoltYAML.parse).toBeDefined();
      expect(MoltYAML.stringify).toBeDefined();
    });

    it('should export molt function', () => {
      expect(molt).toBeDefined();
    });

    it('should export individual functions', () => {
      expect(parseYAML).toBeDefined();
      expect(stringifyYAML).toBeDefined();
    });
  });

  describe('MoltYAML.parse', () => {
    it('should parse YAML string', () => {
      const yaml = `
name: alice
age: 30
`;
      const result = MoltYAML.parse(yaml);
      expect(result).toEqual({
        name: 'alice',
        age: 30,
      });
    });

    it('should accept options', () => {
      const yaml = '2024-01-15T10:30:00.000Z';
      const result = MoltYAML.parse(yaml, { parseDates: false });
      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('MoltYAML.stringify', () => {
    it('should stringify JavaScript object', () => {
      const obj = { name: 'alice', age: 30 };
      const yaml = MoltYAML.stringify(obj);
      expect(yaml).toContain('name: alice');
      expect(yaml).toContain('age: 30');
    });

    it('should accept options', () => {
      const obj = { name: 'alice' };
      const yaml = MoltYAML.stringify(obj, { indent: 4 });
      expect(yaml).toContain('name: alice');
    });
  });

  describe('molt', () => {
    it('should parse YAML string', () => {
      const yaml = `
name: alice
age: 30
`;
      const result = molt(yaml);
      expect(result).toEqual({
        name: 'alice',
        age: 30,
      });
    });

    it('should accept options', () => {
      const yaml = '2024-01-15T10:30:00.000Z';
      const result = molt(yaml, { parseDates: false });
      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('Round-trip', () => {
    it('should handle simple object round-trip', () => {
      const original = { name: 'alice', age: 30 };
      const yaml = stringifyYAML(original);
      const parsed = parseYAML(yaml);
      expect(parsed).toEqual(original);
    });

    it('should handle nested object round-trip', () => {
      const original = {
        user: {
          name: 'alice',
          age: 30,
        },
        settings: {
          theme: 'dark',
        },
      };
      const yaml = stringifyYAML(original);
      const parsed = parseYAML(yaml);
      expect(parsed).toEqual(original);
    });

    it('should handle array round-trip', () => {
      const original = ['apple', 'banana', 'cherry'];
      const yaml = stringifyYAML(original);
      const parsed = parseYAML(yaml);
      expect(parsed).toEqual(original);
    });

    it('should handle array of objects round-trip', () => {
      const original = [
        { name: 'alice', age: 30 },
        { name: 'bob', age: 25 },
      ];
      const yaml = stringifyYAML(original);
      const parsed = parseYAML(yaml);
      expect(parsed).toEqual(original);
    });

    it('should handle complex structure round-trip', () => {
      const original = {
        users: [
          {
            name: 'alice',
            age: 30,
            roles: ['admin', 'developer'],
          },
          {
            name: 'bob',
            age: 25,
            roles: ['user'],
          },
        ],
        settings: {
          theme: 'dark',
          notifications: {
            email: true,
            push: false,
          },
        },
      };
      const yaml = stringifyYAML(original);
      const parsed = parseYAML(yaml);
      expect(parsed).toEqual(original);
    });

    it('should handle scalars round-trip', () => {
      expect(parseYAML(stringifyYAML(42))).toBe(42);
      expect(parseYAML(stringifyYAML(true))).toBe(true);
      expect(parseYAML(stringifyYAML(false))).toBe(false);
      expect(parseYAML(stringifyYAML(null))).toBe(null);
    });

    it('should handle dates round-trip', () => {
      const original = new Date('2024-01-15T10:30:00.000Z');
      const yaml = stringifyYAML(original);
      const parsed = parseYAML(yaml) as Date;
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.toISOString()).toBe(original.toISOString());
    });

    it('should handle empty structures round-trip', () => {
      expect(parseYAML(stringifyYAML({}))).toEqual({});
      expect(parseYAML(stringifyYAML([]))).toEqual([]);
    });

    it('should handle strings with special characters', () => {
      const original = { text: 'hello: world' };
      const yaml = stringifyYAML(original);
      const parsed = parseYAML(yaml);
      expect(parsed).toEqual(original);
    });
  });

  describe('Real-world Examples', () => {
    it('should handle GitHub Actions workflow', () => {
      const workflow = {
        name: 'CI',
        on: ['push', 'pull_request'],
        jobs: {
          test: {
            'runs-on': 'ubuntu-latest',
            steps: [
              { uses: 'actions/checkout@v3' },
              { name: 'Install', run: 'npm install' },
              { name: 'Test', run: 'npm test' },
            ],
          },
        },
      };
      const yaml = stringifyYAML(workflow);
      const parsed = parseYAML(yaml);
      expect(parsed).toEqual(workflow);
    });

    it('should handle Docker Compose file', () => {
      const compose = {
        version: '3.8',
        services: {
          web: {
            image: 'nginx:latest',
            ports: ['80:80'],
            environment: {
              NODE_ENV: 'production',
            },
          },
          db: {
            image: 'postgres:14',
            volumes: ['db-data:/var/lib/postgresql/data'],
          },
        },
        volumes: {
          'db-data': null,
        },
      };
      const yaml = stringifyYAML(compose);
      const parsed = parseYAML(yaml);
      expect(parsed).toEqual(compose);
    });

    it('should handle Kubernetes manifest', () => {
      const manifest = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: {
          name: 'my-pod',
          labels: {
            app: 'my-app',
          },
        },
        spec: {
          containers: [
            {
              name: 'web',
              image: 'nginx:1.14.2',
              ports: [{ containerPort: 80 }],
            },
          ],
        },
      };
      const yaml = stringifyYAML(manifest);
      const parsed = parseYAML(yaml);
      expect(parsed).toEqual(manifest);
    });
  });
});
