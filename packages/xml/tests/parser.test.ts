import { describe, test, expect } from 'vitest';
import { parseXML } from '../src/parser.js';

describe('XML Parser', () => {
  test('should parse simple element', () => {
    const xml = '<root/>';
    const doc = parseXML(xml);
    expect(doc.root.name).toBe('root');
    expect(doc.root.children).toHaveLength(0);
  });

  test('should parse element with attributes', () => {
    const xml = '<user name="alice" age="30"/>';
    const doc = parseXML(xml);
    expect(doc.root.attributes).toEqual({ name: 'alice', age: '30' });
  });

  test('should parse nested elements', () => {
    const xml = '<root><child/></root>';
    const doc = parseXML(xml);
    expect(doc.root.children).toHaveLength(1);
    expect(doc.root.children[0]).toMatchObject({
      type: 'element',
      name: 'child',
    });
  });

  test('should parse text content', () => {
    const xml = '<text>Hello World</text>';
    const doc = parseXML(xml);
    expect(doc.root.children).toHaveLength(1);
    expect(doc.root.children[0]).toMatchObject({
      type: 'text',
      content: 'Hello World',
    });
  });

  test('should parse XML declaration', () => {
    const xml = '<?xml version="1.0" encoding="UTF-8"?><root/>';
    const doc = parseXML(xml);
    expect(doc.declaration).toEqual({
      version: '1.0',
      encoding: 'UTF-8',
      standalone: false,
    });
  });

  test('should parse comments', () => {
    const xml = '<root><!-- comment --></root>';
    const doc = parseXML(xml, { removeComments: false });
    expect(doc.root.children).toHaveLength(1);
    expect(doc.root.children[0]).toMatchObject({
      type: 'comment',
      content: ' comment ',
    });
  });

  test('should remove comments when option enabled', () => {
    const xml = '<root><!-- comment --></root>';
    const doc = parseXML(xml, { removeComments: true });
    expect(doc.root.children).toHaveLength(0);
  });

  test('should parse CDATA sections', () => {
    const xml = '<root><![CDATA[some data]]></root>';
    const doc = parseXML(xml);
    expect(doc.root.children).toHaveLength(1);
    expect(doc.root.children[0]).toMatchObject({
      type: 'cdata',
      content: 'some data',
    });
  });

  test('should parse dirty XML with unquoted attributes', () => {
    const xml = '<user name=alice age=30/>';
    const doc = parseXML(xml, { cleanDirty: true });
    expect(doc.root.attributes).toEqual({ name: 'alice', age: '30' });
  });

  test('should handle mixed content', () => {
    const xml = '<p>Hello <b>World</b>!</p>';
    const doc = parseXML(xml);
    expect(doc.root.children).toHaveLength(3);
    expect(doc.root.children[0]!.type).toBe('text');
    expect(doc.root.children[1]!.type).toBe('element');
    expect(doc.root.children[2]!.type).toBe('text');
  });

  test('should trim text by default', () => {
    const xml = '<text>  whitespace  </text>';
    const doc = parseXML(xml);
    expect((doc.root.children[0] as any).content).toBe('whitespace');
  });

  test('should preserve whitespace when option disabled', () => {
    const xml = '<text>  whitespace  </text>';
    const doc = parseXML(xml, { trimText: false });
    expect((doc.root.children[0] as any).content).toBe('  whitespace  ');
  });
});
