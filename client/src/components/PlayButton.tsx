import React, { useContext } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/Tooltip";
import { Button } from "./ui/Button";
import AppContext from "../lib/AppContext";
import { Address } from "viem";
import { useAccount } from "wagmi";

interface PlayButtonProps {
  play: (address: Address) => void;
  disabled: boolean;
}

export const PlayButton = ({ play, disabled }: PlayButtonProps) => {
  const { address } = useAccount();
  const { state } = useContext(AppContext);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button
              disabled={state.stake === 0 || state.choice === 0 || disabled}
              size="sm"
              onClick={() => play?.(address as Address)}
            >
              Play
            </Button>
          </div>
        </TooltipTrigger>

        <div hidden={state.stake !== 0 && state.choice !== 0}>
          <TooltipContent align="end" className="flex gap-1">
            {state.stake === 0 && "Stake cannot be Zero"}
            {state.stake > 0 && state.choice === 0 && "Select Choice"}
          </TooltipContent>
        </div>
      </Tooltip>
    </TooltipProvider>
  );
};
