import type { NormValue } from '../../types/types';
import { getValueColor, levelToColor } from './utils';

export class ChartGradient {
    private width = 0;
    private height = 0;
    private gradient;

    public getGradientColor(values: number[], norms: NormValue[]) {
        if (!norms || norms.length === 0) {
            return levelToColor('-', true);
        }

        return (context) => {
            const min = Math.min(...values);
            const max = Math.max(...values);
            const chart = context.chart;
            const { ctx, chartArea } = chart;

            if (!chartArea) {
                // This case happens on initial chart load
                return;
            }
            return this.getGradient(ctx, chartArea, min, max, norms);
        };
    }

    private getGradient(ctx, chartArea, min: number, max: number, norms: NormValue[]) {
        const chartWidth = chartArea.right - chartArea.left;
        const chartHeight = chartArea.bottom - chartArea.top;
        if (!this.gradient || this.width !== chartWidth || this.height !== chartHeight) {
            // Create the gradient because this is either the first render
            // or the size of the chart has changed


            const minNorm = norms.reduce((res, row) => {
                if (!res && row.min && row.max) {
                    return row;
                }
                if (res && res.min && res.max && row.min && row.max && res.max - res.min > row.max - row.min) {
                    return row;
                }
                return res;
            }, null as NormValue | null);
            if (!minNorm) {
                throw new Error('Invalid minNorm value');
            }
            const step = (minNorm.max - minNorm.min) / 20;
            // console.log('--->>> getGradient step', step);

            // console.log('--->>> getGradient', min, max, norms);
            const normMids = norms
                .map(n => (n.min && n.max) ? (n.min + n.max) / 2 : n.min || n.max)
                .filter(v => min < v && v < max)
                .sort();
            // console.log('--->>> getGradient normMids', JSON.stringify(normMids));
            const normCols = norms
                .reduce((res, n) => {
                    // console.log('--->>> getGradient reduce n', JSON.stringify(n));
                    if (n.min) {
                        res.push(n.min + step);
                    }
                    if (n.max) {
                        res.push(n.max - step);
                    }
                    res.push((n.min && n.max) ? (n.min + n.max) / 2 : n.min || n.max);
                    // console.log('--->>> getGradient reduce res', JSON.stringify(res));
                    return res;
                }, [] as number[])
                .filter(v => min < v && v < max)
                .sort();
            // console.log('--->>> getGradient normCols', JSON.stringify(normCols));
            const range = max - min;
            const colorSets = normCols.map(v => ({
                offset: (v - min) / range,
                color: getValueColor(norms, v),
            }));
            // console.log('--->>> getGradient colorSets', JSON.stringify(colorSets));

            this.width = chartWidth;
            this.height = chartHeight;
            this.gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            this.gradient.addColorStop(0, getValueColor(norms, min));
            for (const colorSet of colorSets) {
                this.gradient.addColorStop(colorSet.offset, colorSet.color);
            }
            this.gradient.addColorStop(1, getValueColor(norms, max));
        }
        return this.gradient;
    }
}
