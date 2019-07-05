/// <reference types="node" />
import EventEmitter from 'events';
export declare class LiveChatEmitter extends EventEmitter {
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
}
export default function main(prop: MainProp): LiveChatEmitter;
export {};
