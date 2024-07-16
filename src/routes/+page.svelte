<script lang="ts">
    import {
        IndexedDBFileSystem,
        SessionFileSystem,
        VirtualFileSystem,
    } from '$lib/fs';
    import type { ComponentType, SvelteComponent } from 'svelte';
    import Sidebar from './Sidebar.svelte';
    import Text from '$lib/files/Text.svelte';
    import Notebook from '$lib/files/Notebook.svelte';

    let fs = new IndexedDBFileSystem();
    let selectedFile = '';
    let props: Record<string, any> = {};

    let currentComponent: ComponentType;

    $: {
        if (selectedFile) {
            if (selectedFile.endsWith('.ipynb')) {
                const notebook = fs.readFile(selectedFile);
                currentComponent = Notebook;
                props = { notebook: JSON.parse(notebook ?? '') };
            } else {
                const text = fs.readFile(selectedFile);
                currentComponent = Text;
                props = { text };
            }
        }
    }

    let editor: HTMLElement;
</script>

<div class="wrapper">
    <div>
        <Sidebar {fs} bind:selectedFile />
    </div>

    <div class="content">
        {#if currentComponent}
            <div bind:this={editor}></div>
            <svelte:component this={currentComponent} {...props} />
        {/if}
    </div>
</div>

<style>
    .wrapper {
        display: flex;
        width: 100%;
    }

    .content {
        flex: 1;
        height: 100vh;
        width: 100%;
        overflow: scroll;
    }
</style>
