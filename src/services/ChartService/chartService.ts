import type { ChartDataSet, NormValue } from '../../types/types';
import { getOkNorm } from '../normsUtils';
import { CHART_COLORS } from './constants';
import { getColorFunction } from './utils';
import { ChartGradient } from './ChartGradient';
import { isDarkMode } from '../utils';

export class ChartService {
    public getChartData(title: string, subTitle: string, chartDataSet: ChartDataSet) {
        // console.log('--->>> ChartService.getChartData', title, subTitle, chartDataSet);
        const labels = chartDataSet.times.map(t => new Date(t));
        const values = chartDataSet.data;
        return this.getData(subTitle, labels, values, chartDataSet.norms);
    }

    public getChartOptions(chartDataSet: ChartDataSet, from: Date, to: Date) {
        return this.getOptions(chartDataSet, from, to);
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

    private getData(title: string, labels: string[] | Date[], values: number[], norms: NormValue[]) {
        // console.log('--->>> getData norms', norms);
        const chartGradient = new ChartGradient();
        return {
            labels: labels,
            datasets: [
                {
                    label: title,
                    fill: true,
                    lineTension: 0.3,
                    backgroundColor: 'rgba(184, 185, 210, .3)',
                    borderColor: chartGradient.getGradientColor(values, norms),
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: chartGradient.getGradientColor(values, norms),
                    pointBackgroundColor: 'rgb(255, 255, 255)',
                    pointBorderWidth: 10,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgb(0, 0, 0)',
                    pointHoverBorderColor: chartGradient.getGradientColor(values, norms),
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: values,
                },
            ],
        };
    }

    private recountVScale(chartDataSet: ChartDataSet) {
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

    private getOptions(chartDataSet: ChartDataSet, from: Date, to: Date) {
        const vScale = this.recountVScale(chartDataSet);
        return {
            // responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: false
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
                            return context.tick && context.tick.major ?
                                isDarkMode() ? CHART_COLORS.white : CHART_COLORS.darkGrey :
                                isDarkMode() ? CHART_COLORS.lightGrey : CHART_COLORS.dark;
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
                            return context.tick && context.tick.major ?
                                isDarkMode() ? CHART_COLORS.white : CHART_COLORS.darkGrey :
                                isDarkMode() ? CHART_COLORS.lightGrey : CHART_COLORS.dark;
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
}
