import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "@/config/wagmi";
import { Abi, Address, TransactionReceipt } from "viem";
import { HexString } from "../interfaces/GameRoom";

export interface TransactionParams {
  abi: Abi;
  address: Address;
  functionName: string;
  args?: any[];
  value?: any;
  connector?: any;
  chain?: any;
}


const useWriteContractAction = () => {
  const executeWriteAction = async (
    params: TransactionParams
  ): Promise<TransactionReceipt> => {
    try {
      const result: HexString = await writeContract(config, params);
      const receipt = await waitForTransactionReceipt(config, { hash: result });
      return receipt as TransactionReceipt;
    } catch (error: any) {
      throw error;
    }
  };

  return { executeWriteAction };
};

export default useWriteContractAction;
