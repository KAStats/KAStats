<script lang="ts">
    import DirLoader from './lib/DirLoader.svelte';
    import ResultChart from './lib/ResultChart.svelte';
    import TitleSelect from './lib/TitleSelect.svelte';
    import { afterUpdate } from 'svelte';
    import DateRangeSelect from './lib/DateRangeSelect.svelte';
    import ReportHeader from './lib/ReportHeader.svelte';
    import AppHelper from './lib/AppHelper.svelte';
    import type { Dictionary } from './types/global.d.ts';

    let isLoaded = false;
    let from: number;
    let to: number;
    let selectedTitles: Dictionary<string[]> = {};

    const whenLoaded = (event) => isLoaded = true;

    const whenDateSelected = (event) => {
        from = event.detail.from;
        to = event.detail.to;
        // console.log('---->>>> App whenDateSelected from', from, new Date(from));
        // console.log('---->>>> App whenDateSelected to', to, new Date(to));
    }

    const whenTitleSelected = (event) => {
        selectedTitles = event.detail.selected;
        // console.log('---->>>> App whenTitleSelected', selectedTitles);
    }

    afterUpdate(() => {
        // console.log('---->>>> App afterUpdate', from, to);
    })
</script>

<main>
    <div class="app-wrapper">
        <div class="card">
            Statystyki Kwantowego Analizatora
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

            {#each Object.keys(selectedTitles) as title}
                <div class="card-group">
                    <div class="card card-group-title">
                        <h2>{title}</h2>
                    </div>
                    {#each selectedTitles[title] as subTitle}
                        <div class="card">
                            <ResultChart {title} {subTitle} {from} {to}/>
                        </div>
                    {/each}
                </div>
            {/each}
        {/if}
    </div>
    <div class="version">v{__APP_VERSION__}</div>
</main>

<style>
    main {
        position: relative;
        height: 100%;
    }

    .version {
        position: absolute;
        bottom: 0;
        right: -28px;
        font-size: 0.8em;
        color: #999;
    }

    .form-control {
        text-align: left;
    }
</style>
