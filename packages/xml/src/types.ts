/**
 * XML Types and Interfaces
 */

/**
 * XML node types
 */
export type XMLNode = XMLElement | XMLText | XMLComment | XMLCDATA;

export interface XMLElement {
  type: 'element';
  name: string;
  attributes: Record<string, string>;
  children: XMLNode[];
  /** Original position in source */
  position?: { start: number; end: number };
}

export interface XMLText {
  type: 'text';
  content: string;
  position?: { start: number; end: number };
}

export interface XMLComment {
  type: 'comment';
  content: string;
  position?: { start: number; end: number };
}

export interface XMLCDATA {
  type: 'cdata';
  content: string;
  position?: { start: number; end: number };
}

/**
 * XML Document
 */
export interface XMLDocument {
  declaration?: {
    version: string;
    encoding?: string;
    standalone?: boolean;
  };
  root: XMLElement;
}

/**
 * Parse options
 */
export interface ParseXMLOptions {
  /** Clean dirty XML (unquoted attributes, etc.) */
  cleanDirty?: boolean;
  /** Preserve type information */
  preserveTypes?: boolean;
  /** Remove comments */
  removeComments?: boolean;
  /** Trim text content */
  trimText?: boolean;
  /** Parse CDATA sections */
  parseCDATA?: boolean;
  /** Maximum input size in bytes */
  maxSize?: number;
}

/**
 * Stringify options
 */
export interface StringifyXMLOptions {
  /** Include XML declaration */
  declaration?: boolean;
  /** Indentation (spaces or tabs) */
  indent?: string | number;
  /** Self-close empty elements */
  selfClose?: boolean;
  /** Include type metadata */
  preserveTypes?: boolean;
}

/**
 * XML Error
 */
export class XMLError extends Error {
  constructor(
    message: string,
    public readonly position?: number,
    public readonly line?: number,
    public readonly column?: number
  ) {
    super(message);
    this.name = 'XMLError';
  }
}

/**
 * Parse Error
 */
export class ParseError extends XMLError {
  constructor(message: string, position?: number) {
    super(message, position);
    this.name = 'ParseError';
  }
}

/**
 * Validation Error
 */
export class ValidationError extends XMLError {
  constructor(message: string, position?: number) {
    super(message, position);
    this.name = 'ValidationError';
  }
}
