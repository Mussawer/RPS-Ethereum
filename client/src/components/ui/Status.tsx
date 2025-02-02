import { Loader2, Check } from "lucide-react"
import { cn } from '@/src/lib/utils'

interface StatusProps {
  pending: boolean
}

let firstTime = true

export function Status({ pending }: StatusProps) {
  if (pending) {
    firstTime = false
    return (
      <div className="flex items-center gap-2 mt-1">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p className="text-sm text-muted-foreground">Processing transaction...</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 mt-1",
        // Only animate the check icon when transitioning from pending to complete
        !firstTime && "animate-in fade-in duration-300",
      )}
    >
      <Check className="h-4 w-4 text-green-500" />
      <p className="text-sm text-muted-foreground">No pending transactions</p>
    </div>
  )
}

