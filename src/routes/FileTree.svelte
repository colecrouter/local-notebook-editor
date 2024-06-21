<script lang="ts">
    import type { VirtualFileSystem } from '$lib/fs';

    export let fs: VirtualFileSystem;

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

<div class="wrapper">
    <input
        type="file"
        multiple
        title="upload"
        on:input={uploadFile}
        on:dragenter={onDragEnter}
        on:dragleave={onDragLeave} />
    <div class="dropbox" class:active={uploadIsActive}>
        <h4>Drop files here</h4>
    </div>
    <ul>
        {#each $files.sort() as key}
            <li>{key}</li>
        {/each}
    </ul>
</div>

<style>
    ul {
        list-style: none;
        padding: 0;
        margin: 4px;
        background-color: rgba(0, 0, 0, 0.1);
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: stretch;
    }

    li {
        padding: 5px 10px;
        cursor: pointer;
    }

    li:hover {
        background-color: #f4f4f4;
    }

    .wrapper {
        position: relative;
    }

    input[type='file'],
    .dropbox {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100vh;
        opacity: 0;
    }

    input[type='file']:hover {
        cursor: pointer;
    }

    .dropbox {
        pointer-events: none;
        touch-action: none;
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
    }

    .dropbox.active {
        opacity: 0.3;
    }
</style>
