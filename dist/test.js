"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
var reader = index_1.default({ threshold: 2000 });
reader.on("ready", v => console.log(v, "is ready"));
reader.on("error", v => console.log(v));
reader.on("message", v => console.log(v));
