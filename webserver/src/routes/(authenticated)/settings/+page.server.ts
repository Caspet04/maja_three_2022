import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { database } from "$lib/database";

export const actions: Actions = {
    deleteaccount: async ({ request, locals, cookies }) => {
        // TODO: Implement delete account
        // Check if username already exist etc.
    },
};
