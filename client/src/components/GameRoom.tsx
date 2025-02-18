import React, { useContext, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import AppContext from "../lib/AppContext";
import { Button } from "./ui/Button";
import { Label } from "./ui/Label";
import { socket } from "../lib/socket";
import { HexString, Notification } from "../interfaces/GameRoom";
import { Input } from "./ui/Input";
import { Status } from "./ui/Status";
import { Clock } from "lucide-react";
import { cn, contractActions, formatTime, moveMap, resolveGameResult, showToast } from "../lib/utils";
import { useAccount, useBalance } from "wagmi";
import { parseEther, toHex } from "viem/utils";
import { config } from "@/config/wagmi";
import { HasherAbi } from "../../../contracts/HasherAbi";
import { rpsAbi } from "../../../contracts/rpsAbi";
import { rpsByteCode } from "../../../contracts/rpsByteCode";
import { deployContract, readContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { User } from "../interfaces/User";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/Tooltip";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Abi, Address } from "viem";
import { Winner } from "./Winner";
import { sepolia } from "@wagmi/core/chains";
import { GameTimer } from "./GameTimer";
import { nanoid } from "nanoid";
import { Hands } from "../constants";
import { DeployContract } from "../interfaces/ContractActions";
import useContractAction from "../hooks/useWriteContractAction";
import useReadContractAction from "../hooks/useReadContractAction";
import { RulesDialog } from "./Rules";
import { stakeSchema } from "../lib/validations/StakeSchema";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface GameRoomProps {
  gameId: string;
  username: string;
}

type StakeFormValues = z.infer<ReturnType<typeof stakeSchema>>;

export const GameRoom = ({ gameId }: GameRoomProps) => {
  const { isConnected, address, connector } = useAccount();
  //APP STATE MANAGEMENT
  const { state, setOutcome, setStake, setChoice, setMembers } = useContext(AppContext);

  //CONTRACT WRITE ACTION
  const { executeWriteAction } = useContractAction();

  //CONTRACT READ ACTION
  const { executeReadAction } = useReadContractAction();

  //BALANCE OF TOKEN
  const { data: balance } = useBalance({
    address: address, // from useAccount()
  });
  console.log("🚀 ~ :59 ~ GameRoom ~ balance:", balance);

  const form = useForm<StakeFormValues>({
    resolver: zodResolver(stakeSchema(balance?.formatted ? Number(balance.formatted) : 0)),
    defaultValues: {
      stake: 0,
    },
  });

  const {
    formState: { errors },
    register,
  } = form;

  // GAME STATE
  const [isPendingTransaction, setIsPendingTransaction] = useState(false);
  const [selectedHandName, setSelectedHandName] = useState("");
  const [hasPlayer1Committed, setHasPlayer1Committed] = useState(false);
  const [hasPlayer2Committed, setHasPlayer2Committed] = useState(false);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [winner, setWinner] = useState({ username: "", reward: 0, choice: "", address: "0x" as HexString, reason: "" });

  // CONTRACT INTERACTION STATE
  const [contractAddress, setContractAddress] = useState<HexString>();
  const [lastActionTimestamp, setLastActionTimestamp] = useState<number>();
  const [isTimeoutTriggered, setIsTimeoutTriggered] = useState(false);
  const [remainingTimeInSeconds, setRemainingTimeInSeconds] = useState(300); // to track time for timer
  const [isCommitPhase, setIsCommitPhase] = useState(true); // Add state for tracking phase

  //PLAYER REFERENCES
  const gameRoomMembers = useRef<User[]>();
  const player1 = useRef<User>();
  const player2 = useRef<User>();
  const lastActionRef = useRef<number>();
  const saltRef = useRef<string>();

  // HANDLE PLAYER CHOICE SELECTION
  const selectChoice = (hand: Hands) => {
    setSelectedHandName(hand.name);
    setChoice(hand.id);
  };

  // WEBSOCKET EVENT HANDLERS
  useEffect(() => {
    // Handle member updates
    socket.on("update-members", (members) => {
      gameRoomMembers.current = members;
      setMembers(members);

      // Sync stake for player 2 if needed
      const player = members.find((x: User) => x.address === address);
      if (player && !player.p1) {
        setStake(members.find((x: User) => x.p1)?.stake || 0);
      }
    });

    // Handle player moves
    socket.on("player-move", (data) => {
      // If this is Player 2
      const player = gameRoomMembers.current?.find((x) => x.address === data.address);
      if (player && player.p1 && data.stake) {
        setStake(Number(data.stake));
        setContractAddress(data.contractAddress);
      } else if (!player?.p1) {
        setHasPlayer2Committed(true);
      }
    });

    // Handle game results
    socket.on("game-result", (data) => {
      setIsGameEnded(true);
      setOutcome(data.outcome);

      if (data.outcome === "tie") {
        setWinner({
          username: "",
          reward: state.stake, // Each player gets their stake back
          choice: `Player 1 choice ${data?.player1?.choice} and Player 2 choice ${data.player2.choice}`, // Or some tie indicator
          address: "0x" as HexString,
          reason: "",
        });
      } else if (data.winner) {
        setWinner({
          username: data.winner.username,
          reward: data.winner.reward,
          choice: data.winner.choice,
          address: data.winner.address as HexString,
          reason: "",
        });
      }

      // Show appropriate toast message
      if (data.winner?.address === address) {
        showToast("success", "You won! 🎉", `You won ${data.totalStake} ETH!`);
      } else if (data.outcome === "tie") {
        showToast("info", "Game ended in a tie!", "Stakes have been returned");
      }
      setOutcome(data.outcome);
      setIsGameEnded(true);
      setStake(0);
    });

    // Handle game timeout
    socket.on("game-timeout", (data) => {
      console.log("🚀 ~ :138 ~ socket.on ~ data:", data);
      // Always update game state regardless of winner status
      setIsGameEnded(true);
      setIsTimeoutTriggered(true);
      setOutcome(data.outcome);

      setWinner({
        username: data?.timeoutBy || "Timeout Winner",
        address: data?.address || "0x",
        reward: data.reward || state.stake * 2,
        choice: "",
        reason: data.reason || "Opponent timed out",
      });

      if (data.winner?.address === address) {
        showToast("success", "You won! 🎉", data.reason);
      } else {
        showToast("error", "Game Timed Out", data.reason);
      }
    });

    // Handle timeout warnings
    socket.on("timeout-warning", (data) => {
      const currentPlayer = gameRoomMembers.current?.find((x) => x.address === address);
      if (currentPlayer?.username === data.warningFor) {
        showToast("warning", "Time Warning", data.message, 10000);
      }
    });

    // Handle general notifications
    socket.on("send-notification", ({ title, message }: Notification) => {
      showToast("info", title, message);
    });

    return () => {
      socket.off("update-members");
      socket.off("player-move");
      socket.off("send-notification");
      socket.off("game-result");
      socket.off("game-timeout");
      socket.off("timeout-warning");
    };
  }, [setMembers, state.members, hasPlayer1Committed, isTimeoutTriggered]);

  // TIMEOUT HANDLING AND TIMER
  useEffect(() => {
    if (!contractAddress || isTimeoutTriggered || isGameEnded) return;

    let intervalId: NodeJS.Timeout;
    const checkTimeout = async () => {
      const player = gameRoomMembers.current?.find((x) => x.address === address);
      const player1Data = gameRoomMembers.current?.find((x) => x.p1 === true);
      const player2Data = gameRoomMembers.current?.find((x) => x.p1 !== true);
      const now = Math.floor(Date.now() / 1000);

      // Fetch current game state from contract
      const [p2Move, stakeValue, lastActionTime] = await Promise.all([
        executeReadAction({
          address: contractAddress,
          abi: rpsAbi as Abi,
          functionName: "c2",
        }),
        executeReadAction({
          address: contractAddress,
          abi: rpsAbi as Abi,
          functionName: "stake",
        }),
        executeReadAction({
          address: contractAddress,
          abi: rpsAbi as Abi,
          functionName: "lastAction",
        }),
      ]);

      // Calculate remaining time
      const lastAction = Number(lastActionTime);
      const elapsed = now - lastAction;
      const remaining = Math.max(300 - elapsed, 0);

      // Update lastAction state if changed
      if (lastAction !== lastActionRef.current) {
        setLastActionTimestamp(lastAction);
        lastActionRef.current = lastAction;
      }

      // Only update timer if game is active
      if (Number(stakeValue) > 0) {
        setRemainingTimeInSeconds(remaining);

        // Determine game phase
        const isCommitPhase = Number(p2Move) === 0;
        setIsCommitPhase(isCommitPhase);

        // Trigger timeout warnings
        if (remaining === 60) {
          if (!player) return;
          if (isCommitPhase && player2Data) {
            socket.emit("timeout-warning", {
              gameId,
              warningFor: player2Data.username,
              message: `Warning: 1 minute remaining for ${player2Data.username} to make their move`,
            });
          } else if (player1Data) {
            socket.emit("timeout-warning", {
              gameId,
              warningFor: player1Data.username,
              message: `Warning: 1 minute remaining for ${player1Data.username} to reveal their move`,
            });
          }
        }

        // Handle timeout
        if (remaining === 0) {
          clearInterval(intervalId);
          setIsTimeoutTriggered(true);

          try {
            if (!player) return;
            let timeoutResult;
            if (player.p1 && isCommitPhase) {
              showToast("warning", "Timing out the game...");
              const j2TimeoutTxReceipt = await executeWriteAction({
                address: contractAddress,
                abi: rpsAbi as Abi,
                functionName: "j2Timeout",
              });
              if (j2TimeoutTxReceipt?.status === "success") {
                timeoutResult = {
                  timeoutBy: player1Data?.username || "Player 1",
                  winner: player1Data,
                  reason: `${player2Data?.username || "Player 2"} didn't play in time`,
                  reward: state.stake,
                  outcome: "win",
                };

                socket.emit("game-timeout", {
                  gameId,
                  ...timeoutResult,
                });
              }
              setIsGameEnded(true);
            } else if (!player.p1 && Number(p2Move) > 0) {
              setHasPlayer2Committed(true);
              setIsTimeoutTriggered(true); // Set timeout flag before transaction
              showToast("warning", "Timing out the game...");
              const j1TimeoutTxReceipt = await executeWriteAction({
                address: contractAddress,
                abi: rpsAbi as Abi,
                functionName: "j1Timeout",
              });
              if (j1TimeoutTxReceipt?.status === "success") {
                timeoutResult = {
                  timeoutBy: player2Data?.username || "Player 1",
                  winner: player2.current,
                  reason: `${player1Data?.username || "Player 1"} didn't reveal in time`,
                  reward: state.stake * 2,
                  outcome: "win",
                };

                socket.emit("game-timeout", {
                  gameId,
                  ...timeoutResult,
                });
              }
              setIsGameEnded(true);
            }
          } catch (err) {
            showToast("error", "Timeout failed");
            setIsTimeoutTriggered(true); // Reset timeout flag on error
          }
        }
      }
    };

    intervalId = setInterval(checkTimeout, 1000);
    return () => clearInterval(intervalId);
  }, [contractAddress, isGameEnded, isTimeoutTriggered]);

  const resetGameState = () => {
    setChoice(0);
    setSelectedHandName("");
    setIsPendingTransaction(false);
  };

  // GAME ACTIONS
  const play = async (address: HexString) => {
    const player = gameRoomMembers?.current?.find((x) => x.address === address);
    if (!player) return;

    if (!isConnected) {
      showToast("error", "No Web3 Provider Found!", "Please install MetaMask and try again.");
      return;
    }

    setIsPendingTransaction(true);
    try {
      if (player.p1) {
        // PLAYER 1 logic
        const salt = toHex(nanoid(30));
        saltRef.current = salt;
        player1.current = {
          move: state.choice,
          choice: selectedHandName,
          address,
          username: state.username,
          p1: true,
        };

        const player1choiceHash = await executeReadAction({
          address: import.meta.env.VITE_HASHER_ADDRESS,
          abi: HasherAbi as Abi,
          functionName: "hash",
          args: [state.choice, salt],
        });

        const deployParams: DeployContract = {
          choiceHash: player1choiceHash as HexString,
          player2Address: gameRoomMembers.current?.find((x) => !x.p1)?.address!,
          address: address as Address,
          stake: parseEther(state.stake.toString()),
        };

        const receipt = await contractActions.deployGameContract(config, deployParams);
        if (receipt.status === "success") {
          const lastActionTime = await executeReadAction({
            address: receipt.contractAddress as Address,
            abi: rpsAbi as Abi,
            functionName: "lastAction",
          });
          setContractAddress(receipt.contractAddress as Address);
          setLastActionTimestamp(Number(lastActionTime));

          // Emit event and show notification
          socket.emit("player-move", {
            address,
            player1choiceHash,
            contractAddress: receipt.contractAddress,
            stake: state.stake,
          });
          showToast("success", "Commitment Received!", "Your choice has been encrypted.");
          setHasPlayer1Committed(true);
        }
      } else {
        // PLAYER 2 logic
        player2.current = {
          move: state.choice,
          choice: selectedHandName,
          address,
          username: state.username,
          p1: false,
        };

        const playReceipt = await executeWriteAction({
          abi: rpsAbi as Abi,
          address: contractAddress as Address,
          functionName: "play",
          args: [state.choice],
          value: parseEther(state.stake.toString()),
        });

        if (playReceipt?.status === "success") {
          const lastActionTime = await executeReadAction({
            address: contractAddress as Address,
            abi: rpsAbi as Abi,
            functionName: "lastAction",
          });
          setLastActionTimestamp(Number(lastActionTime));

          // Emit event and show notification
          socket.emit("player-move", { address, contractAddress });
          showToast("success", "Commitment Received!", "Your choice has been encrypted.");
          setHasPlayer2Committed(true);
        }
      }
    } catch (err) {
      showToast("error", "Commitment Failed!");
      resetGameState();
      setStake(0);
    } finally {
      setIsPendingTransaction(false);
    }
  };

  const solve = async (address: HexString) => {
    const player = state.members.find((x) => x.address === address);
    if (player) {
      if (isConnected) {
        //contract call solve method
        setIsPendingTransaction(true);

        const solveReceipt = await executeWriteAction({
          abi: rpsAbi as Abi,
          address: contractAddress as Address,
          functionName: "solve",
          args: [player1.current?.move, saltRef.current],
        });
        if (solveReceipt?.status === "success") {
          showToast("success", "Move Revealed!", "Player 1 has revealed their move");
          socket.on("send-notification", ({ title, message }: Notification) => {
            showToast("info", title, message);
          });

          const result = await resolveGameResult(
            contractAddress as Address,
            executeReadAction,
            player1.current?.move as number,
            setStake,
            gameRoomMembers.current || [],
            state.stake
          );

          if (result) {
            const { outcome, gameWinner } = result;
            setOutcome(outcome);
            setWinner(gameWinner || { username: "", reward: 0, choice: "", address: "0x", reason: "" });
            setIsGameEnded(true);
            socket.emit("game-result", {
              gameId,
              outcome,
              winner: gameWinner,
              player1: gameRoomMembers.current?.find((x) => x.p1 === true),
              player2: gameRoomMembers.current?.find((x) => !x.p1),
              totalStake: state.stake * 2,
            });
          }

          setIsPendingTransaction(false);
        }
      } else {
        showToast("error", "No Web3 Provider Found!", "Please install MetaMask and try again.");
        resetGameState();
      }
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div hidden={!isConnected} className="fixed right-[5vw] top-5 flex-1 md:right-5">
        <ConnectButton />
      </div>
      <div className="m-1 max-w-md w-full">
        <Winner
          outcome={state.outcome}
          totalStake={state.stake * 2}
          winner={winner}
          isGameEnded={isGameEnded && (!!winner.username || !!winner.reason)}
          onClose={() => console.log("Winner modal closed")}
        />
      </div>
      <div className="relative">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                <span>{state.username}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gameId">Game ID</Label>
              <div className="flex gap-2">
                <div className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                  <span>{gameId}</span>
                </div>
              </div>
            </div>
            <div>
              <Status pending={isPendingTransaction} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bet">Your Stake</Label>
              <div className="flex flex-col gap-2">
                <Input
                  {...register("stake", {
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      if (value === '' || value === null) return 0;
                      const num = Number(value);
                      return isNaN(num) ? 0 : num;
                    },
                    onChange: (e) => {
                      const value = Number(e.target.value);
                      setStake(value);
                      form.trigger("stake"); // Manually trigger validation
                    },
                  })}
                  id="stake"
                  type="number"
                  min="0"
                  step="0.0001"
                  disabled={!gameRoomMembers.current?.find((player) => player?.address === address)?.p1}
                  className={errors.stake ? "border-red-500" : ""}
                />
                <div className="h-5">
                  {errors.stake && (form.getValues("stake") !== 0) && <span className="text-sm text-red-500 absolute">{errors.stake.message}</span>}
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Choice</Label>
              <div className="flex flex-wrap justify-center gap-1 sm:gap-1 md:gap-2">
                {Hands.map(
                  (hand, index) =>
                    !!index && (
                      <Button
                        color="primary"
                        onClick={() => selectChoice(hand)}
                        variant={selectedHandName === hand.name ? "default" : "outline"}
                        name={String(index)}
                        aria-label="hand"
                        key={hand.name}
                        size={"lg"}
                      >
                        {hand.icon}
                      </Button>
                    )
                )}
              </div>
            </div>

            <GameTimer timeLeft={remainingTimeInSeconds} phase={isCommitPhase ? "commit" : "reveal"} />
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      disabled={state.stake === 0 || state.choice === 0 || isPendingTransaction || hasPlayer2Committed}
                      size="sm"
                      onClick={() => play(address)}
                    >
                      Play
                    </Button>
                  </div>
                </TooltipTrigger>

                <div hidden={state.stake !== 0 && state.choice !== 0}>
                  <TooltipContent align="end" className="flex gap-1">
                    {state.stake === 0 && "Stake cannot be Zero"}
                    {state.stake > 0 && state.choice === 0 && "Select Choice"}
                  </TooltipContent>
                </div>
              </Tooltip>
            </TooltipProvider>

            {gameRoomMembers.current?.find((x) => x.address === address)?.p1 && (
              <Button
                disabled={!hasPlayer2Committed || isPendingTransaction}
                size="sm"
                variant="secondary"
                onClick={() => solve(address)}
              >
                Solve
              </Button>
            )}
          </CardFooter>
        </Card>
        <RulesDialog />
      </div>
    </div>
  );
};
