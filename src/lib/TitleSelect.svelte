<script lang="ts">
    import { DataLoader } from '../services/dataLoader';
    import { createEventDispatcher } from 'svelte';
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
    <input bind:checked={onlyOff} on:change={handleOnlyOff} type=checkbox>
    Tylko poza normą
</label>
<label>
    <input bind:checked={allSubtitles} on:change={handleAllSubtitles} type=checkbox>
    Cały dział
</label>
<label>
    <input bind:checked={allTitles} on:change={handleAllTitles} type=checkbox>
    Wszystkie wykresy
</label>
