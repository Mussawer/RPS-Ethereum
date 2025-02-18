import { z } from "zod";

export const stakeSchema = (maxBalance: number) => 
    z.object({
      stake: z
        .number()
        .min(0, "Stake must be greater than 0")
        .max(maxBalance, `Insufficient balance (max: ${maxBalance.toPrecision(2)} ETH)`)
    });

