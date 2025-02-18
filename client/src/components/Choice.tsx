import React from "react";
import { Label } from "./ui/Label";
import { Hands } from "../constants";
import { Button } from "./ui/Button";

interface ChoiceProps {
    selectedHandName: string,
    selectChoice: (hand: Hands) => void
}

export const Choice = ({selectChoice, selectedHandName}: ChoiceProps) => {
  return (
    <>
      <Label>Choice</Label>
      <div className="flex flex-wrap justify-center gap-1 sm:gap-1 md:gap-2">
        {Hands.map(
          (hand, index) =>
            !!index && (
              <Button
                color="primary"
                onClick={() => selectChoice?.(hand)}
                variant={selectedHandName === hand.name ? "default" : "outline"}
                name={String(index)}
                aria-label="hand"
                key={hand.name}
                size={"lg"}
              >
                {hand.icon}
              </Button>
            )
        )}
      </div>
    </>
  );
};
