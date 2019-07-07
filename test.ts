import Reader from './index'

var reader = Reader({threshold:2000})

reader.on("ready", v => console.log(v,"is ready"))
reader.on("error", v => console.log(v))
reader.on("message", v => console.log(v))
