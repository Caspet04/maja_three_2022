import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { AsyncResultWrapper, type AsyncResult } from "ts-async-results";
import type { Result } from "ts-results";
import pkg from "ts-results";
const { Err, Ok } = pkg;
import type { HTTPError } from "./http-result";
export const database = new PrismaClient();
export function wrap_database_response<T>(
    promise: Promise<T>
): AsyncResult<T, HTTPError> {
    return new AsyncResultWrapper<T, HTTPError>(async () =>
        promise
            .then((value: T): Result<T, HTTPError> => Ok(value))
            .catch(
                (error): Result<T, HTTPError> =>
                    Err({
                        code: StatusCodes.INTERNAL_SERVER_ERROR,
                        name: "internal-database-error",
                        message:
                            "An internal error ocurred with error code 0x01",
                    })
            )
    );
}
