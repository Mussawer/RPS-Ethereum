import { readContract } from "@wagmi/core";
import { config } from "@/config/wagmi";
import { Abi, Address } from "viem";

export interface ReadContractParams {
  abi: Abi;
  address: Address;
  functionName: string;
  args?: any[];
}

const useReadContractAction = () => {
  const executeReadAction = async (
    params: ReadContractParams
  ): Promise<any> => {
    try {
      const result = await readContract(config, {
        address: params.address,
        abi: params.abi,
        functionName: params.functionName,
        args: params.args || [],
      });
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  return { executeReadAction };
};

export default useReadContractAction;