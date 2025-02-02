import React, { useContext, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card'
import { Separator } from '@radix-ui/react-separator'
import AppContext from '../lib/AppContext'
import { Hands } from '../constants/hands'
import { Button } from './ui/Button'
import { Label } from './ui/Label'
import { socket } from '../lib/socket'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Notification } from '../interfaces/GameRoom'
import { Input } from './ui/Input'
import { Status } from './ui/Status'
import { Clock } from 'lucide-react'
import { cn, encrypt } from '../lib/utils'
import { HexString } from '@/server/src/types'
import { useAccount } from 'wagmi'
import { getAccount, deployContract, writeContract } from '@wagmi/core'
import { CancelButton } from './CancelButton'
// import { generateSiweNonce } from 'viem/siwe'
import { parseEther } from 'viem/utils'
import { config } from '@/config/wagmi'

interface GameRoomProps {
  gameId: string
  username: string
}

export const GameRoom = ({ gameId, username }: GameRoomProps) => {
  const navigate = useNavigate()
  const { connector } = getAccount(config)
  const { isConnected, address } = useAccount();
  const { state, setBytesGameId, setStatus, setOutcome, setBet, setChoice, setMembers } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false)
  const [pending, setPending] = useState(false);
  const [selectedHand, setSelectedHand] = useState('');
  const [timeLeft, setTimeLeft] = useState(300)
  const [player1committed, setPlayer1committed] = useState(false)
  const [player2committed, setPlayer2committed] = useState(false)

    // Format time as MM:SS
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  const gameStatus = () => {
    switch (state.status) {
      case 0:
        return "Waiting for your commitment...";
      case 0.1:
        return "Sending commitment...";
      case 1:
        return "Waiting for opponent's commitment...";
      case 2:
        return "Opponent Commited";
      case 2.1:
        return "Sending cancellation...";
      case 2.2:
        return "Game finished! GG!";
      case 2.3:
        return "Game cancelled!";
    }
  };

  const selectChoice = (hand: Hands) => {
    switch (hand.name) {
      case 'ROCK':
        setSelectedHand(hand.name)
        setChoice(1)
        return;
      case 'PAPER':
        setSelectedHand(hand.name)
        setChoice(2)
        return
      case 'SCISSORS':
        setSelectedHand(hand.name)
        setChoice(3)
        return
      case 'SPOCK':
        setSelectedHand(hand.name)
        setChoice(4)
        return
      case 'LIZARD':
        setSelectedHand(hand.name)
        setChoice(5)
        return
    }
  }

  useEffect(() => {
    socket.on('update-members', members => {
      console.log('Updated members list:', members);
      setMembers(members)
    })

    socket.on('send-notification', ({ title, message }: Notification) => {
      console.log('Notification:', title, message);
      toast.info(title, {
        description: message,
        duration: 5000,
        dismissible: true,
        position: "top-right",
      })
    })

    return () => {
      socket.off('update-members')
      socket.off('send-notification')
    }
  }, [setMembers, state.members])

  const timeout = async () => {
    try {
      if (state.status <= 1) {
        //contract for p1 time out
      }
      if (1 >= state.status && state.status < 2) {
        //contract for p2 time out
      }
    } catch (error) {
      console.error('Error submitting timeout:', error)
    }
  }

  useEffect(() => {
    if (state.members?.length === 2 && timeLeft > 0 && player1committed) {
      const interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            clearInterval(interval)
            toast.warning("Timeout!!", {
              description: "Player 1 can call Timeout",
              duration: 5000,
              dismissible: true,
              position: "top-right",
            });
            return 0
          }
          return time - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
    else if (state.members?.length === 2 && timeLeft > 0 && player2committed) {
      const interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            clearInterval(interval)
            toast.warning("Timeout!!", {
              description: "Player 1 can call Timeout",
              duration: 5000,
              dismissible: true,
              position: "top-right",
            });
            return 0
          }
          return time - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [state.members, timeLeft])

  useEffect(() => {
    if (1 >= state.status && state.status < 2) {
      setTimeLeft(500)
    }
  }, [state.status])

  const play = async (address: HexString) => {
    const player = state.members.find((x) => x.address === address)

    if (player) {
      
      if (isConnected) {
        try {
          if (player.p1) {
            // const player1choiceHash = encrypt(generateSiweNonce(), state.choice);
            // //CONTRACT DEPLOY RPS

            // const deploy = await deployContract(config, {
            //   abi: wagmiAbi,
            //   args: [],
            //   bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
            //   connector,
            // })

            // const player2 = state.members.find((x) => {
            //   return !x.p1 
            // })

            // To convert Ether to Wei:
            const bet = parseEther(state.bet.toString())
            
            setStatus(0.1);
            setPending(true);
            // const result = await writeContract(config, {
            //   abi,
            //   address: '0x6b175474e89094c44da98b954eedeac495271d0f', //contract address
            //   functionName: 'RPS',
            //   args: [
            //     player1choiceHash,
            //     player2?.address,
            //     state.bet,
            //     address
            //   ],
            // })
            setPending(false);
            
            // Ensure that we aren't backtracking the game status
            if (state.status <= 0.1) {
              setStatus(1);
            }

            toast.success("Commitment Received!", {
              description: "Your choice has been encrypted.",
              duration: 5000,
              dismissible: true,
              position: "top-right",
            });
            socket.emit('player-move', {address})
            setPlayer1committed(true)
          }
          else {
            //CONTRACT PLAYER 2
            // const player2choiceHash = encrypt(generateSiweNonce(), state.choice);
            setStatus(2)
            setPending(true);
            // const result = await writeContract(config, {
            //   abi,
            //   address: '0x6b175474e89094c44da98b954eedeac495271d0f', //contract address
            //   functionName: 'play',
            //   args: [
            //     player2choiceHash,
            //   ],
            // })
            setPending(false);

            toast.info("Opponent Committed!", {
              description: "Please verify your choice",
              duration: 5000,
              dismissible: true,
              position: "top-right",
            });
            setPlayer2committed(true)
            socket.emit('player-move', {address})
          }
        } catch (err) {
          setStatus(0);
          toast.error("Commitment Failed!", {
            description: 'Commitment Failed!',
            duration: 5000,
            dismissible: true,
            position: "top-right",
          });
        }
      }
      else {
        toast.error("No Web3 Provider Found!", {
          description: "Please install MetaMask and try again.",
          duration: 5000,
          dismissible: true,
          position: "top-right",
        });
      }
    }
  }

  const solve = (address: HexString) => {
    const player = state.members.find((x) => x.address === address)

    if (player) {
      if (isConnected) {
        //contract call solve method
        // const result = await writeContract(config, {
        //   abi,
        //   address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        //   functionName: 'solve',
        //   args: [
        //     player2choiceHash,
        //   ],
        // })
      }
      else {
        toast.error("No Web3 Provider Found!", {
          description: "Please connect MetaMask and try again.",
          duration: 5000,
          dismissible: true,
          position: "top-right",
        });
      }
    }
  }


  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className='flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground'>
              <span>{username}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gameId">Game ID</Label>
            <div className="flex gap-2">
              <div className='flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground'>
                <span>{gameId}</span>
              </div>
            </div>
          </div>

          <div>
            <Status pending={pending} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bet">Your Bet</Label>
            <div className="flex gap-2">
              <Input id="bet" type="number" value={state.bet} onChange={(e) => setBet(Number(e.target.value))} min="0" max="10" />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Choice</Label>
            <div className="flex space-x-0.5">
              {Hands.map(
                (hand, index) =>
                  !!index && (
                    <Button
                      color="primary"
                      onClick={() => selectChoice(hand)}
                      variant={selectedHand === hand.name ? "default" : "outline"}
                      name={String(index)}
                      aria-label="hand"
                      key={hand.name}
                      size={'lg'}
                    >
                      {hand.icon}
                    </Button>
                  )
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className={cn("font-mono text-sm", timeLeft <= 60 && "text-red-500")}>{formattedTime}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => play(address)}>Play</Button>
          <Button disabled={state.status <= 3} size="sm" variant="secondary" onClick={() => solve(address)}>
            Solve
          </Button>
          <Button disabled={state.status <= 2 && !state.members?.find((x) => x.address === address)?.p1 && timeLeft > 0} size="sm" variant="secondary" onClick={() => timeout()}>
            Timeout
          </Button>
          <CancelButton />
        </CardFooter>
      </Card>
    </div>
  )
}
