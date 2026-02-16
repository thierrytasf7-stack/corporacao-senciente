/**
 * Capitaliza a primeira letra de uma string, deixando o resto inalterado.
 * @param str - A string a ser capitalizada.
 * @returns A string com a primeira letra capitalizada.
 * @example
 * capitalize('hello') // 'Hello'
 * capitalize('') // ''
 * capitalize('a') // 'A'
 */
export function capitalize(str: string): string {
    if (str.length === 0) return '';
    return str[0].toUpperCase() + str.slice(1);
}

/**
 * Converte uma string para um slug URL-amigável.
 * @param str - A string a ser convertida.
 * @returns O slug gerado a partir da string.
 * @example
 * slugify('  Hello World! ') // 'hello-world'
 * slugify('foo   bar') // 'foo-bar'
 * slugify('---') // ''
 */
export function slugify(str: string): string {
    return str
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Trunca uma string para um comprimento máximo, incluindo o sufixo.
 * @param str - A string a ser truncada.
 * @param maxLen - O comprimento máximo da string truncada.
 * @param suffix - O sufixo a ser adicionado (padrão: '...').
 * @returns A string truncada.
 * @example
 * truncate('Hello World', 8) // 'Hello...'
 * truncate('Hello', 10) // 'Hello'
 * truncate('Hello', 3) // '...'
 */
export function truncate(str: string, maxLen: number, suffix: string = '...'): string {
    if (str.length <= maxLen) return str;
    if (maxLen < suffix.length) return suffix.slice(0, maxLen);
    return str.slice(0, maxLen - suffix.length) + suffix;
}

/**
 * Conta o número de palavras em uma string.
 * @param str - A string a ser analisada.
 * @returns O número de palavras encontradas.
 * @example
 * countWords('Hello world') // 2
 * countWords('') // 0
 * countWords('   ') // 0
 */
export function countWords(str: string): number {
    const trimmed = str.trim();
    if (trimmed.length === 0) return 0;
    return trimmed.split(/\s+/).length;
}

/**
 * Inverte a ordem das palavras em uma string.
 * @param str - A string a ser processada.
 * @returns A string com as palavras em ordem reversa.
 * @example
 * reverseWords('Hello world') // 'world Hello'
 * reverseWords('  foo   bar  ') // 'bar foo'
 */
export function reverseWords(str: string): string {
    return str.trim().split(/\s+/).reverse().join(' ');
}

// Testes
console.assert(capitalize('hello') === 'Hello', 'capitalize("hello") deve retornar "Hello"');
console.assert(capitalize('') === '', 'capitalize("") deve retornar ""');
console.assert(capitalize('a') === 'A', 'capitalize("a") deve retornar "A"');
console.assert(capitalize('HELLO') === 'HELLO', 'capitalize("HELLO") deve retornar "HELLO"');

console.assert(slugify('  Hello World! ') === 'hello-world', 'slugify("  Hello World! ") deve retornar "hello-world"');
console.assert(slugify('foo   bar') === 'foo-bar', 'slugify("foo   bar") deve retornar "foo-bar"');
console.assert(slugify('---') === '', 'slugify("---") deve retornar ""');
console.assert(slugify('Test@123') === 'test123', 'slugify("Test@123") deve retornar "test123"');

console.assert(truncate('Hello World', 8) === 'Hello...', 'truncate("Hello World", 8) deve retornar "Hello..."');
console.assert(truncate('Hello', 10) === 'Hello', 'truncate("Hello", 10) deve retornar "Hello"');
console.assert(truncate('Hello', 3) === '...', 'truncate("Hello", 3) deve retornar "..."');
console.assert(truncate('Hello', 2, '!!') === '!!', 'truncate("Hello", 2, "!!") deve retornar "!!"');

console.assert(countWords('Hello world') === 2, 'countWords("Hello world") deve retornar 2');
console.assert(countWords('') === 0, 'countWords("") deve retornar 0');
console.assert(countWords('   ') === 0, 'countWords("   ") deve retornar 0');
console.assert(countWords('foo\tbar\nbaz') === 3, 'countWords("foo\tbar\nbaz") deve retornar 3');

console.assert(reverseWords('Hello world') === 'world Hello', 'reverseWords("Hello world") deve retornar "world Hello"');
console.assert(reverseWords('  foo   bar  ') === 'bar foo', 'reverseWords("  foo   bar  ") deve retornar "bar foo"');
console.assert(reverseWords('') === '', 'reverseWords("") deve retornar ""');
console.assert(reverseWords('single') === 'single', 'reverseWords("single") deve retornar "single"');
