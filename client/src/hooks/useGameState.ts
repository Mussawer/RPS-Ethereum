import { Abi, Address } from "viem";
import useReadContractAction from "./useReadContractAction";
import { rpsAbi } from "@/contracts/rpsAbi";
import { useEffect, useState } from "react";
import { HexString } from "../interfaces/GameRoom";

export interface GameStateParams {
    contractAddress: HexString;
}

export const useGameState = ({ contractAddress }: GameStateParams) => {
    const { executeReadAction } = useReadContractAction();
    const [player2Move, setPlayer2Move] = useState();
    const [stakeOfGame, setStakeOfGame] = useState();
    const [lastActionTimeStamp, setLastActionTimeStamp] = useState();

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        const gameState = async () => {
            try {
                const [p2Move, stakeValue, lastActionTime] = await Promise.all([
                    executeReadAction({
                        address: contractAddress as Address,
                        abi: rpsAbi as Abi,
                        functionName: "c2",
                    }),
                    executeReadAction({
                        address: contractAddress as Address,
                        abi: rpsAbi as Abi,
                        functionName: "stake",
                    }),
                    executeReadAction({
                        address: contractAddress as Address,
                        abi: rpsAbi as Abi,
                        functionName: "lastAction",
                    }),
                ]);
    
                setPlayer2Move(p2Move)
                setStakeOfGame(stakeValue)
                setLastActionTimeStamp(lastActionTime)
            } catch (error) {
                
            }
        }

        intervalId = setInterval(gameState, 1000);
        return () => clearInterval(intervalId);
    }, [contractAddress])

    return { player2Move, stakeOfGame, lastActionTimeStamp };
}
