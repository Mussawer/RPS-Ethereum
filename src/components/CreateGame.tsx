import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from "react-router-dom";
// import * as z from 'zod'
// import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
// import { toast } from 'sonner'

// import type { RoomJoinedData } from '@/types'
// import { useUserStore } from '@/stores/userStore'
// import { useMembersStore } from '@/stores/membersStore'
// import { socket } from '@/lib/socket'
// import { createGameSchema } from '@/lib/validations/createGame'
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

interface CreateGameFormProps {
  gameId: string
  isConnected: boolean
}



interface CreateGameForm {
  userName: string
}

export default function CreateGame({ gameId, isConnected }: CreateGameFormProps) {
  const navigate = useNavigate()
  const {setBytesGameId, setStatus, setOutcome, setBet, setChoice} = useContext(AppContext);
  setBytesGameId(keccak256(toHex((gameId))));
  setStatus(0);
  setOutcome("unknown");
  setBet(0);
  setChoice(1);
  console.log("🚀 ~ CreateGameForm ~ isConnected:", isConnected)
  //   const router = useRouter()

  //   const setUser = useUserStore(state => state.setUser)
  //   const setMembers = useMembersStore(state => state.setMembers)

  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateGameForm>({
    defaultValues: {
      userName: '',
    },
  })

  function onSubmit({ userName }: CreateGameForm) {
    setIsLoading(true)

    navigate('/game-room')
    // socket.emit('create-room', { roomId, username })
  }

  //   useEffect(() => {
  //     socket.on('room-joined', ({ user, roomId, members }: RoomJoinedData) => {
  //       setUser(user)
  //       setMembers(members)
  //       router.replace(`/${roomId}`)
  //     })

  //     function handleErrorMessage({ message }: { message: string }) {
  //       toast('Failed to join room!', {
  //         description: message,
  //       })
  //     }

  //     socket.on('room-not-found', handleErrorMessage)

  //     socket.on('invalid-data', handleErrorMessage)

  //     return () => {
  //       socket.off('room-joined')
  //       socket.off('room-not-found')
  //       socket.off('invalid-data', handleErrorMessage)
  //     }
  //   }, [router, setUser, setMembers])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
        <FormField
          control={form.control}
          name='userName'
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
