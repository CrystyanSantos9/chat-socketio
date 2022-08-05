const express = require('express')
const app = express()
const os = require('os')
const session = require('express-session')
const sharedSession = require('express-socket.io-session')

//MODELS
const Room = require('./models/room')
const Message = require('./models/message')

//inicia socket io 
const http = require('http').Server(app)
const io = require('socket.io')(http)



const mongoose = require('mongoose')
const { application } = require('express')
const path = require('path')
const mongoString = process.env.MONGO_STRING || 'mongodb://172.18.0.2:32017/chat-socketio'

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || os.hostname()

app.use(express.json())
app.use(express.urlencoded({extended: false}))


app.set('views',  path.join(__dirname,'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname,'public')))

const expressSession = session({
    secret: process.env.SESSION_SECRET || 'socketio', //variavel de ambiente que fica dentro de .env
    resave: false, 
    saveUninitialized: false,
    cookie: {
        maxAge: 10*60*1000 // 1 hora para cookies de sessão 
    }
})

app.use(expressSession)
io.use(sharedSession(expressSession, { autoSave: true }))




app.get('/', (req, res)=> res.render('home'))

// Quando usuário clicar em entrar em / será feito o post em /
//salva dados na sessao
//redireciona para /room 
app.post('/', (req, res)=> {
    req.session.user = {
        name: req.body.name
    }
    res.redirect('/room')
}
)

app.get('/room', (req, res)=>{
   if(!req.session.user){
        res.redirect('/')
   }else{
    res.render('room', {
        name: req.session.user.name
    })
   }
})


io.on('connection', socket => {
    //buscamos pelas salas inicias
    Room.find({}, (err, rooms)=>{
        socket.emit('roomList', rooms)
    })

    //Add nova sala 
    socket.on('addRoom', roomName => {
        const room = new Room({
            name: roomName
        })
        room
        .save()
        .then(()=>{
            io.emit('newRoom', room)
        })
    })

    //JOIN NA SALA QUANDO CLICADAS PELO CLIENTE
    socket.on('join', roomId=>{
        socket.join(roomId)
        Message
            .find({room: roomId})
            .then((msgs)=>{
                socket.emit('msgsList', msgs)
            })
        console.log('join com sala', roomId)
    })

    socket.on('sendMsg', msg=>{
        const message = new Message({
            author: socket.handshake.session.user.name, 
            when: new Date(),
            type: 'text',
            message: msg.msg, 
            room: msg.room
        })
        message
            .save()
            .then(()=>{
                io.to(msg.room).emit('newMsg', message)
            })
        // console.log(message)
        // console.log(socket.handshake.session)
    })

})






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
