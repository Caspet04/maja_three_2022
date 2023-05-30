import type {
    AccountDataParser,
    AccountManager,
    DeleteData,
    Hash,
    LoginData,
    LogoutData,
    Password,
    RegisterData,
    Salt,
    UID,
    UserData,
    UserID,
    Username,
} from "../interfaces/auth";
import { database, wrap_database_response } from "../database";
import * as crypto from "crypto";
import type { Result } from "ts-results";
import pkg from "ts-results";
const { Err, Ok } = pkg;
import type { HTTPError } from "../http-result";
import { AsyncResultWrapper, type AsyncResult } from "ts-async-results";
import type { Cookies } from "@sveltejs/kit";
import type { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
export class SQLiteAuth implements AccountManager {
    generate_uid(): UID {
        return crypto.randomUUID() as UID;
    }

    hash_password(password: Password, salt: Salt): Hash {
        return crypto
            .pbkdf2Sync(password, salt, 1000, 64, "sha512")
            .toString("hex") as Hash;
    }

    get_user_by_session(session: UID): AsyncResult<UserData, HTTPError> {
        return new AsyncResultWrapper<UserData, HTTPError>(
            async (): Promise<Result<UserData, HTTPError>> => {
                const database_result = await database.user.findUnique({
                    where: { session },
                });

                if (database_result == undefined) {
                    return Err({
                        code: StatusCodes.BAD_REQUEST,
                        name: "provided-session-nonexistant",
                        message: "The proved does not exist",
                    });
                }

                return Ok({
                    username: database_result.username as Username,
                    session: database_result.session as UID,
                    id: database_result.id as UserID,
                    salt: database_result.salt as Salt,
                    hash: database_result.hash as Hash,
                });
            }
        );
    }

    get_current_user(cookies: Cookies): AsyncResult<UserData, HTTPError> {
        return new AsyncResultWrapper<UserData, HTTPError>(
            async (): Promise<Result<UserData, HTTPError>> => {
                const session = cookies.get("session") as UID | undefined;

                if (session == undefined) {
                    return Err({
                        code: StatusCodes.UNAUTHORIZED,
                        name: "not-logged-in",
                        message: "Cannot get user, user is not logged in",
                    });
                }

                const database_result = await database.user.findUnique({
                    where: { session },
                });

                if (database_result == undefined) {
                    return Err({
                        code: StatusCodes.BAD_REQUEST,
                        name: "provided-session-nonexistant",
                        message: "The proved does not exist",
                    });
                }

                return Ok({
                    username: database_result.username as Username,
                    session: database_result.session as UID,
                    id: database_result.id as UserID,
                    salt: database_result.salt as Salt,
                    hash: database_result.hash as Hash,
                });
            }
        );
    }

    login(login_data: LoginData): AsyncResult<UID, HTTPError> {
        return new AsyncResultWrapper(
            async (): Promise<Result<UID, HTTPError>> => {
                const find_result = await wrap_database_response(
                    database.user.findUnique({
                        where: { username: login_data.username },
                    })
                ).resolve();
                if (find_result.err) return find_result;

                const user = find_result.val;
                if (user == null) {
                    return Err({
                        code: StatusCodes.BAD_REQUEST,
                        message: "Username does not exists",
                        name: "UndefinedUsername",
                    });
                }

                const salt = user.salt as Salt;
                const hash = user.hash as Hash;

                const new_hash = this.hash_password(login_data.password, salt);
                if (hash != new_hash) {
                    return Err({
                        code: StatusCodes.BAD_REQUEST,
                        name: "IncorrectPassword",
                        message: "Password is incorrect",
                    });
                }

                const session = this.generate_uid();

                const update_result = await wrap_database_response(
                    database.user.update({
                        where: { id: user.id },
                        data: { session },
                    })
                ).resolve();
                if (update_result.err) return update_result;

                return Ok(session);
            }
        );
    }

    register(register_data: RegisterData): AsyncResult<UID, HTTPError> {
        return new AsyncResultWrapper(
            async (): Promise<Result<UID, HTTPError>> => {
                const find_result = await wrap_database_response(
                    database.user.findUnique({
                        where: { username: register_data.username },
                    })
                ).resolve();
                if (find_result.err) return find_result;

                const user = find_result.val;
                if (user != null) {
                    return Err({
                        code: StatusCodes.BAD_REQUEST,
                        message: "Username used by another user",
                        name: "UsernameAlreadyUsed",
                    });
                }

                const salt = crypto.randomBytes(16).toString("hex") as Salt;
                const hash = this.hash_password(register_data.password, salt);
                const session = this.generate_uid();

                const create_result = await wrap_database_response(
                    database.user.create({
                        data: {
                            username: register_data.username,
                            salt,
                            hash,
                            session,
                        },
                    })
                ).resolve();
                if (create_result.err) return create_result;

                return Ok(session);
            }
        );
    }

    logout(logout_data: LogoutData): AsyncResult<null, HTTPError> {
        return new AsyncResultWrapper(
            async (): Promise<Result<null, HTTPError>> => {
                const update_result = await wrap_database_response(
                    database.user.update({
                        where: {
                            session: logout_data.session,
                        },
                        data: { session: undefined },
                    })
                ).resolve();
                if (update_result.err) return update_result;

                return Ok(null);
            }
        );
    }

    delete(delete_data: DeleteData): AsyncResult<null, HTTPError> {
        return new AsyncResultWrapper(
            async (): Promise<Result<null, HTTPError>> => {
                const delete_result = await wrap_database_response(
                    database.user.delete({
                        where: { id: delete_data.id },
                    })
                ).resolve();
                if (delete_result.err) return delete_result;

                return Ok(null);
            }
        );
    }

    set_session_cookie(session: UID, cookies: Cookies) {
        cookies.set("session", session, {
            path: "/",
            httpOnly: true, // optional for now
            sameSite: "strict", // optional for now
            secure: process.env.NODE_ENV === "production", // optional for now
            maxAge: 1200, //
        });
    }

    reset_session_cookie(cookies: Cookies) {
        cookies.delete("session");
    }
}

export class AccountDataFormParser implements AccountDataParser<FormData> {
    parse_for_login(unparsed: FormData): Result<LoginData, HTTPError> {
        const username = unparsed.get("username")?.toString() as
            | Username
            | undefined;
        const password = unparsed.get("password")?.toString() as
            | Password
            | undefined;

        if (username == undefined)
            return Err({
                code: StatusCodes.BAD_REQUEST,
                message: "Username is not defined",
                name: "UndefinedUsername",
            } as HTTPError);

        if (password == undefined)
            return Err({
                code: StatusCodes.BAD_REQUEST,
                message: "Password is not defined",
                name: "UndefinedPassword",
            } as HTTPError);

        return Ok({
            username,
            password,
        });
    }

    parse_for_register(unparsed: FormData): Result<RegisterData, HTTPError> {
        const username = unparsed.get("username")?.toString() as
            | Username
            | undefined;
        const password = unparsed.get("password")?.toString() as
            | Password
            | undefined;

        if (username == undefined)
            return Err({
                code: StatusCodes.BAD_REQUEST,
                message: "Username is missing",
                name: "MissingUsername",
            } as HTTPError);

        if (password == undefined)
            return Err({
                code: StatusCodes.BAD_REQUEST,
                message: "Password is missing",
                name: "MissingPassword",
            } as HTTPError);

        return Ok({
            username,
            password,
        });
    }
}
