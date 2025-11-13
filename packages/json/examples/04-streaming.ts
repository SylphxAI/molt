/**
 * Streaming API Example
 *
 * This example demonstrates how to process large JSON files
 * without loading them entirely into memory.
 */

import { Readable } from 'node:stream';
import { parseJSONArray, parseNDJSON, parseStream } from '../src/index.js';

console.log('molt Streaming Examples\n');
console.log('='.repeat(50));

// Helper to convert string to ReadableStream
function createStream(data: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(data));
      controller.close();
    },
  });
}

// Example 1: NDJSON (Newline-Delimited JSON)
console.log('\n1. NDJSON Parsing:');
const ndjsonData = `{"id":1,"name":"Alice"}
{"id":2,"name":"Bob"}
{"id":3,"name":"Charlie"}`;

const ndjsonStream = createStream(ndjsonData);

console.log('Processing NDJSON stream...');
for await (const record of parseNDJSON(ndjsonStream)) {
  console.log('  -', record);
}

// Example 2: JSON Array Streaming
console.log('\n2. JSON Array Streaming:');
const arrayData = `[
  {"product":"Laptop","price":999},
  {"product":"Mouse","price":29},
  {"product":"Keyboard","price":79}
]`;

const arrayStream = createStream(arrayData);

console.log('Processing JSON array stream...');
let totalPrice = 0;
for await (const item of parseJSONArray(arrayStream)) {
  console.log('  -', item);
  totalPrice += (item as any).price;
}
console.log('Total price:', totalPrice);

// Example 3: Auto-detect format with parseStream
console.log('\n3. Auto-detect Format:');
const mixedData = `{"type":"log","level":"info"}
{"type":"log","level":"error"}`;

const mixedStream = createStream(mixedData);

console.log('Processing auto-detected stream...');
for await (const entry of parseStream(mixedStream)) {
  console.log('  -', entry);
}

// Example 4: Streaming with Type Reconstruction
console.log('\n4. Streaming with Types:');
const typedNDJSON = `{"created":"2024-01-01T00:00:00.000Z","count":1}
{"created":"2024-01-02T00:00:00.000Z","count":2}`;

// First stringify with type metadata
import { molt } from '../src/index.js';
const events = [
  { created: new Date('2024-01-01'), count: 1 },
  { created: new Date('2024-01-02'), count: 2 },
];
const typedData = events.map((e) => molt.stringify(e)).join('\n');

const typedStream = createStream(typedData);

console.log('Processing typed NDJSON stream...');
for await (const event of parseNDJSON(typedStream)) {
  console.log('  - Date:', (event as any).created instanceof Date, 'Count:', (event as any).count);
}

// Example 5: Large dataset simulation (chunked processing)
console.log('\n5. Chunked Processing:');

async function* generateLargeDataset() {
  // Simulate streaming large dataset in chunks
  for (let i = 0; i < 3; i++) {
    const chunk = `{"batch":${i},"items":[${Array.from({ length: 3 }, (_, j) => j + i * 3).join(',')}]}\n`;
    yield chunk;
  }
}

const asyncIterable = generateLargeDataset();

console.log('Processing large dataset in chunks...');
let recordCount = 0;
for await (const batch of parseNDJSON(asyncIterable)) {
  recordCount++;
  console.log('  - Batch', (batch as any).batch, 'with', (batch as any).items.length, 'items');
}
console.log('Total records processed:', recordCount);

// Example 6: Error handling in streams
console.log('\n6. Error Handling:');
const invalidData = `{"valid":true}
{invalid json here}
{"valid":true}`;

const errorStream = createStream(invalidData);

console.log('Processing stream with errors...');
try {
  for await (const item of parseNDJSON(errorStream)) {
    console.log('  - Valid item:', item);
  }
} catch (error) {
  console.log('  ! Caught error:', (error as Error).message);
}

console.log('\nStreaming examples completed!');
