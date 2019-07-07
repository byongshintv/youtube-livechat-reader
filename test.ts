import Reader from './index'

var reader = Reader({
    threshold:2000,
    tokenDir:`E:\\project-honmono\\read-livechat-bytts\\dist\\.credentials`,
    clientSecretPath:"E:\\project-honmono\\read-livechat-bytts\\dist\\client_secret.json"
})


reader.on("error", v => console.log(v))
reader.on("message", v => console.log(v))

reader.on("ready", v => {
    reader.emit("message","testMessage")
})