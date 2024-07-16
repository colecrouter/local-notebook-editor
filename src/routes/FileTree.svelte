<script lang="ts">
    import type { VirtualFileSystem } from '$lib/fs';

    export let fs: VirtualFileSystem;
    export let selectedFile: string;

    const files = fs.filesList;

    async function uploadFile(e: Event) {
        const files = (e.target as HTMLInputElement).files;

        if (!files) return;

        for (const file of files) {
            fs.addFile(file.name, await file.text());
        }

        uploadIsActive = false;
    }

    let uploadIsActive = false;
    function onDragEnter() {
        uploadIsActive = true;
    }

    function onDragLeave() {
        uploadIsActive = false;
    }
</script>

<ul>
    {#each $files.sort() as key}
        <li on:click={() => (selectedFile = key)}>{key}</li>
    {/each}
</ul>
<div class="wrapper">
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

<style>
    ul {
        list-style: none;
        padding: 0;
        /* background-color: rgba(0, 0, 0, 0.1);
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
        height: 100%; */
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: srtetch;
        z-index: 1;
        flex: 1;
        margin: 0;
    }

    li {
        padding: 5px 10px;
        margin: 0;
        cursor: pointer;
        height: fit-content;
        width: 100%;
        box-sizing: border-box;
        background-color: #fff;
    }

    li:first-child {
        margin-top: 40px;
    }

    li:nth-child(odd) {
        background-color: #f9f9f9;
    }

    li:hover {
        background-color: #f4f4f4;
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
        border: 8px dashed #fff;
        background-color: #000;
        color: #fff;
        height: 100%;
        width: 100%;
    }

    .dropbox.active {
        opacity: 0.3;
    }
</style>
