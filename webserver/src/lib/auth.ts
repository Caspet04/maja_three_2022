import type { AccountManager } from "$lib/interfaces/auth";
import { SQLiteAuth } from "$lib/implementations/auth";
import { AccountDataFormParser } from "$lib/implementations/auth";

export const auth: AccountManager = new SQLiteAuth();
export const form_parser = new AccountDataFormParser();
