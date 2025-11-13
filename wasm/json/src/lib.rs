//! WASM-accelerated dirty JSON cleaner and parser
//!
//! This module provides ultra-fast dirty JSON cleaning using Rust compiled to WASM.
//! It can handle malformed JSON with:
//! - Unquoted object keys
//! - Single quotes for strings
//! - JavaScript-style comments (// and /* */)
//! - Trailing commas in objects and arrays

mod simd;
mod two_stage;

use molt_core::*;
use wasm_bindgen::prelude::*;

/// High-performance dirty JSON cleaner
///
/// This function takes malformed JSON and returns valid JSON.
/// It uses a state machine approach for maximum performance.
#[wasm_bindgen]
pub fn clean_dirty_json(input: &str) -> Result<String, JsValue> {
    clean_dirty_json_internal(input)
        .map_err(|e| JsValue::from_str(&e.message))
}

/// SIMD-accelerated dirty JSON cleaner (v2)
///
/// Uses two-stage parsing with SIMD structural indexing for better performance.
/// Stage 1: Build structural character index using SIMD (3-5x faster)
/// Stage 2: Extract tokens from index (minimal branching)
#[wasm_bindgen]
pub fn clean_dirty_json_simd(input: &str) -> Result<String, JsValue> {
    two_stage::parse_two_stage(input)
        .map(|tokens| reconstruct_json(&tokens))
        .map_err(|e| JsValue::from_str(&e.message))
}

fn clean_dirty_json_internal(input: &str) -> Result<String, ParseError> {
    let tokens = tokenize(input)?;
    let json = reconstruct_json(&tokens);
    Ok(json)
}

/// Tokenize dirty JSON input (optimized)
fn tokenize(input: &str) -> Result<Vec<Token>, ParseError> {
    let bytes = input.as_bytes();
    let len = bytes.len();

    // Pre-allocate tokens vector based on input size heuristic
    // Typically ~1 token per 10 characters for JSON
    let estimated_tokens = (len / 10).max(16);
    let mut tokens = Vec::with_capacity(estimated_tokens);
    let mut pos = 0;

    while pos < len {
        // Skip whitespace and comments
        pos = skip_whitespace_and_comments(input, pos);
        if pos >= len {
            break;
        }

        let c = bytes[pos] as char;
        let start = pos;

        // String literals (double or single quotes) - optimized
        if c == '"' || c == '\'' {
            let quote = c;
            pos += 1;
            let string_start = pos;
            let mut escaped = false;

            // First pass: find string end
            while pos < len {
                let ch = bytes[pos] as char;
                if escaped {
                    escaped = false;
                } else if ch == '\\' {
                    escaped = true;
                } else if ch == quote {
                    break;
                }
                pos += 1;
            }

            // Extract string slice and build value only if needed
            let string_slice = &input[string_start..pos];
            let value = if string_slice.contains('\\') {
                // Has escapes, need to process
                let mut processed = String::with_capacity(string_slice.len());
                let mut chars = string_slice.chars();
                let mut escaped = false;

                while let Some(ch) = chars.next() {
                    if escaped {
                        processed.push(ch);
                        escaped = false;
                    } else if ch == '\\' {
                        processed.push(ch);
                        escaped = true;
                    } else {
                        processed.push(ch);
                    }
                }
                processed
            } else {
                // No escapes, use slice directly
                string_slice.to_string()
            };

            pos += 1; // Skip closing quote
            tokens.push(Token::new(TokenType::String, value, start, pos));
            continue;
        }

        // Numbers (including hex)
        if is_digit(c) || c == '-' || c == '+' || c == '.' {
            let mut value = String::new();

            // Skip leading +
            if c == '+' {
                pos += 1;
                if pos >= len {
                    return Err(ParseError::new("Unexpected end after +", pos));
                }
            } else {
                value.push(c);
                pos += 1;
            }

            // Hex numbers
            if pos < len && value == "0" && bytes[pos] == b'x' {
                value.push('x');
                pos += 1;

                let hex_start = pos;
                while pos < len {
                    let ch = bytes[pos] as char;
                    if ch.is_ascii_hexdigit() {
                        value.push(ch);
                        pos += 1;
                    } else {
                        break;
                    }
                }

                if pos == hex_start {
                    return Err(ParseError::new("Invalid hex number", start));
                }

                // Convert hex to decimal
                if let Ok(hex_val) = u64::from_str_radix(&value[2..], 16) {
                    value = hex_val.to_string();
                }
            } else {
                // Regular numbers
                while pos < len {
                    let ch = bytes[pos] as char;
                    if is_digit(ch) || ch == '.' || ch == 'e' || ch == 'E' || ch == '+' || ch == '-' {
                        value.push(ch);
                        pos += 1;
                    } else {
                        break;
                    }
                }
            }

            tokens.push(Token::new(TokenType::Number, value, start, pos));
            continue;
        }

        // Identifiers and keywords
        if is_identifier_start(c) {
            let mut value = String::new();
            while pos < len && is_identifier_char(bytes[pos] as char) {
                value.push(bytes[pos] as char);
                pos += 1;
            }

            let token_type = match value.as_str() {
                "true" => TokenType::True,
                "false" => TokenType::False,
                "null" => TokenType::Null,
                _ => TokenType::Identifier,
            };

            tokens.push(Token::new(token_type, value, start, pos));
            continue;
        }

        // Single-character tokens
        let token_type = match c {
            '{' => TokenType::LeftBrace,
            '}' => TokenType::RightBrace,
            '[' => TokenType::LeftBracket,
            ']' => TokenType::RightBracket,
            ':' => TokenType::Colon,
            ',' => TokenType::Comma,
            _ => return Err(ParseError::new(format!("Unexpected character: {}", c), pos)),
        };

        pos += 1;
        tokens.push(Token::new(token_type, String::new(), start, pos));
    }

    tokens.push(Token::new(TokenType::EOF, String::new(), len, len));
    Ok(tokens)
}

