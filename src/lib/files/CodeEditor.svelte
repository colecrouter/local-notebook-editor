<script lang="ts">
    import loader from '@monaco-editor/loader';
    import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
    import { onDestroy, onMount } from 'svelte';

    let monaco: typeof Monaco;
    let editorContainer: HTMLElement;
    let editor: Monaco.editor.IStandaloneCodeEditor;

    export let text: string | string[];
    export let lang: string = 'plaintext';

    onMount(async () => {
        // Import our 'monaco.ts' file here
        // (onMount() will only be executed in the browser, which is what we want)
        const monacoEditor = await import('monaco-editor');
        loader.config({ monaco: monacoEditor.default });

        monaco = await loader.init();

        // Your monaco instance is ready, let's display some code!
        editor = monaco.editor.create(editorContainer, {
            value: typeof text === 'string' ? text : text.join(''),
            theme: 'vs-light',
            scrollBeyondLastLine: false,
            renderWhitespace: 'all',
            language: lang,
            minimap: {
                enabled: false,
            },
        });
        // const model = monaco.editor.createModel(text);
        // editor.setModel(model);

        // Register event listener for typing
        editor.onDidChangeModelContent(() => {
            text = editor.getValue();
            editorContainer.dispatchEvent(
                new CustomEvent('updated', { bubbles: true }),
            );
        });

        let ignoreEvent = false;
        const width = editorContainer.clientWidth;
        const updateHeight = () => {
            const contentHeight = Math.min(1000, editor.getContentHeight());
            editorContainer.style.width = `${width}px`;
            editorContainer.style.height = `${contentHeight}px`;
            try {
                ignoreEvent = true;
                editor.layout({ width, height: contentHeight });
            } finally {
                ignoreEvent = false;
            }
        };
        editor.onDidContentSizeChange(updateHeight);
        updateHeight();
    });

    onDestroy(() => {
        editor?.dispose();
    });
</script>

<div class="container" bind:this={editorContainer}></div>

<style>
    .container {
        width: 100%;
        height: 100%;
        margin: 20px;
    }

    :global(.monaco-editor) {
        width: 100% !important;
        height: 100% !important;
    }
</style>
