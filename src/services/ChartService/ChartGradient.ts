import type { NormValue } from '../../types/types';
import { getValueColor } from './utils';

export class ChartGradient {
    private width = 0;
    private height = 0;
    private gradient;

    public getGradientColor(values: number[], norms: NormValue[]) {
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

            // console.log('--->>> getGradient', min, max, norms);
            const normMids = norms
                .map(n => (n.min && n.max) ? (n.min + n.max) / 2 : n.min || n.max)
                .filter(v => min < v && v < max)
                .sort();
            // console.log('--->>> getGradient normMids', normMids);
            const range = max - min;
            const colorSets = normMids.map(v => ({
                offset: (v - min) / range,
                color: getValueColor(norms, v),
            }));
            // console.log('--->>> getGradient colorSets', colorSets);

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
