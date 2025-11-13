/**
 * XML Serializer
 *
 * Serializes XMLDocument back to XML string
 */

import type { XMLDocument, XMLNode, XMLElement, StringifyXMLOptions } from './types.js';

/**
 * Stringify XMLDocument to XML string
 *
 * @param doc - XMLDocument
 * @param options - Stringify options
 * @returns XML string
 */
export function stringifyXML(doc: XMLDocument, options: StringifyXMLOptions = {}): string {
  const { declaration = true, indent = 2, selfClose = true } = options;

  const serializer = new XMLSerializer(indent, selfClose);
  let xml = '';

  // Add declaration if enabled
  if (declaration && doc.declaration) {
    xml += serializer.serializeDeclaration(doc.declaration);
    xml += '\n';
  }

  // Serialize root element
  xml += serializer.serializeElement(doc.root, 0);

  return xml;
}

/**
 * XML Serializer implementation
 */
class XMLSerializer {
  private readonly indentStr: string;
  private readonly selfClose: boolean;

  constructor(indent: string | number, selfClose: boolean) {
    this.indentStr = typeof indent === 'number' ? ' '.repeat(indent) : indent;
    this.selfClose = selfClose;
  }

  serializeDeclaration(decl: NonNullable<XMLDocument['declaration']>): string {
    let xml = '<?xml';
    xml += ` version="${decl.version}"`;
    if (decl.encoding) {
      xml += ` encoding="${decl.encoding}"`;
    }
    if (decl.standalone !== undefined) {
      xml += ` standalone="${decl.standalone ? 'yes' : 'no'}"`;
    }
    xml += '?>';
    return xml;
  }

  serializeElement(element: XMLElement, depth: number): string {
    const indent = this.indentStr.repeat(depth);
    let xml = indent + '<' + element.name;

    // Serialize attributes
    for (const [name, value] of Object.entries(element.attributes)) {
      xml += ` ${name}="${this.escapeAttr(value)}"`;
    }

    // Self-closing tag if no children
    if (element.children.length === 0 && this.selfClose) {
      xml += ' />';
      return xml;
    }

    xml += '>';

    // Serialize children
    if (element.children.length > 0) {
      const hasOnlyText =
        element.children.length === 1 && element.children[0]!.type === 'text';

      if (!hasOnlyText) {
        xml += '\n';
      }

      for (const child of element.children) {
        xml += this.serializeNode(child, depth + 1);
        if (!hasOnlyText || child.type !== 'text') {
          xml += '\n';
        }
      }

      if (!hasOnlyText) {
        xml += indent;
      }
    }

    xml += '</' + element.name + '>';
    return xml;
  }

  serializeNode(node: XMLNode, depth: number): string {
    switch (node.type) {
      case 'element':
        return this.serializeElement(node, depth);

      case 'text':
        // Only indent if it's not inline
        return this.escapeText(node.content);

      case 'comment':
        return this.indentStr.repeat(depth) + '<!--' + node.content + '-->';

      case 'cdata':
        return this.indentStr.repeat(depth) + '<![CDATA[' + node.content + ']]>';

      default:
        return '';
    }
  }

  private escapeText(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private escapeAttr(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

/**
 * Convert XMLDocument to plain JavaScript object
 *
 * @param doc - XMLDocument
 * @returns Plain object
 */
export function toObject(doc: XMLDocument): unknown {
  return elementToObject(doc.root);
}

function elementToObject(element: XMLElement): unknown {
  const obj: Record<string, unknown> = {};

  // Add attributes with @ prefix
  for (const [name, value] of Object.entries(element.attributes)) {
    obj['@' + name] = value;
  }

  // Process children
  if (element.children.length === 0) {
    // Empty element
    return obj;
  }

  if (element.children.length === 1 && element.children[0]!.type === 'text') {
    // Text-only element
    const text = element.children[0].content;
    if (Object.keys(obj).length === 0) {
      // No attributes, return just the text
      return text;
    }
    // Has attributes, add text as #text
    obj['#text'] = text;
    return obj;
  }

  // Multiple children or mixed content
  const childGroups: Record<string, XMLNode[]> = {};

  for (const child of element.children) {
    if (child.type === 'element') {
      if (!childGroups[child.name]) {
        childGroups[child.name] = [];
      }
      childGroups[child.name]!.push(child);
    } else if (child.type === 'text') {
      if (!obj['#text']) {
        obj['#text'] = child.content;
      } else {
        obj['#text'] += child.content;
      }
    } else if (child.type === 'cdata') {
      if (!obj['#cdata']) {
        obj['#cdata'] = child.content;
      } else {
        obj['#cdata'] += child.content;
      }
    }
  }

  // Convert child groups to object properties
  for (const [name, children] of Object.entries(childGroups)) {
    if (children.length === 1) {
      obj[name] = elementToObject(children[0]! as XMLElement);
    } else {
      obj[name] = children.map((child) => elementToObject(child as XMLElement));
    }
  }

  return obj;
}
