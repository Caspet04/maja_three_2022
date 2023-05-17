import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { auth, form_parser } from "$lib/auth";
import { StatusCodes } from "http-status-codes";

export const actions: Actions = {
    login: async ({ request, cookies }) => {
        const form = await request.formData();

        const parse_result = form_parser.parse_for_login(form);
        if (parse_result.err) {
            return fail(parse_result.val.code, parse_result.val);
        }

        const login_result = await auth.login(parse_result.val).resolve();
        if (login_result.err) {
            return fail(login_result.val.code, login_result.val);
        }

        auth.set_session_cookie(login_result.val, cookies);

        throw redirect(StatusCodes.MOVED_TEMPORARILY, "/");
    },
};
