import EventEmitter from 'events';
declare class LiveChatEmitter extends EventEmitter {
}
interface MainProp {
    clientSecretPath?: string;
    liveChatId?: string;
    threshold?: number;
    messagePart?: string;
}
export default function main(prop: MainProp): LiveChatEmitter;
export {};
