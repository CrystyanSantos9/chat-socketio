const mongoose = require('mongoose')
const Room = require('./src/models/room')

// const mongoString = process.env.MONGO_STRING || 'mongodb://172.18.0.2:32017/chat-socketio'
const mongoString = process.env.MONGO_STRING || 'mongodb://192.168.1.110:27017/chat-socketio'

mongoose
    .connect(mongoString, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        const connectionStateInformation = await mongoose.STATES
        const connectionState = connectionStateInformation.connected === 1 ? "Connected" : "Something got wrong"

        const room1 = new Room({
            name: "Sala1_teste"
        })
        const room2 = new Room({
            name: "Sala2_teste"
        })
        const room3 = new Room({
            name: "Sala3_teste"
        })
        async function saveRooms(){
           await room1.save()
           await room2.save()
           await room3.save()

           mongoose.connection.close()
        }
        
        saveRooms()
       

    })
    .catch(error => {
        console.log(error)
    })