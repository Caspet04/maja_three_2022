import { database } from "$lib/database";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
    if (locals.session) {
        const user = await database.user.findUnique({
            where: { session: locals.session },
        });
        if (!user?.username) {
            throw error(404, "user not found for current session");
        }

        return {
            username: user.username,
        };
    }

    return { username: "Username Not Found" };
};
