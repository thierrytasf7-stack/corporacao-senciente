/**
 * Math utility functions for numerical operations.
 * @module math-utils
 */

/**
 * Clamps a numeric value within an inclusive [min, max] range.
 *
 * @param value - The number to clamp.
 * @param min - Lower bound (inclusive).
 * @param max - Upper bound (inclusive).
 * @returns The clamped value.
 * @throws {RangeError} If min is greater than max.
 *
 * @example
 * ```ts
 * clamp(5, 0, 10);   // 5
 * clamp(-3, 0, 10);  // 0
 * clamp(15, 0, 10);  // 10
 * ```
 */
export const clamp = (value: number, min: number, max: number): number => {
  if (min > max) throw new RangeError(`min (${min}) must not be greater than max (${max})`);
  return Math.min(Math.max(value, min), max);
};

/**
 * Performs linear interpolation between two values.
 *
 * When t=0 returns start, t=1 returns end. Values outside [0,1]
 * extrapolate beyond the range.
 *
 * @param start - Starting value (returned when t=0).
 * @param end - Ending value (returned when t=1).
 * @param t - Interpolation factor (not clamped).
 * @returns The interpolated value.
 *
 * @example
 * ```ts
 * lerp(0, 100, 0.5);  // 50
 * lerp(10, 20, 0);    // 10
 * lerp(0, 100, 2);    // 200 (extrapolation)
 * ```
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

/**
 * Rounds a numeric value to a specified number of decimal places.
 *
 * Uses Number.EPSILON correction to handle floating-point edge cases.
 *
 * @param value - The number to round.
 * @param decimals - Decimal places (must be a non-negative integer).
 * @returns The rounded value.
 * @throws {RangeError} If decimals is negative or not an integer.
 *
 * @example
 * ```ts
 * roundTo(3.14159, 2);  // 3.14
 * roundTo(1.005, 2);    // 1.01
 * roundTo(123.456, 0);  // 123
 * ```
 */
export const roundTo = (value: number, decimals: number): number => {
  if (decimals < 0 || !Number.isInteger(decimals)) {
    throw new RangeError(`decimals must be a non-negative integer, got ${decimals}`);
  }
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

/**
 * Returns the nth Fibonacci number using an iterative approach.
 *
 * 0-indexed: F(0)=0, F(1)=1, F(2)=1, F(3)=2, ...
 *
 * @param n - Zero-based index (must be a non-negative integer).
 * @returns The nth Fibonacci number.
 * @throws {RangeError} If n is negative or not an integer.
 *
 * @example
 * ```ts
 * fibonacci(0);   // 0
 * fibonacci(1);   // 1
 * fibonacci(10);  // 55
 * ```
 */
export const fibonacci = (n: number): number => {
  if (n < 0 || !Number.isInteger(n)) {
    throw new RangeError(`n must be a non-negative integer, got ${n}`);
  }
  if (n === 0) return 0;
  if (n === 1) return 1;
  let prev = 0;
  let curr = 1;
  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  return curr;
};

/**
 * Determines whether a number is prime.
 *
 * Uses trial division with 6k+/-1 optimization for O(sqrt(n)) performance.
 * Returns false for non-integers, negatives, 0, and 1.
 *
 * @param n - The number to test.
 * @returns True if n is prime, false otherwise.
 *
 * @example
 * ```ts
 * isPrime(2);   // true
 * isPrime(17);  // true
 * isPrime(4);   // false
 * isPrime(1);   // false
 * ```
 */
export const isPrime = (n: number): boolean => {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
};

// =============================================================================
// TEST CASES
// =============================================================================
//
// --- clamp ---
// console.assert(clamp(5, 0, 10) === 5, 'clamp: within range');
// console.assert(clamp(-5, 0, 10) === 0, 'clamp: below min');
// console.assert(clamp(15, 0, 10) === 10, 'clamp: above max');
// console.assert(clamp(0, 0, 0) === 0, 'clamp: min equals max');
// console.assert(clamp(7, 7, 7) === 7, 'clamp: all equal');
// try { clamp(5, 10, 0); console.assert(false, 'clamp: should throw'); } catch(e) { console.assert(e instanceof RangeError, 'clamp: RangeError'); }
//
// --- lerp ---
// console.assert(lerp(0, 100, 0) === 0, 'lerp: t=0');
// console.assert(lerp(0, 100, 1) === 100, 'lerp: t=1');
// console.assert(lerp(0, 100, 0.5) === 50, 'lerp: midpoint');
// console.assert(lerp(10, 20, 0.25) === 12.5, 'lerp: quarter');
// console.assert(lerp(0, 100, 2) === 200, 'lerp: extrapolate beyond');
// console.assert(lerp(0, 100, -0.5) === -50, 'lerp: extrapolate before');
//
// --- roundTo ---
// console.assert(roundTo(3.14159, 2) === 3.14, 'roundTo: 2 decimals');
// console.assert(roundTo(3.14159, 4) === 3.1416, 'roundTo: 4 decimals rounds up');
// console.assert(roundTo(123.456, 0) === 123, 'roundTo: 0 decimals');
// console.assert(roundTo(1.005, 2) === 1.01, 'roundTo: floating point edge case');
// console.assert(roundTo(0, 5) === 0, 'roundTo: zero');
// try { roundTo(1.5, -1); console.assert(false, 'roundTo: should throw'); } catch(e) { console.assert(e instanceof RangeError, 'roundTo: RangeError'); }
//
// --- fibonacci ---
// console.assert(fibonacci(0) === 0, 'fibonacci: F(0)');
// console.assert(fibonacci(1) === 1, 'fibonacci: F(1)');
// console.assert(fibonacci(2) === 1, 'fibonacci: F(2)');
// console.assert(fibonacci(10) === 55, 'fibonacci: F(10)');
// console.assert(fibonacci(20) === 6765, 'fibonacci: F(20)');
// try { fibonacci(-1); console.assert(false, 'fibonacci: should throw'); } catch(e) { console.assert(e instanceof RangeError, 'fibonacci: RangeError'); }
//
// --- isPrime ---
// console.assert(isPrime(2) === true, 'isPrime: 2');
// console.assert(isPrime(17) === true, 'isPrime: 17');
// console.assert(isPrime(97) === true, 'isPrime: 97');
// console.assert(isPrime(0) === false, 'isPrime: 0');
// console.assert(isPrime(1) === false, 'isPrime: 1');
// console.assert(isPrime(4) === false, 'isPrime: 4');
// console.assert(isPrime(-7) === false, 'isPrime: negative');
// console.assert(isPrime(2.5) === false, 'isPrime: non-integer');
