//! Two-stage parsing implementation
//!
//! Stage 1: Build structural index using SIMD (simd.rs)
//! Stage 2: Extract tokens from structural index (this module)
//!
//! This approach minimizes branching and enables better CPU pipelining.

use molt_core::*;
use crate::simd::{StructuralIndex, StructType};

/// Parse dirty JSON using two-stage approach
pub fn parse_two_stage(input: &str) -> Result<Vec<Token>, ParseError> {
    // Stage 1: Build structural index (SIMD-accelerated)
    let index = StructuralIndex::build(input.as_bytes());

    // Stage 2: Extract tokens from index
    extract_tokens(input.as_bytes(), &index)
}

/// Extract tokens from structural index
fn extract_tokens(input: &[u8], index: &StructuralIndex) -> Result<Vec<Token>, ParseError> {
    let mut tokens = Vec::with_capacity(index.len());
    let mut i = 0;

    while i < index.len() {
        let (pos, typ) = index.get(i).unwrap();

        match typ {
            StructType::Quote | StructType::SingleQuote => {
                // Find matching closing quote
                let string_token = extract_string(input, index, i, typ)?;
                tokens.push(string_token.0);
                i = string_token.1; // Jump to position after closing quote
            }

            StructType::BraceOpen => {
                tokens.push(Token::new(
                    TokenType::LeftBrace,
                    String::new(),
                    pos,
                    pos + 1,
                ));
                i += 1;
            }

            StructType::BraceClose => {
                tokens.push(Token::new(
                    TokenType::RightBrace,
                    String::new(),
                    pos,
                    pos + 1,
                ));
                i += 1;
            }

            StructType::BracketOpen => {
                tokens.push(Token::new(
                    TokenType::LeftBracket,
                    String::new(),
                    pos,
                    pos + 1,
                ));
                i += 1;
            }

            StructType::BracketClose => {
                tokens.push(Token::new(
                    TokenType::RightBracket,
                    String::new(),
                    pos,
                    pos + 1,
                ));
                i += 1;
            }

            StructType::Colon => {
                tokens.push(Token::new(
                    TokenType::Colon,
                    String::new(),
                    pos,
                    pos + 1,
                ));
                i += 1;
            }

            StructType::Comma => {
                tokens.push(Token::new(
                    TokenType::Comma,
                    String::new(),
                    pos,
                    pos + 1,
                ));
                i += 1;
            }
        }

        // Extract non-structural tokens between structural characters
        if i < index.len() {
            let next_pos = index.positions[i];
            if next_pos > pos + 1 {
                // There's content between structural chars
                extract_value_tokens(input, pos + 1, next_pos, &mut tokens)?;
            }
        }
    }

    tokens.push(Token::new(TokenType::EOF, String::new(), input.len(), input.len()));
    Ok(tokens)
}

/// Extract string token from input
///
/// Finds the matching closing quote and extracts the string content.
/// Returns (token, next_index_position)
fn extract_string(
    input: &[u8],
    index: &StructuralIndex,
    start_idx: usize,
    quote_type: StructType,
) -> Result<(Token, usize), ParseError> {
    let start_pos = index.positions[start_idx];

    // Find matching closing quote
    let mut i = start_idx + 1;
    let mut escaped = false;

    while i < index.len() {
        let (pos, typ) = index.get(i).unwrap();

        // Check for escape sequences
        if pos > start_pos + 1 {
            let prev_byte = input[pos - 1];
            if prev_byte == b'\\' {
                // Check if the backslash itself is escaped
                let mut backslash_count = 0;
                let mut check_pos = pos - 1;
                while check_pos > start_pos && input[check_pos] == b'\\' {
                    backslash_count += 1;
                    if check_pos == 0 {
                        break;
                    }
                    check_pos -= 1;
                }
                escaped = backslash_count % 2 == 1;
            } else {
                escaped = false;
            }
        }

        // Found matching quote?
        if typ == quote_type && !escaped {
            // Extract string content
            let content_start = start_pos + 1;
            let content_end = pos;
            let value = String::from_utf8_lossy(&input[content_start..content_end]).to_string();

            return Ok((
                Token::new(TokenType::String, value, start_pos, pos + 1),
                i + 1,
            ));
        }

        i += 1;
    }

    Err(ParseError::new("Unterminated string", start_pos))
}

