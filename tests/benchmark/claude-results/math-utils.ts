/**
 * Math utility functions for numerical operations.
 *
 * @module math-utils
 */

/**
 * Clamps a numeric value within an inclusive range defined by min and max.
 * If the value is less than min, returns min. If greater than max, returns max.
 * Otherwise returns the value unchanged.
 *
 * @param value - The number to clamp
 * @param min - The lower bound of the range (inclusive)
 * @param max - The upper bound of the range (inclusive)
 * @returns The clamped value, guaranteed to be within [min, max]
 * @throws {RangeError} If min is greater than max
 *
 * @example
 * ```ts
 * clamp(5, 0, 10);   // 5
 * clamp(-3, 0, 10);  // 0
 * clamp(15, 0, 10);  // 10
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new RangeError(`min (${min}) must not be greater than max (${max})`);
  }
  return Math.min(Math.max(value, min), max);
}

/**
 * Performs linear interpolation (lerp) between two values.
 * When t = 0 the result is `start`, when t = 1 the result is `end`,
 * and values in between produce a proportional blend.
 *
 * Note: t is not clamped, so values outside [0, 1] will extrapolate
 * beyond the start-end range.
 *
 * @param start - The starting value (returned when t = 0)
 * @param end - The ending value (returned when t = 1)
 * @param t - The interpolation factor, typically in the range [0, 1]
 * @returns The interpolated value between start and end
 *
 * @example
 * ```ts
 * lerp(0, 100, 0.5);  // 50
 * lerp(10, 20, 0);    // 10
 * lerp(10, 20, 1);    // 20
 * ```
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Rounds a numeric value to a specified number of decimal places.
 * Uses the "round half away from zero" strategy via `Math.round`.
 *
 * @param value - The number to round
 * @param decimals - The number of decimal places to round to (must be a non-negative integer)
 * @returns The rounded value
 * @throws {RangeError} If decimals is negative or not an integer
 *
 * @example
 * ```ts
 * roundTo(3.14159, 2);  // 3.14
 * roundTo(1.005, 2);    // 1.01
 * roundTo(123.456, 0);  // 123
 * ```
 */
export function roundTo(value: number, decimals: number): number {
  if (decimals < 0 || !Number.isInteger(decimals)) {
    throw new RangeError(`decimals must be a non-negative integer, got ${decimals}`);
  }
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Returns the nth Fibonacci number using an iterative approach.
 * The sequence is 0-indexed: F(0) = 0, F(1) = 1, F(2) = 1, F(3) = 2, ...
 *
 * @param n - The zero-based index in the Fibonacci sequence (must be a non-negative integer)
 * @returns The nth Fibonacci number
 * @throws {RangeError} If n is negative or not an integer
 *
 * @example
 * ```ts
 * fibonacci(0);   // 0
 * fibonacci(1);   // 1
 * fibonacci(10);  // 55
 * ```
 */
export function fibonacci(n: number): number {
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
}

/**
 * Determines whether a given number is a prime number.
 * A prime number is a natural number greater than 1 that has no positive
 * divisors other than 1 and itself.
 *
 * Uses trial division up to the square root of n for efficiency.
 *
 * @param n - The number to test for primality
 * @returns `true` if the number is prime, `false` otherwise
 *
 * @example
 * ```ts
 * isPrime(2);   // true
 * isPrime(17);  // true
 * isPrime(4);   // false
 * ```
 */
export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) {
    return false;
  }

  if (n === 2) return true;
  if (n === 3) return true;
  if (n % 2 === 0) return false;
  if (n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return false;
    }
  }

  return true;
}

// =============================================================================
// TEST CASES
// =============================================================================
//
// --- clamp ---
//
// console.assert(clamp(5, 0, 10) === 5,        "clamp: value within range returns value");
// console.assert(clamp(-5, 0, 10) === 0,       "clamp: value below min returns min");
// console.assert(clamp(15, 0, 10) === 10,      "clamp: value above max returns max");
// console.assert(clamp(0, 0, 0) === 0,         "clamp: min equals max returns that value");
// console.assert(clamp(7, 7, 7) === 7,         "clamp: all three equal returns value");
//
// // Should throw RangeError when min > max:
// // try { clamp(5, 10, 0); } catch (e) { console.assert(e instanceof RangeError); }
//
// --- lerp ---
//
// console.assert(lerp(0, 100, 0) === 0,        "lerp: t=0 returns start");
// console.assert(lerp(0, 100, 1) === 100,      "lerp: t=1 returns end");
// console.assert(lerp(0, 100, 0.5) === 50,     "lerp: t=0.5 returns midpoint");
// console.assert(lerp(10, 20, 0.25) === 12.5,  "lerp: t=0.25 returns quarter point");
// console.assert(lerp(0, 100, 2) === 200,      "lerp: t>1 extrapolates beyond end");
// console.assert(lerp(0, 100, -0.5) === -50,   "lerp: t<0 extrapolates before start");
//
// --- roundTo ---
//
// console.assert(roundTo(3.14159, 2) === 3.14,  "roundTo: pi to 2 decimals");
// console.assert(roundTo(3.14159, 4) === 3.1416, "roundTo: pi to 4 decimals rounds up");
// console.assert(roundTo(123.456, 0) === 123,   "roundTo: 0 decimals rounds to integer");
// console.assert(roundTo(1.005, 2) === 1.01,    "roundTo: handles floating point edge case");
// console.assert(roundTo(0, 5) === 0,           "roundTo: zero stays zero");
//
// // Should throw RangeError for negative decimals:
// // try { roundTo(1.5, -1); } catch (e) { console.assert(e instanceof RangeError); }
//
// --- fibonacci ---
//
// console.assert(fibonacci(0) === 0,            "fibonacci: F(0) = 0");
// console.assert(fibonacci(1) === 1,            "fibonacci: F(1) = 1");
// console.assert(fibonacci(2) === 1,            "fibonacci: F(2) = 1");
// console.assert(fibonacci(10) === 55,          "fibonacci: F(10) = 55");
// console.assert(fibonacci(20) === 6765,        "fibonacci: F(20) = 6765");
//
// // Should throw RangeError for negative input:
// // try { fibonacci(-1); } catch (e) { console.assert(e instanceof RangeError); }
//
// --- isPrime ---
//
// console.assert(isPrime(2) === true,           "isPrime: 2 is prime");
// console.assert(isPrime(17) === true,          "isPrime: 17 is prime");
// console.assert(isPrime(97) === true,          "isPrime: 97 is prime");
// console.assert(isPrime(0) === false,          "isPrime: 0 is not prime");
// console.assert(isPrime(1) === false,          "isPrime: 1 is not prime");
// console.assert(isPrime(4) === false,          "isPrime: 4 is not prime");
// console.assert(isPrime(100) === false,        "isPrime: 100 is not prime");
// console.assert(isPrime(-7) === false,         "isPrime: negative numbers are not prime");
// console.assert(isPrime(2.5) === false,        "isPrime: non-integers are not prime");
