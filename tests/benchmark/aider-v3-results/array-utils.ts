/**
 * Utilitários de array para TypeScript
 */

/**
 * Divide um array em subarrays de tamanho especificado
 * @typeParam T - Tipo dos elementos do array
 * @param arr - Array a ser dividido
 * @param size - Tamanho máximo de cada chunk
 * @returns Array de arrays divididos
 * @throws RangeError se size <= 0
 * @example
 * chunk([1, 2, 3, 4], 2) // [[1, 2], [3, 4]]
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(arr: T[], size: number): T[][] {
    if (size <= 0) {
        throw new RangeError('Size must be greater than 0');
    }
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

/**
 * Remove duplicatas de um array preservando a ordem
 * @typeParam T - Tipo dos elementos do array
 * @param arr - Array de entrada
 * @returns Array com elementos únicos
 * @example
 * unique([1, 2, 2, 3, 1]) // [1, 2, 3]
 * unique([NaN, NaN, 1]) // [NaN, 1]
 */
export function unique<T>(arr: T[]): T[] {
    const seen = new Set<T>();
    const result: T[] = [];
    for (const item of arr) {
        if (!seen.has(item)) {
            seen.add(item);
            result.push(item);
        }
    }
    return result;
}

/**
 * Achata arrays aninhados até uma profundidade específica
 * @typeParam T - Tipo dos elementos do array
 * @param arr - Array aninhado
 * @param depth - Profundidade máxima de achatar (padrão: Infinity)
 * @returns Array achata
 * @example
 * flatten([1, [2, [3, 4]]], 1) // [1, 2, [3, 4]]
 * flatten([1, [2, [3, 4]]]) // [1, 2, 3, 4]
 */
export function flatten<T>(arr: unknown[], depth: number = Infinity): T[] {
    const result: T[] = [];
    function _flatten(input: unknown[], currentDepth: number) {
        for (const item of input) {
            if (Array.isArray(item) && currentDepth > 0) {
                _flatten(item, currentDepth - 1);
            } else {
                result.push(item as T);
            }
        }
    }
    _flatten(arr, depth);
    return result;
}

/**
 * Agrupa elementos de um array por uma chave
 * @typeParam T - Tipo dos elementos do array
 * @param arr - Array de entrada
 * @param keyFn - Função para extrair a chave de agrupamento
 * @returns Objeto com arrays agrupados por chave
 * @example
 * groupBy(['a', 'bb', 'ccc'], x => x.length.toString()) // {'1': ['a'], '2': ['bb'], '3': ['ccc']}
 */
export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
    const result: Record<string, T[]> = {};
    for (const item of arr) {
        const key = keyFn(item);
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(item);
    }
    return result;
}

/**
 * Retorna a interseção de dois arrays
 * @typeParam T - Tipo dos elementos dos arrays
 * @param a - Primeiro array
 * @param b - Segundo array
 * @returns Array com elementos presentes em ambos os arrays
 * @example
 * intersect([1, 2, 3, 2], [2, 3, 4]) // [2, 3]
 */
export function intersect<T>(a: T[], b: T[]): T[] {
    const setB = new Set(b);
    const seen = new Set<T>();
    const result: T[] = [];
    for (const item of a) {
        if (setB.has(item) && !seen.has(item)) {
            seen.add(item);
            result.push(item);
        }
    }
    return result;
}

// Testes
console.assert(JSON.stringify(chunk([1, 2, 3, 4], 2)) === JSON.stringify([[1, 2], [3, 4]]), 'chunk() falhou no teste básico');
console.assert(JSON.stringify(chunk([1, 2, 3, 4, 5], 2)) === JSON.stringify([[1, 2], [3, 4], [5]]), 'chunk() falhou no teste com resto');
console.assert(JSON.stringify(chunk([], 2)) === JSON.stringify([]), 'chunk() falhou no array vazio');
try {
    chunk([1, 2, 3], 0);
    console.assert(false, 'chunk() não lançou erro para size <= 0');
} catch (e) {
    console.assert(e instanceof RangeError, 'chunk() não lançou RangeError para size <= 0');
}

console.assert(JSON.stringify(unique([1, 2, 2, 3, 1])) === JSON.stringify([1, 2, 3]), 'unique() falhou no teste básico');
console.assert(JSON.stringify(unique([NaN, NaN, 1])) === JSON.stringify([NaN, 1]), 'unique() falhou com NaN');
console.assert(JSON.stringify(unique([])) === JSON.stringify([]), 'unique() falhou no array vazio');

console.assert(JSON.stringify(flatten([1, [2, [3, 4]]], 1)) === JSON.stringify([1, 2, [3, 4]]), 'flatten() falhou na profundidade 1');
console.assert(JSON.stringify(flatten([1, [2, [3, 4]]])) === JSON.stringify([1, 2, 3, 4]), 'flatten() falhou na profundidade infinita');
console.assert(JSON.stringify(flatten([1, 2, 3])) === JSON.stringify([1, 2, 3]), 'flatten() falhou no array não aninhado');
console.assert(JSON.stringify(flatten([], 2)) === JSON.stringify([]), 'flatten() falhou no array vazio');

console.assert(JSON.stringify(groupBy(['a', 'bb', 'ccc'], x => x.length.toString())) === JSON.stringify({'1': ['a'], '2': ['bb'], '3': ['ccc']}), 'groupBy() falhou no teste básico');
console.assert(JSON.stringify(groupBy([], x => x)) === JSON.stringify({}), 'groupBy() falhou no array vazio');

console.assert(JSON.stringify(intersect([1, 2, 3, 2], [2, 3, 4])) === JSON.stringify([2, 3]), 'intersect() falhou no teste básico');
console.assert(JSON.stringify(intersect([1, 2], [3, 4])) === JSON.stringify([]), 'intersect() falhou sem interseção');
console.assert(JSON.stringify(intersect([], [1, 2])) === JSON.stringify([]), 'intersect() falhou no array vazio');
