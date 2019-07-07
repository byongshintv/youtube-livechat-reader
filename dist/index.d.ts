/// <reference types="node" />
import EventEmitter from 'events';
export declare class LiveChatEmitter extends EventEmitter {
    private liveChatId;
    setLiveChatId(liveChatId: string): any;
    getLiveChatId(): string;
}
export declare class LiveChatAPIError extends Error {
}
export declare class LiveChatAPIFirstExecuteError extends LiveChatAPIError {
}
interface MainProp {
    clientSecretPath?: string;
    liveChatId?: string;
    threshold?: number;
    messagePart?: string;
    tokenDir?: string;
}
export default function main(prop: MainProp): LiveChatEmitter;
export {};
