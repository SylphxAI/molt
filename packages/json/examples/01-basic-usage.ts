/**
 * Basic Usage Example
 *
 * This example demonstrates the simplest way to use molt
 * for parsing and stringifying JSON with type preservation.
 */

import { molt } from '../src/index.js';

// Parse dirty JSON with type reconstruction
const input = `{
  user: 'alice',           // Single quotes (not valid JSON)
  age: 30,
  created: Date.now(),     // Will be reconstructed as Date
  tags: new Set(['a', 'b']) // Will be reconstructed as Set
}`;

console.log('Input (dirty JSON):');
console.log(input);

const parsed = molt.parse(input);
console.log('\nParsed result:');
console.log(parsed);
console.log('\nTypes preserved:');
console.log('created is Date:', parsed.created instanceof Date);
console.log('tags is Set:', parsed.tags instanceof Set);

// Stringify with type preservation
const data = {
  name: 'Bob',
  registered: new Date('2024-01-01'),
  score: 123456789012345678901n, // BigInt
  settings: new Map([
    ['theme', 'dark'],
    ['language', 'en'],
  ]),
  roles: new Set(['admin', 'user']),
  pattern: /^test$/i, // RegExp
};

console.log('\n\nOriginal data:');
console.log(data);

const json = molt.stringify(data, { space: 2 });
console.log('\nStringified JSON:');
console.log(json);

const restored = molt.parse(json);
console.log('\nRestored data:');
console.log(restored);
console.log('\nTypes verified:');
console.log('registered is Date:', restored.registered instanceof Date);
console.log('score is BigInt:', typeof restored.score === 'bigint');
console.log('settings is Map:', restored.settings instanceof Map);
console.log('roles is Set:', restored.roles instanceof Set);
console.log('pattern is RegExp:', restored.pattern instanceof RegExp);
