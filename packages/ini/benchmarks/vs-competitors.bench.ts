import { bench, describe } from 'vitest';
import { parseINI, serializeINI } from '../src/index.js';
import ini from 'ini';

// Test data
const simpleINI = `
key1 = value1
key2 = value2
key3 = value3
`;

const sectionINI = `
[section1]
key1 = value1
key2 = value2

[section2]
key3 = value3
key4 = value4
`;

const typedINI = `
[database]
host = localhost
port = 5432
enabled = true
timeout = 30.5

[server]
workers = 4
debug = false
`;

const gitConfigINI = `
[user]
name = Alice Smith
email = alice@example.com

[core]
editor = vim
autocrlf = true
filemode = false

[alias]
st = status
co = checkout
br = branch
ci = commit

[color]
ui = true
diff = auto
status = auto
branch = auto
`;

const complexINI = `
; PHP Configuration File

[PHP]
engine = on
short_open_tag = off
precision = 14
output_buffering = 4096
zlib.output_compression = off
implicit_flush = off
serialize_precision = -1

[Date]
date.timezone = UTC
date.default_latitude = 31.7667
date.default_longitude = 35.2333

[MySQL]
mysql.allow_local_infile = on
mysql.allow_persistent = on
mysql.cache_size = 2000
mysql.max_persistent = -1
mysql.max_links = -1
mysql.default_port = 3306
mysql.connect_timeout = 60
mysql.trace_mode = off
`;

// Prepare data for serialization
const simpleData = parseINI(simpleINI);
const sectionData = parseINI(sectionINI);
const complexData = parseINI(complexINI);

describe('INI Parsing Benchmarks', () => {
  describe('Parse simple INI', () => {
    bench('molt-ini', () => {
      parseINI(simpleINI);
    });

    bench('ini (npm)', () => {
      ini.parse(simpleINI);
    });
  });

  describe('Parse with sections', () => {
    bench('molt-ini', () => {
      parseINI(sectionINI);
    });

    bench('ini (npm)', () => {
      ini.parse(sectionINI);
    });
  });

  describe('Parse with type coercion', () => {
    bench('molt-ini', () => {
      parseINI(typedINI);
    });

    bench('ini (npm)', () => {
      ini.parse(typedINI);
    });
  });

  describe('Parse Git config', () => {
    bench('molt-ini', () => {
      parseINI(gitConfigINI);
    });

    bench('ini (npm)', () => {
      ini.parse(gitConfigINI);
    });
  });

  describe('Parse complex config', () => {
    bench('molt-ini', () => {
      parseINI(complexINI);
    });

    bench('ini (npm)', () => {
      ini.parse(complexINI);
    });
  });
});

describe('INI Serialization Benchmarks', () => {
  describe('Serialize simple data', () => {
    bench('molt-ini', () => {
      serializeINI(simpleData);
    });

    bench('ini (npm)', () => {
      ini.stringify(simpleData);
    });
  });

  describe('Serialize with sections', () => {
    bench('molt-ini', () => {
      serializeINI(sectionData);
    });

    bench('ini (npm)', () => {
      ini.stringify(sectionData);
    });
  });

  describe('Serialize complex config', () => {
    bench('molt-ini', () => {
      serializeINI(complexData);
    });

    bench('ini (npm)', () => {
      ini.stringify(complexData);
    });
  });
});
