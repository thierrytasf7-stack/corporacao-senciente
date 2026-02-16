/**
 * String utility functions for common text transformations.
 *
 * @module string-utils
 */

/**
 * Capitalizes the first letter of a string, leaving the rest unchanged.
 *
 * @param str - The input string to capitalize.
 * @returns A new string with the first character converted to uppercase.
 *
 * @example
 * ```ts
 * capitalize('hello'); // 'Hello'
 * capitalize('already Capitalized'); // 'Already Capitalized'
 * ```
 */
export const capitalize = (str: string): string => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts a string to a URL-friendly slug.
 *
 * Transformations applied:
 * - Trims leading/trailing whitespace
 * - Converts to lowercase
 * - Replaces spaces and consecutive whitespace with a single hyphen
 * - Removes all characters that are not alphanumeric or hyphens
 * - Collapses consecutive hyphens into one
 * - Strips leading and trailing hyphens
 *
 * @param str - The input string to slugify.
 * @returns A URL-safe slug derived from the input string.
 *
 * @example
 * ```ts
 * slugify('Hello World!'); // 'hello-world'
 * slugify('  My Blog Post #1  '); // 'my-blog-post-1'
 * ```
 */
export const slugify = (str: string): string => {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Truncates a string to a maximum length and appends a suffix when truncation occurs.
 *
 * If the string length is less than or equal to {@link maxLen}, the original string
 * is returned unchanged. Otherwise, the string is cut so that the visible portion
 * plus the suffix together do not exceed {@link maxLen}.
 *
 * @param str - The input string to truncate.
 * @param maxLen - The maximum allowed length of the returned string (including suffix).
 * @param suffix - The string appended when truncation occurs. Defaults to `'...'`.
 * @returns The original string if it fits, or a truncated version with the suffix appended.
 *
 * @example
 * ```ts
 * truncate('Hello, World!', 10); // 'Hello, ...'
 * truncate('Short', 10); // 'Short'
 * truncate('Overflow text', 8, '~'); // 'Overflo~'
 * ```
 */
export const truncate = (str: string, maxLen: number, suffix: string = '...'): string => {
  if (str.length <= maxLen) return str;
  const cutLength = maxLen - suffix.length;
  if (cutLength <= 0) return suffix.slice(0, maxLen);
  return str.slice(0, cutLength) + suffix;
};

/**
 * Counts the number of words in a string.
 *
 * Words are defined as contiguous sequences of non-whitespace characters.
 * Leading, trailing, and multiple consecutive whitespace characters are handled
 * gracefully. An empty or whitespace-only string returns `0`.
 *
 * @param str - The input string in which to count words.
 * @returns The number of words found in the string.
 *
 * @example
 * ```ts
 * countWords('Hello World'); // 2
 * countWords('  spaced   out  '); // 2
 * countWords(''); // 0
 * ```
 */
export const countWords = (str: string): number => {
  const trimmed = str.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
};

/**
 * Reverses the order of words in a string while preserving each word's characters.
 *
 * Words are split on whitespace boundaries. Multiple consecutive spaces are
 * collapsed into a single space in the result, and leading/trailing whitespace
 * is removed.
 *
 * @param str - The input string whose words should be reversed.
 * @returns A new string with the word order reversed.
 *
 * @example
 * ```ts
 * reverseWords('Hello World'); // 'World Hello'
 * reverseWords('one two three'); // 'three two one'
 * ```
 */
export const reverseWords = (str: string): string => {
  return str.trim().split(/\s+/).reverse().join(' ');
};

// =============================================================================
// TEST CASES
// =============================================================================
//
// ----- capitalize -----
//
// console.assert(capitalize('hello') === 'Hello', 'capitalize: basic lowercase word');
// console.assert(capitalize('') === '', 'capitalize: empty string returns empty');
// console.assert(capitalize('a') === 'A', 'capitalize: single character');
// console.assert(capitalize('HELLO') === 'HELLO', 'capitalize: already uppercase stays unchanged');
// console.assert(capitalize('hello world') === 'Hello world', 'capitalize: only first char is affected');
//
// ----- slugify -----
//
// console.assert(slugify('Hello World!') === 'hello-world', 'slugify: basic phrase with punctuation');
// console.assert(slugify('  My Blog Post #1  ') === 'my-blog-post-1', 'slugify: trimming and special chars');
// console.assert(slugify('---leading---trailing---') === 'leading-trailing', 'slugify: strips surrounding hyphens');
// console.assert(slugify('') === '', 'slugify: empty string returns empty');
// console.assert(slugify('already-a-slug') === 'already-a-slug', 'slugify: valid slug passes through unchanged');
//
// ----- truncate -----
//
// console.assert(truncate('Hello, World!', 10) === 'Hello, ...', 'truncate: basic truncation with default suffix');
// console.assert(truncate('Short', 10) === 'Short', 'truncate: no truncation needed');
// console.assert(truncate('Overflow text', 8, '~') === 'Overflo~', 'truncate: custom single-char suffix');
// console.assert(truncate('Tiny', 2) === '..', 'truncate: maxLen smaller than suffix returns partial suffix');
// console.assert(truncate('Exact len', 9) === 'Exact len', 'truncate: exact boundary returns original');
//
// ----- countWords -----
//
// console.assert(countWords('Hello World') === 2, 'countWords: two simple words');
// console.assert(countWords('') === 0, 'countWords: empty string returns 0');
// console.assert(countWords('   ') === 0, 'countWords: whitespace-only returns 0');
// console.assert(countWords('one') === 1, 'countWords: single word');
// console.assert(countWords('  multiple   spaces   here  ') === 3, 'countWords: irregular spacing');
//
// ----- reverseWords -----
//
// console.assert(reverseWords('Hello World') === 'World Hello', 'reverseWords: two words swap');
// console.assert(reverseWords('one two three') === 'three two one', 'reverseWords: three words reversed');
// console.assert(reverseWords('solo') === 'solo', 'reverseWords: single word unchanged');
// console.assert(reverseWords('  spaced   out  ') === 'out spaced', 'reverseWords: trims and collapses spaces');
// console.assert(reverseWords('') === '', 'reverseWords: empty string returns empty');
