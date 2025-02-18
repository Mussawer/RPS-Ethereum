export interface GameRoomData {
    gameId: string
    username: string
  }
  
  export type HexString = `0x${string}` | undefined;

  export interface Player {
    id: string
    username: string
    gameId: string
    address: HexString
    p1: boolean
    contractAddress?: HexString;
    choiceHash?: string;
    stake?: number
  }
