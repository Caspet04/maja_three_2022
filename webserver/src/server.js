import http from "http";
import express from "express";
import { setup_websocket } from "../websocket";
import { handler } from "../build/handler";

const app = express();
const server = http.createServer(app);

setup_websocket(server);

app.use(handler);

server.listen(3000, () => {
    console.log("Running on http://localhost:3000");
});
