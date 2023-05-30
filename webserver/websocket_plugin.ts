import { setup_websocket } from "./websocket";

export const websocket_server = {
    name: "websocket_server",
    configureServer(server: any) {
        setup_websocket(server.httpServer);
    },
};
