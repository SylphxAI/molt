/**
 * Schema Validation Example
 *
 * This example shows how to validate JSON data against schemas
 * using Zod or simple schema validation.
 */

import { z } from 'zod';
import { SimpleSchemaValidator, ZodAdapter, molt } from '../src/index.js';

console.log('molt Schema Validation Examples\n');
console.log('='.repeat(50));

// Example 1: Basic Zod validation
console.log('\n1. Basic Zod Validation:');

const userSchema = z.object({
  name: z.string(),
  age: z.number().min(0).max(150),
  email: z.string().email(),
});

const validUserJson = `{
  name: "Alice",
  age: 30,
  email: "alice@example.com"
}`;

try {
  const user = molt.parse(validUserJson, {
    schema: new ZodAdapter(userSchema),
  });
  console.log('✓ Valid user:', user);
} catch (error) {
  console.log('✗ Validation failed:', (error as Error).message);
}

// Example 2: Zod validation with invalid data
console.log('\n2. Invalid Data Detection:');

const invalidUserJson = `{
  name: "Bob",
  age: 200,
  email: "not-an-email"
}`;

try {
  const user = molt.parse(invalidUserJson, {
    schema: new ZodAdapter(userSchema),
  });
  console.log('✓ Valid user:', user);
} catch (error) {
  console.log('✗ Validation failed (expected):', (error as Error).message);
}

// Example 3: Simple schema validation (no dependencies)
console.log('\n3. Simple Schema Validation:');

const productJson = `{
  id: 123,
  name: "Laptop",
  price: 999.99,
  inStock: true
}`;

const productValidator = new SimpleSchemaValidator({
  id: 'number',
  name: 'string',
  price: 'number',
  inStock: 'boolean',
});

try {
  const product = molt.parse(productJson, {
    schema: productValidator,
  });
  console.log('✓ Valid product:', product);
} catch (error) {
  console.log('✗ Validation failed:', (error as Error).message);
}

// Example 4: Nested schema validation
console.log('\n4. Nested Schema Validation:');

const orderSchema = z.object({
  orderId: z.string(),
  customer: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number().positive(),
    }),
  ),
  total: z.number().positive(),
});

const orderJson = `{
  orderId: "ORD-123",
  customer: {
    name: "Charlie",
    email: "charlie@example.com"
  },
  items: [
    {productId: 1, quantity: 2},
    {productId: 2, quantity: 1}
  ],
  total: 149.99
}`;

try {
  const order = molt.parse(orderJson, {
    schema: new ZodAdapter(orderSchema),
  });
  console.log('✓ Valid order:', order);
  console.log('  - Customer:', order.customer.name);
  console.log('  - Items:', order.items.length);
} catch (error) {
  console.log('✗ Validation failed:', (error as Error).message);
}

// Example 5: Safe parsing (no exceptions)
console.log('\n5. Safe Parsing:');

const adapter = new ZodAdapter(userSchema);

const result1 = adapter.safeParse({
  name: 'Valid User',
  age: 25,
  email: 'valid@example.com',
});

if (result1.success) {
  console.log('✓ Valid data:', result1.data);
} else {
  console.log('✗ Invalid data:', result1.error);
}

const result2 = adapter.safeParse({
  name: 'Invalid User',
  age: -5, // Invalid age
  email: 'not-an-email',
});

if (result2.success) {
  console.log('✓ Valid data:', result2.data);
} else {
  console.log('✗ Invalid data (expected):', result2.error.message);
}

// Example 6: Schema validation with type reconstruction
console.log('\n6. Validation with Type Reconstruction:');

const eventSchema = z.object({
  timestamp: z.date(),
  eventType: z.enum(['login', 'logout', 'purchase']),
  userId: z.number(),
});

const event = {
  timestamp: new Date('2024-11-13T10:30:00Z'),
  eventType: 'login' as const,
  userId: 12345,
};

const eventJson = molt.stringify(event);
console.log('Event JSON:', eventJson);

try {
  const parsed = molt.parse(eventJson, {
    schema: new ZodAdapter(eventSchema),
  });
  console.log('✓ Valid event:', parsed);
  console.log('  - Timestamp is Date:', parsed.timestamp instanceof Date);
  console.log('  - Event type:', parsed.eventType);
} catch (error) {
  console.log('✗ Validation failed:', (error as Error).message);
}

// Example 7: Custom error messages with Zod
console.log('\n7. Custom Error Messages:');

const strictUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().min(18, 'Must be 18 or older'),
});

const invalidJson = `{username: "ab", password: "short", age: 15}`;

try {
  molt.parse(invalidJson, {
    schema: new ZodAdapter(strictUserSchema),
  });
} catch (error) {
  console.log('✗ Validation errors:', (error as Error).message);
}

console.log('\nSchema validation examples completed!');
