<script lang="ts">
    import type { LayoutServerData } from "./$types";
    export let data: LayoutServerData;
</script>

<nav>
    <a href="/">Home</a>

    <a href="/settings">Settings</a>
</nav>

<p>{data.name}</p>

<slot />
