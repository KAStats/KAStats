import { getOkNorm } from './normsUtils';
import { describe, expect, it } from 'vitest';
import type { NormValue } from '../types/types';

describe("normsUtils", () => {
    const normTests: [number, NormValue, NormValue[]][] = [
        [1, { level: '-', min: 0.192, max: 0.412 }, [{ level: '-', min: 0.192, max: 0.412 }]],
        [2, { level: '-', min: 0.192, max: 0.412 }, [{ level: '-', min: 0.192, max: 0.412 }, {
            level: '+',
            min: 0.412,
            max: 0.612
        }]],
        [3, { level: '-', min: 0.192, max: 0.412 }, [{ level: '-', min: 0.192, max: 0.412 }, {
            level: '+',
            min: 0.412,
            max: 0.612
        }, {
            level: '++',
            min: 0.612
        }]],
        [4, { level: '-', max: 2 }, [{ level: '+++', min: 2 }]],
        [5, { level: '-', min: 1, max: 2 }, [{ level: '+++', min: 2 }, { level: '+++', max: 1 }]],
    ];

    for (const [no, expRes, testNorms] of normTests) {
        test(`getOkNorm works with test ${no}`, () => {
            const norm = getOkNorm(testNorms);

            expect(norm).toEqual(expRes);
        });
    }
});
