import { describe, test, expect } from 'vitest';
import { cleanDirtyXML } from '../src/cleaner.js';

describe('XML Cleaner', () => {
  test('should clean unquoted attributes', () => {
    const dirty = '<user name=alice age=30/>';
    const clean = cleanDirtyXML(dirty);
    expect(clean).toBe('<user name="alice" age="30" />');
  });

  test('should convert single quotes to double quotes', () => {
    const dirty = "<user name='alice' city='NYC'/>";
    const clean = cleanDirtyXML(dirty);
    expect(clean).toBe('<user name="alice" city="NYC" />');
  });

  test('should preserve already clean XML', () => {
    const xml = '<user name="alice" age="30"/>';
    const clean = cleanDirtyXML(xml);
    expect(clean).toBe('<user name="alice" age="30" />');
  });

  test('should handle nested elements', () => {
    const dirty = '<root><user name=alice/><user name=bob/></root>';
    const clean = cleanDirtyXML(dirty);
    expect(clean).toContain('name="alice"');
    expect(clean).toContain('name="bob"');
  });

  test('should escape text content entities', () => {
    const dirty = '<text>a & b < c > d</text>';
    const clean = cleanDirtyXML(dirty);
    expect(clean).toBe('<text>a &amp; b &lt; c &gt; d</text>');
  });

  test('should preserve XML declaration', () => {
    const xml = '<?xml version="1.0" encoding="UTF-8"?><root/>';
    const clean = cleanDirtyXML(xml);
    expect(clean).toContain('<?xml version="1.0" encoding="UTF-8"?>');
  });

  test('should preserve comments', () => {
    const xml = '<root><!-- comment --></root>';
    const clean = cleanDirtyXML(xml);
    expect(clean).toContain('<!-- comment -->');
  });

  test('should preserve CDATA sections', () => {
    const xml = '<root><![CDATA[some data]]></root>';
    const clean = cleanDirtyXML(xml);
    expect(clean).toContain('<![CDATA[some data]]>');
  });

  test('should handle mixed quoted and unquoted attributes', () => {
    const dirty = '<user name=alice city="NYC" age=30/>';
    const clean = cleanDirtyXML(dirty);
    expect(clean).toBe('<user name="alice" city="NYC" age="30" />');
  });

  test('should escape quotes in attribute values', () => {
    const dirty = '<user title="CEO & "Chief""/>';
    const clean = cleanDirtyXML(dirty);
    expect(clean).toContain('&quot;');
  });
});
