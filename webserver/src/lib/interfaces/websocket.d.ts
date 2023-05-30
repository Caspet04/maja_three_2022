export interface ServerToClientEvents {
    message: (author: string, content: string, timestamp: number) => void;
}

export interface ClientToServerEvents {
    message: (content: string) => void;
}

export interface InterServerEvents {}
export interface SocketData {
    name: string;
}
