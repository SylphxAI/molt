import { bench, describe } from 'vitest';
import { parseXML, molt, cleanDirtyXML } from '../src/index.js';
import { XMLParser } from 'fast-xml-parser';
import xml2js from 'xml2js';

const fxpParser = new XMLParser();

/**
 * XML Parsing Benchmarks vs Competitors
 *
 * Comparing against popular XML parsers:
 * - fast-xml-parser (fastest)
 * - xml2js (most popular)
 * - xml-js (lightweight)
 */

// Sample XML documents
const simpleXML = `
<config>
  <app>MyApp</app>
  <version>1.0.0</version>
  <server>
    <host>localhost</host>
    <port>8080</port>
    <enabled>true</enabled>
  </server>
</config>
`;

const complexXML = `
<application>
  <metadata>
    <name>Production API</name>
    <version>2.5.0</version>
    <description>Production REST API Server</description>
  </metadata>
  <database>
    <host>db.example.com</host>
    <port>5432</port>
    <credentials>
      <username>admin</username>
      <password>secret</password>
    </credentials>
    <replicas>
      <replica>
        <host>replica1.example.com</host>
        <port>5432</port>
        <role>standby</role>
      </replica>
      <replica>
        <host>replica2.example.com</host>
        <port>5432</port>
        <role>standby</role>
      </replica>
      <replica>
        <host>replica3.example.com</host>
        <port>5432</port>
        <role>standby</role>
      </replica>
    </replicas>
  </database>
  <cache>
    <type>redis</type>
    <ttl>3600</ttl>
    <nodes>
      <node>redis1.example.com:6379</node>
      <node>redis2.example.com:6379</node>
      <node>redis3.example.com:6379</node>
    </nodes>
  </cache>
</application>
`;

const attributesXML = `
<users>
  <user id="1" role="admin" active="true">
    <name>Alice</name>
    <email>alice@example.com</email>
    <joined>2024-01-15</joined>
  </user>
  <user id="2" role="user" active="true">
    <name>Bob</name>
    <email>bob@example.com</email>
    <joined>2024-02-20</joined>
  </user>
  <user id="3" role="moderator" active="false">
    <name>Charlie</name>
    <email>charlie@example.com</email>
    <joined>2024-03-10</joined>
  </user>
</users>
`;

const cdataXML = `
<article>
  <title>Example Article</title>
  <content><![CDATA[
    This is the article content with <special> characters
    that should not be parsed as XML tags.

    <script>alert('Hello')</script>

    And some more text here.
  ]]></content>
  <comments>
    <comment>
      <author>User1</author>
      <text><![CDATA[Great article! <3]]></text>
    </comment>
  </comments>
</article>
`;

const dirtyXML = `
<config>
  <server host=localhost port=8080 enabled=true>
    <name>MyServer</name>
  <database type=postgres host=db.example.com>
    <credentials username=admin password=secret>
  </database>
  <features>
    <feature name=auth enabled=true>
    <feature name=logging level=info>
</config>
`;

describe('XML Parsing Performance', () => {
  bench('molt-xml: simple config', () => {
    parseXML(simpleXML);
  });

  bench('molt-xml: complex nested', () => {
    parseXML(complexXML);
  });

  bench('molt-xml: attributes', () => {
    parseXML(attributesXML);
  });

  bench('molt-xml: CDATA sections', () => {
    parseXML(cdataXML);
  });

  // Competitors (install with: bun add -D fast-xml-parser xml2js xml-js)
  // Uncomment when packages are installed:

  bench('fast-xml-parser: simple config', () => {
    fxpParser.parse(simpleXML);
  });
  bench('fast-xml-parser: complex nested', () => {
    fxpParser.parse(complexXML);
  });
  bench('fast-xml-parser: attributes', () => {
    fxpParser.parse(attributesXML);
  });
  bench('fast-xml-parser: CDATA sections', () => {
    fxpParser.parse(cdataXML);
  });

  bench('xml2js: simple config', async () => {
    await xml2js.parseStringPromise(simpleXML);
  });
  bench('xml2js: complex nested', async () => {
    await xml2js.parseStringPromise(complexXML);
  });
  bench('xml2js: attributes', async () => {
    await xml2js.parseStringPromise(attributesXML);
  });

  // import { xml2js as xmljs } from 'xml-js';
  // bench('xml-js: simple config', () => {
  //   xmljs(simpleXML);
  // });
  // bench('xml-js: complex nested', () => {
  //   xmljs(complexXML);
  // });
  // bench('xml-js: attributes', () => {
  //   xmljs(attributesXML);
  // });
});

describe('XML to Object Conversion Performance', () => {
  bench('molt-xml: toObject simple', () => {
    molt(simpleXML);
  });

  bench('molt-xml: toObject complex', () => {
    molt(complexXML);
  });

  bench('molt-xml: toObject attributes', () => {
    molt(attributesXML);
  });

  // Competitors with object output
  bench('fast-xml-parser: toObject simple', () => {
    fxpParser.parse(simpleXML);
  });
  bench('fast-xml-parser: toObject complex', () => {
    fxpParser.parse(complexXML);
  });
});

describe('Dirty XML Cleaning Performance', () => {
  bench('molt-xml: clean dirty XML', () => {
    cleanDirtyXML(dirtyXML);
  });

  bench('molt-xml: parse dirty XML directly', () => {
    parseXML(dirtyXML, { cleanDirty: true });
  });

  bench('molt-xml: toObject from dirty XML', () => {
    molt(dirtyXML, { cleanDirty: true });
  });
});

describe('XML Large Document Performance', () => {
  // Generate large XML document
  const items = Array.from(
    { length: 1000 },
    (_, i) => `
    <item>
      <id>${i}</id>
      <name>Item ${i}</name>
      <description>Description for item ${i}</description>
      <price>${(Math.random() * 1000).toFixed(2)}</price>
      <inStock>${Math.random() > 0.5}</inStock>
      <tags>
        <tag>tag1</tag>
        <tag>tag2</tag>
        <tag>tag3</tag>
      </tags>
    </item>`
  ).join('');

  const largeXML = `<catalog>${items}</catalog>`;

  bench('molt-xml: parse 1000 items', () => {
    parseXML(largeXML);
  });

  bench('molt-xml: toObject 1000 items', () => {
    molt(largeXML);
  });

  bench('fast-xml-parser: parse 1000 items', () => {
    fxpParser.parse(largeXML);
  });

  bench('xml2js: parse 1000 items', async () => {
    await xml2js.parseStringPromise(largeXML);
  });
});

describe('XML with Mixed Content', () => {
  const mixedXML = `
<article>
  <p>This is a paragraph with <b>bold</b> and <i>italic</i> text.</p>
  <p>Another paragraph with <a href="https://example.com">a link</a>.</p>
  <div>
    Outer text
    <span>Inner text</span>
    More outer text
  </div>
</article>
`;

  bench('molt-xml: mixed content', () => {
    parseXML(mixedXML);
  });

  bench('molt-xml: mixed content to object', () => {
    molt(mixedXML);
  });
});

describe('XML Round-trip Performance', () => {
  bench('molt-xml: parse → toObject → parse', () => {
    const doc = parseXML(complexXML);
    const obj = molt(complexXML);
    parseXML(complexXML);
  });
});
