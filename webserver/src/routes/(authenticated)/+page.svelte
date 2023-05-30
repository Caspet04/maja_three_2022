<script lang="ts">
    import { io, Socket } from "socket.io-client";
    import type {
        ClientToServerEvents,
        ServerToClientEvents,
    } from "$lib/interfaces/websocket";
    import type { PageServerData } from "./$types";

    export let data: PageServerData;

    type Message = { author: string; content: string; timestamp: string };
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

    let messages: Message[];
    $: messages = [];

    let message_input: string = "";

    socket.on(
        "message",
        (author: string, content: string, timestamp: number) => {
            const timestamp_date = new Date(timestamp);
            const formated_timestamp =
                [
                    timestamp_date.getDate(),
                    timestamp_date.getMonth(),
                    timestamp_date.getFullYear(),
                ].join("/") +
                " " +
                [
                    timestamp_date.getHours(),
                    timestamp_date.getMinutes(),
                    timestamp_date.getSeconds(),
                ].join(":");
            messages.push({
                author,
                content,
                timestamp: formated_timestamp,
            });
            messages = messages;
        }
    );

    function send_message() {
        socket.emit("message", message_input);
        message_input = "";
    }
</script>

<div id="chat">
    <div id="messages">
        {#each messages as message}
            <div class="message" class:self={message.author == data.username}>
                <div class="author">{message.author}</div>
                <div class="timestamp">{message.timestamp}</div>
                <div class="content">{message.content}</div>
            </div>
        {/each}
    </div>
    <form id="write-area" on:submit|preventDefault={() => send_message()}>
        <input type="text" bind:value={message_input} />
        <button>Send</button>
    </form>
</div>

<style>
    #chat {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    #messages {
        display: flex;
        flex-direction: column;
        width: 50vw;
        height: 80vh;
        overflow-y: scroll;
        background: darkgray;
    }

    .message {
        display: grid;
        grid-template-columns: min-content auto;
        grid-template-rows: max-content auto;

        background: grey;
        border: 1px solid black;
        border-radius: 10px;
        padding: 0.5em;
        width: 90%;
    }

    .author {
        font-size: large;
        font-weight: bold;
        margin-bottom: 0.25em;
        margin-right: 0.5em;
        white-space: nowrap;
    }

    .timestamp {
        font-size: small;
        align-self: flex-end;
        margin-bottom: 0.25em;
    }

    .content {
        grid-column: 1/-1;
    }

    .message.self {
        align-self: flex-end;
        grid-template-columns: auto min-content;
    }

    .message.self > .author {
        text-align: end;
    }
</style>
