//! SIMD-accelerated structural character detection
//!
//! This module implements simdjson-style parallel scanning for JSON structural characters.
//! It uses WASM SIMD128 instructions to process 16 bytes at a time, identifying
//! structural characters ({, }, [, ], :, ,, ", ') in parallel.

#[cfg(target_arch = "wasm32")]
use std::arch::wasm32::*;

/// Find all structural character positions using SIMD
///
/// Processes input 16 bytes at a time using WASM SIMD instructions.
/// Returns a vector of positions where structural characters are found.
#[cfg(target_arch = "wasm32")]
pub fn find_structural_positions_simd(input: &[u8]) -> Vec<usize> {
    let len = input.len();
    let mut positions = Vec::with_capacity(len / 8); // Estimate: ~12% of chars are structural

    let mut i = 0;

    // Process 16-byte chunks with SIMD
    while i + 16 <= len {
        unsafe {
            // Load 16 bytes
            let chunk_ptr = input.as_ptr().add(i);
            let chunk = v128_load(chunk_ptr as *const v128);

            // Find structural characters in parallel
            let mask = find_structural_mask(chunk);

            // Extract positions from bitmask
            for bit in 0..16 {
                if (mask & (1 << bit)) != 0 {
                    positions.push(i + bit);
                }
            }
        }

        i += 16;
    }

    // Handle remaining bytes (fallback to scalar)
    while i < len {
        if is_structural_char(input[i]) {
            positions.push(i);
        }
        i += 1;
    }

    positions
}

/// Find structural characters in a 16-byte SIMD vector
///
/// Returns a bitmask where each bit indicates if the corresponding byte
/// is a structural character.
#[cfg(target_arch = "wasm32")]
#[inline(always)]
unsafe fn find_structural_mask(chunk: v128) -> u16 {
    // Create comparison vectors for each structural character
    let brace_open = i8x16_eq(chunk, i8x16_splat(b'{' as i8));
    let brace_close = i8x16_eq(chunk, i8x16_splat(b'}' as i8));
    let bracket_open = i8x16_eq(chunk, i8x16_splat(b'[' as i8));
    let bracket_close = i8x16_eq(chunk, i8x16_splat(b']' as i8));
    let colon = i8x16_eq(chunk, i8x16_splat(b':' as i8));
    let comma = i8x16_eq(chunk, i8x16_splat(b',' as i8));
    let quote = i8x16_eq(chunk, i8x16_splat(b'"' as i8));
    let single_quote = i8x16_eq(chunk, i8x16_splat(b'\'' as i8));

    // Combine all masks with OR operations
    let structural1 = v128_or(
        v128_or(brace_open, brace_close),
        v128_or(bracket_open, bracket_close),
    );
    let structural2 = v128_or(
        v128_or(colon, comma),
        v128_or(quote, single_quote),
    );
    let structural = v128_or(structural1, structural2);

    // Extract bitmask
    i8x16_bitmask(structural)
}

/// Fallback for non-WASM targets
#[cfg(not(target_arch = "wasm32"))]
pub fn find_structural_positions_simd(input: &[u8]) -> Vec<usize> {
    find_structural_positions_scalar(input)
}

/// Scalar fallback implementation
pub fn find_structural_positions_scalar(input: &[u8]) -> Vec<usize> {
    let mut positions = Vec::with_capacity(input.len() / 8);

    for (i, &byte) in input.iter().enumerate() {
        if is_structural_char(byte) {
            positions.push(i);
        }
    }

    positions
}

/// Check if a byte is a structural character
#[inline(always)]
fn is_structural_char(byte: u8) -> bool {
    matches!(
        byte,
        b'{' | b'}' | b'[' | b']' | b':' | b',' | b'"' | b'\''
    )
}

/// Structural character type
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StructType {
    BraceOpen,      // {
    BraceClose,     // }
    BracketOpen,    // [
    BracketClose,   // ]
    Colon,          // :
    Comma,          // ,
    Quote,          // "
    SingleQuote,    // '
}

impl StructType {
    /// Get the structural type from a byte
    #[inline]
    pub fn from_byte(byte: u8) -> Option<Self> {
        match byte {
            b'{' => Some(StructType::BraceOpen),
            b'}' => Some(StructType::BraceClose),
            b'[' => Some(StructType::BracketOpen),
            b']' => Some(StructType::BracketClose),
            b':' => Some(StructType::Colon),
            b',' => Some(StructType::Comma),
            b'"' => Some(StructType::Quote),
            b'\'' => Some(StructType::SingleQuote),
            _ => None,
        }
    }
}

/// Structural index for fast token extraction
pub struct StructuralIndex {
    pub positions: Vec<usize>,
    pub types: Vec<StructType>,
}

impl StructuralIndex {
    /// Build structural index from input
    pub fn build(input: &[u8]) -> Self {
        let positions = find_structural_positions_simd(input);
        let types = positions
            .iter()
            .filter_map(|&pos| StructType::from_byte(input[pos]))
            .collect();

        StructuralIndex { positions, types }
    }

    /// Get the number of structural characters
    #[inline]
    pub fn len(&self) -> usize {
        self.positions.len()
    }

    /// Check if index is empty
    #[inline]
    pub fn is_empty(&self) -> bool {
        self.positions.is_empty()
    }

    /// Get position and type at index
    #[inline]
    pub fn get(&self, index: usize) -> Option<(usize, StructType)> {
        if index < self.len() {
            Some((self.positions[index], self.types[index]))
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_find_structural_positions() {
        let input = br#"{"name":"alice","age":30}"#;
        let positions = find_structural_positions_simd(input);

        // Should find: { " : " , " : } = 10 structural chars
        assert_eq!(positions.len(), 10);
        assert_eq!(input[positions[0]], b'{');
        assert_eq!(input[positions[1]], b'"');
        assert_eq!(input[positions[9]], b'}');
    }

    #[test]
    fn test_structural_index() {
        let input = br#"{"key":"value"}"#;
        let index = StructuralIndex::build(input);

        assert_eq!(index.len(), 6); // { " : " }
        assert_eq!(index.types[0], StructType::BraceOpen);
        assert_eq!(index.types[5], StructType::BraceClose);
    }

    #[test]
    fn test_is_structural_char() {
        assert!(is_structural_char(b'{'));
        assert!(is_structural_char(b'}'));
        assert!(is_structural_char(b'"'));
        assert!(is_structural_char(b'\''));
        assert!(!is_structural_char(b'a'));
        assert!(!is_structural_char(b'1'));
    }
}
