<script lang="ts">
    import { DateInput } from 'date-picker-svelte';
    import { afterUpdate, createEventDispatcher } from 'svelte';
    import { getDateChangedByDays } from '../services/dateUtils';
    import { DataLoader } from '../services/dataLoader';

    let from = getDateChangedByDays(-21);
    let to = new Date();

    const dispatch = createEventDispatcher();
    const dataLoader = DataLoader.getInstance();

    $:fromMax = getDateChangedByDays(0, to);
    $:toMin = getDateChangedByDays(1, from);
    let foundAmount = dataLoader.getFiteredAmount(from, to);

    afterUpdate(() => {
        foundAmount = dataLoader.getFiteredAmount(from, to);
        dispatch('dateSelected', { from: from.getTime(), to: to.getTime() });
    });
</script>

<div class="date-time-group">
    <div class="date-time-control">
        <div class="date-time-label">Od:</div>
        <DateInput bind:max={fromMax} bind:value={from} format="yyyy-MM-dd"/>
    </div>
    <div class="date-time-control">
        <div class="date-time-label">Do:</div>
        <DateInput bind:min={toMin} bind:value={to} format="yyyy-MM-dd"/>
    </div>
    <div>
        Wybrano raportów: {foundAmount}
    </div>
</div>

<style>
    .date-time-group {
        display: flex;
    }

    .date-time-control {
        display: flex;
        justify-content: space-between;
    }

    .date-time-control:not(:last-child) {
        padding-right: 2em;
    }

    .date-time-label {
        padding-right: 1em;
    }
</style>
