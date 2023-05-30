import type { Tag } from "../type-utils";
import type { HTTPError } from "../http-result";
import type { Result } from "ts-results";
import type { AsyncResult } from "ts-async-results";
import type { Cookies } from "@sveltejs/kit";

// Switch out ts-results with an ESM compatible library, likely self made
// Can't be bothered with it, using the import pkg, const method instead

export type Username = string & Tag<"username">;
export type Password = string & Tag<"password">;
export type Salt = string & Tag<"salt">;
export type Hash = string & Tag<"hash">;
export type UID = string & Tag<"uid">;
export type UserID = number & Tag<"user-id">;

export type LoginData = {
    username: Username;
    password: Password;
};

export type RegisterData = {
    username: Username;
    password: Password;
};

export type LogoutData = {
    session: UID;
};

export type DeleteData = {
    id: number;
};

export type UserData = {
    username: Username;
    session: UID;
    salt: Salt;
    hash: Hash;
    id: UserID;
};

export interface AccountManager {
    /**
     * Gets a user by their session, returns an HTTPError if an error occurred or the user
     * is not logged in.
     *
     * Example:
     * ```
     * const get_result = await manager.get_user_by_session(session).resolve();
     * if (get_result.err) {
     *     // Handle the error in `get_result.val`
     * }
     *
     * const user = result.val;
     * ```
     *
     * @param {UID} session The `session` argument is the session of the user.
     * @returns {AsyncResult<UserData, HTTPError>} Returns an async result that either resolves to
     * `UserData` or an `HTTPError`.
     */
    get_user_by_session(session: UID): AsyncResult<UserData, HTTPError>;

    /**
     * Gets the current user from the cookies, returns an HTTPError if an error occurred or the user
     * is not logged in.
     *
     * Example:
     * ```
     * const get_result = await manager.get_current_user(cookies).resolve();
     * if (get_result.err) {
     *     // Handle the error in `get_result.val`
     * }
     *
     * const user = result.val;
     * ```
     *
     * @param {Cookies} cookies The `cookies` argument is the cookies for the request.
     * @returns {AsyncResult<UserData, HTTPError>} Returns an async result that either resolves to
     * `UserData` or an `HTTPError`.
     */
    get_current_user(cookies: Cookies): AsyncResult<UserData, HTTPError>;

    /**
     * Verifies the provided username and password, then updates the session and returns it. If
     * an error ocurred or the credentials did were not valid, return an HTTPError.
     *
     * Example:
     * ```
     * const parse_result = parser.parse_for_login(data);
     * if (parse_result.err) {
     *     // Handle the error in `parse_result.val`
     * }
     *
     * const login_data = parse_result.val;
     * const login_result = await manager.login(login_data).resolve();
     * if (login_result.err) {
     *     // Handle the error in `login_result.val`
     * }
     *
     * const session = result.val;
     *
     * // This is recommended if the session is stored in a cookie
     * manager.set_session_cookie(session, cookies);
     * ```
     * @param {LoginData} login_data The `login_data` is an object of type {@link LoginData}
     * consisting of a `username` and `password`.
     * @returns {AsyncResult<UID, HTTPError>} Returns an async result with either the session
     * {@link UID} or an error if one ocurred.
     */
    login(login_data: LoginData): AsyncResult<UID, HTTPError>;

    /**
     * Attempts to register a user with the provided username and password, then returns a session.
     * If an error ocurred or the credentials did were not valid, return an HTTPError.
     *
     * Example:
     * ```
     * const parse_result = parser.parse_for_register(data);
     * if (parse_result.err) {
     *     // Handle the error in `parse_result.val`
     * }
     *
     * const register_data = parse_result.val;
     * const register_result = await manager.register(register_data).resolve();
     * if (register_result.err) {
     *     // Handle the error in `register_result.val`
     * }
     *
     * const session = result.val;
     *
     * // This is recommended if the session is stored in a cookie
     * manager.set_session_cookie(session, cookies);
     * ```
     * @param {RegisterData} register_data The `register_data` is an object of type {@link RegisterData}
     * consisting of a `username` and `password`.
     * @returns {AsyncResult<UID, HTTPError>} Returns an async result with either the session
     * {@link UID} or an error if one ocurred.
     */
    register(register_data: RegisterData): AsyncResult<UID, HTTPError>;

    /**
     * Attempts to logout a user with the provided session. If an error ocurred, return an
     * HTTPError.
     *
     * Example:
     * ```
     * const get_result = await manager.get_current_user(cookies).resolve();
     * if (get_result.err) {
     *     // Handle the error in `get_result.val`
     * }
     *
     * const user = get_result.val;
     * const logout_result = await manager.logout({ session: user.session }).resolve();
     * if (logout_result.err) {
     *     // Handle the error in `logout_result.val`
     * }
     *
     * // This is recommended if the session is stored in a cookie
     * manager.reset_session_cookie(cookies);
     * ```
     * @param {LogoutData} logout_data The `logout_data` is an object of type {@link LogoutData}
     * consisting of a `session`.
     * @returns {AsyncResult<null, HTTPError>} Returns an async result with either null or an error
     * if one ocurred.
     */
    logout(logout_data: LogoutData): AsyncResult<null, HTTPError>;

    /**
     * Deletes a user from the id. If an error ocurred, return an HTTPError.
     *
     * Example:
     * ```
     * const get_result = manger.get_current_user(cookies);
     * if (get_result.err) {
     *     // Handle the error in `get_result.val`
     * }
     *
     * const user = get_result.val;
     * const delete_result = await manager.delete({ id: user.id }).resolve();
     * if (delete_result.err) {
     *     // Handle the error in `delete_result.val`
     * }
     *
     * // This is recommended if the session is stored in a cookie
     * manager.reset_session_cookie(session, cookies);
     * ```
     * @param {DeleteData} delete_data The `delete_data` is an object of type {@link DeleteData}
     * consisting of an `id`.
     * @returns {AsyncResult<UID, HTTPError>} Returns an async result with either null or an error
     * if one ocurred.
     */
    delete(delete_data: DeleteData): AsyncResult<null, HTTPError>;

    /**
     * Generate a {@link UID} for the session.
     */
    generate_uid(): UID;

    /**
     * Hash the password.
     * @param {Password} password The password to hash.
     * @param {Salt} salt The salt to use, make sure to use a randomly generated one.
     * @returns {Hash} Returns the hash.
     */
    hash_password(password: Password, salt: Salt): Hash;

    /**
     * Sets the `session` parameter on the cookies object.
     * @param {UID} session The session to store.
     * @param {Cookies} cookies The cookies to store the session in.
     */
    set_session_cookie(session: UID, cookies: Cookies): void;

    /**
     * Removes the `session` parameter on the cookies object.
     * @param {Cookies} cookies The cookies object to remove the `session` from.
     */
    reset_session_cookie(cookies: Cookies): void;
}

export interface AccountDataParser<T> {
    parse_for_login(unparsed: T): Result<LoginData, HTTPError>;
    parse_for_register(unparsed: T): Result<RegisterData, HTTPError>;
}
