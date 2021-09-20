const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

var cors = require('cors')
app.use(cors());

app.options('*', cors())

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId)
        console.log(userName)
        socket.broadcast.emit('user-connected', userId);
        // socket.to(roomId).broadcast.emit('user-connected', userId);

        socket.on('disconnect', () => {
                socket.broadcast.emit('user-disconnected', userId)
                    // socket.to(roomId).broadcast.emit('user-disconnected', userId)
            })
            // messages
        socket.on('message', (message) => {
            //send message to the same room
            io.to(roomId).emit('createMessage', message)
        });


    })
})

server.listen(process.env.PORT || 3000)