/**
 * Capitalizes the first letter of a string.
 * @param str The input string.
 * @returns The string with the first letter capitalized.
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to a URL-friendly slug.
 * @param str The input string.
 * @returns The slugified string.
 */
export function slugify(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes
}

/**
 * Truncates a string to a maximum length.
 * @param str The input string.
 * @param maxLen The maximum length.
 * @param suffix The suffix to add if truncated (default '...').
 * @returns The truncated string.
 */
export function truncate(str: string, maxLen: number, suffix: string = '...'): string {
    if (str.length <= maxLen) {
        return str;
    }
    return str.slice(0, maxLen) + suffix;
}

/**
 * Counts the number of words in a string.
 * @param str The input string.
 * @returns The word count.
 */
export function countWords(str: string): number {
    return str.trim().split(/\s+/).length;
}

/**
 * Reverses the order of words in a string.
 * @param str The input string.
 * @returns The string with words in reversed order.
 */
export function reverseWords(str: string): string {
    return str.trim().split(/\s+/).reverse().join(' ');
}

// Test cases
// capitalize
console.log(capitalize('hello')); // Hello
console.log(capitalize('world')); // World
console.log(capitalize('')); // ''

// slugify
console.log(slugify('Hello World!')); // hello-world
console.log(slugify('This is a Test')); // this-is-a-test
console.log(slugify('Special #$% Characters')); // special-characters

// truncate
console.log(truncate('Hello World', 5)); // Hello...
console.log(truncate('Hello World', 8, '!!!')); // Hello!!!
console.log(truncate('Hello', 10)); // Hello

// countWords
console.log(countWords('Hello World')); // 2
console.log(countWords('This is a test')); // 4
console.log(countWords('')); // 0

// reverseWords
console.log(reverseWords('Hello World')); // World Hello
console.log(reverseWords('This is a test')); // test a is This
console.log(reverseWords('Single')); // Single
