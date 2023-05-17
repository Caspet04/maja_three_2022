import { database } from "$lib/database";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import * as crypto from "crypto";
import { auth, form_parser } from "$lib/auth";

export const actions: Actions = {
    register: async ({ request, locals, cookies }) => {
        const form = await request.formData();

        const parse_result = form_parser.parse_for_register(form);
        if (parse_result.err) {
            return fail(parse_result.val.code, parse_result.val);
        }

        const register_result = await auth.register(parse_result.val).resolve();
        if (register_result.err) {
            return fail(register_result.val.code, register_result.val);
        }

        auth.set_session_cookie(register_result.val, cookies);

        throw redirect(302, "/");
    },
};
