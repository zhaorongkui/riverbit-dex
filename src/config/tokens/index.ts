import { Chain, ChainID } from "../chain";
import Arbitrum_One_Tokens from "../tokens/arbitrum.one";
import Arbitrum_Sepolia_Tokens from "../tokens/arbitrum.sepolia";
import type { TOKEN_INFO, Tokens } from "./token.type";

export const TOKEN_DETAIL: Record<number, Record<Tokens, TOKEN_INFO>> = {
  [ChainID[Chain.ARBITRUM_ONE]]: Arbitrum_One_Tokens,
  [ChainID[Chain.ARBITRUM_SEPOLIA]]: Arbitrum_Sepolia_Tokens,
};

export const getTokenInfo = (chainId: number | undefined, token: Tokens) => {
  if (!chainId) return null;
  const chainTokens = TOKEN_DETAIL[chainId];
  if (!chainTokens) {
    console.warn(`No token configuration for chainId: ${chainId}`);
    return null;
  }
  const tokenDetail = chainTokens[token];
  if (!tokenDetail) {
    console.warn(`Token ${token} not found for chainId: ${chainId}`);
    return null;
  }
  return tokenDetail;
};
