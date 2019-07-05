import { OAuth2Client } from 'googleapis-common';
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
export declare class LoadingSecretJSONError extends Error {
}
export declare class ReadingSecretJSONError extends Error {
}
export interface AuthCredentail {
    installed: {
        client_secret: string;
        client_id: string;
        redirect_uris: string[];
    };
}
export declare function authorize(filename: string): Promise<OAuth2Client>;
