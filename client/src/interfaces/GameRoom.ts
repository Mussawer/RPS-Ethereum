import { User } from "./User"

export type HexString = `0x${string}` | undefined;

export interface GameJoinedData {
    user: User
    gameId: string
    members: User[]
  }

  export interface Notification {
    title: string
    message: string
  }

  export interface GameResult {
    outcome: "win" | "tie";
    gameWinner: {
      choice: string;
      username: string;
      address: HexString;
      reward: number;
      reason: string;
    } | null;
    player1Data: User,
    player2Data: User
  }
  