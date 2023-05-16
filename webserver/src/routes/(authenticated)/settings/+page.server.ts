import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { database } from "$lib/database";
import { auth } from "$lib/auth";
import { StatusCodes } from "http-status-codes";

export const actions: Actions = {
    logout: async ({ request, locals, cookies }) => {
        const get_result = await auth.get_current_user(cookies).resolve();
        if (get_result.err) {
            get_result.val.action = "logout";
            return fail(get_result.val.code, get_result.val);
        }

        const user = get_result.val;
        const logout_result = await auth
            .logout({ session: user.session })
            .resolve();
        if (logout_result.err) {
            logout_result.val.action = "logout";
            return fail(logout_result.val.code, logout_result.val);
        }

        auth.reset_session_cookie(cookies);

        throw redirect(StatusCodes.MOVED_TEMPORARILY, "/login");
    },

    deleteaccount: async ({ request, locals, cookies }) => {
        const get_result = await auth.get_current_user(cookies).resolve();
        if (get_result.err) {
            get_result.val.action = "deleteaccount";
            return fail(get_result.val.code, get_result.val);
        }

        const user = get_result.val;
        const delete_result = await auth.delete({ id: user.id }).resolve();
        if (delete_result.err) {
            delete_result.val.action = "deleteaccount";
            return fail(delete_result.val.code, delete_result.val);
        }

        auth.reset_session_cookie(cookies);

        throw redirect(StatusCodes.MOVED_TEMPORARILY, "/login");
    },
};
