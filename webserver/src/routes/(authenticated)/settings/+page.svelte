<script lang="ts">
    import type { ActionData } from "./$types";

    export let form: ActionData;
</script>

<form method="POST" action="?/logout">
    <button>LOGOUT</button>
    {#if form != null && form.action == "logout"}
        <div class="error {form.name}">{form.message}</div>
    {/if}
</form>

<form method="POST" action="?/deleteaccount">
    <button>DELETE ACCOUNT</button>
    {#if form != null && form.action == "deleteaccount"}
        <div class="error {form.name}">{form.message}</div>
    {/if}
</form>
