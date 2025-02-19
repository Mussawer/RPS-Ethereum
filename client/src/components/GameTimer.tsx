import { Clock } from "lucide-react";
import { cn, formatTime } from "../lib/utils";

interface GameTimerProps {
  timeLeft: number;
  phase: "commit" | "reveal";
  hasPlayer1Committed: boolean;
  hasPlayer2Committed: boolean;
  isPlayer1: boolean;
}

export const GameTimer = ({ timeLeft, phase, hasPlayer1Committed, hasPlayer2Committed, isPlayer1 }: GameTimerProps) => {
  let statusMessage = "";
  
  if (phase === "commit") {
    if (!hasPlayer1Committed) {
      statusMessage = isPlayer1 
        ? "Your turn to commit" 
        : "Player 1 needs to make the move";
    } else if (!hasPlayer2Committed) {
      statusMessage = isPlayer1
        ? "Player 2 needs to make the move"
        : "Your turn to commit";
    }
  } else {
    statusMessage = isPlayer1
      ? "Your turn to reveal"
      : "Player 1 needs to reveal the move";
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4" />
      <span className={cn("font-mono text-sm", timeLeft <= 60 && "text-red-500")}>
        {`${formatTime(timeLeft)} ${phase === "commit" ? `Commit: ${statusMessage}` : `Reveal: ${statusMessage}`}`}
      </span>
    </div>
  );
};
