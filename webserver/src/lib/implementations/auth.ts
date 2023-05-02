import type {
    AccountManager,
    Encrypter,
    Hash,
    LoginData,
    Password,
    RegisterData,
    Salt,
    UID,
    UIDRandomizer,
    Username,
} from "$lib/interfaces/auth";
import { database } from "$lib/database";
import * as crypto from "crypto";
import { Err, Ok, type Result } from "ts-results";
import type { HTTPError } from "$lib/type-utils";
import { AsyncResultWrapper, type AsyncResult } from "ts-async-results";

const uid_randomizer: UIDRandomizer = {
    generate_unique_id: function (): UID {
        return crypto.randomUUID() as UID;
    },
};

const encrypter: Encrypter = {
    hash: function (password: Password, salt: Salt): Hash {
        return crypto
            .pbkdf2Sync(password, salt, 1000, 64, "sha512")
            .toString("hex") as Hash;
    },
};

export function parse_login_data_from_form(
    form_data: FormData
): Result<LoginData, HTTPError> {
    const username = form_data.get("username")?.toString() as
        | Username
        | undefined;
    const password = form_data.get("password")?.toString() as
        | Password
        | undefined;

    if (username == undefined)
        return Err({
            code: 400,
            message: "Username is not defined",
            name: "UndefinedUsername",
        } as HTTPError);

    if (password == undefined)
        return Err({
            code: 400,
            message: "Password is not defined",
            name: "UndefinedPassword",
        } as HTTPError);

    return Ok({
        username,
        password,
    } as LoginData);
}
export function parse_register_data_from_form(
    form_data: FormData
): Result<RegisterData, HTTPError> {
    const username = form_data.get("username")?.toString() as
        | Username
        | undefined;
    const password = form_data.get("password")?.toString() as
        | Password
        | undefined;

    if (username == undefined)
        return Err({
            code: 400,
            message: "Username is missing",
            name: "MissingUsername",
        } as HTTPError);

    if (password == undefined)
        return Err({
            code: 400,
            message: "Password is missing",
            name: "MissingPassword",
        } as HTTPError);

    return Ok({
        username,
        password,
    } as RegisterData);
}

export class SQLiteAuth implements AccountManager {
    login(login_data: LoginData): AsyncResult<UID, HTTPError> {
        return new AsyncResultWrapper<UID, HTTPError>(
            async (): Promise<Result<UID, HTTPError>> => {
                let database_result;
                try {
                    database_result = await database.user.findFirst({
                        where: { username: login_data.username },
                    });
                } catch (error) {
                    return Err({
                        code: 500,
                        message: "Internal database error",
                        name: "InternalDatabaseError",
                    });
                }

                if (database_result == null)
                    return Err({
                        code: 400,
                        message: "Username does not exists",
                        name: "UndefinedUsername",
                    });

                const salt = database_result.salt as Salt;
                const hash = database_result.hash as Hash;

                const new_hash = encrypter.hash(login_data.password, salt);

                if (hash != new_hash)
                    return Err({
                        code: 400,
                        name: "IncorrectPassword",
                        message: "Password is incorrect",
                    });

                const session = uid_randomizer.generate_unique_id();
                try {
                    await database.user.update({
                        where: { id: database_result.id },
                        data: {
                            session,
                        },
                    });
                } catch (error) {
                    return Err({
                        code: 500,
                        message: "Internal database error",
                        name: "InternalDatabaseError",
                    });
                }

                return Ok(session);
            }
        );
    }

    register(register_data: RegisterData): AsyncResult<UID, HTTPError> {
        return new AsyncResultWrapper(
            async (): Promise<Result<UID, HTTPError>> => {
                let database_result;
                try {
                    database_result = await database.user.findFirst({
                        where: { username: register_data.username },
                    });
                } catch (error) {
                    return Err({
                        code: 500,
                        message: "Internal database error",
                        name: "InternalDatabaseError",
                    });
                }

                if (database_result != null)
                    return Err({
                        code: 400,
                        message: "Username used by another user",
                        name: "UsernameAlreadyUsed",
                    });

                const salt = crypto.randomBytes(16).toString("hex") as Salt;
                const hash = encrypter.hash(register_data.password, salt);
                const session = uid_randomizer.generate_unique_id();
                try {
                    await database.user.create({
                        data: {
                            username: register_data.username,
                            salt,
                            hash,
                            session,
                        },
                    });
                } catch (error) {
                    return Err({
                        code: 500,
                        message: "Internal database error",
                        name: "InternalDatabaseError",
                    });
                }

                return Ok(session);
            }
        );
    }
    logout(session_token: UID): AsyncResult<null, HTTPError> {
        return new AsyncResultWrapper<null, HTTPError>(
            async (): Promise<Result<null, HTTPError>> => {
                return Ok(null);
            }
        );
    }
}
