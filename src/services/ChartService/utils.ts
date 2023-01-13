import type { NormValue } from '../../types/types';
import { isInNorm } from '../normsUtils';
import { NORM_LEVEL_TO_COLOR, NORM_LEVEL_TO_COLOR_ALPHA } from './constants';

export const getColorFunction = (norms: NormValue[]) => (context): string => getValueColor(norms, context.tick.value, true);
export const getValueColor = (norms: NormValue[], value: number, isAlpha = false): string => {
    for (const norm of norms) {
        const isIn = isInNorm(norm, value);
        if (isIn) {
            return levelToColor(norm.level, isAlpha);
        }
    }
    return NORM_LEVEL_TO_COLOR['-'];
}
const levelToColor = (level: string, isAlpha = false): string =>
    isAlpha ?
        NORM_LEVEL_TO_COLOR_ALPHA[level] || NORM_LEVEL_TO_COLOR_ALPHA['-'] :
        NORM_LEVEL_TO_COLOR[level] || NORM_LEVEL_TO_COLOR['-'];
