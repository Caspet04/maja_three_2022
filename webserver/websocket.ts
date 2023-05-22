import { Server, type Socket } from "socket.io";
import type http from "http";
import type {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from "$lib/interfaces/websocket";
import { parse } from "cookie";
import { auth } from "./src/lib/auth";
import type { UID } from "./src/lib/interfaces/auth";

export function setup_websocket(server: http.Server) {
    // TODO: Fix typing of socket server
    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >(server);

    const sockets: Socket[] = [];

    io.on("connection", async (socket) => {
        if (socket.handshake.headers.cookie == undefined) {
            return;
        }

        const session = parse(socket.handshake.headers.cookie)["session"] as
            | UID
            | undefined;
        if (session == undefined) {
            return;
        }

        const get_result = await auth.get_user_by_session(session).resolve();
        if (get_result.err) return;

        const username = get_result.val.username;

        socket.data.name = username;
        sockets.push(socket);

        socket.on("disconnect", () => {
            const index = sockets.indexOf(socket);
            if (index < 0) return;
            sockets.splice(index, 1);
            sockets.forEach((recieve_socket) => {
                const timestamp = Date.now();
                const author = socket.data.name ?? "Unknown User";
                recieve_socket.emit(
                    "message",
                    "Server",
                    `User "${author}" disconnected`,
                    timestamp
                );
            });
        });

        socket.on("message", (content) => {
            sockets.forEach((recieve_socket) => {
                const timestamp = Date.now();
                const author = socket.data.name ?? "Unknown User";
                recieve_socket.emit("message", author, content, timestamp);
            });
        });
    });
}
