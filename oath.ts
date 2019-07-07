import fs from 'fs'
import readline from 'readline'
import {google } from 'googleapis'
import { OAuth2Client } from 'googleapis-common';
import { Credentials } from 'google-auth-library';
import path from 'path';
var OAuth2 = google.auth.OAuth2;

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
export class LoadingSecretJSONError extends Error{}
export class ReadingSecretJSONError extends Error{}

export interface AuthCredentail{
  installed:{
    client_secret:string,
    client_id:string,
    redirect_uris:string[]
  }
}
export async function authorize(filename:string,tokenDir:string):Promise<OAuth2Client> { return new Promise(res => {
    var tokenPath = path.join(tokenDir,'private_key.json') ;
    let content:string;
    try{
        // Load client secrets from a local file.
        content = fs.readFileSync(filename).toString("UTF-8")
        // Authorize a client with the loaded credentials, then call the YouTube API.
    } catch(err){
        throw new LoadingSecretJSONError(err)
    } 
    let credentials:AuthCredentail
  try{
    credentials = JSON.parse(content)
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
  
  } catch(err){
    throw new ReadingSecretJSONError(err)
  }

  // Check if we have previously stored a token.
  fs.readFile(tokenPath, async function(err, token) {
    if (err) {
      var oauth:OAuth2Client = await getNewToken(oauth2Client,tokenPath);
      res(oauth)
    } else {
      oauth2Client.credentials = JSON.parse(token.toString("UTF-8"));
      res(oauth2Client);
    }
  });
})}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
async function getNewToken(oauth2Client:OAuth2Client,tokenPath:string):Promise<OAuth2Client> { return new Promise(res => {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token,tokenPath);
      res(oauth2Client);
    });
  });
})}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token:Credentials,tokenPath:string) {
  try {
    fs.mkdirSync(path.join(tokenPath,"../"));
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(tokenPath, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + tokenPath);
  });
  console.log('Token stored to ' + tokenPath);
}

