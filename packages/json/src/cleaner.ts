/**
 * High-performance dirty JSON cleaner using state machine
 * Handles malformed JSON: unquoted keys, single quotes, comments, trailing commas, etc.
 */

import { ParseError } from './types.js';

/**
 * Token types
 */
enum TokenType {
  String = 0,
  Number = 1,
  True = 2,
  False = 3,
  Null = 4,
  ObjectStart = 5,
  ObjectEnd = 6,
  ArrayStart = 7,
  ArrayEnd = 8,
  Colon = 9,
  Comma = 10,
  EOF = 11,
}

interface Token {
  type: TokenType;
  value: string;
  position: number;
}

/**
 * Fast character classification
 */
const isWhitespace = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return code === 32 || code === 9 || code === 10 || code === 13; // space, tab, \n, \r
};

const isDigit = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return code >= 48 && code <= 57; // 0-9
};

const isIdentifierStart = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return (
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    code === 95 || // _
    code === 36 // $
  );
};

const isIdentifierChar = (char: string): boolean => {
  return isIdentifierStart(char) || isDigit(char);
};

/**
 * Clean dirty JSON to valid JSON
 */
export function cleanDirtyJSON(input: string, maxSize = 100 * 1024 * 1024): string {
  if (input.length > maxSize) {
    throw new ParseError(`Input too large: ${input.length} bytes (max: ${maxSize})`);
  }

  const tokens = tokenize(input);
  return reconstructJSON(tokens);
}

/**
 * Tokenize the input using state machine
 */
function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  const len = input.length;

  while (pos < len) {
    const char = input[pos];

    // Skip whitespace
    if (isWhitespace(char!)) {
      pos++;
      continue;
    }

    // Comments
    if (char === '/' && pos + 1 < len) {
      const next = input[pos + 1];
      if (next === '/') {
        // Single-line comment
        pos += 2;
        while (pos < len && input[pos] !== '\n') {
          pos++;
        }
        continue;
      }
      if (next === '*') {
        // Multi-line comment
        pos += 2;
        while (pos + 1 < len) {
          if (input[pos] === '*' && input[pos + 1] === '/') {
            pos += 2;
            break;
          }
          pos++;
        }
        continue;
      }
    }

    // String (double quotes)
    if (char === '"') {
      const start = pos;
      pos++;
      let value = '';
      let escaped = false;

      while (pos < len) {
        const c = input[pos]!;
        if (escaped) {
          value += c;
          escaped = false;
        } else if (c === '\\') {
          value += c;
          escaped = true;
        } else if (c === '"') {
          pos++;
          break;
        } else {
          value += c;
        }
        pos++;
      }

      tokens.push({ type: TokenType.String, value, position: start });
      continue;
    }

    // String (single quotes) - convert to double quotes
    if (char === "'") {
      const start = pos;
      pos++;
      let value = '';
      let escaped = false;

      while (pos < len) {
        const c = input[pos]!;
        if (escaped) {
          // Handle escaped characters
          if (c === "'") {
            value += "'"; // Escaped single quote becomes regular single quote
          } else if (c === '"') {
            value += '\\"'; // Escaped double quote stays escaped
          } else if (c === 'n') {
            value += '\\n'; // Keep escape sequences
          } else if (c === 'r') {
            value += '\\r';
          } else if (c === 't') {
            value += '\\t';
          } else if (c === '\\') {
            value += '\\\\'; // Escaped backslash
          } else {
            value += `\\${c}`; // Keep other escape sequences
          }
          escaped = false;
        } else if (c === '\\') {
          escaped = true;
        } else if (c === "'") {
          pos++;
          break;
        } else if (c === '"') {
          // Escape existing double quotes
          value += '\\"';
        } else if (c === '\n') {
          // Escape newlines
          value += '\\n';
        } else if (c === '\r') {
          value += '\\r';
        } else if (c === '\t') {
          value += '\\t';
        } else {
          value += c;
        }
        pos++;
      }

      tokens.push({ type: TokenType.String, value, position: start });
      continue;
    }

    // Numbers
    if (isDigit(char!) || char === '-' || char === '+' || char === '.') {
      const start = pos;
      let value = '';

      // Handle sign (skip + as JSON doesn't support it)
      if (char === '-') {
        value += char;
        pos++;
      } else if (char === '+') {
        pos++; // Skip the + sign
      }

      // Handle leading decimal point (.5 -> 0.5)
      if (pos < len && input[pos] === '.') {
        value += '0.';
        pos++;
      }

      // Collect digits and decimal point
      while (pos < len) {
        const c = input[pos]!;
        if (isDigit(c) || c === '.' || c === 'e' || c === 'E' || c === '+' || c === '-') {
          value += c;
          pos++;
        } else if (c === 'x' || c === 'X') {
          // Hex number (0xFF)
          value = '0';
          pos++;
          let hexValue = 0;
          while (pos < len) {
            const h = input[pos]!;
            if ((h >= '0' && h <= '9') || (h >= 'a' && h <= 'f') || (h >= 'A' && h <= 'F')) {
              hexValue = hexValue * 16 + Number.parseInt(h, 16);
              pos++;
            } else {
              break;
            }
          }
          value = String(hexValue);
          break;
        } else {
          break;
        }
      }

      tokens.push({ type: TokenType.Number, value, position: start });
      continue;
    }

    // Keywords and identifiers
    if (isIdentifierStart(char!)) {
      const start = pos;
      let value = '';

      while (pos < len && isIdentifierChar(input[pos]!)) {
        value += input[pos];
        pos++;
      }

      // Check for keywords
      if (value === 'true') {
        tokens.push({ type: TokenType.True, value: 'true', position: start });
      } else if (value === 'false') {
        tokens.push({ type: TokenType.False, value: 'false', position: start });
      } else if (value === 'null') {
        tokens.push({ type: TokenType.Null, value: 'null', position: start });
      } else if (value === 'undefined') {
        tokens.push({ type: TokenType.Null, value: 'null', position: start });
      } else if (value === 'Infinity') {
        tokens.push({ type: TokenType.String, value: 'Infinity', position: start });
      } else if (value === 'NaN') {
        tokens.push({ type: TokenType.String, value: 'NaN', position: start });
      } else {
        // Unquoted key - treat as string
        tokens.push({ type: TokenType.String, value, position: start });
      }
      continue;
    }

    // Structural characters
    switch (char) {
      case '{':
        tokens.push({ type: TokenType.ObjectStart, value: '{', position: pos });
        pos++;
        break;
      case '}':
        tokens.push({ type: TokenType.ObjectEnd, value: '}', position: pos });
        pos++;
        break;
      case '[':
        tokens.push({ type: TokenType.ArrayStart, value: '[', position: pos });
        pos++;
        break;
      case ']':
        tokens.push({ type: TokenType.ArrayEnd, value: ']', position: pos });
        pos++;
        break;
      case ':':
        tokens.push({ type: TokenType.Colon, value: ':', position: pos });
        pos++;
        break;
      case ',':
        tokens.push({ type: TokenType.Comma, value: ',', position: pos });
        pos++;
        break;
      default:
        throw new ParseError(`Unexpected character: ${char}`, pos);
    }
  }

  tokens.push({ type: TokenType.EOF, value: '', position: pos });
  return tokens;
}

