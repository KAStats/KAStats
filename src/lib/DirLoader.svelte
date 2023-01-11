<script lang="ts">
    import { DataLoader } from '../services/dataLoader.ts';
    import { createEventDispatcher } from 'svelte';

    //Declare the dispatch
    const dispatch = createEventDispatcher();

    let isLoaded = false;

    const loadData = async () => {
        const dataLoader = DataLoader.getInstance();
        const meta = await dataLoader.getReportMetas(true);
        await dataLoader.loadReportsFromDir(Object.keys(meta));
        dataLoader.translateReportsToChartData();
        isLoaded = true;
        dispatch('loaded', true);
    }
</script>

<button on:click={loadData}>
    Otwórz katalog
</button>
