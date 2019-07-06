"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oath_1 = require("./oath");
const googleapis_1 = require("googleapis");
const events_1 = __importDefault(require("events"));
class LiveChatEmitter extends events_1.default {
}
exports.LiveChatEmitter = LiveChatEmitter;
class LiveChatAPIError extends Error {
}
exports.LiveChatAPIError = LiveChatAPIError;
class LiveChatAPIFirstExecuteError extends LiveChatAPIError {
}
exports.LiveChatAPIFirstExecuteError = LiveChatAPIFirstExecuteError;
function getMessages(auth, liveChatId, messagePart) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            var service = googleapis_1.google.youtube('v3');
            service.liveChatMessages.list({
                auth: auth,
                part: messagePart,
                liveChatId,
            }, function (err, response) {
                if (err) {
                    rej(err);
                }
                else {
                    res(response.data.items);
                }
            });
        });
    });
}
function readLiveChat(emitter, auth, liveChatId, threadholes = 1000, messagePart) {
    return __awaiter(this, void 0, void 0, function* () {
        var getPublishAt = (message) => new Date(message.snippet.publishedAt);
        var prevMessages = yield getMessages(auth, liveChatId, messagePart).catch(err => { throw new LiveChatAPIFirstExecuteError(err); }); // 마지막 
        var lastTime = prevMessages.length === 0 ? new Date() : getPublishAt(prevMessages[prevMessages.length - 1]);
        emitter.emit("ready", liveChatId);
        var interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            var nextMessage = yield getMessages(auth, liveChatId, messagePart);
            nextMessage.map(message => {
                var publishedAt = getPublishAt(message);
                if (publishedAt <= lastTime)
                    return; //가장 마지막에 읽힌 메세지보다 이전의 메세지인 경우
                lastTime = publishedAt;
                emitter.emit("message", message);
            });
        }), threadholes);
    });
}
function getLiveChatId(auth) {
    return __awaiter(this, void 0, void 0, function* () {
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
                    console.log("There is no active broadcast. It will check the broadCast id to upload.");
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
    });
}
function main(prop) {
    prop = Object.assign({ clientSecretPath: 'client_secret.json', threshold: 1000, messagePart: "snippet" }, prop);
    let { clientSecretPath, liveChatId, threshold, messagePart } = prop;
    var emitter = new LiveChatEmitter();
    new Promise(function (res, rej) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var auth = yield oath_1.authorize(clientSecretPath);
                liveChatId = liveChatId || (yield getLiveChatId(auth));
                yield readLiveChat(emitter, auth, liveChatId, threshold, messagePart);
            }
            catch (err) {
                rej(err);
            }
        });
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
