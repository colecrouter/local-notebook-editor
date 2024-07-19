<script lang="ts">
    import type { EmscriptenFS } from '$lib/fs';
    import type { Writable } from 'svelte/store';
    import FileTree from './FileTree.svelte';

    let sidebar: HTMLDivElement;
    let sidebarWidth = 300;
    let isDragging = false;
    function startResizing(e: MouseEvent) {
        if (!isDragging) return;

        const offsetRight = document.body.offsetWidth - e.clientX;
        const newWidth = document.body.offsetWidth - offsetRight;

        sidebarWidth = newWidth;
    }

    function stopResizing() {
        isDragging = false;
        window.removeEventListener('mousemove', startResizing);
        window.removeEventListener('mouseup', stopResizing);
    }

    function handleDrag(e: MouseEvent) {
        isDragging = true;
        window.addEventListener('mousemove', startResizing);
        window.addEventListener('mouseup', stopResizing);
    }

    function handleDrop(e: MouseEvent) {
        isDragging = false;
        window.removeEventListener('mousemove', startResizing);
        window.removeEventListener('mouseup', stopResizing);
    }

    export let selectedFile: string;
</script>

<div class="sidebar" bind:this={sidebar} style:width={`${sidebarWidth}px`}>
    <FileTree bind:selectedFile />
    <div class="dragger" on:mousedown={handleDrag}></div>
</div>

<style>
    .sidebar {
        background-color: var(--background-accent);
        min-width: 10px;
        max-width: 600px;
        height: 100vh;
        position: relative;
        top: 0;
        left: 0;
        border-right: 1px solid var(--border);
    }

    .dragger {
        content: '';
        position: absolute;
        top: 0;
        right: -5px;
        width: 10px;
        height: 100%;
        background-color: transparent;
        cursor: ew-resize;
        user-select: none;
    }
</style>
