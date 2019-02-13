import defaultLang from './lang/zh-CN';

let deflang = defaultLang;


export const lang = (path, options) => {
    let value;
    const array = path.split('.');
    let ObjVal = deflang;
    let i = 0, j = array.length - 1;
    while (i <= j) {
        const property = array[i];//key
        value = ObjVal[property];//val
        ObjVal = value;
        i++;
    }
    return value ? value : '';
};
