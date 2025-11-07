import { useWalletClient } from "wagmi";
import useWallet from "../useWallet";
import { useMemo } from "react";
import { TOKEN_DETAIL } from "../../config/tokens";
import { Tokens } from "../../config/tokens/token.type";
import { MockUSDC } from "../../contract";
export const useUSDC = () => {
  const { data: walletClient } = useWalletClient();
  const { chainId } = useWallet();
  const address = useMemo(
    () => chainId && TOKEN_DETAIL[chainId][Tokens.USDC].address,
    [chainId]
  );
  const abi = useMemo(() => MockUSDC, []);
  // 领取 USDC 测试币
  const faucet = async () => {
    if (!walletClient || !address) return;
    return await walletClient.writeContract({
      address,
      abi,
      functionName: "faucet",
    });
  };

  return {
    faucet,
  };
};
