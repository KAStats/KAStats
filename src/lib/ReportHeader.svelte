<script lang="ts">
    import { DataLoader } from '../services/dataLoader';

    const dataLoader = DataLoader.getInstance();
    $:meta = dataLoader.getFirstReportMetaCache();
    $:amount = dataLoader.getReportsAmount();

</script>

{#if meta}
    <div class="meta-wrapper">
        <div>Imię: {meta.name}</div>
        <div>Wiek: {meta.age}</div>
        <div>Płeć: {meta.sex}</div>
        <div>Wczytano raportów: {amount} </div>
    </div>
{/if}

<style>
    .meta-wrapper {
        display: flex;
    }

    .meta-wrapper * {
        padding-right: 2em;
    }
</style>
