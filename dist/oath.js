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
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
var OAuth2 = googleapis_1.google.auth.OAuth2;
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube'];
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
class LoadingSecretJSONError extends Error {
}
exports.LoadingSecretJSONError = LoadingSecretJSONError;
class ReadingSecretJSONError extends Error {
}
exports.ReadingSecretJSONError = ReadingSecretJSONError;
function authorize(filename, tokenDir) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(res => {
            var tokenPath = path_1.default.join(tokenDir, 'private_key.json');
            let content;
            try {
                // Load client secrets from a local file.
                content = fs_1.default.readFileSync(filename).toString("UTF-8");
                // Authorize a client with the loaded credentials, then call the YouTube API.
            }
            catch (err) {
                throw new LoadingSecretJSONError(err);
            }
            let credentials;
            try {
                credentials = JSON.parse(content);
                var clientSecret = credentials.installed.client_secret;
                var clientId = credentials.installed.client_id;
                var redirectUrl = credentials.installed.redirect_uris[0];
                var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
            }
            catch (err) {
                throw new ReadingSecretJSONError(err);
            }
            // Check if we have previously stored a token.
            fs_1.default.readFile(tokenPath, function (err, token) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        var oauth = yield getNewToken(oauth2Client, tokenPath);
                        res(oauth);
                    }
                    else {
                        oauth2Client.credentials = JSON.parse(token.toString("UTF-8"));
                        res(oauth2Client);
                    }
                });
            });
        });
    });
}
exports.authorize = authorize;
/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, tokenPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(res => {
            var authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES
            });
            console.log('Authorize this app by visiting this url: ', authUrl);
            var rl = readline_1.default.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question('Enter the code from that page here: ', function (code) {
                rl.close();
                oauth2Client.getToken(code, function (err, token) {
                    if (err) {
                        console.log('Error while trying to retrieve access token', err);
                        return;
                    }
                    oauth2Client.credentials = token;
                    storeToken(token, tokenPath);
                    res(oauth2Client);
                });
            });
        });
    });
}
/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token, tokenPath) {
    try {
        fs_1.default.mkdirSync(path_1.default.join(tokenPath, "../"));
    }
    catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs_1.default.writeFile(tokenPath, JSON.stringify(token), (err) => {
        if (err)
            throw err;
        console.log('Token stored to ' + tokenPath);
    });
    console.log('Token stored to ' + tokenPath);
}
