import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/Dialog'
import { Button } from './ui/Button'
import { Label } from './ui/Label'

export const CancelButton = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {/* disabled={!isConnected} */}
                <Button variant='destructive' size="sm">
                    Cancel
                </Button>
            </DialogTrigger>

            <DialogContent className='w-[90vw] max-w-[400px]'>
                <DialogHeader className='pb-2'>
                    <DialogTitle>Cancel the Game!</DialogTitle>
                </DialogHeader>

                <Label>Are you sure you want to cancel and leave the game. You will lose you stake</Label>

                <Button type='submit' className='mt-2 bg-black'>
                    Yes
                </Button>
                <Button type='submit' className='mt-2 bg-black'>
                    No
                </Button>
            </DialogContent>
        </Dialog>
    )
}
