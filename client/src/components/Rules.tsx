"use client"

import { BookOpen } from "lucide-react"
import { Button } from "@/src/components/ui/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/Dialog"
import { Card, CardContent } from "@/src/components/ui/Card"
import { IMAGEURL } from "../constants"

const GAME_STEPS = [
  {
    step: 1,
    description: "Player 1 will put stake and commits the choice"
  },
  {
    step: 2,
    description: "Timer to timeout Player 2 will start"
  },
  {
    step: 3,
    description: "Player 2 will then commits their choice on same stake"
  },
  {
    step: 4,
    description: "Timer to timeout Player 1 will start"
  },
  {
    step: 5,
    description: "Player 1 will reveal their move"
  },
  {
    step: 6,
    description: "Game will be decided after Player 1 reveal their move"
  }
]

export function RulesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed bottom-4 right-4 h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20"
        >
          <BookOpen className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Game Rules</DialogTitle>
        </DialogHeader>
        <Card className="border-none shadow-none">
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <img 
                src={IMAGEURL} 
                className="w-52 h-52 object-contain" 
                alt="Rock Paper Scissors Lizard Spock Rules Diagram"
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-primary/70">Game Flow</h3>
              <div className="space-y-3">
                {GAME_STEPS.map(({ step, description }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {step}
                    </div>
                    <p className="text-sm text-muted-foreground leading-tight pt-1">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}