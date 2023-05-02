import type { AccountManager } from "$lib/interfaces/auth";
import { SQLiteAuth } from "$lib/implementations/auth";
export {
    parse_login_data_from_form,
    parse_register_data_from_form,
} from "$lib/implementations/auth";

export const auth: AccountManager = new SQLiteAuth();
