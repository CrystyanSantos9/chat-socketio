const mongoose = require('mongoose')
const mongoString = process.env.MONGO_STRING || 'mongodb://172.18.0.2:32017/chat-socketio'
const { http } = require('./app')
const os = require('os')

//ENVIRONMENTS
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || os.hostname()

//MODELS
const Room = require('./models/room')
const Message = require('./models/message')

mongoose
    .connect(mongoString, { useNewUrlParser: true, useUnifiedTopology: true } )
    .then(async ()=>{
        const connectionStateInformation = await mongoose.STATES
        const connectionState = connectionStateInformation.connected === 1 ? "Connected":"Something got wrong"
    
        http.listen(3000, ()=>{
            console.log(`Application running on host ${HOST} on port ${PORT} and database is ${connectionState}`)
        })
    })
    .catch(error=>{
        console.log(error)
    })

