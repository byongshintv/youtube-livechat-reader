/// <reference types="node" />
import { OAuth2Client } from "googleapis-common";
import { youtube_v3 } from "googleapis";
import EventEmitter from 'events';
interface LiveChatEmitterDefaultData {
    auth: OAuth2Client;
    liveChatId: string;
}
export declare class LiveChatEmitter extends EventEmitter {
    private liveChatId;
    private auth;
    setDefaultData(prop: LiveChatEmitterDefaultData): void;
    getLiveChatId(): string;
    getOauth(): OAuth2Client;
    sendMessage(message: string, callback?: (err: any, res: any) => any): any;
}
export declare class LiveChatAPIError extends Error {
}
export declare class LiveChatAPIFirstExecuteError extends LiveChatAPIError {
}
export declare type emit$message = youtube_v3.Schema$LiveChatMessage;
interface MainProp {
    clientSecretPath?: string;
    liveChatId?: string;
    threshold?: number;
    messagePart?: string;
    tokenDir?: string;
}
export default function main(prop: MainProp): LiveChatEmitter;
export {};
