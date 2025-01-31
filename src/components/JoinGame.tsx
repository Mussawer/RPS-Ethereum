import { useContext, useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'

import { socket } from '@/src/lib/socket'
import { Button } from '@/src/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/Dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/src/components/ui/Form'
import { Input } from '@/src/components/ui/Input'
import { keccak256, toHex } from 'viem'
import AppContext from '../lib/AppContext'
import { useNavigate } from 'react-router-dom'

interface JoinGameForm {
  username: string
  gameId: string
}

type HexString = `0x${string}` | undefined;

interface JoinGameProps {
  // gameId: string
  isConnected: boolean
  address: HexString
}

export default function JoinGame({ isConnected, address }: JoinGameProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const {state, setBytesGameId, setStatus, setOutcome, setBet, setChoice, setUsername, setGameId, setMembers} = useContext(AppContext);
  setStatus(0);
  setOutcome("unknown");
  setBet(0);
  setChoice(1);
  const form = useForm<JoinGameForm>({
    defaultValues: {
      username: '',
      gameId: '',
    },
  })

  function onSubmit({ gameId, username }: JoinGameForm) {
    setIsLoading(true)
    setUsername(username)
    setGameId(gameId)
    setBytesGameId(keccak256(toHex((gameId))));
    navigate('/game-room')
    socket.emit('join-room', { gameId, username, p1:false }, {address})
  }

    useEffect(() => {
      socket.on('room-not-found', () => {
        setIsLoading(false)
      })
    }, [])

    

  return (
    <Dialog>
      <DialogTrigger asChild>
      {/* disabled={!isConnected} */}
        <Button variant='outline' className='w-full'>
          Join a Room
        </Button>
      </DialogTrigger>

      <DialogContent className='w-[90vw] max-w-[400px]'>
        <DialogHeader className='pb-2'>
          <DialogTitle>Join a room now!</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder='Username' {...field} />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='gameId'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder='Room ID' {...field} />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <Button disabled={state.members.length === 2} type='submit' className='mt-2 bg-black'>
              {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Join'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
