import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
// import * as z from 'zod'
// import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

// import { socket } from '@/lib/socket'
// import { joinRoomSchema } from '@/lib/validations/joinRoom'
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
import { useAccount } from 'wagmi'

interface JoinRoomForm {
    userName: string
    roomId: string
}

export default function JoinRoom() {
  const {address, isConnected}  = useAccount();
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<JoinRoomForm>({
    // resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      userName: '',
      roomId: '',
    },
  })

  function onSubmit({ roomId, userName }: JoinRoomForm) {
    setIsLoading(true)
    // socket.emit('join-room', { roomId, username })
  }

//   useEffect(() => {
//     socket.on('room-not-found', () => {
//       setIsLoading(false)
//     })
//   }, [])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!isConnected} variant='outline' className='w-full'>
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
              name='userName'
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
              name='roomId'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder='Room ID' {...field} />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <Button type='submit' className='mt-2 bg-black'>
              {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Join'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
