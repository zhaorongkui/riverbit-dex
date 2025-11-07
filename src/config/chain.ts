// src/config/chain.ts
import { arbitrum, arbitrumSepolia } from "wagmi/chains";

/** 枚举定义 */
export enum Chain {
  ARBITRUM_ONE = "Arbitrum One",
  ARBITRUM_SEPOLIA = "Arbitrum Sepolia",
}

/** 统一的链 ID 映射 */
export const ChainID: Record<Chain, number> = {
  [Chain.ARBITRUM_ONE]: arbitrum.id, // 42161
  [Chain.ARBITRUM_SEPOLIA]: arbitrumSepolia.id, // 421614
};

/** 链配置信息结构 */
export interface ChainInfo {
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/** 链信息配置 */
export const CHAIN_INFO: Record<Chain, ChainInfo> = {
  [Chain.ARBITRUM_ONE]: {
    id: ChainID[Chain.ARBITRUM_ONE],
    name: "Arbitrum One",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    blockExplorer: "https://arbiscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  [Chain.ARBITRUM_SEPOLIA]: {
    id: ChainID[Chain.ARBITRUM_SEPOLIA],
    name: "Arbitrum Sepolia",
    rpcUrl: "https://arb-sepolia.g.alchemy.com/v2/w3svVdLMaBS42ZGbujrMm",
    blockExplorer: "https://sepolia.arbiscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
};

/** 根据 chainId 查找对应 Chain 枚举 */
export function getChainById(chainId?: number): Chain | undefined {
  return (Object.keys(ChainID) as Chain[]).find(
    (key) => ChainID[key] === chainId
  );
}
