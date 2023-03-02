import type { AsyncResult } from "ts-async-results";
import type { HTTPError } from "$lib/interfaces/http-response";
import type { User } from "@prisma/client";

export type UserExistsResult =
    | {
          user_exists: true;
          user: User;
      }
    | {
          user_exists: false;
      };

export interface AuthData {
    username: string;
    password: string;
}

export interface AuthResult {
    session: string;
}

export interface RegisterData {
    username: string;
    password: string;
}

export interface RegisterResult {
    session: string;
}

export interface LogoutData {
    username: string;
    password: string;
}

export interface LogoutResult {
    session: string;
}

export interface IUserManager {
    user_exists: (username: string) => AsyncResult<UserExistsResult, HTTPError>;
    authenticate: (data: AuthData) => AsyncResult<AuthResult, HTTPError>;
    register: (data: RegisterData) => AsyncResult<RegisterResult, HTTPError>;
    logout: (data: LogoutData) => AsyncResult<LogoutResult, HTTPError>;
}
