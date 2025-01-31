import { io } from 'socket.io-client'

console.log("🚀 ~ process.env.NODE_ENV:", process.env.NODE_ENV)
const SERVER =
  process.env.NODE_ENV === 'production'
    ? 'https://scribble-production-d6c0.up.railway.app'
    : 'http://localhost:3001'

export const socket = io(SERVER, { transports: ['websocket'] })

