<script lang="ts">
    import Notebook from '$lib/files/Notebook.svelte';
    import Text from '$lib/files/Text.svelte';
    import { indexedDBFS, type EmscriptenFS } from '$lib/fs';
    import { onMount, setContext, type ComponentType } from 'svelte';
    import Sidebar from './Sidebar.svelte';
    import { writable } from 'svelte/store';

    let fs = writable<EmscriptenFS>();
    setContext('fs', fs);

    onMount(async () => {
        fs.set(await indexedDBFS());
        editor.addEventListener('updated', (e) => {
            updateFile(e);
        });
    });

    let selectedFile = '';
    let data: unknown;
    let currentComponent: ComponentType | null;

    $: {
        if (selectedFile && $fs) {
            if (selectedFile.endsWith('.ipynb')) {
                const notebook = $fs.readFile(selectedFile, {
                    encoding: 'utf8',
                });
                currentComponent = Notebook;
                data = JSON.parse(notebook ?? '');
            } else {
                const text = $fs.readFile(selectedFile, { encoding: 'utf8' });
                currentComponent = Text;
                data = text;
            }
        } else {
            currentComponent = null;
        }
    }

    const updateFile = (e: Event) => {
        $fs.writeFile(
            selectedFile,
            typeof data === 'string' ? data : JSON.stringify(data),
            {
                encoding: 'utf8',
            },
        );
        $fs.syncfs(false, (err) => {
            if (err) {
                console.error(err);
            }
        });
        console.log('File updated');
    };

    let editor: HTMLElement;
</script>

<div class="wrapper">
    <div>
        <Sidebar bind:selectedFile />
    </div>

    <div class="content" bind:this={editor}>
        {#if currentComponent}
            {#key currentComponent}
                <svelte:component this={currentComponent} {data} />
            {/key}
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
