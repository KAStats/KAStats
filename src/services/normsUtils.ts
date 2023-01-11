import type { NormValue } from '../types/types';

export const isInNorm = (norm: NormValue, value: number) => {
    if (norm.min && norm.max) {
        return norm.min <= value && value <= norm.max;
    }
    if (norm.max) {
        return value <= norm.max;
    }
    if (norm.min) {
        return norm.min <= value;
    }
    console.log('--->>> isInNorm ', norm, value);
    throw new Error();
}

export const isOff = (norms: NormValue[], value: number) => {
    const norm = norms.find(n => n.level === '-');
    if (norm) {
        return !isInNorm(norm, value);
    }
    for (const norm of norms) {
        return isInNorm(norm, value);
    }
    console.log('--->>> isOff reportNorms', norms, value);
    throw new Error();
}

export const getOkNorm = (norms: NormValue[], noException = false): NormValue | null => {
    // console.log('--->>> getOkNorm norms', norms);
    const norm = norms.find(n => n.level === '-');
    if (norm) {
        return norm;
    }

    if (noException) {
        return null;
    }

    console.error('--->>> getOkNorm missing OK in norms', norms);
    throw new Error();
}
