const http=require('http')
const express=require('express')
const path=require('path')
const Filter=require('bad-words')
const app=express()
const { generateMessage,generateLocationMessage }=require('./utils/messages')
const { addUser,removeUser,getUser,getUsersInRoom }=require('./utils/users')

// configuring server outside the express
const server=http.createServer(app)

const socketio=require('socket.io')
// socket io expected to be called with raw http server
const io=socketio(server)

const port =process.env.PORT || 3000

// sending static file stored in public directory
// we can optionally use an endpoint to serve static file like  app.use('/hello',express.static(publicDirectoryPath))
const publicDirectoryPath=path.join(__dirname,'/public')
app.use(express.static(publicDirectoryPath))


// let count=0
// io.on('connection',(socket)=>{
//     console.log("New WebSocket Connection!!")
//     socket.emit('countUpdated',count)
//     socket.on('increment',()=>{
//         count++
//         // emit event for single connection
//         // socket.emit('countUpdated',count)

//         // emit event for all connection
//         io.emit('countUpdated',count)
//     })
// })

let message="Welcome!!!"
// listening a connection event
io.on('connection',(socket)=>{
    socket.on('join',(options,callback)=>{
        const { error,user } = addUser({ id:socket.id, ...options })

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        // emitting a 'message' event
        socket.emit('message',generateMessage('Admin',message))
        // socket.broadcast.emit('message',generateMessage('A new user has joined!!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()

        // socket.emit  sends event to specific client
        // io.emit  sends event to every connected client
        // socket.broadcast.emit sends event to every connected client except the one who emits it
        // io.to.emit emit events to everybody in specific room
        // socket.broadcast.to.emit emits events to everybody except specific client
    })

    // listening a 'sendMessage' event
    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)
        const filter=new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('location',(data,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${data.latitude},${data.longitude}`))
        callback()
        // console.log("Latitude::",data.latitude)
        // console.log("Longitude::",data.longitude)
    })

    // disconnect is an inbuilt event that doesn't need to get emitted, it is emitted by server by default
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        } 
    })

})


server.listen(port,()=>{
    console.log("App is running on port 3000")
})