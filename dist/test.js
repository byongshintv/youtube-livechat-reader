"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
var reader = index_1.default({
    threshold: 2000,
    tokenDir: "E:\\credential\\youtube",
    clientSecretPath: "E:\\credential\\client_secret_vstv.json"
});
const testMessage = "hello vsTV!";
reader.on("error", v => console.log(v));
reader.on("message", (v) => {
    console.log(v);
    if (v.snippet.textMessageDetails.messageText == testMessage)
        console.log("TEST COMPLETE!!!");
});
reader.on("ready", v => {
    console.log(v + " is ready~");
    reader.sendMessage(testMessage);
});
