import type { ChartDataSet, NormValue } from '../types/types';
import { getOkNorm, isInNorm } from './normsUtils';

const CHART_COLORS = {
    red: 'rgb(255,0,0)',
    red50: 'rgba(255,0,0, 0.5)',
    orange: 'rgb(255,98,0)',
    orange50: 'rgba(255,98,0, 0.5)',
    yellow: 'rgb(255, 205, 86)',
    yellow50: 'rgba(255, 205, 86, 0.5)',
    green: 'rgb(0,203,34)',
    green50: 'rgba(0,203,34, 0.5)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    lightGrey: 'rgb(201, 203, 207)',
    grey: 'rgb(101, 103, 107)',
    darkGrey: 'rgb(49,49,51)',
    white: 'rgb(255,255,255)'
};

const NORM_LEVEL_TO_COLOR = {
    '-': CHART_COLORS.green,
    '+': CHART_COLORS.yellow,
    '++': CHART_COLORS.orange,
    '+++': CHART_COLORS.red,
};

const NORM_LEVEL_TO_COLOR_ALPHA = {
    '-': CHART_COLORS.green50,
    '+': CHART_COLORS.yellow50,
    '++': CHART_COLORS.orange50,
    '+++': CHART_COLORS.red50,
};

export class ChartService {
    public getChartData(title: string, subTitle: string, chartDataSet: ChartDataSet) {
        // console.log('--->>> ChartService.getChartData', title, subTitle, chartDataSet);
        const labels = chartDataSet.times.map(t => new Date(t)); // .map(t => format(new Date(t), 'dd.MM.yyyy k:mm'));
        const values = chartDataSet.data;
        return getData(subTitle, labels, values, chartDataSet.norms);
    }

    public getChartOptions(title: string, subTitle: string, chartDataSet: ChartDataSet, from: Date, to: Date) {
        // console.log('--->>> ChartService.getChartData', title, subTitle, chartDataSet);
        return getOptions(subTitle, chartDataSet, from, to);
    }

    public filterChartDataSetByTime(from: Date, to: Date, chartDataSet: ChartDataSet): ChartDataSet {
        const fromTS = from.getTime();
        const toTS = to.getTime();
        const filterIndexes = chartDataSet.times
            .reduce((res, val, index) =>
                    fromTS <= val && val <= toTS ? [...res, index] : res,
                [] as number[]);
        const filteredChartDataSet = { ...chartDataSet };
        filteredChartDataSet.times = filterIndexes.map(index => chartDataSet.times[index]);
        filteredChartDataSet.data = filterIndexes.map(index => chartDataSet.data[index]);
        filteredChartDataSet.isOff = filterIndexes.map(index => chartDataSet.isOff[index]);
        return filteredChartDataSet;
    }
}


let width, height, gradient;

function getGradient(ctx, chartArea, min: number, max: number, norms: NormValue[]) {
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    if (!gradient || width !== chartWidth || height !== chartHeight) {
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

        width = chartWidth;
        height = chartHeight;
        gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, getValueColor(norms, min));
        for (const colorSet of colorSets) {
            gradient.addColorStop(colorSet.offset, colorSet.color);
        }
        gradient.addColorStop(1, getValueColor(norms, max));
    }
    return gradient;
}

const getGradientColor = (values: number[], norms: NormValue[], name: string) => (context) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const chart = context.chart;
    const { ctx, chartArea } = chart;

    if (!chartArea) {
        // This case happens on initial chart load
        return;
    }
    return getGradient(ctx, chartArea, min, max, norms);
};

export const getData = (title: string, labels: string[] | Date[], values: number[], norms: NormValue[]) => {
    // console.log('--->>> getData norms', norms);
    return {
        labels: labels,
        datasets: [
            {
                label: title,
                fill: true,
                lineTension: 0.3,
                backgroundColor: 'rgba(184, 185, 210, .3)',
                borderColor: getGradientColor(values, norms, 'borderColor'),
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: getGradientColor(values, norms, 'pointBorderColor'),
                pointBackgroundColor: 'rgb(255, 255, 255)',
                pointBorderWidth: 10,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgb(0, 0, 0)',
                pointHoverBorderColor: getGradientColor(values, norms, 'pointHoverBorderColor'),
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: values,
            },
        ],
    };
}

const recountVScale = (chartDataSet: ChartDataSet) => {
    const minValue = Math.min(...chartDataSet.data);
    const maxValue = Math.max(...chartDataSet.data);
    const okNorm = getOkNorm(chartDataSet.norms);
    const halfMin = okNorm.max < minValue || minValue === maxValue ? okNorm.max : minValue;
    const halfMax = maxValue < okNorm.min || minValue === maxValue ? okNorm.min : maxValue;
    const stepSize = (halfMax - halfMin) / 7;
    const min = halfMin === minValue ? minValue - stepSize : halfMin;
    const max = halfMax === maxValue ? maxValue + stepSize : halfMax;
    return {
        min,
        max,
        ticks: {
            stepSize,
        }
    };
};

const getOptions = (title: string, chartDataSet: ChartDataSet, from: Date, to: Date) => {
    const vScale = recountVScale(chartDataSet);
    return {
        // responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: false,
            title: {
                display: true,
                text: title,
                color: CHART_COLORS.white
            }
        },
        scales: {
            x: {
                type: 'time',
                min: from.getTime(),
                max: to.getTime(),
                time: {
                    tooltipFormat: 'dd.MM.yyyy k:mm',
                    displayFormats: {
                        datetime: 'dd.MM.yyyy k:mm:ss',
                        millisecond: 'k:mm:ss.SSS',
                        second: 'k:mm:ss',
                        minute: 'k:mm',
                        hour: 'k:mm',
                        day: 'd.MM',
                        week: 'W',
                        month: 'MM.yyyy',
                        quarter: 'MM.yyyy',
                        year: 'yyyy'
                    }
                },
                border: {
                    display: true
                },
                grid: {
                    display: true,
                    drawOnChartArea: true,
                    drawTicks: true,
                    color: CHART_COLORS.darkGrey,
                },
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    major: {
                        enabled: true
                    },
                    color: function (context) {
                        return context.tick && context.tick.major ? CHART_COLORS.white : CHART_COLORS.lightGrey;
                    },
                    font: function (context) {
                        if (context.tick && context.tick.major) {
                            return {
                                weight: 'bold',
                            };
                        }
                    }
                }

            },
            y: {
                border: {
                    display: false
                },
                grid: {
                    color: getColorFunction(chartDataSet.norms),
                },
                ...vScale,
                ticks: {
                    autoSkip: false,
                    major: {
                        enabled: true
                    },
                    color: function (context) {
                        return context.tick && context.tick.major ? CHART_COLORS.white : CHART_COLORS.lightGrey;
                    },
                    font: function (context) {
                        if (context.tick && context.tick.major) {
                            return {
                                weight: 'bold',
                            };
                        }
                    }
                }
            }
        }
    }
};

const getColorFunction = (norms: NormValue[]) => (context): string => getValueColor(norms, context.tick.value, true);

const getValueColor = (norms: NormValue[], value: number, isAlpha = false): string => {
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
