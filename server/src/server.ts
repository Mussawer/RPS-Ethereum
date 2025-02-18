import express from 'express'
import { Server, type Socket } from 'socket.io'
import http from 'http'
import cors from 'cors'

import { addPlayer, getRoomMembers, getPlayer, removePlayer, updatePlayer } from './data/users'
import { GameRoomData, HexString, Player } from './types'

const app = express()

app.use(cors())

const server = http.createServer(app)

const io = new Server(server)

// Track active game rooms
let activeRooms: Set<string> = new Set();

// Check if a room exists in active rooms
function isRoomCreated(gameId: string) {
  return activeRooms.has(gameId);
}

function joinRoom(socket: Socket, gameId: string, username: string, p1: boolean, address?: HexString) {
  const members = getRoomMembers(gameId);

  // Prevent joining if room is full (max 2 players)
  if (members.length >= 2) {
    socket.emit('room-full', {
      message: "This room is already full.",
      roomFull: true
    });
    return;
  }
  
  socket.join(gameId);
  activeRooms.add(gameId);

  const player: Player = {
    id: socket.id,
    username,
    address: address,
    p1: p1,
    gameId
  }
  addPlayer(player)

  // Get updated member list and notify clients
  const updatedMembers = getRoomMembers(gameId);
  socket.emit('game-joined', { player, gameId, updatedMembers })
  socket.to(gameId).emit('update-members', updatedMembers)
  socket.to(gameId).emit('send-notification', {
    title: 'New member arrived!',
    message: `${username} joined the party.`,
  })
}

function leaveRoom(socket: Socket) {
  const user = getPlayer(socket.id)
  if (!user) return

  const { username, gameId } = user

  removePlayer(socket.id)
  const members = getRoomMembers(gameId)

  // Clean up empty rooms
  if (members.length === 0) {
    activeRooms.delete(gameId);
  }

  // Notify remaining players about departure
  socket.to(gameId).emit('update-members', members)
  socket.to(gameId).emit('send-notification', {
    title: 'Member departure!',
    message: `${username} left the party.`,
  })
  socket.leave(gameId)
}

function update(socket: Socket, userData: Player) {
  const user = getPlayer(socket.id)
  if (!user) return
  updatePlayer(userData)
  const { username, gameId } = user

  // Broadcast the move data to all players in the room
  const members = getRoomMembers(gameId)
  socket.to(gameId).emit('update-members', members)
  socket.to(gameId).emit('player-move', userData);
  socket.to(gameId).emit('send-notification', {
    title: 'Choice Commited',
    message: `${username} has committed the choice.`,
    data: user
  })
}

io.on('connection', socket => {
  socket.on('create-room', (gameRoomData: GameRoomData, playerData: Player) => {
    const { gameId, username } = gameRoomData
    const { p1, address } = playerData

    joinRoom(socket, gameId, username, p1, address)
  })

  socket.on('join-room', (gameRoomData: GameRoomData, userData: Player) => {
    const { gameId, username } = gameRoomData
    const { p1, address } = userData
    if (isRoomCreated(gameId)) {
      return joinRoom(socket, gameId, username, p1, address)
    }

    socket.emit('game-not-found', {
      message: "Oops! The Room ID you entered doesn't exist or hasn't been created yet.",
      roomFounded: false
    })
  })

  socket.on('game-result', (resultData) => {
    io.to(resultData.gameId).emit('game-result', resultData);
  });

  socket.on('player-move', (playerData: Player) => {
    update(socket, playerData)
  })


  socket.on('game-timeout', (data) => {
    io.to(data.gameId).emit("game-timeout", {
      ...data,
      winner: {
        username: data.username, 
        address: data.address,
        reward: data.reward,
        reason: data.reason,
        outcome: data.outcome
      }
    });
  });

  socket.on('timeout-warning', (warningData) => {
    socket.to(warningData.gameId).emit('timeout-warning', warningData);
  });

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
