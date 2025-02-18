import { Clock } from "lucide-react";
import { cn, formatTime } from "../lib/utils";

export const GameTimer = ({ timeLeft, phase }: {
    timeLeft: number;
    phase: "commit" | "reveal";
  }) => (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4" />
      <span className={cn("font-mono text-sm", timeLeft <= 60 && "text-red-500")}>
        {`${phase === "commit" ? "Commit: " : "Reveal: "}${formatTime(timeLeft)}`}
      </span>
    </div>
  );