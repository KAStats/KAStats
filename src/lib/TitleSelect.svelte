<script lang="ts">
    import { DataLoader } from '../services/dataLoader';
    import { createEventDispatcher } from 'svelte';
    import { Checkbox } from 'svelte-mui';
    import type { Dictionary } from '../types/global.d.ts';

    export let from: number;
    export let to: number;
    let title: string;
    let subTitle: string;
    let selected: Dictionary<string[]> = {};
    let onlyOff = false;
    let allSubtitles = false;
    let allTitles = false;

    const dispatch = createEventDispatcher();

    const dataLoader = DataLoader.getInstance();
    $: titleStructure = dataLoader.getTitleStructure(new Date(from), new Date(to), onlyOff);
    $: showTitleSelect = !allTitles && titleStructure && Object.keys(titleStructure).length > 0;
    $: showSubTitleSelect = showTitleSelect && !allSubtitles && titleStructure[title] && titleStructure[title].length > 0;

    const handleSelectTitle = (event) => {
        selected = {};
        title = event.target.value;
        subTitle = titleStructure[title][0];
        if (allSubtitles) {
            selected[title] = titleStructure[title] || [];
        } else {
            selected[title] = [subTitle];
        }
        dispatch('titleSelected', { selected });
    }

    const handleSelectSubTitle = (event) => {
        subTitle = event.target.value;
        selected = {};
        selected[title] = [subTitle];
        dispatch('titleSelected', { selected });
    }

    const handleOnlyOff = (event) => {
        if (allTitles) {
            selected = titleStructure;
            dispatch('titleSelected', { selected });
        } else if (title) {
            selected = {};
            if (allSubtitles) {
                selected[title] = titleStructure[title] || [];
            } else {
                selected[title] = [subTitle];
            }
            dispatch('titleSelected', { selected });
        }
    }

    const handleAllSubtitles = (event) => {
        allTitles = false;
        if (title) {
            selected = {};
            if (allSubtitles) {
                selected[title] = titleStructure[title] || [];
            } else {
                selected[title] = [subTitle];
            }
            dispatch('titleSelected', { selected });
        }
    }

    const handleAllTitles = (event) => {
        allSubtitles = false;
        selected = {};
        if (allTitles) {
            selected = titleStructure;
        } else if (title) {
            selected[title] = [subTitle];
        }
        dispatch('titleSelected', { selected });
    }
</script>

<div class="form-row">
    {#if showTitleSelect}
        <select bind:value={title} on:change={handleSelectTitle}>
            <option disabled selected value> -- wybierz tytuł --</option>
            {#each Object.keys(titleStructure) as title, i}
                <option value={title}>{title}</option>
            {/each}
        </select>
        {#if showSubTitleSelect}
            <select bind:value={subTitle} on:change={handleSelectSubTitle}
                    disabled={!titleStructure[title] || titleStructure[title].length === 0}>
                {#each titleStructure[title] as subTitle, i}
                    <option value={subTitle}>{subTitle}</option>
                {/each}
            </select>
        {/if}
    {/if}
    <label>
        <Checkbox bind:checked={onlyOff} class="checkbox" on:change={handleOnlyOff}>Tylko poza normą</Checkbox>
    </label>
    <label>
        <Checkbox bind:checked={allSubtitles} class="checkbox" on:change={handleAllSubtitles}>Cały dział</Checkbox>
    </label>
    <label>
        <Checkbox bind:checked={allTitles} class="checkbox" on:change={handleAllTitles}>Wszystkie wykresy</Checkbox>
    </label>
</div>

<style>
    .form-row {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .form-row > * {
        margin-right: 1rem;
    }
</style>
