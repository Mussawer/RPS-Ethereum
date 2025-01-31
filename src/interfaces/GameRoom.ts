import { User } from "./User"

export interface GameJoinedData {
    user: User
    gameId: string
    members: User[]
  }

  export interface Notification {
    title: string
    message: string
  }