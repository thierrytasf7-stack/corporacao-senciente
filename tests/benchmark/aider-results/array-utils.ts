/**
 * Divide um array em sub-arrays de tamanho especificado.
 * @param arr Array a ser dividido.
 * @param size Tamanho de cada sub-array.
 * @returns Array de sub-arrays.
 */
export function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

/**
 * Remove valores duplicados de um array.
 * @param arr Array a ser processado.
 * @returns Array com valores únicos.
 */
export function unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
}

/**
 * Achata um array aninhado até uma profundidade especificada.
 * @param arr Array a ser achatado.
 * @param depth Profundidade máxima de achatamento (padrão: Infinity).
 * @returns Array achatado.
 */
export function flatten<T>(arr: any[], depth: number = Infinity): T[] {
    return arr.reduce((acc, val) => {
        if (Array.isArray(val) && depth > 0) {
            acc.push(...flatten(val, depth - 1));
        } else {
            acc.push(val);
        }
        return acc;
    }, [] as T[]);
}

/**
 * Agrupa elementos de um array por uma chave especificada.
 * @param arr Array a ser agrupado.
 * @param keyFn Função para extrair a chave de cada elemento.
 * @returns Objeto com arrays agrupados por chave.
 */
export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return arr.reduce((acc, item) => {
        const key = keyFn(item);
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {} as Record<string, T[]>);
}

/**
 * Retorna a interseção de dois arrays.
 * @param a Primeiro array.
 * @param b Segundo array.
 * @returns Array com elementos presentes em ambos os arrays.
 */
export function intersect<T>(a: T[], b: T[]): T[] {
    const setB = new Set(b);
    return a.filter(item => setB.has(item));
}

// Testes
if (require.main === module) {
    // chunk
    console.log(chunk([1, 2, 3, 4, 5], 2)); // [[1, 2], [3, 4], [5]]
    console.log(chunk(['a', 'b', 'c', 'd'], 3)); // [['a', 'b', 'c'], ['d']]
    console.log(chunk([true, false, true], 1)); // [[true], [false], [true]]

    // unique
    console.log(unique([1, 2, 2, 3, 4, 4, 5])); // [1, 2, 3, 4, 5]
    console.log(unique(['a', 'b', 'a', 'c'])); // ['a', 'b', 'c']
    console.log(unique([true, false, true])); // [true, false]

    // flatten
    console.log(flatten([1, [2, [3, [4]]], 5])); // [1, 2, 3, 4, 5]
    console.log(flatten([1, [2, [3, [4]]], 5], 2)); // [1, 2, 3, [4], 5]
    console.log(flatten(['a', ['b', ['c']], 'd'])); // ['a', 'b', 'c', 'd']

    // groupBy
    console.log(groupBy(['one', 'two', 'three'], s => s.length.toString())); // {'3': ['one', 'two'], '5': ['three']}
    console.log(groupBy([1, 2, 3, 4, 5], n => (n % 2 === 0 ? 'even' : 'odd'))); // {'odd': [1, 3, 5], 'even': [2, 4]}
    console.log(groupBy([{id: 1, group: 'A'}, {id: 2, group: 'B'}, {id: 3, group: 'A'}], obj => obj.group)); // {'A': [{id: 1, group: 'A'}, {id: 3, group: 'A'}], 'B': [{id: 2, group: 'B'}]}

    // intersect
    console.log(intersect([1, 2, 3, 4], [3, 4, 5, 6])); // [3, 4]
    console.log(intersect(['a', 'b', 'c'], ['b', 'c', 'd'])); // ['b', 'c']
    console.log(intersect([true, false, true], [false, true])); // [false, true]
}
