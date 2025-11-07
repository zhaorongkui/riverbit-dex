// src/hooks/useWallet.ts
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  type Connector,
  type CreateConnectorFn,
} from "wagmi";
import { useCallback, useEffect, useState } from "react";
import type { DisconnectMutate } from "wagmi/query";
import { Chain, ChainID } from "../config/chain";
import { useAuth } from "./useAuth";

interface UseWalletReturn {
  address: `0x${string}` | undefined;
  chainId: number | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  connectors: readonly Connector<CreateConnectorFn>[];
  disconnectWallet: DisconnectMutate<unknown>;
  connectWallet: (connector: Connector<CreateConnectorFn>) => Promise<void>;
  switchToArbitrum: (chainId: number) => Promise<void>;
}

export default function useWallet(): UseWalletReturn {
  const { connect, connectors, isPending } = useConnect();
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { signAndGetToken } = useAuth();
  const [needSignAndGetToken, setNeedSignAndGetToken] = useState(false);

  const connectWallet = useCallback(
    async (connector: Connector<CreateConnectorFn>) => {
      try {
        await connect({
          connector,
          chainId: ChainID[Chain.ARBITRUM_SEPOLIA],
        });

        setNeedSignAndGetToken(true);
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    },
    [connect]
  );

  // 切换到 Arbitrum One 链
  const switchToArbitrum = useCallback(
    async (chainId: number) => {
      try {
        await switchChain({ chainId });
      } catch (err) {
        console.error("Failed to switch chain:", err);
      }
    },
    [switchChain]
  );

  useEffect(() => {
    // console.log(isConnected, needSignAndGetToken);
    if (
      (isConnected && needSignAndGetToken) ||
      (isConnected && !localStorage.getItem("Riverbit_Token"))
    )
      signAndGetToken(() => setNeedSignAndGetToken(false));
  }, [isConnected, needSignAndGetToken, signAndGetToken]);

  return {
    address,
    chainId,
    isConnected,
    isConnecting: isPending || switching,
    connectors,
    connectWallet,
    disconnectWallet: disconnect,
    switchToArbitrum,
  };
}
