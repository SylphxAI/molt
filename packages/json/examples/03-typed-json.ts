/**
 * Typed JSON Example
 *
 * This example demonstrates how molt preserves JavaScript types
 * that are normally lost during JSON serialization.
 */

import { molt } from '../src/index.js';

console.log('molt Typed JSON Examples\n');
console.log('='.repeat(50));

// Example 1: Dates
console.log('\n1. Date Preservation:');
const withDate = {
  created: new Date('2024-01-01T00:00:00Z'),
  updated: new Date('2024-12-01T12:30:45Z'),
};
const dateJson = molt.stringify(withDate, { space: 2 });
console.log('Original:', withDate);
console.log('JSON:', dateJson);
const restoredDate = molt.parse(dateJson);
console.log('Restored:', restoredDate);
console.log('Type check:', restoredDate.created instanceof Date);

// Example 2: BigInt
console.log('\n2. BigInt Support:');
const withBigInt = {
  largeNumber: 123456789012345678901234567890n,
  balance: 999999999999999999n,
};
const bigIntJson = molt.stringify(withBigInt, { space: 2 });
console.log('Original:', withBigInt);
console.log('JSON:', bigIntJson);
const restoredBigInt = molt.parse(bigIntJson);
console.log('Restored:', restoredBigInt);
console.log('Type check:', typeof restoredBigInt.largeNumber === 'bigint');

// Example 3: Map and Set
console.log('\n3. Map and Set:');
const withCollections = {
  map: new Map([
    ['key1', 'value1'],
    ['key2', { nested: true }],
    [3, 'numeric key'],
  ]),
  set: new Set([1, 2, 3, 'mixed', { obj: true }]),
};
const collectionsJson = molt.stringify(withCollections, { space: 2 });
console.log('Original Map size:', withCollections.map.size);
console.log('Original Set size:', withCollections.set.size);
console.log('JSON:', collectionsJson);
const restoredCollections = molt.parse(collectionsJson);
console.log('Restored Map size:', restoredCollections.map.size);
console.log('Restored Set size:', restoredCollections.set.size);
console.log('Map has key1:', restoredCollections.map.has('key1'));
console.log('Set has "mixed":', restoredCollections.set.has('mixed'));

// Example 4: RegExp
console.log('\n4. RegExp:');
const withRegex = {
  emailPattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i,
  urlPattern: /^https?:\/\/.+/,
};
const regexJson = molt.stringify(withRegex, { space: 2 });
console.log('Original:', withRegex);
console.log('JSON:', regexJson);
const restoredRegex = molt.parse(regexJson);
console.log('Restored:', restoredRegex);
console.log('Email test:', restoredRegex.emailPattern.test('test@example.com'));

// Example 5: Special values (undefined, NaN, Infinity)
console.log('\n5. Special Values:');
const withSpecial = {
  nothing: undefined,
  notANumber: Number.NaN,
  infinite: Number.POSITIVE_INFINITY,
  negInfinite: Number.NEGATIVE_INFINITY,
};
const specialJson = molt.stringify(withSpecial, { space: 2 });
console.log('Original:', withSpecial);
console.log('JSON:', specialJson);
const restoredSpecial = molt.parse(specialJson);
console.log('Restored:', restoredSpecial);
console.log('undefined check:', restoredSpecial.nothing === undefined);
console.log('NaN check:', Number.isNaN(restoredSpecial.notANumber));
console.log('Infinity check:', restoredSpecial.infinite === Number.POSITIVE_INFINITY);

// Example 6: Complex nested structure
console.log('\n6. Complex Nested Structure:');
const complex = {
  user: {
    id: 12345n,
    name: 'Alice',
    registered: new Date('2023-01-01'),
    metadata: new Map([
      ['lastLogin', new Date('2024-11-13')],
      ['loginCount', 42],
    ]),
    preferences: {
      theme: 'dark',
      notifications: new Set(['email', 'push']),
    },
  },
  validations: [
    /^\d{3}-\d{2}-\d{4}$/, // SSN pattern
    /^[A-Z]{2}\d{6}$/, // ID pattern
  ],
};
const complexJson = molt.stringify(complex, { space: 2 });
console.log('JSON length:', complexJson.length, 'bytes');
const restoredComplex = molt.parse(complexJson);
console.log('User ID type:', typeof restoredComplex.user.id);
console.log('Registered type:', restoredComplex.user.registered instanceof Date);
console.log('Metadata type:', restoredComplex.user.metadata instanceof Map);
console.log('Notifications type:', restoredComplex.user.preferences.notifications instanceof Set);
console.log('Validation patterns:', restoredComplex.validations.length, 'RegExp objects');
