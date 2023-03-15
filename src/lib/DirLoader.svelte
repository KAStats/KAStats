<script lang="ts">
    import { DataLoader } from '../services/dataLoader.ts';
    import { createEventDispatcher } from 'svelte';
    import Spinner from './Spinner.svelte';

    //Declare the dispatch
    const dispatch = createEventDispatcher();

    let isLoading = false;
    let isLoaded = false;

    const loadData = async () => {
        isLoading = true;
        try {
            const dataLoader = DataLoader.getInstance();
            const meta = await dataLoader.getReportMetas(true);
            await dataLoader.loadReportsFromDir(Object.keys(meta));
            dataLoader.translateReportsToChartData();
            isLoaded = true;
            isLoading = false;
            dispatch('loaded', true);
        } catch (e) {
            console.error(e);
            isLoading = false;
        }
    }
</script>

{#if isLoading}
    <Spinner/>
{:else}
    <button on:click={loadData}>
        Otwórz katalog z raportami
    </button>
{/if}
