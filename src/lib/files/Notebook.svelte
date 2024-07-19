<script lang="ts" context="module">
</script>

<script lang="ts">
    import AddBlock from '$lib/files/AddBlock.svelte';
    import Cell from '$lib/files/Cell.svelte';
    import { pythonAsync } from '$lib/kernel/pythonAsync';
    import type { Kernel } from '$lib/kernel/type';
    import type { Notebook } from '$lib/notebook';
    import { onMount, setContext } from 'svelte';
    import { writable } from 'svelte/store';

    export let data: Notebook;
    let kernel: Kernel;
    let store = writable<Kernel>();

    setContext('kernel', store);
    onMount(async () => {
        kernel = await pythonAsync();
        store.set(kernel);
        kernel.fs.refreshFiles();
    });

    function addBlock(type: 'code' | 'markdown', index: number) {
        data.cells.splice(index, 0, {
            cell_type: type,
            source: type === 'code' ? [''] : '',
            outputs: [],
            execution_count: 0,
            metadata: { collapsed: false, scrolled: false },
        });
        data = { ...data };

        // Update file
        container.dispatchEvent(
            new CustomEvent('updated', { detail: data, bubbles: true }),
        );
    }

    let container: HTMLElement;

    function deleteBlock(index: number) {
        data.cells.splice(index, 1);
        data = { ...data };
        container.dispatchEvent(
            new CustomEvent('updated', { detail: data, bubbles: true }),
        );
    }
</script>

<!-- <div bind:this={editorContainer}></div> -->
<div class="notebook" bind:this={container}>
    {#each data.cells as cell, i}
        <AddBlock index={i} {addBlock} />
        <div class="cell-wrapper">
            <Cell {cell} deleteCell={() => deleteBlock(i)} />
        </div>
    {/each}
    <AddBlock index={data.cells.length} {addBlock} />
</div>

<style>
    .notebook {
        height: 100%;
        margin-left: 20px;
        padding-top: 20px;
        display: flex;
        flex-direction: column;
    }
</style>
