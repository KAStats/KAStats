export const CHART_COLORS = {
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
export const NORM_LEVEL_TO_COLOR = {
    '-': CHART_COLORS.green,
    '+': CHART_COLORS.yellow,
    '++': CHART_COLORS.orange,
    '+++': CHART_COLORS.red,
};
export const NORM_LEVEL_TO_COLOR_ALPHA = {
    '-': CHART_COLORS.green50,
    '+': CHART_COLORS.yellow50,
    '++': CHART_COLORS.orange50,
    '+++': CHART_COLORS.red50,
};
