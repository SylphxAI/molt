//! Shared parsing core for molt data transformation stack
//!
//! This crate provides high-performance parsing primitives that can be shared
//! across different data formats (JSON, XML, YAML, etc.)

use std::fmt;

/// Token type for parsers
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TokenType {
    String,
    Number,
    True,
    False,
    Null,
    LeftBrace,
    RightBrace,
    LeftBracket,
    RightBracket,
    Colon,
    Comma,
    Identifier,
    EOF,
}

/// A token with its type, value, and position
#[derive(Debug, Clone)]
pub struct Token {
    pub token_type: TokenType,
    pub value: String,
    pub start: usize,
    pub end: usize,
}

impl Token {
    pub fn new(token_type: TokenType, value: String, start: usize, end: usize) -> Self {
        Self {
            token_type,
            value,
            start,
            end,
        }
    }
}

/// Parse error with position information
#[derive(Debug, Clone)]
pub struct ParseError {
    pub message: String,
    pub position: usize,
}

impl ParseError {
    pub fn new(message: impl Into<String>, position: usize) -> Self {
        Self {
            message: message.into(),
            position,
        }
    }
}

impl fmt::Display for ParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Parse error at position {}: {}", self.position, self.message)
    }
}

impl std::error::Error for ParseError {}

/// Check if a character is whitespace
#[inline]
pub fn is_whitespace(c: char) -> bool {
    matches!(c, ' ' | '\t' | '\n' | '\r')
}

/// Check if a character is a digit
#[inline]
pub fn is_digit(c: char) -> bool {
    c.is_ascii_digit()
}

/// Check if a character can start an identifier
#[inline]
pub fn is_identifier_start(c: char) -> bool {
    c.is_ascii_alphabetic() || c == '_' || c == '$'
}

/// Check if a character can be part of an identifier
#[inline]
pub fn is_identifier_char(c: char) -> bool {
    c.is_ascii_alphanumeric() || c == '_' || c == '$'
}

/// Skip whitespace and comments
pub fn skip_whitespace_and_comments(input: &str, mut pos: usize) -> usize {
    let bytes = input.as_bytes();
    let len = bytes.len();

    while pos < len {
        let c = bytes[pos] as char;

        // Skip whitespace
        if is_whitespace(c) {
            pos += 1;
            continue;
        }

        // Skip single-line comments
        if c == '/' && pos + 1 < len && bytes[pos + 1] == b'/' {
            pos += 2;
            while pos < len && bytes[pos] != b'\n' {
                pos += 1;
            }
            continue;
        }

        // Skip multi-line comments
        if c == '/' && pos + 1 < len && bytes[pos + 1] == b'*' {
            pos += 2;
            while pos + 1 < len {
                if bytes[pos] == b'*' && bytes[pos + 1] == b'/' {
                    pos += 2;
                    break;
                }
                pos += 1;
            }
            continue;
        }

        break;
    }

    pos
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_whitespace() {
        assert!(is_whitespace(' '));
        assert!(is_whitespace('\t'));
        assert!(is_whitespace('\n'));
        assert!(is_whitespace('\r'));
        assert!(!is_whitespace('a'));
    }

    #[test]
    fn test_skip_whitespace() {
        assert_eq!(skip_whitespace_and_comments("   hello", 0), 3);
        assert_eq!(skip_whitespace_and_comments("\t\n\rhello", 0), 3);
        assert_eq!(skip_whitespace_and_comments("hello", 0), 0);
    }

    #[test]
    fn test_skip_comments() {
        assert_eq!(skip_whitespace_and_comments("// comment\nhello", 0), 11);
        assert_eq!(skip_whitespace_and_comments("/* comment */hello", 0), 13);
    }
}
