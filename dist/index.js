"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oath_1 = require("./oath");
const googleapis_1 = require("googleapis");
const events_1 = __importDefault(require("events"));
class LiveChatEmitter extends events_1.default {
    setDefaultData(prop) {
        this.liveChatId = prop.liveChatId;
        this.auth = prop.auth;
    }
    ;
    getLiveChatId() {
        return this.liveChatId;
    }
    getOauth() {
        return this.auth;
    }
    sendMessage(message, callback) {
        var prop = {
            auth: this.auth,
            part: "snippet",
            requestBody: {
                snippet: {
                    liveChatId: this.getLiveChatId(),
                    type: "textMessageEvent",
                    textMessageDetails: {
                        messageText: message
                    }
                }
            }
        };
        service.liveChatMessages.insert(prop, callback);
    }
}
exports.LiveChatEmitter = LiveChatEmitter;
class LiveChatAPIError extends Error {
}
exports.LiveChatAPIError = LiveChatAPIError;
class LiveChatAPIFirstExecuteError extends LiveChatAPIError {
}
exports.LiveChatAPIFirstExecuteError = LiveChatAPIFirstExecuteError;
var service = googleapis_1.google.youtube('v3');
async function getMessages(auth, liveChatId, messagePart, pageToken) {
    return new Promise((res, rej) => {
        const prop = {
            auth: auth,
            part: messagePart,
            liveChatId,
        };
        if (pageToken !== undefined)
            prop.pageToken = pageToken;
        service.liveChatMessages.list(prop, (err, response) => {
            if (err)
                throw err;
            var nextPageToken = response.data.nextPageToken;
            var messages = response.data.items;
            res({ nextPageToken, messages });
        });
    });
}
async function readLiveChat(emitter, auth, liveChatId, threadholes = 1000, messagePart) {
    var { nextPageToken } = await getMessages(auth, liveChatId, messagePart).catch(err => { throw new LiveChatAPIFirstExecuteError(err); }); // 마지막 
    emitter.emit("ready", liveChatId);
    var interval = setInterval(async () => {
        var { messages, nextPageToken: token } = await getMessages(auth, liveChatId, messagePart, nextPageToken);
        nextPageToken = token;
        messages.reverse().map((message) => {
            emitter.emit("message", message);
        });
    }, threadholes);
    emitter.on("stop", () => clearInterval(interval));
}
async function getLiveChatId(auth) {
    return new Promise((finalResolve, finalReject) => {
        var requestProp = {
            auth,
            part: 'snippet',
            broadcastType: "all"
        };
        const liveBroadcasts = googleapis_1.google.youtube('v3').liveBroadcasts;
        new Promise((res, rej) => {
            // 현재 활성화중인 broadCastlive 체크
            liveBroadcasts.list(Object.assign({}, requestProp, { broadcastStatus: "active" }), (err, response) => {
                err ? rej(err) : res(response);
            });
        }).then((response) => new Promise((res, rej) => {
            // 활성화중인 라이브가 없을 시 활성화 예정인 라이브 체크
            var items = response.data.items;
            if (items.length == 0) {
                ("There is no active broadcast. It will check the broadCast id to upload.");
                googleapis_1.google.youtube('v3').liveBroadcasts.list(Object.assign({}, requestProp, { broadcastStatus: "upcoming" }), (err, upcomingResponse) => {
                    if (err)
                        rej(err);
                    res(upcomingResponse);
                });
            }
            else {
                finalResolve(items[0].snippet.liveChatId);
            }
        })).then((response) => {
            new Promise((res, rej) => {
                // 활성화된 라이브 체크 
                var items = response.data.items;
                if (items.length == 0) {
                    rej("It is not possible to check both live and live not id checked.");
                }
                else {
                    finalResolve(items[0].snippet.liveChatId);
                }
            });
        }).catch((err) => { throw err; });
    });
}
function main(prop) {
    prop = Object.assign({ clientSecretPath: 'client_secret.json', threshold: 1000, messagePart: "snippet", tokenDir: '.credentials/' }, prop);
    let { clientSecretPath, liveChatId, threshold, messagePart, tokenDir } = prop;
    var emitter = new LiveChatEmitter();
    new Promise(async function (res, rej) {
        try {
            var auth = await oath_1.authorize(clientSecretPath, tokenDir);
            liveChatId = liveChatId || await getLiveChatId(auth);
            emitter.setDefaultData({ auth, liveChatId });
            await readLiveChat(emitter, auth, liveChatId, threshold, messagePart);
        }
        catch (err) {
            rej(err);
        }
    }).catch(err => {
        var message;
        if (err instanceof oath_1.LoadingSecretJSONError)
            message = clientSecretPath + " not found.";
        else if (err instanceof oath_1.ReadingSecretJSONError)
            message = clientSecretPath + " is not a valid client_secret file.";
        else {
            message = err;
        }
        emitter.emit("error", message);
    });
    return emitter;
}
exports.default = main;
