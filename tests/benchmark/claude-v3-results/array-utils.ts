/**
 * Array utility functions for common collection operations.
 * @module array-utils
 */

/**
 * Splits an array into smaller arrays (chunks) of a specified size.
 *
 * @typeParam T - The type of elements in the array.
 * @param arr - The source array to chunk.
 * @param size - Maximum elements per chunk. Must be a positive integer.
 * @returns An array of chunks.
 * @throws {RangeError} If size is less than or equal to zero.
 *
 * @example
 * ```ts
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 * ```
 */
export const chunk = <T>(arr: T[], size: number): T[][] => {
  if (size <= 0) throw new RangeError('Chunk size must be a positive integer.');
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

/**
 * Returns a new array with duplicate values removed.
 *
 * Uses Set semantics (SameValueZero), so NaN equals NaN.
 * Preserves first-occurrence order.
 *
 * @typeParam T - The type of elements in the array.
 * @param arr - The source array.
 * @returns A new deduplicated array.
 *
 * @example
 * ```ts
 * unique([1, 2, 2, 3, 1]); // [1, 2, 3]
 * ```
 */
export const unique = <T>(arr: T[]): T[] => {
  return [...new Set(arr)];
};

/**
 * Flattens a nested array structure to the specified depth.
 *
 * @typeParam T - The expected element type of the flat result.
 * @param arr - The nested array to flatten.
 * @param depth - Maximum recursion depth. Defaults to Infinity.
 * @returns A new flattened array.
 *
 * @example
 * ```ts
 * flatten([1, [2, [3, [4]]]], 2); // [1, 2, 3, [4]]
 * flatten([1, [2, [3]]]);         // [1, 2, 3]
 * ```
 */
export const flatten = <T>(arr: unknown[], depth: number = Infinity): T[] => {
  const result: unknown[] = [];
  const recurse = (items: unknown[], d: number): void => {
    for (const item of items) {
      if (Array.isArray(item) && d > 0) {
        recurse(item, d - 1);
      } else {
        result.push(item);
      }
    }
  };
  recurse(arr, depth);
  return result as T[];
};

/**
 * Groups array elements into a record keyed by a function result.
 *
 * Order within each group is preserved from the original array.
 *
 * @typeParam T - The type of elements in the array.
 * @param arr - The source array.
 * @param keyFn - Function that returns the grouping key for each element.
 * @returns A record mapping keys to arrays of matching elements.
 *
 * @example
 * ```ts
 * groupBy([1, 2, 3, 4], n => n % 2 === 0 ? 'even' : 'odd');
 * // { odd: [1, 3], even: [2, 4] }
 * ```
 */
export const groupBy = <T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> => {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const key = keyFn(item);
    if (!(key in result)) result[key] = [];
    result[key].push(item);
  }
  return result;
};

/**
 * Returns the deduplicated intersection of two arrays.
 *
 * Elements present in both arrays are returned, with duplicates removed.
 * Order follows the first array.
 *
 * @typeParam T - The type of elements.
 * @param a - First array.
 * @param b - Second array.
 * @returns Deduplicated array of common elements.
 *
 * @example
 * ```ts
 * intersect([1, 2, 3], [2, 3, 4]); // [2, 3]
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
// --- chunk ---
// console.assert(JSON.stringify(chunk([1,2,3,4], 2)) === '[[1,2],[3,4]]', 'chunk: even split');
// console.assert(JSON.stringify(chunk([1,2,3,4,5], 3)) === '[[1,2,3],[4,5]]', 'chunk: remainder');
// console.assert(JSON.stringify(chunk([1,2], 10)) === '[[1,2]]', 'chunk: size > length');
// console.assert(JSON.stringify(chunk([], 3)) === '[]', 'chunk: empty array');
// try { chunk([1], 0); console.assert(false, 'chunk: should throw'); } catch(e) { console.assert(e instanceof RangeError, 'chunk: RangeError for 0'); }
//
// --- unique ---
// console.assert(JSON.stringify(unique([1,2,2,3,1])) === '[1,2,3]', 'unique: numbers');
// console.assert(JSON.stringify(unique(['a','b','a'])) === '["a","b"]', 'unique: strings');
// console.assert(JSON.stringify(unique([1,2,3])) === '[1,2,3]', 'unique: already unique');
// console.assert(unique([NaN,NaN,1]).length === 2, 'unique: NaN dedup');
//
// --- flatten ---
// console.assert(JSON.stringify(flatten([1,[2,[3,[4]]]])) === '[1,2,3,4]', 'flatten: full');
// console.assert(JSON.stringify(flatten([1,[2,[3]]], 1)) === '[1,2,[3]]', 'flatten: depth 1');
// console.assert(JSON.stringify(flatten([1,[2]], 0)) === '[1,[2]]', 'flatten: depth 0');
// console.assert(JSON.stringify(flatten([])) === '[]', 'flatten: empty');
//
// --- groupBy ---
// const g = groupBy([1,2,3,4], n => n % 2 === 0 ? 'even' : 'odd');
// console.assert(JSON.stringify(g['even']) === '[2,4]', 'groupBy: even');
// console.assert(JSON.stringify(g['odd']) === '[1,3]', 'groupBy: odd');
// console.assert(Object.keys(groupBy([], () => 'k')).length === 0, 'groupBy: empty');
// console.assert(Object.keys(groupBy(['a','b','c'], s => s)).length === 3, 'groupBy: unique keys');
//
// --- intersect ---
// console.assert(JSON.stringify(intersect([1,2,3], [2,3,4])) === '[2,3]', 'intersect: basic');
// console.assert(JSON.stringify(intersect([1,2], [3,4])) === '[]', 'intersect: disjoint');
// console.assert(JSON.stringify(intersect([1,1,2], [1,2])) === '[1,2]', 'intersect: dedup');
// console.assert(JSON.stringify(intersect([], [1,2])) === '[]', 'intersect: empty first');
// console.assert(JSON.stringify(intersect(['a','b'], ['b','c'])) === '["b"]', 'intersect: strings');