/// Reconstruct valid JSON from tokens (optimized)
fn reconstruct_json(tokens: &[Token]) -> String {
    // Pre-allocate capacity based on estimated output size
    // Estimate: input size * 1.2 (accounting for quotes and escaping)
    let estimated_capacity = tokens.iter()
        .map(|t| t.value.len() + 4) // value + quotes/delimiters
        .sum::<usize>();
    let mut result = String::with_capacity(estimated_capacity);
    let mut i = 0;

    while i < tokens.len() {
        let token = &tokens[i];

        match token.token_type {
            TokenType::String => {
                // Always use double quotes
                result.push('"');
                // Escape any existing double quotes (optimized)
                let bytes = token.value.as_bytes();
                let mut last_escape = 0;

                for (idx, &byte) in bytes.iter().enumerate() {
                    if byte == b'"' {
                        // Check if already escaped
                        if idx == 0 || bytes[idx - 1] != b'\\' {
                            result.push_str(&token.value[last_escape..idx]);
                            result.push('\\');
                            result.push('"');
                            last_escape = idx + 1;
                        }
                    }
                }

                if last_escape < token.value.len() {
                    result.push_str(&token.value[last_escape..]);
                }
                result.push('"');
            }
            TokenType::Number => {
                result.push_str(&token.value);
            }
            TokenType::True => {
                result.push_str("true");
            }
            TokenType::False => {
                result.push_str("false");
            }
            TokenType::Null => {
                result.push_str("null");
            }
            TokenType::Identifier => {
                // Unquoted key - quote it
                result.push('"');
                result.push_str(&token.value);
                result.push('"');
            }
            TokenType::LeftBrace => {
                result.push('{');
            }
            TokenType::RightBrace => {
                // Remove trailing comma before closing brace (optimized)
                if let Some(&b',') = result.as_bytes().last() {
                    result.pop();
                }
                result.push('}');
            }
            TokenType::LeftBracket => {
                result.push('[');
            }
            TokenType::RightBracket => {
                // Remove trailing comma before closing bracket (optimized)
                if let Some(&b',') = result.as_bytes().last() {
                    result.pop();
                }
                result.push(']');
            }
            TokenType::Colon => {
                result.push(':');
            }
            TokenType::Comma => {
                // Only add comma if next token is not a closing bracket/brace
                if i + 1 < tokens.len() {
                    let next = &tokens[i + 1];
                    if !matches!(next.token_type,
                        TokenType::RightBrace | TokenType::RightBracket | TokenType::EOF)
                    {
                        result.push(',');
                    }
                }
            }
            TokenType::EOF => break,
        }

        i += 1;
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_simple_dirty_json() {
        let input = "{name: 'alice', age: 30}";
        let result = clean_dirty_json_internal(input).unwrap();
        assert_eq!(result, r#"{"name":"alice","age":30}"#);
    }

    #[test]
    fn test_clean_with_comments() {
        let input = r#"{
            // This is a comment
            name: "bob",
            /* Multi-line
               comment */
            age: 25
        }"#;
        let result = clean_dirty_json_internal(input).unwrap();
        assert!(result.contains(r#""name""#));
        assert!(result.contains(r#""bob""#));
    }

    #[test]
    fn test_clean_trailing_commas() {
        let input = r#"{"items": [1, 2, 3,], "total": 3,}"#;
        let result = clean_dirty_json_internal(input).unwrap();
        assert_eq!(result, r#"{"items":[1,2,3],"total":3}"#);
    }

    #[test]
    fn test_hex_numbers() {
        let input = r#"{"value": 0xFF}"#;
        let result = clean_dirty_json_internal(input).unwrap();
        assert_eq!(result, r#"{"value":255}"#);
    }
}
