import { HexString } from "./GameRoom"

export interface User {
    id?: string
    username: string
    address?: HexString
    p1?: boolean
    choiceHash?: string,
    contractAddress?: HexString,
    move?: number
    choice?: string
    gameId?: string
    stake?: number
}