/// Extract value tokens (numbers, keywords, identifiers) between structural positions
fn extract_value_tokens(
    input: &[u8],
    start: usize,
    end: usize,
    tokens: &mut Vec<Token>,
) -> Result<(), ParseError> {
    let mut pos = start;

    // Skip whitespace and comments
    pos = skip_whitespace_and_comments_range(input, pos, end);

    if pos >= end {
        return Ok(());
    }

    let c = input[pos] as char;

    // Numbers
    if c.is_ascii_digit() || c == '-' || c == '+' || c == '.' {
        let mut value = String::new();

        // Skip leading +
        if c == '+' {
            pos += 1;
            if pos >= end {
                return Ok(());
            }
        } else {
            value.push(c);
            pos += 1;
        }

        // Hex numbers
        if pos < end && value == "0" && input[pos] == b'x' {
            value.push('x');
            pos += 1;

            let hex_start = pos;
            while pos < end && (input[pos] as char).is_ascii_hexdigit() {
                value.push(input[pos] as char);
                pos += 1;
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
            while pos < end {
                let ch = input[pos] as char;
                if ch.is_ascii_digit() || ch == '.' || ch == 'e' || ch == 'E' || ch == '+' || ch == '-' {
                    value.push(ch);
                    pos += 1;
                } else {
                    break;
                }
            }
        }

        tokens.push(Token::new(TokenType::Number, value, start, pos));
        return Ok(());
    }

    // Identifiers and keywords
    if c.is_alphabetic() || c == '_' || c == '$' {
        let mut value = String::new();
        while pos < end {
            let ch = input[pos] as char;
            if ch.is_alphanumeric() || ch == '_' || ch == '$' {
                value.push(ch);
                pos += 1;
            } else {
                break;
            }
        }

        let token_type = match value.as_str() {
            "true" => TokenType::True,
            "false" => TokenType::False,
            "null" => TokenType::Null,
            _ => TokenType::Identifier,
        };

        tokens.push(Token::new(token_type, value, start, pos));
    }

    Ok(())
}

/// Skip whitespace and comments in a range
fn skip_whitespace_and_comments_range(input: &[u8], start: usize, end: usize) -> usize {
    let mut pos = start;

    while pos < end {
        let c = input[pos];

        // Whitespace
        if c.is_ascii_whitespace() {
            pos += 1;
            continue;
        }

        // Single-line comments
        if c == b'/' && pos + 1 < end && input[pos + 1] == b'/' {
            pos += 2;
            while pos < end && input[pos] != b'\n' {
                pos += 1;
            }
            continue;
        }

        // Multi-line comments
        if c == b'/' && pos + 1 < end && input[pos + 1] == b'*' {
            pos += 2;
            while pos + 1 < end {
                if input[pos] == b'*' && input[pos + 1] == b'/' {
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
    fn test_parse_simple() {
        let input = r#"{"name":"alice","age":30}"#;
        let tokens = parse_two_stage(input).unwrap();

        assert!(!tokens.is_empty());
        // Should have: { " identifier " : " string " , " identifier " : number }
    }

    #[test]
    fn test_parse_with_comments() {
        let input = r#"{
            // Comment
            "name": "bob"
        }"#;
        let tokens = parse_two_stage(input).unwrap();
        assert!(!tokens.is_empty());
    }

    #[test]
    fn test_parse_dirty() {
        let input = "{ name: 'alice', age: 30, }";
        let tokens = parse_two_stage(input).unwrap();
        assert!(!tokens.is_empty());
    }
}
