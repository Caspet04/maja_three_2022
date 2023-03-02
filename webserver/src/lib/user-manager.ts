import type {
    IUserManager,
    AuthData,
    AuthResult,
    LogoutData,
    LogoutResult,
    RegisterData,
    RegisterResult,
    UserExistsResult,
} from "$lib/interfaces/user-manager";
import {
    type AsyncResult,
    AsyncErr,
    AsyncOk,
    AsyncResultWrapper,
} from "ts-async-results";
import type { HTTPError } from "./interfaces/http-response";
import { type Result, Err, Ok } from "ts-results";
import { database } from "./database";
import * as crypto from "crypto";

class UserManager implements IUserManager {
    parse_form_data_as_login_data(
        form_data: FormData
    ): Result<AuthData, HTTPError> {
        const username = form_data.get("username")?.toString();
        const password = form_data.get("password")?.toString();

        if (!username) {
            return Err({
                code: 400,
                error: {
                    message: "Username not provided",
                    name: "MissingUsername",
                },
            });
        } else if (typeof username !== "string") {
            return Err({
                code: 400,
                error: new TypeError(
                    `Field "username" expected a "string" but got a "${typeof username}"`
                ),
            });
        }

        if (!password) {
            return Err({
                code: 400,
                error: {
                    message: "Password not provided",
                    name: "MissingPassword",
                },
            });
        } else if (typeof password !== "string") {
            return Err({
                code: 400,
                error: new TypeError(
                    `Field "password" expected a "string" but got a "${typeof password}"`
                ),
            });
        }

        return Ok({
            username,
            password,
        });
    }

    parse_form_data_as_register_data(
        form_data: FormData
    ): Result<RegisterData, HTTPError> {
        const username = form_data.get("username")?.toString();
        const password = form_data.get("password")?.toString();

        if (!username) {
            return Err({
                code: 400,
                error: {
                    message: "Username not provided",
                    name: "MissingUsername",
                },
            });
        } else if (typeof username !== "string") {
            return Err({
                code: 400,
                error: new TypeError(
                    `Field "username" expected a "string" but got a "${typeof username}"`
                ),
            });
        }

        if (!password) {
            return Err({
                code: 400,
                error: {
                    message: "Password not provided",
                    name: "MissingPassword",
                },
            });
        } else if (typeof password !== "string") {
            return Err({
                code: 400,
                error: new TypeError(
                    `Field "password" expected a "string" but got a "${typeof password}"`
                ),
            });
        }

        return Ok({
            username,
            password,
        });
    }

    user_exists: (
        username: string
    ) => AsyncResult<UserExistsResult, HTTPError> = (username) =>
        new AsyncResultWrapper(async () => {
            return database.user
                .findUnique({
                    where: { username: username },
                })
                .then((result) => {
                    return Ok<UserExistsResult>(
                        result != null
                            ? {
                                  user: result,
                                  user_exists: true,
                              }
                            : {
                                  user_exists: false,
                              }
                    );
                })
                .catch((e) => {
                    console.error(e);
                    return Err({
                        code: 500,
                        error: {
                            message: "Internal database error",
                            name: "DatabaseError",
                        },
                    });
                });
        });

    authenticate: (data: AuthData) => AsyncResult<AuthResult, HTTPError> = (
        data
    ) =>
        new AsyncResultWrapper<AuthResult, HTTPError>(async () => {
            const user_exists_result = await this.user_exists(
                data.username
            ).resolve();
            if (user_exists_result.err) {
                return user_exists_result;
            }

            if (!user_exists_result.val.user_exists) {
                return new Err({
                    code: 400,
                    error: {
                        name: "UserDoesNotExist",
                        message: "A user with that username does not exist",
                    },
                });
            }

            const { salt, hash } = user_exists_result.val.user;

            const new_hash = crypto
                .pbkdf2Sync(data.password, salt, 1000, 64, "sha512")
                .toString("hex");

            if (new_hash != hash) {
                return new Err({
                    code: 400,
                    error: {
                        name: "IncorrectPassword",
                        message: "Password provided is incorrect",
                    },
                });
            }

            // TODO: Only update if the session has expired, otherwise it's not possible to use multiple devices at once, probably
            const session = crypto.randomUUID();

            const update = await database.user.update({
                where: { id: user_exists_result.val.user.id },
                data: {
                    session,
                },
            });

            return new Ok({
                session,
            });
        });

    register: (data: RegisterData) => AsyncResult<RegisterResult, HTTPError> = (
        data
    ) =>
        new AsyncResultWrapper(async () => {
            return Err({
                code: -1,
                error: {
                    message: "Register not implemented yet",
                    name: "NotImplemented",
                },
            });
        });

    logout: (data: LogoutData) => AsyncResult<LogoutResult, HTTPError> = (
        data
    ) =>
        new AsyncResultWrapper(async () => {
            return Err({
                code: -1,
                error: {
                    message: "Logout not implemented yet",
                    name: "NotImplemented",
                },
            });
        });
}
export const user_manager = new UserManager();
