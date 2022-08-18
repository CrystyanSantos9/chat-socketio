/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express')
const app = express()
const os = require('os')
const session = require('express-session')
const sharedSession = require('express-socket.io-session')
const cors = require('cors')

//MODELS
const Room = require('./models/room')
const Message = require('./models/message')

//inicia socket io 
const http = require('http').Server(app)
const io = require('socket.io')(http)
const redis = require('socket.io-redis')
io.adapter(redis({ host: "192.168.1.110", port: 6379 }))


const mongoose = require('mongoose')
const path = require('path')
const mongoString = process.env.MONGO_STRING || 'mongodb://172.18.0.2:32017/chat-socketio'

const hostname = os.hostname()
const PORT = process.env.PORT || 3005
const HOST = process.env.HOST || '0.0.0.0'

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())

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
io.use((socket, next)=>{
    const session = socket.handshake.session //negociação de conexão
    if(!session.user){
        next(new Error('Auth failed!'))
    }else{
        next()
    }
})



app.get('/', (req, res)=> res.render('home'))

// Quando usuário clicar em entrar em / será feito o post em /
//salva dados na sessao
//redireciona para /room 
app.post('/', (req, res)=> {
    if(req.body.name !==''){
        req.session.user = {
            name: req.body.name
        }
        return res.redirect('/room')
    } 
     res.redirect('/')
})

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

    //Received audio 
    socket.on('sendAudio', msg =>{
        const message = new Message({
            author: socket.handshake.session.user.name, 
            when: new Date(),
            type: 'audio',
            message: msg.data, 
            room: msg.room
        })
        message
            .save()
            .then(()=>{
                io.to(msg.room).emit('newAudio', message)
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
        http.listen(PORT, ()=>{
            console.log(`Application running on host http://${HOST}:${PORT} and database is ${connectionState}`)
        })
    })
    .catch(error=>{
        console.log(error)
    })
