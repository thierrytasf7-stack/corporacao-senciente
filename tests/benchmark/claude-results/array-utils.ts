/**
 * Array utility functions for common operations on arrays.
 *
 * Provides generic, type-safe helpers for chunking, deduplication,
 * flattening, grouping, and set intersection.
 */

/**
 * Splits an array into smaller arrays (chunks) of a specified size.
 *
 * The last chunk may contain fewer elements than `size` if the array
 * length is not evenly divisible.
 *
 * @typeParam T - The type of elements in the array.
 * @param arr - The source array to split into chunks.
 * @param size - The maximum number of elements per chunk. Must be a positive integer.
 * @returns An array of chunks, where each chunk is an array of at most `size` elements.
 * @throws {RangeError} If `size` is less than or equal to zero.
 *
 * @example
 * ```ts
 * chunk([1, 2, 3, 4, 5], 2);
 * // => [[1, 2], [3, 4], [5]]
 * ```
 */
export const chunk = <T>(arr: T[], size: number): T[][] => {
  if (size <= 0) {
    throw new RangeError('Chunk size must be a positive integer.');
  }

  const result: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }

  return result;
};

/**
 * Returns a new array with duplicate values removed.
 *
 * Equality is determined using `Set` semantics (strict equality via SameValueZero),
 * which means `NaN` is considered equal to `NaN` and `-0` is equal to `+0`.
 *
 * @typeParam T - The type of elements in the array.
 * @param arr - The source array that may contain duplicates.
 * @returns A new array containing only the first occurrence of each unique value.
 *
 * @example
 * ```ts
 * unique([1, 2, 2, 3, 1, 4]);
 * // => [1, 2, 3, 4]
 * ```
 */
export const unique = <T>(arr: T[]): T[] => {
  return [...new Set(arr)];
};

/**
 * Flattens a nested array structure to the specified depth.
 *
 * By default, the array is fully flattened (depth = `Infinity`).
 * A depth of `0` returns a shallow copy without any flattening.
 *
 * @typeParam T - The expected element type of the resulting flat array.
 * @param arr - The nested array to flatten.
 * @param depth - The maximum recursion depth. Defaults to `Infinity` for full flattening.
 * @returns A new array with sub-array elements concatenated up to the specified depth.
 *
 * @example
 * ```ts
 * flatten([1, [2, [3, [4]]]], 2);
 * // => [1, 2, 3, [4]]
 *
 * flatten([1, [2, [3, [4]]]]);
 * // => [1, 2, 3, 4]
 * ```
 */
export const flatten = <T>(arr: unknown[], depth: number = Infinity): T[] => {
  const result: unknown[] = [];

  const recurse = (current: unknown[], currentDepth: number): void => {
    for (const item of current) {
      if (Array.isArray(item) && currentDepth > 0) {
        recurse(item, currentDepth - 1);
      } else {
        result.push(item);
      }
    }
  };

  recurse(arr, depth);
  return result as T[];
};

/**
 * Groups the elements of an array into a record keyed by the result of a
 * provided function.
 *
 * Each key in the returned record maps to an array of elements that produced
 * that key when passed through `keyFn`. The order of elements within each
 * group is preserved from the original array.
 *
 * @typeParam T - The type of elements in the array.
 * @param arr - The source array to group.
 * @param keyFn - A function that receives an element and returns the grouping key string.
 * @returns A record where each key maps to the array of elements that share that key.
 *
 * @example
 * ```ts
 * const people = [
 *   { name: 'Alice', dept: 'eng' },
 *   { name: 'Bob', dept: 'sales' },
 *   { name: 'Carol', dept: 'eng' },
 * ];
 * groupBy(people, (p) => p.dept);
 * // => { eng: [{ name: 'Alice', ... }, { name: 'Carol', ... }], sales: [{ name: 'Bob', ... }] }
 * ```
 */
