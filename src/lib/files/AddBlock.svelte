<script lang="ts">
    export let addBlock: (type: 'code' | 'markdown', index: number) => void;
    export let index: number;

    function addCodeBlock() {
        addBlock('code', index);
    }

    function addMarkdownBlock() {
        addBlock('markdown', index);
    }
</script>

<div class="wrapper">
    <div class="hr">
        <div class="button-container">
            <button on:click={addCodeBlock}>🔢</button>
            <button on:click={addMarkdownBlock}>💬</button>
        </div>
    </div>
</div>

<style>
    .hr {
        height: 1px;
        margin: 2px 0;
        width: 100%;
        background-color: #ccc;
        opacity: 0;
        display: flex;
        justify-content: center;
    }

    .wrapper {
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .wrapper:hover {
        cursor: pointer;
    }

    .wrapper:hover .hr {
        opacity: 1;
    }

    button {
        padding: 4px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: white;
        cursor: pointer;
        position: relative;
        top: -12px;
    }
</style>
