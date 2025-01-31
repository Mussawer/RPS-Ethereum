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
import { cn } from '../lib/utils'

interface GameRoomProps {
  gameId: string
  username: string
}

export const GameRoom = ({gameId, username}: GameRoomProps) => {
  const navigate = useNavigate()
  const {state, setBytesGameId, setStatus, setOutcome, setBet, setChoice, setUsername, setGameId, setMembers} = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false)
  const [pending, setPending] = useState(false);
  const [selectedHand, setSelectedHand] = useState('');
  const [timeLeft, setTimeLeft] = useState(0) 

  const gameStatus = () => {
    switch (state.status) {
      case 0:
        return "Waiting for your commitment...";
      case 0.1:
        return "Sending commitment...";
      case 1:
        return "Waiting for opponent's commitment...";
      case 2:
        return "Waiting for your verification...";
      case 2.1:
        return "Sending verification...";
      case 2.2:
        return "Waiting for opponent's verification...";
      case 2.3:
        return "Sending cancellation...";
      case 3:
        return "Game finished! GG!";
      case 4:
        return "Game cancelled!";
    }
  };

  useEffect(() => {
    console.log('useEffect')
    socket.on('update-members', members => {
      console.log('Updated members list:', members);
      setMembers(members)
    })

    socket.on('send-notification', ({ title, message }: Notification) => {
      console.log('Notification:', title, message);
      toast(title, {
        description: message,
      })
    })

    return () => {
      socket.off('update-members')
      socket.off('send-notification')
    }
  }, [setMembers, state.members])

  

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          clearInterval(interval)
          return 0
        }
        return time - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

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

  const play = () => {
    
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
            <Status pending={pending}/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bet">Your Bet</Label>
            <div className="flex gap-2">
              <Input id="bet" type="number" value={state.bet} onChange={(e) => setBet(Number(e.target.value))} min="0" max="10"/>
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
          <Button size="sm" onClick={play}>Play</Button>
          <Button size="sm" variant="secondary">
            Reveal
          </Button>
          <Button size="sm" variant="destructive">
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
