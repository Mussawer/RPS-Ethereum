import React, { useContext } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Separator } from '@radix-ui/react-separator'
import AppContext from '../lib/AppContext'

export const GameRoom = () => {
  const {state} = useContext(AppContext);

  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <div className='text-center'>
        Game Room: {state.gameId}
        <div>Username: {state.username}</div>
      </div>
      <Card className='w-[90vw] max-w-[400px]'>
        <CardHeader>
          <CardTitle>Select Hands</CardTitle>
        </CardHeader>

        <CardContent className='flex flex-col space-y-4'>
          {/* <CreateRoom roomId={roomId} isConnected={isConnected}/> */}

          <div className='flex items-center space-x-2 '>
            <Separator />
            <span className='text-xs text-muted-foreground'>OR</span>
            <Separator />
          </div>

          {/* <JoinRoom isConnected={isConnected}/> */}
        </CardContent>
      </Card>
    </div>
  )
}
