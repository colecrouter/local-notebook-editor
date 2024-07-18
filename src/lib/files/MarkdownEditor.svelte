<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { marked } from 'marked';

    export let markdown: string | string[];
    export let editing = false;

    let compiledMarkdown: string;

    const dispatch = createEventDispatcher();

    // Function to compile Markdown
    async function compileMarkdown() {
        compiledMarkdown = await marked(
            typeof markdown === 'string' ? markdown : markdown.join(''),
        );
        dispatch('updated', { markdown: compiledMarkdown });
    }

    // Compile markdown on initial load and on changes
    onMount(compileMarkdown);
    $: editing, compileMarkdown();
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="markdown-container" on:dblclick={() => (editing = true)}>
    {#if editing}
        <textarea class="markdown-editor" bind:value={markdown}></textarea>
    {:else}
        <div class="markdown-preview">
            {@html compiledMarkdown}
        </div>
    {/if}
</div>

<style>
    .markdown-container {
        display: flex;
        justify-content: space-between;
        padding: 0 20px;
    }

    .markdown-container:has(.markdown-editor:focus) {
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .markdown-editor {
        width: 100%;
        /* border: 1px solid #ccc; */
        border: none;
        padding: 10px;
        /* box-sizing: border-box; */
    }

    .markdown-editor:focus {
        outline: none;
    }

    .markdown-editor {
        font-family: monospace;
    }

    .markdown-preview {
        overflow-y: auto;
    }
</style>
