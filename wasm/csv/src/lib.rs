//! WASM-accelerated CSV parser and serializer
//!
//! This module provides high-performance CSV processing using Rust compiled to WASM.
//! It handles RFC 4180 compliant CSV with:
//! - Quoted fields with commas, newlines, and quotes
//! - Different delimiters (comma, semicolon, tab, pipe)
//! - Type conversion (numbers, booleans)
//! - Header row support

use wasm_bindgen::prelude::*;
use serde_json::{json, Value};

/// Parse CSV string to JSON array
///
/// Returns a JSON string representing an array of objects (with header)
/// or an array of arrays (without header).
///
/// # Arguments
/// * `input` - CSV string to parse
/// * `delimiter` - Field delimiter (default: ',')
/// * `has_header` - Whether first row is header (default: true)
/// * `convert_types` - Convert strings to numbers/booleans (default: true)
#[wasm_bindgen]
pub fn parse_csv(
    input: &str,
    delimiter: Option<char>,
    has_header: Option<bool>,
    convert_types: Option<bool>,
) -> Result<String, JsValue> {
    let delimiter = delimiter.unwrap_or(',');
    let has_header = has_header.unwrap_or(true);
    let convert_types = convert_types.unwrap_or(true);

    parse_csv_internal(input, delimiter, has_header, convert_types)
        .map_err(|e| JsValue::from_str(&e))
}

/// Stringify JSON array to CSV string
///
/// Takes a JSON string (array of objects or array of arrays) and returns CSV.
///
/// # Arguments
/// * `json_input` - JSON string to stringify
/// * `delimiter` - Field delimiter (default: ',')
/// * `include_header` - Whether to include header row (default: true)
/// * `quote_all` - Quote all fields (default: false)
#[wasm_bindgen]
pub fn stringify_csv(
    json_input: &str,
    delimiter: Option<char>,
    include_header: Option<bool>,
    quote_all: Option<bool>,
) -> Result<String, JsValue> {
    let delimiter = delimiter.unwrap_or(',');
    let include_header = include_header.unwrap_or(true);
    let quote_all = quote_all.unwrap_or(false);

    let data: Value = serde_json::from_str(json_input)
        .map_err(|e| JsValue::from_str(&format!("Invalid JSON: {}", e)))?;

    stringify_csv_internal(&data, delimiter, include_header, quote_all)
        .map_err(|e| JsValue::from_str(&e))
}

// ============================================================================
// Internal Implementation
// ============================================================================

fn parse_csv_internal(
    input: &str,
    delimiter: char,
    has_header: bool,
    convert_types: bool,
) -> Result<String, String> {
    let mut lines = Vec::new();
    let mut current_line = Vec::new();
    let mut current_field = String::new();
    let mut in_quotes = false;
    let mut chars = input.chars().peekable();

    // Parse all rows
    while let Some(ch) = chars.next() {
        if in_quotes {
            if ch == '"' {
                // Check for escaped quote (doubled quotes)
                if chars.peek() == Some(&'"') {
                    current_field.push('"');
                    chars.next();
                } else {
                    in_quotes = false;
                }
            } else {
                current_field.push(ch);
            }
        } else {
            match ch {
                '"' => in_quotes = true,
                c if c == delimiter => {
                    current_line.push(current_field.clone());
                    current_field.clear();
                }
                '\n' => {
                    current_line.push(current_field.clone());
                    current_field.clear();
                    if !current_line.is_empty() {
                        lines.push(current_line.clone());
                        current_line.clear();
                    }
                }
                '\r' => {
                    // Handle CRLF
                    if chars.peek() == Some(&'\n') {
                        chars.next();
                    }
                    current_line.push(current_field.clone());
                    current_field.clear();
                    if !current_line.is_empty() {
                        lines.push(current_line.clone());
                        current_line.clear();
                    }
                }
                _ => current_field.push(ch),
            }
        }
    }

    // Handle last field and line
    if !current_field.is_empty() || !current_line.is_empty() {
        current_line.push(current_field);
        if !current_line.is_empty() {
            lines.push(current_line);
        }
    }

    if lines.is_empty() {
        return Ok("[]".to_string());
    }

    // Convert to JSON
    let result = if has_header {
        // Array of objects
        let header = &lines[0];
        let data_rows = &lines[1..];

        let objects: Vec<Value> = data_rows
            .iter()
            .map(|row| {
                let mut obj = serde_json::Map::new();
                for (i, value) in row.iter().enumerate() {
                    let key = header.get(i).map(|s| s.as_str()).unwrap_or("");
                    let converted_value = if convert_types {
                        convert_value(value)
                    } else {
                        Value::String(value.clone())
                    };
                    obj.insert(key.to_string(), converted_value);
                }
                Value::Object(obj)
            })
            .collect();

        json!(objects)
    } else {
        // Array of arrays
        let arrays: Vec<Value> = lines
            .iter()
            .map(|row| {
                let arr: Vec<Value> = row
                    .iter()
                    .map(|v| {
                        if convert_types {
                            convert_value(v)
                        } else {
                            Value::String(v.clone())
                        }
                    })
                    .collect();
                json!(arr)
            })
            .collect();

        json!(arrays)
    };

    serde_json::to_string(&result).map_err(|e| format!("Serialization error: {}", e))
}

