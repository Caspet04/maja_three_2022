<script lang="ts">
    import { enhance } from "$app/forms";
    import type { ActionData } from "./$types";

    export let form: ActionData;
</script>

<form use:enhance method="POST" action="?/register">
    {#if form != null}
        <div class="error {form.name}">{form.message}</div>
    {/if}

    <input type="text" name="username" />
    <input type="password" name="password" />
    <button>REGISTER</button>
</form>
