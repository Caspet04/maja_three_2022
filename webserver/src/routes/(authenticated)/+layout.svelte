<script lang="ts">
    import type { LayoutServerData } from "./$types";
    export let data: LayoutServerData;
</script>

<nav>
    <a href="/">Home</a>

    <a href="/settings">Settings</a>

    <a href="/chat">Chat</a>

    <a href="/clicker">Clicker</a>

    <a href="/blog">Blog</a>
</nav>

<p>{data.name}</p>

<slot />

<!-- TODO: Remove unused code, links, etc -->
<!-- TODO: Add points? (reddit karma) -->
