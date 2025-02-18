import { z } from "zod";

export const stakeSchema = (maxBalance: number) => 
    z.object({
      stake: z
      .string()  // Change to string since input value is string
      .transform((val) => Number(val))  // Transform string to number
      .pipe(      // Then validate the number
        z.number()
          .min(0, "Stake must be greater than 0")
          .max(maxBalance, `Insufficient balance (max: ${maxBalance.toPrecision(2)} ETH)`)
      )
    });

