// components/StakeInput.tsx
import { Input } from "./ui/Input";
import { UseFormRegister, UseFormTrigger } from "react-hook-form";
import { HexString } from "../interfaces/GameRoom";
import { User } from "../interfaces/User";
import { useContext, useEffect, useState } from "react";
import AppContext from "../lib/AppContext";

interface StakeInputProps {
  register: UseFormRegister<any>;
  trigger: UseFormTrigger<any>;
  value: number;
  errors: any;
  address: HexString | undefined;
  hasPlayer1Committed: boolean;
  gameRoomMembers: React.MutableRefObject<User[] | undefined>;
}

export const StakeInput = ({
  register,
  trigger,
  errors,
  address,
  gameRoomMembers,
  hasPlayer1Committed
}: StakeInputProps) => {
  const { state, setStake } = useContext(AppContext);
  const isPlayer1 = gameRoomMembers.current?.find(
    (player) => player?.address === address
  )?.p1;
  const [inputValue, setInputValue] = useState(state.stake.toString());

  useEffect(() => {
    setInputValue(state.stake.toString());
  }, [state.stake]);

  return (
    <>
      <Input
        {...register("stake", {
          onChange: (e) => {
            const rawValue = e.target.value;
            setInputValue(rawValue); // Allow temporary free-form input
            
            // Validate only when input is complete
            if (rawValue.endsWith(".") || rawValue === "") return;
            
            const numValue = parseFloat(rawValue);
            if (!isNaN(numValue)) {
              setStake(numValue);
              trigger("stake");
            }
          },
        })}
        id="stake"
        min="0"
        step="0.0001"
        value={inputValue} // Use local string state
        disabled={!isPlayer1 || hasPlayer1Committed}
        className={errors.stake ? "border-red-500" : ""}
        onBlur={() => {
          // Final validation on blur
          const numValue = parseFloat(inputValue);
          if (isNaN(numValue)) {
            setInputValue("0");
            setStake(0);
          } else {
            setInputValue(numValue.toString());
            setStake(numValue);
          }
          trigger("stake");
        }}
      />
      {errors.stake && <span className="text-sm text-red-500">{errors.stake.message}</span>}
    </>
  );
};