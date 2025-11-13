/**
 * Dirty JSON Parsing Example
 *
 * This example shows how molt handles malformed JSON that would
 * normally fail with standard JSON.parse().
 */

import { molt } from '../src/index.js';

console.log('molt Dirty JSON Examples\n');
console.log('='.repeat(50));

// Example 1: Unquoted keys
const unquotedKeys = `{
  name: "Alice",
  age: 30,
  city: "NYC"
}`;

console.log('\n1. Unquoted Keys:');
console.log('Input:', unquotedKeys);
console.log('Parsed:', molt.parse(unquotedKeys));

// Example 2: Single quotes
const singleQuotes = `{
  'name': 'Bob',
  'email': 'bob@example.com'
}`;

console.log('\n2. Single Quotes:');
console.log('Input:', singleQuotes);
console.log('Parsed:', molt.parse(singleQuotes));

// Example 3: Trailing commas
const trailingCommas = `{
  "items": [1, 2, 3,],
  "active": true,
}`;

console.log('\n3. Trailing Commas:');
console.log('Input:', trailingCommas);
console.log('Parsed:', molt.parse(trailingCommas));

// Example 4: Comments
const withComments = `{
  // User information
  "name": "Charlie",
  /*
   * Multi-line comment
   */
  "role": "admin"
}`;

console.log('\n4. Comments:');
console.log('Input:', withComments);
console.log('Parsed:', molt.parse(withComments));

// Example 5: Mixed dirty JSON
const mixedDirty = `{
  user: 'david',        // Single quotes, unquoted key
  age: 25,
  tags: ['js', 'ts',],  // Trailing comma in array
  active: true,         // Trailing comma after this
}`;

console.log('\n5. Mixed Dirty JSON:');
console.log('Input:', mixedDirty);
console.log('Parsed:', molt.parse(mixedDirty));

// Example 6: Clean only (no type reconstruction)
console.log('\n6. Clean Only (return valid JSON string):');
const cleaned = molt.clean(mixedDirty);
console.log('Cleaned:', cleaned);
console.log(
  'Is valid JSON:',
  (() => {
    try {
      JSON.parse(cleaned);
      return true;
    } catch {
      return false;
    }
  })(),
);
