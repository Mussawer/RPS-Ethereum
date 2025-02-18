import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from "react-router-dom";
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/Button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/Form'
import { Input } from '@/src/components/ui/Input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/components/ui/Tooltip'
import { keccak256, toHex } from 'viem';
import AppContext from '../lib/AppContext';
import { socket } from '../lib/socket';
import { GameJoinedData } from '../interfaces/GameRoom';
import { useAccount } from 'wagmi';
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createGameSchema } from '../lib/validations/CreateGame';


interface CreateGameFormProps {
  gameId: string

}




type CreatGameForm = z.infer<typeof createGameSchema>

export default function CreateGame({ gameId }: CreateGameFormProps) {
  const {isConnected, address}  = useAccount();
  const navigate = useNavigate()
  const {state, setBytesGameId, setStatus, setOutcome, setStake, setChoice, setUsername, setMembers} = useContext(AppContext);
  setBytesGameId(keccak256(toHex((gameId))));
  setStatus(0);
  setOutcome("unknown");
  setStake(0);
  setChoice(0);

  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreatGameForm>({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      username: '',
    },
  })


  function onSubmit({ username }: CreatGameForm) {
    setIsLoading(true)
    setUsername(username)
    navigate('/game-room')
    socket.emit('create-room', { gameId, username }, {address, p1:true, username})
  }

    useEffect(() => {
      setChoice(0)
      setStake(0)
      socket.on('game-joined', ({ members }: GameJoinedData) => {
        setMembers(members)
        navigate('/game-room')
      })

      function handleErrorMessage({ message }: { message: string }) {
        toast.error('Failed to join room!', {
          description: message,
          duration: 5000,
        dismissible: true,
        position: "top-right",
        })
      }

      socket.on('game-not-found', handleErrorMessage)

      socket.on('invalid-data', handleErrorMessage)

      return () => {
        socket.off('game-joined')
        socket.off('game-not-found')
        socket.off('invalid-data', handleErrorMessage)
      }
    }, [setMembers])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-foreground'>Username</FormLabel>
              <FormControl>
                <Input placeholder='johndoe' {...field} />
              </FormControl>
              <FormMessage className='text-xs' />
            </FormItem>
          )}
        />

        <div>
          <p className='mb-2 text-sm font-medium'>Game ID</p>

          <div className='flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground'>
            <span>{gameId}</span>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button disabled={!isConnected} type='submit' className='mt-2 w-full'> 
                  {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Create a Room'}
                </Button>
              </div>
            </TooltipTrigger>

            <div hidden={isConnected}>
              <TooltipContent align='end' className='flex gap-1'>
                Connect Wallet to Create Game
              </TooltipContent>
            </div>
          </Tooltip>
        </TooltipProvider>

      </form>
    </Form>
  )
}
