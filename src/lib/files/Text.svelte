<script lang="ts" context="module">
</script>

<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    import loader from '@monaco-editor/loader';
    import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

    export let data = '';

    let editor: Monaco.editor.IStandaloneCodeEditor;
    let monaco: typeof Monaco;
    let editorContainer: HTMLElement;

    const dispatch = createEventDispatcher();

    onMount(async () => {
        // Import our 'monaco.ts' file here
        // (onMount() will only be executed in the browser, which is what we want)
        const monacoEditor = await import('monaco-editor');
        loader.config({ monaco: monacoEditor.default });

        monaco = await loader.init();

        // Your monaco instance is ready, let's display some code!
        editor = monaco.editor.create(editorContainer, {
            value: data,
            theme: 'vs-light',
            scrollBeyondLastLine: false,
            renderWhitespace: 'all',
            minimap: {
                enabled: true,
            },
        });
        const model = monaco.editor.createModel(data);
        editor.setModel(model);
        editor.onDidChangeModelContent(() => {
            dispatch('updated', { text: editor.getValue() });
        });
    });

    onDestroy(() => {
        monaco?.editor.getModels().forEach((model) => model.dispose());
        editor?.dispose();
    });
</script>

<div bind:this={editorContainer}></div>

<style>
    div {
        width: 100%;
        height: 100%;
    }

    :global(.monaco-editor) {
        width: 100% !important;
        height: 100% !important;
    }
</style>
