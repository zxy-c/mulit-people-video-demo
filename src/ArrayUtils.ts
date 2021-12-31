function remove<T>(array: T[], item: T) {
    let indexOf = array.indexOf(item)
    if (indexOf !== -1) {
        array.splice(indexOf, 1)
        return true
    } else {
        return false
    }
}

function sum<T>(array: T[], toNumber: (item: T) => number = defaultToNumber) {
    let num = 0
    array.forEach(item => {
        num += toNumber(item)
    })
    return num
}

function removeBy<T>(
    array: T[],
    predicate: (this: void, value: T, index: number, obj: T[]) => boolean,
) {
    let item = array.find(predicate)
    return remove(array, item)
}

function intersectionOf<T>(arr1: Array<T>, arr2: Array<T>) {
    return arr1.filter(it => arr2.includes(it))
}

function groupBy<T, K, V = T>(
    array: T[],
    predicate: (v: T) => K,
    mapFunction?: (value: T, index: number) => V,
): Map<K, V[]> {
    const map = new Map<K, V[]>()
    array.forEach((item, index, array) => {
        const key = predicate(item)
        let value = (mapFunction && mapFunction(item, index)) as V
        if (map.has(key)) {
            map.set(key, map.get(key)!!.concat([value]))
        } else {
            map.set(key, [value])
        }
    })
    return map
}

function sortComposition<T>(
    array: T[],
    comparators: Array<(a: T, b: T) => number>,
) {
    if (comparators.length) {
        return array.sort((a, b) => {
            for (let comparator of comparators) {
                let compareResult = comparator(a, b)
                if (compareResult !== 0) {
                    return compareResult
                }
            }
            return 0
        })
    } else {
        return array.sort()
    }
}

function toMap<T, K, V>(
    array: T[],
    mapKey: (value: T, index: number) => K,
    mapValue?: (value: T, index: number) => V,
): Map<K, V> {
    return new Map(
        array.map((value, index) => [
            mapKey(value, index),
            (mapValue ? mapValue : (value: T) => value as unknown as V)(value, index),
        ]),
    )
}

function repeat<T>(value: T, size: number) {
    const arr = []
    for (let i = 0; i < size; i++) {
        arr.push(value)
    }
    return arr
}

function generate<T>(length: number, generator: (index: number) => T) {
    return Array.from(new Array(length).keys()).map(generator)
}

export default {
    sum,
    remove,
    removeBy,
    intersectionOf,
    groupBy,
    sortComposition,
    toMap,
    repeat,
    generate,
}

function defaultToNumber<T>(item: T) {
    if (typeof item === "number") {
        return item
    } else {
        return 0
    }
}
