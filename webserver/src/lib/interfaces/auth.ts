import type { As, HTTPError } from "$lib/type-utils";
import type { Result } from "ts-results";
import type { AsyncResult } from "ts-async-results";

export type Username = string & As<"username">;
export type Password = string & As<"password">;
export type Salt = string & As<"salt">;
export type Hash = string & As<"hash">;
export type UID = string & As<"uid">;

export type LoginData = {
    username: Username;
    password: Password;
} & As<"login-data">;

export type RegisterData = {
    username: Username;
    password: Password;
} & As<"register-data">;

/**
 * Contains authentication functionality such as registration, login, signout, etc.
 */
export interface AccountManager {
    /**
     * Authenticates the user and returns a session token or an error object with proper HTTP code.
     * @param login_data data used to login the user.
     */
    login(login_data: LoginData): AsyncResult<UID, HTTPError>;
    /**
     * Creates a new user and returns a session token or an error object with proper HTTP code.
     * @param register_data data used to create the user.
     */
    register(register_data: RegisterData): AsyncResult<UID, HTTPError>;
    /**
     * The user is logged out and returns null or an error object with proper HTTP code.
     * @param session_token the session token of the user to logout.
     */
    logout(session_token: UID): AsyncResult<null, HTTPError>;
}

export interface UIDRandomizer {
    generate_unique_id(): UID;
}

export interface Encrypter {
    hash(password: Password, salt: Salt): Hash;
}
