import { io } from 'socket.io-client'

const SERVER =
  process.env.NODE_ENV === 'production'
    ? 'https://rps-ethereum.onrender.com/'
    : 'http://localhost:3001'

export const socket = io(SERVER, { transports: ['websocket'] })

