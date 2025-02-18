// components/StakeInput.tsx
import { Input } from "./ui/Input";
import { UseFormRegister, UseFormTrigger } from "react-hook-form";
import { HexString } from "../interfaces/GameRoom";
import { User } from "../interfaces/User";

interface StakeInputProps {
  register: UseFormRegister<any>;
  trigger: UseFormTrigger<any>;
  value: number;
  setStake: (value: number) => void;
  errors: any;
  address: HexString | undefined;
  gameRoomMembers: React.MutableRefObject<User[] | undefined>;
}

export const StakeInput = ({
  register,
  trigger,
  value,
  setStake,
  errors,
  address,
  gameRoomMembers,
}: StakeInputProps) => {
  return (
    <>
      <Input
        {...register("stake", {
          onChange: (e) => {
            const inputValue = e.target.value;
            if (inputValue !== "") {
              const numValue = Number(inputValue);
              if (!isNaN(numValue)) {
                setStake(numValue);
                trigger("stake");
              }
            } else {
              setStake(0);
            }
          },
        })}
        id="stake"
        min="0"
        step="0.0001"
        disabled={!gameRoomMembers.current?.find((player) => player?.address === address)?.p1}
        className={errors.stake ? "border-red-500" : ""}
      />
      {errors.stake && <span className="text-sm text-red-500">{errors.stake.message}</span>}
    </>
  );
};
