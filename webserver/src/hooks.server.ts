import type { Handle } from "@sveltejs/kit";
import { database } from "$lib/database";
import { auth } from "$lib/auth";

// handle runs for every request to the server
export const handle: Handle = async ({ event, resolve }) => {
    const get_result = await auth.get_current_user(event.cookies).resolve();
    if (get_result.ok) {
        event.locals.session = get_result.val.session;
    }

    // if (event.request.method === "OPTIONS") {
    //     return new Response(null, {
    //         headers: {
    //             "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
    //             "Access-Control-Allow-Origin": "*",
    //         },
    //     });
    // }

    /* 
  
    The following line is a yolo from a security perspective.
  
    response.headers.append("Access-Control-Allow-Origin", `*`);
    
    Read up on it here: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
  
  */

    const response = await resolve(event);
    // response.headers.append("Access-Control-Allow-Origin", `*`);
    return response;
};
