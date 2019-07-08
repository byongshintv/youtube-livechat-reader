import { OAuth2Client } from "googleapis-common";
import { authorize, LoadingSecretJSONError, ReadingSecretJSONError } from "./oath";
import { google, youtube_v3 } from "googleapis";
import { GaxiosResponse } from "gaxios";
import EventEmitter from 'events'

interface LiveChatEmitterDefaultData{
    auth:OAuth2Client,
    liveChatId:string

}
export class LiveChatEmitter extends EventEmitter{
    private liveChatId:string
    private auth:OAuth2Client


    public setDefaultData(prop:LiveChatEmitterDefaultData){
        this.liveChatId = prop.liveChatId;
        this.auth = prop.auth;
    };

    public getLiveChatId():string{
        return this.liveChatId;
    }

    public getOauth():OAuth2Client{
        return this.auth;
    }

    public sendMessage(message:string,callback?:(err,res) => any):any{
        var prop = {
            auth:this.auth,
            part: "snippet",
            requestBody:{
                snippet:{              
                    liveChatId: this.getLiveChatId(),
                    type: "textMessageEvent",
                    textMessageDetails:{
                        messageText:message
                    }
                }
            }
        }
    
        service.liveChatMessages.insert(prop,callback)
    }
}

export class LiveChatAPIError extends Error{}
export class LiveChatAPIFirstExecuteError extends LiveChatAPIError{}
var service = google.youtube('v3');

type MessageList = youtube_v3.Schema$LiveChatMessage[]
interface getMessagesReturn{
    messages: MessageList,
    nextPageToken: string
}
async function getMessages(
    auth:OAuth2Client,liveChatId:string,messagePart:string
    ,pageToken?:string
    ): Promise<getMessagesReturn> { return new Promise((res,rej) => {

    
    const prop:youtube_v3.Params$Resource$Livechatmessages$List = {
        auth: auth,
        part:messagePart,
        liveChatId,
    }
    if(pageToken !== undefined) prop.pageToken = pageToken;

    service.liveChatMessages.list(prop, (err, response) => {
        if(err) throw err
        var nextPageToken = response.data.nextPageToken
        var messages = response.data.items
        res({ nextPageToken, messages})
    });
})}

export type emit$message = youtube_v3.Schema$LiveChatMessage
async function readLiveChat(emitter:LiveChatEmitter,auth:OAuth2Client,liveChatId:string,threadholes= 1000,messagePart){
        var { nextPageToken } = await getMessages(auth,liveChatId,messagePart).catch(err => {throw new LiveChatAPIFirstExecuteError(err)}) // 마지막 

        emitter.emit("ready",liveChatId)
    
        var interval = setInterval(async () => {
            var {messages, nextPageToken: token} = await getMessages(auth,liveChatId,messagePart,nextPageToken)
            nextPageToken = token
            messages.reverse().map((message:emit$message) => {
                emitter.emit("message",message)  
            })
        }, threadholes)

        emitter.on("stop", () => clearInterval(interval))

}

async function getLiveChatId(auth:OAuth2Client):Promise<string>{ return new Promise((finalResolve,finalReject) => {
    type BroadCastResponse = GaxiosResponse<youtube_v3.Schema$LiveBroadcastListResponse>;
    type BroadCastItems = youtube_v3.Schema$LiveBroadcast[]
    var requestProp = {
        auth,
        
        part:'snippet',
        broadcastType:"all"
    }
    const liveBroadcasts = google.youtube('v3').liveBroadcasts
    new Promise<BroadCastResponse>((res,rej) => {
        // 현재 활성화중인 broadCastlive 체크
        liveBroadcasts.list({
            ...requestProp,
            broadcastStatus:"active"
        },(err,response) => {
            err ? rej(err) : res(response)
        })
    }).then((response:BroadCastResponse) => new Promise<BroadCastResponse>((res,rej) => {

        // 활성화중인 라이브가 없을 시 활성화 예정인 라이브 체크
        var items:BroadCastItems = response.data.items as BroadCastItems  
        if(items.length == 0){
            ("There is no active broadcast. It will check the broadCast id to upload.")
            google.youtube('v3').liveBroadcasts.list({
                ...requestProp,
                broadcastStatus:"upcoming"
            },(err,upcomingResponse) => {
                if(err) rej(err)
                res(upcomingResponse)
            })
        } else {
            finalResolve(items[0].snippet.liveChatId)
        }
    })).then((response:BroadCastResponse) => { new Promise((res,rej) => {
        // 활성화된 라이브 체크 
        var items:BroadCastItems = response.data.items as BroadCastItems  
        if(items.length == 0){
            rej("It is not possible to check both live and live not id checked.")
        } else {
            finalResolve(items[0].snippet.liveChatId)
        }
    })}).catch((err:any) => {throw err })

    
})}

interface MainProp{
    clientSecretPath?:string, 
    liveChatId?:string,
    threshold?:number,
    messagePart?:string,
    tokenDir?:string
}
export default function main(prop:MainProp){
    prop = {
        clientSecretPath: 'client_secret.json',
        threshold:1000,
        messagePart:"snippet",
        tokenDir:'.credentials/',
        ...prop
    }
    let { clientSecretPath, liveChatId, threshold, messagePart, tokenDir } = prop
    var emitter = new LiveChatEmitter();

    new Promise<void>(async function(res,rej){
        try{

            var auth:OAuth2Client = await authorize(clientSecretPath,tokenDir)
            liveChatId = liveChatId || await getLiveChatId(auth)
            emitter.setDefaultData({ auth, liveChatId });
            await readLiveChat(emitter, auth,liveChatId,threshold,messagePart)

        } catch(err){
            rej(err)
        } 
    }).catch(err => {
        var message
        if(err instanceof LoadingSecretJSONError)
            message = clientSecretPath + " not found."
        else if(err instanceof ReadingSecretJSONError)
            message = clientSecretPath + " is not a valid client_secret file."
        else {
            message = err
        }
        emitter.emit("error",message)
    })


    return emitter
}