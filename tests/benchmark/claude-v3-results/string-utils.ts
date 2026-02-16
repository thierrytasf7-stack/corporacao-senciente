/**
 * String utility functions for common text transformations.
 * @module string-utils
 */

/**
 * Capitalizes the first letter of a string, leaving the rest unchanged.
 *
 * @param str - The input string to capitalize.
 * @returns A new string with the first character uppercased.
 *
 * @example
 * ```ts
 * capitalize('hello');   // 'Hello'
 * capitalize('');        // ''
 * capitalize('A');       // 'A'
 * ```
 */
export const capitalize = (str: string): string => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts a string to a URL-friendly slug (kebab-case).
 *
 * Trims whitespace, lowercases, replaces spaces with hyphens,
 * removes non-alphanumeric characters, collapses consecutive hyphens,
 * and strips leading/trailing hyphens.
 *
 * @param str - The input string to slugify.
 * @returns A URL-safe slug.
 *
 * @example
 * ```ts
 * slugify('Hello World!');        // 'hello-world'
 * slugify('  My Post #1  ');      // 'my-post-1'
 * slugify('---already---bad---'); // 'already-bad'
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
 * Truncates a string to a maximum length, appending a suffix when truncated.
 *
 * The suffix is included in the maxLen count. If the string fits within
 * maxLen, it is returned unchanged. If maxLen is smaller than the suffix,
 * the suffix itself is truncated to maxLen.
 *
 * @param str - The input string to truncate.
 * @param maxLen - Maximum allowed length of the returned string (including suffix).
 * @param suffix - String appended when truncation occurs. Defaults to `'...'`.
 * @returns The original or truncated string.
 *
 * @example
 * ```ts
 * truncate('Hello World!', 8);       // 'Hello...'
 * truncate('Short', 10);             // 'Short'
 * truncate('Overflow', 6, '~');      // 'Overf~'
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
 * Words are contiguous sequences of non-whitespace characters.
 * Returns 0 for empty or whitespace-only strings.
 *
 * @param str - The input string.
 * @returns The number of words.
 *
 * @example
 * ```ts
 * countWords('Hello World');     // 2
 * countWords('  spaced  out '); // 2
 * countWords('');                // 0
 * ```
 */
export const countWords = (str: string): number => {
  const trimmed = str.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
};

/**
 * Reverses the order of words in a string.
 *
 * Trims and collapses whitespace. Each word's characters are preserved.
 *
 * @param str - The input string.
 * @returns A new string with word order reversed.
 *
 * @example
 * ```ts
 * reverseWords('Hello World');  // 'World Hello'
 * reverseWords('a b c');        // 'c b a'
 * ```
 */
export const reverseWords = (str: string): string => {
  const trimmed = str.trim();
  if (trimmed.length === 0) return '';
  return trimmed.split(/\s+/).reverse().join(' ');
};

// =============================================================================
// TEST CASES
// =============================================================================
//
// --- capitalize ---
// console.assert(capitalize('hello') === 'Hello', 'capitalize: basic word');
// console.assert(capitalize('') === '', 'capitalize: empty string');
// console.assert(capitalize('a') === 'A', 'capitalize: single char');
// console.assert(capitalize('HELLO') === 'HELLO', 'capitalize: already uppercase');
// console.assert(capitalize('hello world') === 'Hello world', 'capitalize: only first char');
//
// --- slugify ---
// console.assert(slugify('Hello World!') === 'hello-world', 'slugify: basic');
// console.assert(slugify('  My Post #1  ') === 'my-post-1', 'slugify: trim + special');
// console.assert(slugify('---bad---') === 'bad', 'slugify: strip hyphens');
// console.assert(slugify('') === '', 'slugify: empty string');
// console.assert(slugify('already-slug') === 'already-slug', 'slugify: passthrough');
//
// --- truncate ---
// console.assert(truncate('Hello World!', 8) === 'Hello...', 'truncate: suffix in maxLen');
// console.assert(truncate('Short', 10) === 'Short', 'truncate: no truncation');
// console.assert(truncate('Overflow', 6, '~') === 'Overf~', 'truncate: custom suffix');
// console.assert(truncate('Tiny', 2) === '..', 'truncate: maxLen < suffix');
// console.assert(truncate('Exact', 5) === 'Exact', 'truncate: exact boundary');
//
// --- countWords ---
// console.assert(countWords('Hello World') === 2, 'countWords: two words');
// console.assert(countWords('') === 0, 'countWords: empty string');
// console.assert(countWords('   ') === 0, 'countWords: whitespace only');
// console.assert(countWords('one') === 1, 'countWords: single word');
// console.assert(countWords('  a  b  c  ') === 3, 'countWords: extra spaces');
//
// --- reverseWords ---
// console.assert(reverseWords('Hello World') === 'World Hello', 'reverseWords: two words');
// console.assert(reverseWords('a b c') === 'c b a', 'reverseWords: three words');
// console.assert(reverseWords('solo') === 'solo', 'reverseWords: single word');
// console.assert(reverseWords('') === '', 'reverseWords: empty');
// console.assert(reverseWords('  x  y  ') === 'y x', 'reverseWords: trim + collapse');
