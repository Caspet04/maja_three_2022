import type { AccountManager } from "./interfaces/auth";
import { SQLiteAuth } from "./implementations/auth";
import { AccountDataFormParser } from "./implementations/auth";

export const auth: AccountManager = new SQLiteAuth();
export const form_parser = new AccountDataFormParser();
