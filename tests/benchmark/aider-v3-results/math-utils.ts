/**
 * Utilitários matemáticos
 */
export function clamp(value: number, min: number, max: number): number {
    /**
     * Limita um valor dentro de um intervalo [min, max]
     * @param value Valor a ser limitado
     * @param min Valor mínimo do intervalo
     * @param max Valor máximo do intervalo
     * @returns Valor limitado dentro do intervalo
     * @throws RangeError se min > max
     * @example
     * clamp(5, 0, 10) // 5
     * clamp(-5, 0, 10) // 0
     * clamp(15, 0, 10) // 10
     */
    if (min > max) {
        throw new RangeError('min cannot be greater than max');
    }
    return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, t: number): number {
    /**
     * Interpolação linear entre dois valores
     * @param start Valor inicial
     * @param end Valor final
     * @param t Fator de interpolação (pode ser <0 ou >1 para extrapolação)
     * @returns Valor interpolado
     * @example
     * lerp(0, 10, 0.5) // 5
     * lerp(0, 10, 2) // 20 (extrapolação)
     * lerp(0, 10, -0.5) // -5 (extrapolação)
     */
    return start + (end - start) * t;
}

export function roundTo(value: number, decimals: number): number {
    /**
     * Arredonda um número para N casas decimais
     * @param value Valor a ser arredondado
     * @param decimals Número de casas decimais (deve ser >= 0 e inteiro)
     * @returns Valor arredondado
     * @throws RangeError se decimals < 0 ou não for inteiro
     * @example
     * roundTo(3.14159, 2) // 3.14
     * roundTo(1.005, 2) // 1.01 (corrige imprecisão de ponto flutuante)
     */
    if (!Number.isInteger(decimals) || decimals < 0) {
        throw new RangeError('decimals must be a non-negative integer');
    }
    const factor = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function fibonacci(n: number): number {
    /**
     * Calcula o n-ésimo número de Fibonacci (0-indexado)
     * @param n Índice do número de Fibonacci (deve ser >= 0 e inteiro)
     * @returns N-ésimo número de Fibonacci
     * @throws RangeError se n < 0 ou não for inteiro
     * @example
     * fibonacci(0) // 0
     * fibonacci(1) // 1
     * fibonacci(5) // 5
     * fibonacci(10) // 55
     */
    if (!Number.isInteger(n) || n < 0) {
        throw new RangeError('n must be a non-negative integer');
    }
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
}

export function isPrime(n: number): boolean {
    /**
     * Verifica se um número é primo
     * @param n Número a ser verificado
     * @returns true se n for primo, false caso contrário
     * @example
     * isPrime(2) // true
     * isPrime(4) // false
     * isPrime(17) // true
     * isPrime(1) // false
     */
    if (n < 2 || !Number.isInteger(n)) return false;
    if (n === 2 || n === 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
}

// Testes
console.assert(clamp(5, 0, 10) === 5, 'clamp(5, 0, 10) should be 5');
console.assert(clamp(-5, 0, 10) === 0, 'clamp(-5, 0, 10) should be 0');
console.assert(clamp(15, 0, 10) === 10, 'clamp(15, 0, 10) should be 10');
console.assert(clamp(0, -10, 10) === 0, 'clamp(0, -10, 10) should be 0');
console.assert(clamp(-15, -10, -5) === -10, 'clamp(-15, -10, -5) should be -10');

console.assert(lerp(0, 10, 0.5) === 5, 'lerp(0, 10, 0.5) should be 5');
console.assert(lerp(0, 10, 0) === 0, 'lerp(0, 10, 0) should be 0');
console.assert(lerp(0, 10, 1) === 10, 'lerp(0, 10, 1) should be 10');
console.assert(lerp(0, 10, 2) === 20, 'lerp(0, 10, 2) should be 20');
console.assert(lerp(0, 10, -0.5) === -5, 'lerp(0, 10, -0.5) should be -5');

console.assert(roundTo(3.14159, 2) === 3.14, 'roundTo(3.14159, 2) should be 3.14');
console.assert(roundTo(1.005, 2) === 1.01, 'roundTo(1.005, 2) should be 1.01');
console.assert(roundTo(123.456, 0) === 123, 'roundTo(123.456, 0) should be 123');
console.assert(roundTo(0.123456, 4) === 0.1235, 'roundTo(0.123456, 4) should be 0.1235');
console.assert(roundTo(-3.14159, 2) === -3.14, 'roundTo(-3.14159, 2) should be -3.14');

console.assert(fibonacci(0) === 0, 'fibonacci(0) should be 0');
console.assert(fibonacci(1) === 1, 'fibonacci(1) should be 1');
console.assert(fibonacci(5) === 5, 'fibonacci(5) should be 5');
console.assert(fibonacci(10) === 55, 'fibonacci(10) should be 55');
console.assert(fibonacci(15) === 610, 'fibonacci(15) should be 610');

console.assert(isPrime(2) === true, 'isPrime(2) should be true');
console.assert(isPrime(4) === false, 'isPrime(4) should be false');
console.assert(isPrime(17) === true, 'isPrime(17) should be true');
console.assert(isPrime(1) === false, 'isPrime(1) should be false');
console.assert(isPrime(25) === false, 'isPrime(25) should be false');

// Testes de erro
try {
    clamp(5, 10, 0);
    console.assert(false, 'clamp(5, 10, 0) should throw RangeError');
} catch (e) {
    console.assert(e instanceof RangeError, 'clamp(5, 10, 0) should throw RangeError');
}

try {
    roundTo(3.14, -1);
    console.assert(false, 'roundTo(3.14, -1) should throw RangeError');
} catch (e) {
    console.assert(e instanceof RangeError, 'roundTo(3.14, -1) should throw RangeError');
}

try {
    fibonacci(-1);
    console.assert(false, 'fibonacci(-1) should throw RangeError');
} catch (e) {
    console.assert(e instanceof RangeError, 'fibonacci(-1) should throw RangeError');
}
