<script lang="ts">
    import Sidebar from './Sidebar.svelte';
</script>

<div class="wrapper">
    <Sidebar />

    <div class="content">
        <h1>Page</h1>
    </div>
</div>

<style>
    .wrapper {
        display: flex;
        width: 100%;
    }

    .content {
        flex: 1;
        padding: 20px;
    }
</style>
