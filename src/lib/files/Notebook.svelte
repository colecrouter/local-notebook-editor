<script lang="ts" context="module">
</script>

<script lang="ts">
    import Cell from '$lib/files/Cell.svelte';
    import { python } from '$lib/kernel/python';
    import type { Kernel } from '$lib/kernel/type';
    import type { Notebook } from '$lib/notebook';
    import { onMount, setContext } from 'svelte';
    import { writable } from 'svelte/store';

    export let data: Notebook;
    let kernel: Kernel;
    let store = writable<Kernel>();

    setContext('kernel', store);
    onMount(async () => {
        kernel = await python();
        store.set(kernel);
    });
</script>

<!-- <div bind:this={editorContainer}></div> -->
<div class="notebook">
    {#key data}
        {#each data.cells as cell}
            <div class="cell-wrapper">
                <Cell {cell} />
            </div>
        {/each}
    {/key}
</div>

<style>
    .notebook {
        height: 100%;
        margin-left: 20px;
        padding-top: 20px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
</style>
