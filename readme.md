# youtube-livechat-reader
[![Build Status](https://travis-ci.org/byongshintv/youtube-livechat-reader.svg?branch=master)](https://travis-ci.org/byongshintv/youtube-livechat-reader)
[![npm version](https://badge.fury.io/js/youtube-livechat-reader.svg)](https://badge.fury.io/js/youtube-livechat-reader)

[Youtube OAuth 2.0 Client](https://console.developers.google.com/apis/credentials)의 client_secrent파일으로 자신의 라이브 스트리밍 메세지를 가져올 수 있습니다.

ES6과 Async-Await을 사용한 라이브러리이기에 버전 7.6이상의 nodejs가 필요합니다. 아래의 코드로 버전을 확인 해 주세요.
```
node --version
```

## 설치
아래 코드로 마지막버전의 `youtube-livechat-reader`를 package.json파일에 추가할 수 있습니다.
```
npm install -s youtube-livechat-reader
```

## 사용방법
```
let livechatReader = require('youtube-livechat-reader')
```
위와 같은 방법으로 새로운 메세지가 도착할때마다 이벤트를 뱉어주는 [`EventEmitter`](https://nodejs.org/api/events.html)객체를 획득할 수 있습니다.


| 파라미터     |   설명     | 타입 | 필수여부 | 기본값 |
| --------     |:---------------| :-----| :-----| :-----:|
| **clientSecretPath** | *[Youtube OAuth 2.0 Client](https://console.developers.google.com/apis/credentials)에서 제공하는 `client_secret.json`의 위치* | **string** | **false** | client_secret.json 
| **liveChatId**     | *메세지를 읽을 라이브챗의 주소* | **string** | **false** | 사용자의 라이브챗
| **threshold** |  *메세지를 확인할 간격*  | **number** | **false** | 1000
| **messagePart** |  *유튜브 서버에서 가져올 자원의 범위를 지정합니다. id, snippet, authorDetails를 입력할 수 있으며 snippet은 필수입니다. 쉼표로 두가지 이상의 자원을 지정할 수 있습니다.*  | **string** | **false** | snippet, authorDetails
| **tokenDir** |  *유튜브 API 서버에서 반환된 OAuth 토큰을 저장할 장소를 지정합니다.*  | **string** | **false** | .credentials/


```
let livechatReader = require('youtube-livechat-reader')
var reader = livechatReader({clientSecretPath:"client_secret.json"})

reader.on("ready", livechatId => console.log(livechatId,"is ready"))
reader.on("error", snippet => console.log(snippet))
reader.on("message", err => console.error(err))
```

`message`이벤트에서 반환되는 리소스는 [liveChatMessages]('https://developers.google.com/youtube/v3/live/docs/liveChatMessages/list')요청으로 반환되는 값과 같습니다.


## 사용방법
패키지의 기본함수를 실행했을때 반환되는 `EventEmitter`객체는 이벤트를 제공하는것 외에도 여러가지 동작을 수행할 수 있습니다. 

### 메세지 전송(sendMessage)
`ready`이벤트가 정상적으로 emit된 `EventEmiiter`객체는 `sendMessage`메서드를 통해 접속중인 채팅방에 메세지를 전송할 수 있습니다.  

`reader.sendMessage(message:string, callback?:(err, res) )`와 같이 사용할 수 있습니다.

```
var reader = Reader()

const testMessage = "hello vsTV!"
reader.on("message", (v:emit$message) => {
    console.log(v)
    if(v.snippet.textMessageDetails.messageText == testMessage)
        console.log("TEST COMPLETE!!!")
})

reader.on("ready", v => {
    console.log(v + " is ready~")
    reader.sendMessage(testMessage)
})
```
