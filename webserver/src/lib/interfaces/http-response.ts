import { fail as actionfail } from "@sveltejs/kit";

export type HTTPResponse = HTTPSuccess | HTTPError;

export interface HTTPSuccess {
    code: number;
}

export interface HTTPError {
    code: number;
    error: {
        name: string;
        message: string;
    };
}

export namespace HTTPResponse {
    export function fail(error: HTTPError) {
        return actionfail(error.code, {
            name: error.error.name,
            message: error.error.message,
        });
    }
}
