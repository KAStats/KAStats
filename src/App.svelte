<script lang="ts">
    import DirLoader from './lib/DirLoader.svelte';
    import ResultChart from './lib/ResultChart.svelte';
    import TitleSelect from './lib/TitleSelect.svelte';
    import { afterUpdate } from 'svelte';
    import DateRangeSelect from './lib/DateRangeSelect.svelte';
    import ReportHeader from './lib/ReportHeader.svelte';
    import AppHelper from './lib/AppHelper.svelte';

    let isLoaded = false;
    let from: number;
    let to: number;
    let title = '';
    let subTitles: string[] = [];

    const whenLoaded = (event) => isLoaded = true;

    const whenDateSelected = (event) => {
        from = event.detail.from;
        to = event.detail.to;
        // console.log('---->>>> App whenDateSelected from', from, new Date(from));
        // console.log('---->>>> App whenDateSelected to', to, new Date(to));
    }

    const whenTitleSelected = (event) => {
        title = event.detail.title;
        subTitles = event.detail.subTitles;
        // console.log('---->>>> App whenTitleSelected', title, subTitles);
    }

    afterUpdate(() => {
        // console.log('---->>>> App afterUpdate', from, to);
    })
</script>

<main>
    <div>
        <div class="card">
            Statystyki Kwantowego Analizatora V {__APP_VERSION__}
        </div>
        {#if !isLoaded}
            <div class="card">
                <DirLoader on:loaded={whenLoaded}/>
            </div>
            <div class="card">
                <AppHelper/>
            </div>
        {/if}
        {#if isLoaded}
            <div class="card">
                <div class="form-control">
                    <ReportHeader/>
                </div>
                <div class="form-control">
                    <DateRangeSelect on:dateSelected={whenDateSelected}/>
                </div>
                <div class="form-control">
                    <TitleSelect on:titleSelected={whenTitleSelected} {from} {to}/>
                </div>
            </div>

            {#each subTitles as subTitle}
                <div class="card">
                    <ResultChart {title} {subTitle} {from} {to}/>
                </div>
            {/each}
        {/if}
    </div>
</main>

<style>
    .form-control {
        text-align: left;
    }
</style>
