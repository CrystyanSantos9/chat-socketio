const mongoose = require('mongoose')

const MessageSchema = mongoose.Schema({
    author: String,
    when: Date,
    type: String, //pode ser audio ou texto
    message: String,
    room: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Room' //referencia o schema room
    } 
})

const Message = mongoose.model('Message', MessageSchema)

module.exports = Message