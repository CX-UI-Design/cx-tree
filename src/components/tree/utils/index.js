export const objectAssign = function (target) {
    for (let i = 1, j = arguments.length; i < j; i++) {
        let source = arguments[i] || {};
        for (let prop in source) {
            if (source.hasOwnProperty(prop)) {
                let value = source[prop];
                if (value !== undefined) {
                    target[prop] = value;
                }
            }
        }
    }

    return target;
};

/**
 * judge type accurate
 * @param value
 * @returns {*}
 */
export const judgeType = function (value) {
    const t = Object.prototype.toString.call(value);
    let map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object'
    };
    if (value instanceof Element) {
        return 'element';
    }
    return map[t];
};

export const replaceParam = (Old, New) => {
    return !New && ![false, 0].includes(New) ? Old : New;
};
