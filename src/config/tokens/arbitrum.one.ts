import { Tokens, type TOKEN_INFO } from "./token.type";

const Arbitrum_One_Tokens: Record<Tokens, TOKEN_INFO> = {
  [Tokens.ETH]: {
    address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    decimals: 18,
    displayName: Tokens.ETH,
  },
  [Tokens.USDC]: {
    address: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`,
    decimals: 6,
    displayName: Tokens.USDC,
  },
  [Tokens.ARENA_NFT]: {
    address: `0x0000000000000000000000000000000000000000`,
    decimals: 18,
    displayName: Tokens.ARENA_NFT,
  },
};

export default Arbitrum_One_Tokens;
