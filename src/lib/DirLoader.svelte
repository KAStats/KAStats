<script lang="ts">
    import { DataLoader } from '../services/dataLoader.ts';
    import { createEventDispatcher } from 'svelte';
    import { Snackbar, Button } from 'svelte-mui';
    import Spinner from './Spinner.svelte';
    import Fa from 'svelte-fa/src/fa.svelte'
    import { faRectangleXmark } from '@fortawesome/free-regular-svg-icons'

    //Declare the dispatch
    const dispatch = createEventDispatcher();

    let isLoading = false;
    let isLoaded = false;

    let snackbarVisible = false;
    let snackbarMessage = 'Wybierz katalog z raportami i potwierdź dostęp jak na poniższym opisie.';

    const loadData = async () => {
        isLoading = true;
        snackbarVisible = false;
        try {
            const dataLoader = DataLoader.getInstance();
            const meta = await dataLoader.getReportMetas(true);
            await dataLoader.loadReportsFromDir(Object.keys(meta));
            dataLoader.translateReportsToChartData();
            isLoaded = true;
            isLoading = false;
            dispatch('loaded', true);
        } catch (e) {
            if (e.message === 'The user aborted a request.') {
                snackbarVisible = true;
            }
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

<Snackbar bind:visible={snackbarVisible} class="error" timeout="0">
    {snackbarMessage}
    <span slot="action">
        <Button class="snackbar-close" on:click={() => (snackbarVisible = false)}><Fa icon={faRectangleXmark}
                                                                                      scale={2}/></Button>
    </span>
</Snackbar>
