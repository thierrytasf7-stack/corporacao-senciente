/**
 * Clamps a value between a minimum and maximum value.
 * @param value The value to clamp.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns The clamped value.
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linearly interpolates between two values.
 * @param start The start value.
 * @param end The end value.
 * @param t The interpolation factor (0-1).
 * @returns The interpolated value.
 */
export function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

/**
 * Rounds a number to a specified number of decimal places.
 * @param value The number to round.
 * @param decimals The number of decimal places.
 * @returns The rounded number.
 */
export function roundTo(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

/**
 * Calculates the nth Fibonacci number (0-indexed).
 * @param n The index of the Fibonacci number to calculate.
 * @returns The nth Fibonacci number.
 */
export function fibonacci(n: number): number {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
}

/**
 * Checks if a number is prime.
 * @param n The number to check.
 * @returns True if the number is prime, false otherwise.
 */
export function isPrime(n: number): boolean {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
}

// Test cases
// clamp
console.log(clamp(5, 0, 10)); // 5
console.log(clamp(-1, 0, 10)); // 0
console.log(clamp(15, 0, 10)); // 10

// lerp
console.log(lerp(0, 10, 0.5)); // 5
console.log(lerp(0, 10, 0)); // 0
console.log(lerp(0, 10, 1)); // 10

// roundTo
console.log(roundTo(3.14159, 2)); // 3.14
console.log(roundTo(3.14159, 3)); // 3.142
console.log(roundTo(3.14159, 0)); // 3

// fibonacci
console.log(fibonacci(0)); // 0
console.log(fibonacci(1)); // 1
console.log(fibonacci(10)); // 55

// isPrime
console.log(isPrime(2)); // true
console.log(isPrime(4)); // false
console.log(isPrime(17)); // true
