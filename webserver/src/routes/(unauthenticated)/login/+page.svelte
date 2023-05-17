<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ActionData, PageServerData } from "./$types";

    export let form: ActionData;
    let count = 0;
</script>

<form use:enhance method="POST" action="?/login">
    {#if form != null}
        <div class="error {form.name}">{form.message}</div>
    {/if}

    <input type="text" name="username" />
    <input type="password" name="password" />
    <button>LOGIN</button>
</form>

<button on:click={() => count++}>
    {count}
</button>
