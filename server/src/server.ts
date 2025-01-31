import 'module-alias/register'

import express from 'express'
import { Server, type Socket } from 'socket.io'
import http from 'http'
import cors from 'cors'

import { addUser, getRoomMembers, getUser, removeUser } from './data/users'
import { GameRoomData, HexString, User } from './types'


const app = express()

app.use(cors())

const server = http.createServer(app)

const io = new Server(server)

function isRoomCreated(gameId: string) {
  const rooms = Array.from(io.sockets.adapter.rooms)
  return rooms?.some(room => room[0] === gameId)
}

function joinRoom(socket: Socket, gameId: string, username: string, p1: boolean, address?: HexString, ) {
    console.log("Before joining - Rooms:", Array.from(io.sockets.adapter.rooms));
  
    socket.join(gameId);
    
    console.log("After joining - Rooms:", Array.from(io.sockets.adapter.rooms));
    console.log("Room members for", gameId, ":", io.sockets.adapter.rooms.get(gameId));
  
    const user = {
    id: socket.id,
    username,
    address,
    p1
  }
  addUser({ ...user, gameId, address, p1 })
  const members = getRoomMembers(gameId)

  socket.emit('room-joined', { user, gameId, members })
  socket.to(gameId).emit('update-members', members)
  socket.to(gameId).emit('send-notification', {
    title: 'New member arrived!',
    message: `${username} joined the party.`,
  })
}

function leaveRoom(socket: Socket) {
  const user = getUser(socket.id)
  if (!user) return

  const { username, gameId } = user

  removeUser(socket.id)
  const members = getRoomMembers(gameId)

  socket.to(gameId).emit('update-members', members)
  socket.to(gameId).emit('send-notification', {
    title: 'Member departure!',
    message: `${username} left the party.`,
  })
  socket.leave(gameId)
}

io.on('connection', socket => {
  socket.on('create-room', (gameRoomData: GameRoomData, userData: User) => {
    console.log("🚀 ~ socket.on ~ userData:", userData)
    console.log("🚀 ~ socket.on ~ gameRoomData:", gameRoomData)

    const { gameId, username } = gameRoomData
    const {p1} = userData

    joinRoom(socket, gameId, username, p1)
  })

  socket.on('join-room', (gameRoomData: GameRoomData, userData: User) => {
    const { gameId, username } = gameRoomData
    console.log("🚀 ~ file: server.ts:101 ~ socket.on ~ gameRoomData:", gameRoomData)
    const {p1} = userData

    if (isRoomCreated(gameId)) {
      return joinRoom(socket, gameId, username, p1)
    }

    socket.emit('room-not-found', {
      message: "Oops! The Room ID you entered doesn't exist or hasn't been created yet.",
    })
  })

  socket.on('leave-room', () => {
    leaveRoom(socket)
  })

  socket.on('disconnect', () => {
    socket.emit('disconnected')
    leaveRoom(socket)
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => console.log(`Server is running on port ${PORT} now!`))
