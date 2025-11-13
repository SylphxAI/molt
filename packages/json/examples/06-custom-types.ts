/**
 * Custom Types Example
 *
 * This example demonstrates how to register and use custom type
 * transformers for your own classes and data structures.
 */

import { molt } from '../src/index.js';
import type { CustomTypeTransformer } from '../src/types.js';

console.log('molt Custom Types Examples\n');
console.log('='.repeat(50));

// Example 1: Simple custom class
console.log('\n1. Simple Custom Class:');

class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}

  toString() {
    return `Point(${this.x}, ${this.y})`;
  }
}

const pointTransformer: CustomTypeTransformer<Point> = {
  name: 'Point',
  isApplicable: (v): v is Point => v instanceof Point,
  serialize: (v: Point) => ({ x: v.x, y: v.y }),
  deserialize: (v: unknown) => {
    const { x, y } = v as { x: number; y: number };
    return new Point(x, y);
  },
  priority: 100,
};

molt.registerCustom(pointTransformer);

const point = new Point(10, 20);
console.log('Original:', point.toString());

const pointJson = molt.stringify(point, { space: 2 });
console.log('JSON:', pointJson);

const restoredPoint = molt.parse<Point>(pointJson);
console.log('Restored:', restoredPoint.toString());
console.log('Is Point instance:', restoredPoint instanceof Point);

// Example 2: Complex custom class with nested data
console.log('\n2. Complex Custom Class:');

class Rectangle {
  constructor(
    public topLeft: Point,
    public bottomRight: Point,
  ) {}

  get width() {
    return this.bottomRight.x - this.topLeft.x;
  }

  get height() {
    return this.bottomRight.y - this.topLeft.y;
  }

  get area() {
    return this.width * this.height;
  }
}

const rectangleTransformer: CustomTypeTransformer<Rectangle> = {
  name: 'Rectangle',
  isApplicable: (v): v is Rectangle => v instanceof Rectangle,
  serialize: (v: Rectangle) => ({
    topLeft: v.topLeft,
    bottomRight: v.bottomRight,
  }),
  deserialize: (v: unknown) => {
    const { topLeft, bottomRight } = v as { topLeft: Point; bottomRight: Point };
    return new Rectangle(topLeft, bottomRight);
  },
  priority: 100,
};

molt.registerCustom(rectangleTransformer);

const rect = new Rectangle(new Point(0, 0), new Point(100, 50));

console.log('Original rectangle:');
console.log('  Width:', rect.width);
console.log('  Height:', rect.height);
console.log('  Area:', rect.area);

const rectJson = molt.stringify(rect, { space: 2 });
console.log('JSON:', rectJson);

const restoredRect = molt.parse<Rectangle>(rectJson);
console.log('Restored rectangle:');
console.log('  Width:', restoredRect.width);
console.log('  Height:', restoredRect.height);
console.log('  Area:', restoredRect.area);

// Example 3: Custom type in data structure
console.log('\n3. Custom Types in Data Structure:');

const drawing = {
  name: 'My Drawing',
  created: new Date(),
  shapes: [
    new Point(5, 5),
    new Rectangle(new Point(10, 10), new Point(50, 30)),
    new Point(100, 100),
  ],
  metadata: new Map([
    ['author', 'Alice'],
    ['version', 1],
  ]),
};

const drawingJson = molt.stringify(drawing, { space: 2 });
console.log('Drawing JSON length:', drawingJson.length, 'bytes');

const restoredDrawing = molt.parse(drawingJson);
console.log('Restored drawing:');
console.log('  Name:', restoredDrawing.name);
console.log('  Created:', restoredDrawing.created instanceof Date);
console.log('  Shapes:', restoredDrawing.shapes.length);
console.log(
  '  Shape types:',
  restoredDrawing.shapes.map((s: any) => s.constructor.name),
);

// Example 4: Per-call custom types (not global)
console.log('\n4. Per-call Custom Types:');

class Color {
  constructor(
    public r: number,
    public g: number,
    public b: number,
  ) {}

  toHex() {
    const hex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
  }
}

const colorTransformer: CustomTypeTransformer<Color> = {
  name: 'Color',
  isApplicable: (v): v is Color => v instanceof Color,
  serialize: (v: Color) => ({ r: v.r, g: v.g, b: v.b }),
  deserialize: (v: unknown) => {
    const { r, g, b } = v as { r: number; g: number; b: number };
    return new Color(r, g, b);
  },
};

const palette = {
  primary: new Color(255, 0, 0),
  secondary: new Color(0, 255, 0),
  accent: new Color(0, 0, 255),
};

// Use custom type without global registration
const paletteJson = molt.stringify(palette, {
  customTypes: [colorTransformer],
  space: 2,
});

console.log('Palette JSON:', paletteJson);

const restoredPalette = molt.parse<typeof palette>(paletteJson, {
  customTypes: [colorTransformer],
});

console.log('Restored colors:');
console.log('  Primary:', restoredPalette.primary.toHex());
console.log('  Secondary:', restoredPalette.secondary.toHex());
console.log('  Accent:', restoredPalette.accent.toHex());

// Example 5: Unregister custom type
console.log('\n5. Unregister Custom Type:');

console.log('Unregistering Point and Rectangle...');
molt.unregisterCustom('Point');
molt.unregisterCustom('Rectangle');

const newPoint = new Point(1, 2);
const withoutCustom = molt.stringify({ point: newPoint });
console.log('Without custom transformer:', withoutCustom);
console.log('(Point serialized as plain object)');

console.log('\nCustom types examples completed!');
