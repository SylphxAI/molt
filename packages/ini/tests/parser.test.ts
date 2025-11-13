import { describe, it, expect } from 'vitest';
import { parseINI, ParseError } from '../src/index.js';

describe('INI Parser', () => {
  describe('Basic parsing', () => {
    it('should parse simple key-value pairs', () => {
      const ini = `
key1 = value1
key2 = value2
`;
      const result = parseINI(ini);
      expect(result).toEqual({
        '': {
          key1: 'value1',
          key2: 'value2',
        },
      });
    });

    it('should parse without spaces', () => {
      const ini = 'key1=value1\nkey2=value2';
      const result = parseINI(ini);
      expect(result).toEqual({
        '': {
          key1: 'value1',
          key2: 'value2',
        },
      });
    });

    it('should handle empty lines', () => {
      const ini = `
key1 = value1

key2 = value2

`;
      const result = parseINI(ini);
      expect(result).toEqual({
        '': {
          key1: 'value1',
          key2: 'value2',
        },
      });
    });
  });

  describe('Sections', () => {
    it('should parse sections', () => {
      const ini = `
[section1]
key1 = value1

[section2]
key2 = value2
`;
      const result = parseINI(ini);
      expect(result).toEqual({
        section1: { key1: 'value1' },
        section2: { key2: 'value2' },
      });
    });

    it('should handle keys before first section', () => {
      const ini = `
key0 = value0

[section1]
key1 = value1
`;
      const result = parseINI(ini);
      expect(result).toEqual({
        '': { key0: 'value0' },
        section1: { key1: 'value1' },
      });
    });
  });

  describe('Comments', () => {
    it('should ignore semicolon comments', () => {
      const ini = `
; This is a comment
key1 = value1
; Another comment
key2 = value2
`;
      const result = parseINI(ini);
      expect(result).toEqual({
        '': {
          key1: 'value1',
          key2: 'value2',
        },
      });
    });

    it('should ignore hash comments', () => {
      const ini = `
# This is a comment
key1 = value1
# Another comment
key2 = value2
`;
      const result = parseINI(ini);
      expect(result).toEqual({
        '': {
          key1: 'value1',
          key2: 'value2',
        },
      });
    });

    it('should handle inline comments when enabled', () => {
      const ini = 'key1 = value1 ; inline comment';
      const result = parseINI(ini, { inlineComments: true });
      expect(result).toEqual({
        '': { key1: 'value1' },
      });
    });
  });

  describe('Type parsing', () => {
    it('should parse integers', () => {
      const ini = 'port = 8080';
      const result = parseINI(ini);
      expect(result).toEqual({
        '': { port: 8080 },
      });
    });

    it('should parse floats', () => {
      const ini = 'pi = 3.14159';
      const result = parseINI(ini);
      expect(result).toEqual({
        '': { pi: 3.14159 },
      });
    });

    it('should parse booleans', () => {
      const ini = `
enabled = true
disabled = false
yes = yes
no = no
on = on
off = off
`;
      const result = parseINI(ini);
      expect(result).toEqual({
        '': {
          enabled: true,
          disabled: false,
          yes: true,
          no: false,
          on: true,
          off: false,
        },
      });
    });

    it('should parse null values', () => {
      const ini = `
null1 = null
null2 = nil
null3 = undefined
`;
      const result = parseINI(ini);
      expect(result).toEqual({
        '': {
          null1: null,
          null2: null,
          null3: null,
        },
      });
    });

    it('should not parse types when disabled', () => {
      const ini = 'port = 8080\nenabled = true';
      const result = parseINI(ini, { parseTypes: false });
      expect(result).toEqual({
        '': {
          port: '8080',
          enabled: 'true',
        },
      });
    });
  });

  describe('Quoted values', () => {
    it('should handle double-quoted strings', () => {
      const ini = 'message = "Hello World"';
      const result = parseINI(ini);
      expect(result).toEqual({
        '': { message: 'Hello World' },
      });
    });

    it('should handle single-quoted strings', () => {
      const ini = "message = 'Hello World'";
      const result = parseINI(ini);
      expect(result).toEqual({
        '': { message: 'Hello World' },
      });
    });
  });

  describe('Real-world examples', () => {
    it('should parse Git config', () => {
      const ini = `
[user]
name = Alice Smith
email = alice@example.com

[core]
editor = vim
autocrlf = true

[alias]
st = status
co = checkout
`;
      const result = parseINI(ini);
      expect(result).toEqual({
        user: {
          name: 'Alice Smith',
          email: 'alice@example.com',
        },
        core: {
          editor: 'vim',
          autocrlf: true,
        },
        alias: {
          st: 'status',
          co: 'checkout',
        },
      });
    });

    it('should parse database config', () => {
      const ini = `
[database]
host = localhost
port = 5432
name = myapp
user = admin
password = secret123

[server]
host = 0.0.0.0
port = 8080
workers = 4
`;
      const result = parseINI(ini);
      expect(result.database).toEqual({
        host: 'localhost',
        port: 5432,
        name: 'myapp',
        user: 'admin',
        password: 'secret123',
      });
      expect(result.server).toEqual({
        host: '0.0.0.0',
        port: 8080,
        workers: 4,
      });
    });

    it('should parse PHP config', () => {
      const ini = `
; PHP Configuration

[PHP]
engine = on
short_open_tag = off
precision = 14
output_buffering = 4096

[Date]
date.timezone = UTC
`;
      const result = parseINI(ini);
      expect(result.PHP).toEqual({
        engine: true,
        short_open_tag: false,
        precision: 14,
        output_buffering: 4096,
      });
      expect(result.Date).toEqual({
        'date.timezone': 'UTC',
      });
    });
  });
});
