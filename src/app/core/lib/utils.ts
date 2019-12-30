import { MatDateFormats } from '@angular/material';

export function isUndefined(value: any): value is undefined {
    return typeof value === 'undefined';
}

export function isNull(value: any): value is null {
    return value === null;
}

export function isNil(value: any): value is (null | undefined) {
    return value === null || typeof (value) === 'undefined';
}

export function isString(value: any): value is string {
    return typeof value === 'string';
}

export function isObject(value: any): boolean {
    return typeof value === 'object';
}

export function isArray(value: any): boolean {
    return Array.isArray(value);
}

export function isEmptyString(value: string): boolean {
    return isNil(value) || value.trim() === '';
}

export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

export function getByKey(obj, key_path) {
    let value;
    Object.keys(obj).forEach(function eachKey(key) {
        if (key == key_path) {
            value = obj[key_path];
        }
    });
    return value;
}

export function fixedTO(no) {
    if (Number.isInteger(no))
        return no;
    else if (no == 0)
        return '';
    else
        return (isNaN(Number(no.toFixed(2))) ? '' : Number(no.toFixed(2)));
}

export function getProperty(value: { [key: string]: any }, key: string): any {

    if (isNil(value) || !isObject(value)) {
        return undefined;
    }

    const keys: string[] = key.split('.');
    let result: any = value[keys.shift()];

    for (const i of keys) {
        if (isNil(result) || !isObject(result)) {
            return undefined;
        }
        result = result[i];
    }

    return result;
}
export const MM_DD_YYYY_Format: MatDateFormats = {
    parse: {
        dateInput: 'MM/DD/YYYY',
    },
    display: {
        dateInput: 'MM/DD/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MM YYYY',
    }
};

export function getArrayIndexObj(array, keyValue, index) {
    let result;
    array.forEach((element, key) => {
        if (element[index] == keyValue) {
            result = key;
        }
    });
    return result;
}

export function underscoreTrimEnd(value: string): string {
    if (value !== null && value.length > 0 && value.charAt(value.length - 1) === '_') {
        return value.substring(0, value.length - 1);
    }
    return value;
}

export function removeAllUnderscore(value: string): string {
    let result;
    if (value.includes('_')) {
        let re = /\_/gi;
        result = value.replace(re, '');
    } else {
        result = value;
    }
    return result;
}

export function isIeEdge(): boolean {
    const version = detectIE();
    if (version !== false && version >= 12) {
        return true;
    }
    return false;
}

export function isIe(): boolean {
    const version = detectIE();
    if (version !== false && version < 12) {
        return true;
    }
    return false;
}

function detectIE(): any {
    const ua = window.navigator.userAgent;

    // Test values; Uncomment to check result …

    // IE 10
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

    // IE 11
    // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

    // Edge 12 (Spartan)
    // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko)
    // Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

    // Edge 13
    // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)
    // Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

    const msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    const trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        const rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    const edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

export function getFileExt(fileName: string): string {
    return fileName.substr((fileName.lastIndexOf('.')));
}
