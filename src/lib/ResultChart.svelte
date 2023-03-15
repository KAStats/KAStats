<script lang="ts">
    import { Line } from 'svelte-chartjs';
    import {
        Chart as ChartJS,
        Title,
        Tooltip,
        Legend,
        LineElement,
        LinearScale,
        PointElement,
        CategoryScale,
        TimeScale,
    } from 'chart.js';
    import 'chartjs-adapter-date-fns';
    import { ChartService } from '../services/ChartService/chartService.ts';
    import { DataLoader } from '../services/dataLoader.ts';
    import { afterUpdate } from 'svelte';
    import Spinner from './Spinner.svelte';

    export let from: number;
    export let to: number;
    export let title: string;
    export let subTitle: string;
    let showChart: boolean = false;

    $: fromDate = new Date(from);
    $: toDate = new Date(to);

    const dataLoader = DataLoader.getInstance();

    let data;
    let options;
    let plugins;

    afterUpdate(() => {
        const resultsChartData = dataLoader.getChartData(fromDate, toDate, title, subTitle);
        if (resultsChartData) {
            const chartService = new ChartService();
            const filteredChartData = chartService.filterChartDataSetByTime(fromDate, toDate, resultsChartData);
            data = chartService.getChartData(title, subTitle, filteredChartData);
            options = chartService.getChartOptions(filteredChartData, fromDate, toDate);
            plugins = chartService.getChartPlugins(filteredChartData, fromDate, toDate);
            setTimeout(() => {
                showChart = true;
            }, 1);
        }
    })

    ChartJS.register(
        Title,
        Tooltip,
        Legend,
        LineElement,
        LinearScale,
        PointElement,
        CategoryScale,
        TimeScale
    );
</script>

{#if data}
    <div class="chart-wrapper">
        <div>{subTitle}</div>
        <div class="chart-container">
            <div class="chart-container-spinner">
                <Spinner/>
            </div>
            {#if showChart}
                <div class="chart">
                    <Line {data} {options} {plugins}/>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .chart-container {
        position: relative;
        margin: auto;
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .chart-container-spinner {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
    }

    .chart {
        position: relative;
        width: 100%;
        height: 100%;
        z-index: 2;
    }
</style>
