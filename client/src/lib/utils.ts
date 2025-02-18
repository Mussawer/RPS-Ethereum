import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from "sonner";
import { deployContract, readContract, waitForTransactionReceipt } from "@wagmi/core";
import { Abi, Address, TransactionReceipt } from 'viem';
import { Config } from '@wagmi/core';
import { DeployContract, GameState } from '../interfaces/ContractActions';
import { rpsAbi } from '../../../contracts/rpsAbi';
import { rpsByteCode } from '../../../contracts/rpsByteCode';
import { GameResult, HexString } from '../interfaces/GameRoom';
import { User } from '../interfaces/User';
import { ReadContractParams } from '../hooks/useReadContractAction';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


  export const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };



type ToastType = "success" | "error" | "info" | "warning";
export const showToast = (
  type: ToastType,
  title: string,
  description?: string,
  duration?: number
) => {
  const options = {
    duration: duration || 5000,
    dismissible: true,
    position: "top-right" as const,
  };

  toast[type](title, { ...options, description });
};

export const moveMap: Record<number, string> = {
  1: "ROCK",
  2: "PAPER",
  3: "SCISSORS",
  4: "SPOCK",
  5: "LIZARD",
};

export const contractActions = {
  async deployGameContract(
    config: Config, 
    params: DeployContract
  ): Promise<TransactionReceipt> {
    const contractTranxHash = await deployContract(config, {
      abi: rpsAbi as Abi,
      args: [params.choiceHash, params.player2Address],
      bytecode: rpsByteCode,
      account: params.address,
      value: params.stake
    });
    return waitForTransactionReceipt(config, { hash: contractTranxHash });
  },
};


export async function resolveGameResult(
  contractAddress: Address,
  executeReadAction: (params: ReadContractParams) => Promise<any>,
  player1Move: number,
  stakeSetter: (newStake: number) => void,
  gameRoomMembers: User[],
  stateStake: number
): Promise<GameResult | null> {
  const stake = await executeReadAction({
    address: contractAddress,
    abi: rpsAbi as Abi,
    functionName: "stake",
  });

  const stakeValue = Number(stake);
  stakeSetter(stakeValue);

  if (stakeValue === 0) {
    const c2 = await executeReadAction({
      address: contractAddress,
      abi: rpsAbi as Abi,
      functionName: "c2",
    });

    const c1 = player1Move;

    const winnerFilter = await executeReadAction({
      address: contractAddress,
      abi: rpsAbi as Abi,
      functionName: "win",
      args: [c1, c2],
    });

    // Find players' data from the game room members
    const player1Data: User = gameRoomMembers.find((x) => x.p1 === true) as User;
    const player2Data: User = gameRoomMembers.find((x) => !x.p1) as User;

    let outcome: "win" | "tie";
    let gameWinner: GameResult["gameWinner"];

    if (Number(c1) === Number(c2)) {
      outcome = "tie";
      gameWinner = null;
    } else if (winnerFilter) {
      outcome = "win";
      gameWinner = {
        choice: `Player 1 choice ${moveMap[c1]} and Player 2 choice ${moveMap[c2]}`,
        username: player1Data?.username || "",
        address: player1Data?.address || "0x",
        reward: (player1Data?.stake || stateStake) * 2,
        reason: "",
      };
    } else {
      outcome = "win";
      gameWinner = {
        choice: `Player 1 choice ${moveMap[c1]} and Player 2 choice ${moveMap[c2]}`,
        username: player2Data?.username || "",
        address: player2Data?.address || "0x",
        reward: (player1Data?.stake || stateStake) * 2,
        reason: "",
      };
    }

    return { outcome, gameWinner, player1Data, player2Data };
  }
  return null;
}
