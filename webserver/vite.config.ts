import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig } from "vite";

import { websocket_server } from "./websocket_plugin";

const config: UserConfig = {
    plugins: [sveltekit(), websocket_server],
};

export default config;
