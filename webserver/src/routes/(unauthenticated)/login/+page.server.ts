import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { database } from "$lib/database";
import * as crypto from "crypto";
import { user_manager } from "$lib/user-manager";
import { HTTPResponse } from "$lib/interfaces/http-response";

export const actions: Actions = {
    login: async ({ request, locals, cookies }) => {
        const form_data = await request.formData();
        const login_data =
            user_manager.parse_form_data_as_login_data(form_data);

        if (login_data.err) {
            return HTTPResponse.fail(login_data.val);
        }

        const result = await user_manager
            .authenticate(login_data.val)
            .resolve();

        if (result.err) {
            return HTTPResponse.fail(result.val);
        }

        cookies.set("session", result.val.session, {
            path: "/",
            httpOnly: true, // optional for now
            sameSite: "strict", // optional for now
            secure: process.env.NODE_ENV === "production", // optional for now
            maxAge: 1200, //
        });

        console.log(5);
    },
};
