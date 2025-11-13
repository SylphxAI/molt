import { describe, test, expect } from 'vitest';
import { molt, MoltXML } from '../src/index.js';

describe('Molt XML API', () => {
  test('molt() should parse XML to object', () => {
    const xml = '<user name="alice" age="30"/>';
    const obj = molt(xml);
    expect(obj).toEqual({
      '@name': 'alice',
      '@age': '30',
    });
  });

  test('molt() should handle dirty XML', () => {
    const xml = '<user name=alice age=30/>';
    const obj = molt(xml);
    expect(obj).toEqual({
      '@name': 'alice',
      '@age': '30',
    });
  });

  test('molt() should parse nested elements', () => {
    const xml = '<root><user name="alice"/><user name="bob"/></root>';
    const obj = molt(xml);
    expect(obj).toEqual({
      user: [{ '@name': 'alice' }, { '@name': 'bob' }],
    });
  });

  test('molt() should parse text content', () => {
    const xml = '<message>Hello World</message>';
    const obj = molt(xml);
    expect(obj).toBe('Hello World');
  });

  test('molt() should handle attributes and text', () => {
    const xml = '<message lang="en">Hello</message>';
    const obj = molt(xml);
    expect(obj).toEqual({
      '@lang': 'en',
      '#text': 'Hello',
    });
  });

  test('MoltXML.clean() should clean dirty XML', () => {
    const dirty = '<user name=alice/>';
    const clean = MoltXML.clean(dirty);
    expect(clean).toBe('<user name="alice" />');
  });

  test('MoltXML.parse() should return XMLDocument', () => {
    const xml = '<root><child/></root>';
    const doc = MoltXML.parse(xml);
    expect(doc.root.name).toBe('root');
    expect(doc.root.children).toHaveLength(1);
  });

  test('MoltXML.stringify() should serialize XMLDocument', () => {
    const xml = '<root><child name="test"/></root>';
    const doc = MoltXML.parse(xml);
    const str = MoltXML.stringify(doc, { indent: 0 });
    expect(str).toContain('<root>');
    expect(str).toContain('<child name="test"');
    expect(str).toContain('</root>');
  });

  test('round-trip: parse → stringify → parse', () => {
    const xml = '<root><user name="alice" age="30"><city>NYC</city></user></root>';
    const doc1 = MoltXML.parse(xml);
    const str = MoltXML.stringify(doc1);
    const doc2 = MoltXML.parse(str);
    expect(doc2.root.name).toBe(doc1.root.name);
    expect(doc2.root.children).toHaveLength(doc1.root.children.length);
  });

  test('should handle real-world dirty XML', () => {
    const dirty = `
      <users>
        <user name=alice age=30 active=true>
          <city>NYC</city>
          <tags>
            <tag>developer</tag>
            <tag>typescript</tag>
          </tags>
        </user>
      </users>
    `;
    const obj = molt(dirty);
    expect(obj).toMatchObject({
      user: {
        '@name': 'alice',
        '@age': '30',
        '@active': 'true',
        city: 'NYC',
        tags: {
          tag: ['developer', 'typescript'],
        },
      },
    });
  });
});