fn convert_value(s: &str) -> Value {
    // Try to parse as number
    if let Ok(num) = s.parse::<i64>() {
        return json!(num);
    }
    if let Ok(num) = s.parse::<f64>() {
        return json!(num);
    }

    // Try to parse as boolean
    match s {
        "true" => return json!(true),
        "false" => return json!(false),
        _ => {}
    }

    // Empty string
    if s.is_empty() {
        return Value::String(String::new());
    }

    // Return as string
    Value::String(s.to_string())
}

fn stringify_csv_internal(
    data: &Value,
    delimiter: char,
    include_header: bool,
    quote_all: bool,
) -> Result<String, String> {
    let array = data.as_array().ok_or("Input must be an array")?;

    if array.is_empty() {
        return Ok(String::new());
    }

    let mut output = String::new();

    // Check if first element is an object or array
    if let Some(first) = array.first() {
        if first.is_object() {
            // Array of objects
            let objects: Vec<&serde_json::Map<String, Value>> = array
                .iter()
                .filter_map(|v| v.as_object())
                .collect();

            if objects.is_empty() {
                return Ok(String::new());
            }

            // Collect all unique keys
            let mut columns: Vec<String> = Vec::new();
            for obj in &objects {
                for key in obj.keys() {
                    if !columns.contains(key) {
                        columns.push(key.clone());
                    }
                }
            }

            // Write header
            if include_header {
                for (i, col) in columns.iter().enumerate() {
                    if i > 0 {
                        output.push(delimiter);
                    }
                    output.push_str(&serialize_field(col, delimiter, quote_all));
                }
                output.push('\n');
            }

            // Write data rows
            for obj in objects {
                for (i, col) in columns.iter().enumerate() {
                    if i > 0 {
                        output.push(delimiter);
                    }
                    let value = obj.get(col);
                    let field = value_to_string(value);
                    output.push_str(&serialize_field(&field, delimiter, quote_all));
                }
                output.push('\n');
            }
        } else if first.is_array() {
            // Array of arrays
            for row in array {
                let arr = row.as_array().ok_or("Row must be an array")?;
                for (i, value) in arr.iter().enumerate() {
                    if i > 0 {
                        output.push(delimiter);
                    }
                    let field = value_to_string(Some(value));
                    output.push_str(&serialize_field(&field, delimiter, quote_all));
                }
                output.push('\n');
            }
        } else {
            return Err("Array elements must be objects or arrays".to_string());
        }
    }

    // Remove trailing newline
    if output.ends_with('\n') {
        output.pop();
    }

    Ok(output)
}

fn value_to_string(value: Option<&Value>) -> String {
    match value {
        Some(Value::String(s)) => s.clone(),
        Some(Value::Number(n)) => n.to_string(),
        Some(Value::Bool(b)) => b.to_string(),
        Some(Value::Null) | None => String::new(),
        Some(v) => v.to_string(),
    }
}

fn serialize_field(field: &str, delimiter: char, quote_all: bool) -> String {
    let needs_quotes = quote_all
        || field.contains(delimiter)
        || field.contains('"')
        || field.contains('\n')
        || field.contains('\r');

    if needs_quotes {
        let escaped = field.replace('"', "\"\"");
        format!("\"{}\"", escaped)
    } else {
        field.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_csv() {
        let csv = "name,age\nAlice,30\nBob,25";
        let result = parse_csv(csv, None, None, None).unwrap();
        assert!(result.contains("Alice"));
        assert!(result.contains("30"));
    }

    #[test]
    fn test_parse_quoted_fields() {
        let csv = "name,address\nAlice,\"123 Main St, NYC\"";
        let result = parse_csv(csv, None, None, None).unwrap();
        assert!(result.contains("123 Main St, NYC"));
    }

    #[test]
    fn test_stringify_simple() {
        let json = r#"[{"name":"Alice","age":30}]"#;
        let result = stringify_csv(json, None, None, None).unwrap();
        assert!(result.contains("name,age"));
        assert!(result.contains("Alice,30"));
    }
}
