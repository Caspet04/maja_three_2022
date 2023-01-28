<script lang="ts">
    import type { ActionData } from "./$types";

    export let form: ActionData;
</script>

<form method="POST" action="?/deleteaccount">
    <!-- {#if form?.error}
        {form?.error}
    {/if} -->
    <button>DELETE ACCOUNT</button>
</form>
