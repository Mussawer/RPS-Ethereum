"use client";

import { useEffect, useState } from "react";
import { Trophy, Coins, MinusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/Dialog";
import { Badge } from "@/src/components/ui/Badge";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { HexString } from "../interfaces/GameRoom";
import { socket } from "../lib/socket";

interface GameStatsProps {
  totalStake: number;
  outcome: string;
  winner?: {
    username: string;
    reward: number;
    choice: string;
    address: HexString;
    reason: string
  };
  isGameEnded: boolean;
  onClose?: () => void;
}

export function Winner({ totalStake, outcome, winner, isGameEnded, onClose }: GameStatsProps) {
  const [showResult, setShowResult] = useState(false);

  const handleClose = () => {
    setShowResult(false);
    onClose?.();
    socket.emit('leave-room')
  };

  useEffect(() => {
    if (isGameEnded && outcome && (winner || outcome === "tie")) {
      setShowResult(true);
    }
  }, [isGameEnded, outcome, winner]);

  return (
    <>
      {/* Total Stakes Display */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-muted-foreground">Total Stakes</span>
            </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
              {totalStake} ETH
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Result Modal */}
      <Dialog open={showResult} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {outcome === "win" ? (
                <Trophy className="h-5 w-5 text-yellow-500" />
              ) : (
                <MinusCircle className="h-5 w-5 text-blue-500" />
              )}
              Game Results
            </DialogTitle>
          </DialogHeader>

          {outcome === "win" && winner && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Winner</p>
                <h3 className="text-xl font-bold text-yellow-700 mt-1">{winner.username}</h3>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-2xl">{winner.choice}</span>
                  {winner.reason !== ""  && <p className="text-sm text-muted-foreground">{winner.reason}</p>}
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    +{winner.reward} stake
                  </Badge>
                </div>
              </div>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          )}

          {outcome === "tie" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                <p className="text-center text-sm text-muted-foreground mb-3">It's a Tie!</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-2xl">{winner?.choice}</span>
                  <div className="space-y-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {totalStake / 2} stake returned
                  </Badge>
                </div>
                </div>
              </div>
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
