import { Address, Hash } from "viem";
import { HexString } from "./GameRoom";

// Types for parameters
export interface DeployContract {
  choiceHash: HexString;
  player2Address: Address;
  address: Address;
  stake: bigint;
}

// Types for return values
export interface GameState {
  p2Move: number;
  stakeValue: number;
  lastActionTime: number;
}