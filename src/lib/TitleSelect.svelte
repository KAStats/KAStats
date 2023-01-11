<script lang="ts">
    import { DataLoader } from '../services/dataLoader';
    import { createEventDispatcher } from 'svelte';

    export let from: number;
    export let to: number;
    let title: string;
    let subTitle: string;
    let onlyOff = false;
    let allSubtitles = false;

    const dispatch = createEventDispatcher();

    const dataLoader = DataLoader.getInstance();
    $: titleStructure = dataLoader.getTitleStructure(new Date(from), new Date(to), onlyOff);

    const handleSelectTitle = (event) => {
        title = event.target.value;
        subTitle = titleStructure[title][0];
        if (allSubtitles) {
            dispatch('titleSelected', { title, subTitles: titleStructure[title] || [] });
        } else {
            dispatch('titleSelected', { title, subTitles: [subTitle] });
        }
    }

    const handleSelectSubTitle = (event) => {
        subTitle = event.target.value;
        dispatch('titleSelected', { title, subTitles: [subTitle] });
    }

    const handleOnlyOff = (event) => {
        if (title) {
            if (allSubtitles) {
                dispatch('titleSelected', { title, subTitles: titleStructure[title] || [] });
            } else {
                dispatch('titleSelected', { title, subTitles: [subTitle] });
            }
        }
    }

    const handleAllSubtitles = (event) => {
        if (title) {
            if (allSubtitles) {
                dispatch('titleSelected', { title, subTitles: titleStructure[title] || [] });
            } else {
                dispatch('titleSelected', { title, subTitles: [subTitle] });
            }
        }
    }
</script>

{#if titleStructure && Object.keys(titleStructure).length > 0}
    <select bind:value={title} on:change={handleSelectTitle}>
        <option disabled selected value> -- wybierz tytuł --</option>
        {#each Object.keys(titleStructure) as title, i}
            <option value={title}>{title}</option>
        {/each}
    </select>
    {#if titleStructure[title] && titleStructure[title].length > 0 && !allSubtitles}
        <select bind:value={subTitle} on:change={handleSelectSubTitle}
                disabled={!titleStructure[title] || titleStructure[title].length === 0}>
            {#each titleStructure[title] as subTitle, i}
                <option value={subTitle}>{subTitle}</option>
            {/each}
        </select>
    {/if}
    <label>
        <input type=checkbox bind:checked={onlyOff} on:change={handleOnlyOff}>
        Tylko poza normą
    </label>
    <label>
        <input type=checkbox bind:checked={allSubtitles} on:change={handleAllSubtitles}>
        Cały dział
    </label>
{/if}
