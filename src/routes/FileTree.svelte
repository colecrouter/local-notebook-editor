<script lang="ts">
    import { indexedDBFS, type EmscriptenFS } from '$lib/fs';
    import { getContext, onMount } from 'svelte';
    import { writable, type Writable } from 'svelte/store';

    export let selectedFile: string;

    // Hacky workaround because a kernel doesn't exist yet so we can't use the fs store
    const fs = getContext<Writable<EmscriptenFS>>('fs');

    let files: string[] = [];
    fs.subscribe(async (f) => {
        // Sync virtual fs with indexedDB
        await new Promise((resolve, reject) =>
            $fs?.syncfs(true, (err) => {
                if (err) reject(err);
                resolve(err);
            }),
        );
        // Ignore . and .. directories
        files =
            f?.readdir(f?.cwd())?.filter((f) => f !== '.' && f !== '..') ?? [];
    });

    async function uploadFile(e: Event) {
        const files = (e.target as HTMLInputElement).files;

        if (!files) return;

        for (const file of files) {
            $fs?.writeFile(
                file.name,
                new Uint8Array(await file.arrayBuffer()),
                {
                    encoding: 'binary',
                },
            );
        }

        // Sync indexedDB with virtual fs
        $fs?.syncfs(false, (err) => {
            if (err) console.error(err);
            $fs = $fs;
        });

        uploadIsActive = false;
    }

    let uploadIsActive = false;
    function onDragEnter() {
        uploadIsActive = true;
    }

    function onDragLeave() {
        uploadIsActive = false;
    }

    function downloadFile(filename: string) {
        const file = new Blob([$fs?.readFile(filename) ?? '']);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.click();
    }

    async function deleteFile(filename: string) {
        $fs?.unlink(filename);
        await new Promise((resolve, reject) =>
            $fs?.syncfs(false, (err) => {
                if (err) reject(err);
                resolve(err);
            }),
        );
        $fs?.syncfs(true, (err) => {
            if (err) console.error(err);
            $fs = $fs;
            if (selectedFile === filename) selectedFile = '';
        });
    }
</script>

{#if $fs === undefined}
    <p>Loading...</p>
{:else}
    <ul>
        {#each files as key}
            <li on:click={() => (selectedFile = key)}>
                <div>
                    {key}
                    <div class="toolbar">
                        <button on:click={() => deleteFile(key)}>🗑️</button>
                        <button on:click={() => downloadFile(key)}>💾</button>
                    </div>
                </div>
            </li>
        {/each}
    </ul>

    <div class="wrapper">
        {#if !files.length}
            <div class="noclick">
                <h4>No files found</h4>
                <p>Drag and drop, or click here to upload files</p>
            </div>
        {/if}
        <input
            type="file"
            multiple
            title="upload"
            on:input={uploadFile}
            on:dragenter={onDragEnter}
            on:dragleave={onDragLeave} />
        <div
            class="dropbox"
            role="button"
            tabindex="0"
            class:active={uploadIsActive}>
            <h4>Drop files here</h4>
        </div>
    </div>
{/if}

<style>
    ul {
        list-style: none;
        padding: 0;
        /* background-color: rgba(0, 0, 0, 0.1);
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
        height: 100%; */
        width: 100%;
        z-index: 1;
        flex: 1;
        margin: 0;
        font-size: 1em;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: stretch;
        font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            'Segoe UI',
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            'Open Sans',
            'Helvetica Neue',
            sans-serif;
    }

    li {
        padding: 5px 10px;
        margin: 0;
        cursor: pointer;
        height: fit-content;
        width: 100%;
        box-sizing: border-box;
        background-color: var(--background-accent);
        font-family: Arial, sans-serif;
    }

    li > div {
        display: inline-flex;
        justify-content: space-between;
        width: calc(100% - 1.5em - 10px);
    }

    li::before {
        content: '📄';
        margin-right: 10px;
    }

    li:first-child {
        margin-top: 40px;
    }

    li:hover {
        filter: brightness(0.8);
    }

    .wrapper {
        position: relative;
        flex-direction: column;
        display: flex;
        align-items: stretch;
        height: 100%;
        width: 100%;
        margin-right: 4px;
    }

    input[type='file'],
    .dropbox {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
    }

    input[type='file'] {
        z-index: 2;
    }

    input[type='file']:hover {
        cursor: pointer;
    }

    .dropbox {
        z-index: 1;
        transition: opacity 0.3s ease-in-out;
        box-sizing: border-box;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 8px dashed var(--text);
        background-color: var(--background-accent);
        color: var(--text);
        height: 100%;
        width: 100%;
    }

    .dropbox.active {
        opacity: 0.3;
    }

    .toolbar {
        display: none;
        justify-content: flex-end;
        gap: 2px;
        margin-left: auto;
    }

    li:hover .toolbar {
        display: inline;
    }

    .toolbar button {
        padding: 0px;
        border: none;
        background-color: transparent;
        cursor: pointer;
    }

    .toolbar button:hover {
        filter: brightness(0.8);
    }

    .noclick {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        gap: 20px;
        pointer-events: none;
        touch-action: none;
        text-align: center;
    }
</style>