export const groupBy = <T>(
  arr: T[],
  keyFn: (item: T) => string,
): Record<string, T[]> => {
  const result: Record<string, T[]> = {};

  for (const item of arr) {
    const key = keyFn(item);

    if (!(key in result)) {
      result[key] = [];
    }

    result[key].push(item);
  }

  return result;
};

/**
 * Returns the intersection of two arrays -- elements that appear in both.
 *
 * Duplicates are removed from the result. The order of elements in the
 * returned array follows their order in the first array `a`.
 *
 * Equality is determined using `Set` semantics (SameValueZero).
 *
 * @typeParam T - The type of elements in the arrays.
 * @param a - The first array.
 * @param b - The second array.
 * @returns A new array containing elements present in both `a` and `b`, deduplicated.
 *
 * @example
 * ```ts
 * intersect([1, 2, 3, 4], [3, 4, 5, 6]);
 * // => [3, 4]
 * ```
 */
export const intersect = <T>(a: T[], b: T[]): T[] => {
  const setB = new Set(b);
  return unique(a.filter((item) => setB.has(item)));
};

// =============================================================================
// TEST CASES
// =============================================================================
//
// The following test cases are commented out. Uncomment and run with a test
// runner (e.g., Jest, Vitest) or execute directly with ts-node / tsx to verify.
//
// ---------------------------------------------------------------------------
// chunk
// ---------------------------------------------------------------------------
//
// // Test 1: Evenly divisible array
// console.assert(
//   JSON.stringify(chunk([1, 2, 3, 4], 2)) === JSON.stringify([[1, 2], [3, 4]]),
//   'chunk: evenly divisible array should produce equal-sized chunks',
// );
//
// // Test 2: Array length not divisible by size -- last chunk is smaller
// console.assert(
//   JSON.stringify(chunk([1, 2, 3, 4, 5], 3)) === JSON.stringify([[1, 2, 3], [4, 5]]),
//   'chunk: remainder elements should form a smaller final chunk',
// );
//
// // Test 3: Size larger than array length returns single chunk
// console.assert(
//   JSON.stringify(chunk([1, 2], 10)) === JSON.stringify([[1, 2]]),
//   'chunk: size > length should return one chunk with all elements',
// );
//
// // Test 4: Empty array returns empty result
// console.assert(
//   JSON.stringify(chunk([], 3)) === JSON.stringify([]),
//   'chunk: empty array should return empty array',
// );
//
// // Test 5: Invalid size throws RangeError
// try {
//   chunk([1, 2, 3], 0);
//   console.assert(false, 'chunk: size 0 should throw RangeError');
// } catch (e) {
//   console.assert(e instanceof RangeError, 'chunk: should throw RangeError for size <= 0');
// }
//
// ---------------------------------------------------------------------------
// unique
// ---------------------------------------------------------------------------
//
// // Test 1: Removes duplicate numbers
// console.assert(
//   JSON.stringify(unique([1, 2, 2, 3, 1, 4])) === JSON.stringify([1, 2, 3, 4]),
//   'unique: should remove duplicate numbers',
// );
//
// // Test 2: Handles strings
// console.assert(
//   JSON.stringify(unique(['a', 'b', 'a', 'c', 'b'])) === JSON.stringify(['a', 'b', 'c']),
//   'unique: should remove duplicate strings',
// );
//
// // Test 3: Already-unique array is unchanged
// console.assert(
//   JSON.stringify(unique([1, 2, 3])) === JSON.stringify([1, 2, 3]),
//   'unique: already-unique array should be unchanged',
// );
//
// // Test 4: Handles NaN correctly (NaN === NaN in Set)
// const nanResult = unique([NaN, NaN, 1]);
// console.assert(
//   nanResult.length === 2 && Number.isNaN(nanResult[0]) && nanResult[1] === 1,
//   'unique: should deduplicate NaN values',
// );
//
// ---------------------------------------------------------------------------
// flatten
// ---------------------------------------------------------------------------
//
// // Test 1: Full flatten (default depth = Infinity)
// console.assert(
//   JSON.stringify(flatten([1, [2, [3, [4]]]])) === JSON.stringify([1, 2, 3, 4]),
//   'flatten: default depth should fully flatten nested arrays',
// );
//
// // Test 2: Flatten to specific depth
// console.assert(
//   JSON.stringify(flatten([1, [2, [3, [4]]]], 1)) === JSON.stringify([1, 2, [3, [4]]]),
//   'flatten: depth 1 should flatten one level only',
// );
//
// // Test 3: Depth 0 returns shallow copy (no flattening)
// console.assert(
//   JSON.stringify(flatten([1, [2, 3]], 0)) === JSON.stringify([1, [2, 3]]),
//   'flatten: depth 0 should not flatten at all',
// );
//
// // Test 4: Mixed types
// console.assert(
//   JSON.stringify(flatten(['a', ['b', ['c']]])) === JSON.stringify(['a', 'b', 'c']),
//   'flatten: should handle mixed/string elements',
// );
//
// ---------------------------------------------------------------------------
// groupBy
// ---------------------------------------------------------------------------
//
// // Test 1: Group objects by a property
// const people = [
//   { name: 'Alice', dept: 'eng' },
//   { name: 'Bob', dept: 'sales' },
//   { name: 'Carol', dept: 'eng' },
// ];
// const grouped = groupBy(people, (p) => p.dept);
// console.assert(
//   grouped['eng'].length === 2 && grouped['sales'].length === 1,
//   'groupBy: should group objects by department',
// );
//
// // Test 2: Group numbers by even/odd
// const evenOdd = groupBy([1, 2, 3, 4, 5], (n) => (n % 2 === 0 ? 'even' : 'odd'));
// console.assert(
//   JSON.stringify(evenOdd['even']) === JSON.stringify([2, 4]) &&
//   JSON.stringify(evenOdd['odd']) === JSON.stringify([1, 3, 5]),
//   'groupBy: should group numbers by even/odd',
// );
//
// // Test 3: Empty array returns empty record
// const emptyGroup = groupBy([], () => 'key');
// console.assert(
//   Object.keys(emptyGroup).length === 0,
//   'groupBy: empty array should return empty record',
// );
//
// // Test 4: Single-element groups
// const singleGroups = groupBy(['a', 'b', 'c'], (s) => s);
// console.assert(
//   Object.keys(singleGroups).length === 3 &&
//   singleGroups['a'].length === 1,
//   'groupBy: unique keys should each have a single-element array',
// );
//
// ---------------------------------------------------------------------------
// intersect
// ---------------------------------------------------------------------------
//
// // Test 1: Basic intersection
// console.assert(
//   JSON.stringify(intersect([1, 2, 3, 4], [3, 4, 5, 6])) === JSON.stringify([3, 4]),
//   'intersect: should return common elements',
// );
//
// // Test 2: No common elements
// console.assert(
//   JSON.stringify(intersect([1, 2], [3, 4])) === JSON.stringify([]),
//   'intersect: disjoint arrays should return empty array',
// );
//
// // Test 3: Duplicate handling -- result is deduplicated
// console.assert(
//   JSON.stringify(intersect([1, 1, 2, 2], [1, 2, 2])) === JSON.stringify([1, 2]),
//   'intersect: should deduplicate results',
// );
//
// // Test 4: String intersection
// console.assert(
//   JSON.stringify(intersect(['a', 'b', 'c'], ['b', 'c', 'd'])) === JSON.stringify(['b', 'c']),
//   'intersect: should work with strings',
// );
//
// // Test 5: One empty array returns empty
// console.assert(
//   JSON.stringify(intersect([], [1, 2, 3])) === JSON.stringify([]),
//   'intersect: empty first array should return empty result',
// );
//
// console.log('All array-utils tests passed.');
