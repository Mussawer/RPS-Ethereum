import { nanoid } from 'nanoid'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/Card'
import { Separator } from '@/src/components/ui/Separator'
import CreateRoomForm from '@/src/components/CreateRoom'
import JoinRoomButtoon from '@/src/components/JoinRoom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export default function Home() {
  const roomId = nanoid(30)

  return (
    <div className='flex h-screen flex-col items-center justify-between pb-5 pt-[13vh]'>
      <div className='fixed right-[5vw] top-5 flex-1 md:right-5' >
        <ConnectButton />
      </div>
      <Card className='w-[90vw] max-w-[400px]'>
        <CardHeader>
          <CardTitle>RPS</CardTitle>
          <CardDescription>
            PLAY RPS WITH YOUR FRIENDS
          </CardDescription>
        </CardHeader>

        <CardContent className='flex flex-col space-y-4'>
          <CreateRoomForm roomId={roomId} />

          <div className='flex items-center space-x-2 '>
            <Separator />
            <span className='text-xs text-muted-foreground'>OR</span>
            <Separator />
          </div>

          <JoinRoomButtoon />
        </CardContent>
      </Card>
    </div>
  )
}
