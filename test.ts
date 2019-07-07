import Reader, { emit$message } from './index'

var reader = Reader({
    threshold:2000,
    tokenDir:"E:\\credential\\youtube",
    clientSecretPath:"E:\\credential\\client_secret_vstv.json"
})

const testMessage = "hello vsTV!"
reader.on("error", v => console.log(v))
reader.on("message", (v:emit$message) => {
    console.log(v)
    if(v.snippet.textMessageDetails.messageText == testMessage)
        console.log("TEST COMPLETE!!!")
})

reader.on("ready", v => {
    console.log(v + " is ready~")
    reader.sendMessage(testMessage)
})