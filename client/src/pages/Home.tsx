import { nanoid } from 'nanoid'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/Card'
import { Separator } from '@/src/components/ui/Separator'
import CreateGame from '@/src/components/CreateGame'
import JoinGame from '@/src/components/JoinGame'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useContext, useEffect } from 'react'
import AppContext from '../lib/AppContext'

interface HomeProps {
  gameId: string
}

export default function Home({gameId}: HomeProps) {
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
          <CreateGame gameId={gameId}/>

          <div className='flex items-center space-x-2 '>
            <Separator />
            <span className='text-xs text-muted-foreground'>OR</span>
            <Separator />
          </div>

          <JoinGame />
        </CardContent>
      </Card>
    </div>
  )
}
