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

    export let from: number;
    export let to: number;
    export let title: string;
    export let subTitle: string;

    $: fromDate = new Date(from);
    $: toDate = new Date(to);

    const dataLoader = DataLoader.getInstance();

    let data;
    let options;

    afterUpdate(() => {
        const resultsChartData = dataLoader.getChartData(fromDate, toDate, title, subTitle);
        if (resultsChartData) {
            const chartService = new ChartService();
            const filteredChartData = chartService.filterChartDataSetByTime(fromDate, toDate, resultsChartData);
            data = chartService.getChartData(title, subTitle, filteredChartData);
            options = chartService.getChartOptions(title, subTitle, filteredChartData, fromDate, toDate);
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
    <div class="chart-container">
        <Line {data} {options}/>
    </div>
{/if}

<style>
    .chart-container {
        position: relative;
        margin: auto;
        height: 40vh;
        width: 80vw;
    }
</style>
