<script lang="ts" context="module">
    import { Mutex } from 'async-mutex';

    const runningMutex = new Mutex();
</script>

<script lang="ts">
    import CodeEditor from '$lib/files/CodeEditor.svelte';
    import MarkdownEditor from '$lib/files/MarkdownEditor.svelte';
    import { formatNotebookOutput } from '$lib/files/output';
    import type { Kernel } from '$lib/kernel/type';
    import type { Cell } from '$lib/notebook';
    import { getContext, onDestroy, onMount } from 'svelte';
    import type { Writable } from 'svelte/store';

    export let cell: Cell;
    let editing: boolean;
    let kernel: Writable<Kernel>;
    let output =
        cell.cell_type === 'code' ? formatNotebookOutput(cell.outputs) : '';
    let isExecuting = false;

    kernel = getContext<Writable<Kernel>>('kernel');

    const runCode = async () => {
        if (isExecuting) return;
        isExecuting = true;
        let unsubscribe = $kernel.output.subscribe((value) => {
            if (value !== undefined) {
                output = value;
                console.log(value);
            }
        });

        // Lock the kernel to prevent concurrent execution
        const release = await runningMutex.acquire();
        try {
            $kernel.output.set(''); // Clear previous output
            await $kernel.execute(
                typeof cell.source === 'string'
                    ? cell.source
                    : cell.source.join(''),
            );
        } finally {
            release();
            unsubscribe();
            isExecuting = false;
        }
    };
</script>

<div class="cell">
    {#if cell.cell_type === 'code'}
        <CodeEditor bind:text={cell.source} lang="python" />
    {:else if cell.cell_type === 'markdown'}
        <MarkdownEditor markdown={cell.source} bind:editing />
    {/if}
    <div class="toolbar">
        {#if cell.cell_type === 'code'}
            <button on:click={runCode} disabled={isExecuting}>
                {isExecuting ? '⏳' : '▶️'}
            </button>
        {:else if cell.cell_type === 'markdown'}
            {#if editing}
                <button on:click={() => (editing = false)}>💾</button>
            {:else}
                <button on:click={() => (editing = true)}>✏️</button>
            {/if}
        {/if}
        <button>🗑️</button>
    </div>

    {#if output}
        <div class="output">
            <pre>{output}</pre>
        </div>
    {/if}
</div>

<style>
    .cell {
        margin: 4px;
        border: 1px solid transparent;
        border-radius: 4px;
        position: relative;
        padding-top: 8px;
    }

    .cell:hover {
        border: 1px solid #ccc;
    }

    .toolbar {
        display: flex;
        justify-content: flex-end;
        padding: 6px;
        position: absolute;
        top: -16px;
        right: 4px;
        gap: 2px;
        background-color: #f4f4f4;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .toolbar button {
        padding: 4px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: white;
        cursor: pointer;
    }

    .toolbar button:hover {
        background-color: #f9f9f9;
    }

    .output {
        padding: 10px;
        max-height: 400px;
        overflow-y: scroll;
    }
</style>