/**
 * Reconstruct valid JSON from tokens
 */
function reconstructJSON(tokens: Token[]): string {
  let output = '';
  let pos = 0;

  const peek = (): Token => tokens[pos] || tokens[tokens.length - 1]!;
  const advance = (): Token => tokens[pos++]!;

  const parseValue = (): void => {
    const token = peek();

    switch (token.type) {
      case TokenType.String:
        output += `"${token.value}"`;
        advance();
        break;
      case TokenType.Number:
        output += token.value;
        advance();
        break;
      case TokenType.True:
        output += 'true';
        advance();
        break;
      case TokenType.False:
        output += 'false';
        advance();
        break;
      case TokenType.Null:
        output += 'null';
        advance();
        break;
      case TokenType.ObjectStart:
        parseObject();
        break;
      case TokenType.ArrayStart:
        parseArray();
        break;
      default:
        throw new ParseError(`Unexpected token: ${token.type}`, token.position);
    }
  };

  const parseObject = (): void => {
    advance(); // consume {
    output += '{';

    let first = true;

    while (peek().type !== TokenType.ObjectEnd && peek().type !== TokenType.EOF) {
      // Skip trailing comma
      if (peek().type === TokenType.Comma) {
        advance();
        if (peek().type === TokenType.ObjectEnd) {
          break;
        }
      }

      if (!first) {
        output += ',';
      }
      first = false;

      // Key (must be string)
      const keyToken = advance();
      if (keyToken.type !== TokenType.String) {
        throw new ParseError(`Expected string key, got ${keyToken.type}`, keyToken.position);
      }
      output += `"${keyToken.value}"`;

      // Colon
      const colon = advance();
      if (colon.type !== TokenType.Colon) {
        throw new ParseError(`Expected colon, got ${colon.type}`, colon.position);
      }
      output += ':';

      // Value
      parseValue();
    }

    if (peek().type !== TokenType.ObjectEnd) {
      throw new ParseError('Expected }', peek().position);
    }
    advance(); // consume }
    output += '}';
  };

  const parseArray = (): void => {
    advance(); // consume [
    output += '[';

    let first = true;

    while (peek().type !== TokenType.ArrayEnd && peek().type !== TokenType.EOF) {
      // Skip trailing comma
      if (peek().type === TokenType.Comma) {
        advance();
        if (peek().type === TokenType.ArrayEnd) {
          break;
        }
      }

      if (!first) {
        output += ',';
      }
      first = false;

      parseValue();
    }

    if (peek().type !== TokenType.ArrayEnd) {
      throw new ParseError('Expected ]', peek().position);
    }
    advance(); // consume ]
    output += ']';
  };

  parseValue();

  return output;
}
