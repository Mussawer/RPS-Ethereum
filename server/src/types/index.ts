export interface GameRoomData {
    gameId: string
    username: string
  }
  
  export type HexString = `0x${string}` | undefined;

  export interface User {
    id: string
    username: string
    gameId: string
    address: HexString
    p1: boolean
  }