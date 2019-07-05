import Reader from './index'

var reader = Reader({clientSecretPath:"client_secret.json"})

reader.on("ready", v => console.log(v,"is ready"))
reader.on("error", v => console.log(v))
reader.on("message", v => console.log(v))
