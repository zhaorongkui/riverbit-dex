import { Tokens, type TOKEN_INFO } from "./token.type";

const Arbitrum_Sepolia_Tokens: Record<Tokens, TOKEN_INFO> = {
  [Tokens.ETH]: {
    address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    decimals: 18,
    displayName: Tokens.ETH,
  },
  [Tokens.USDC]: {
    address: "0xc2Ffdc52763bB5AFe193358Ed4793c738687D99e",
    decimals: 6,
    displayName: Tokens.USDC,
  },
  [Tokens.ARENA_NFT]: {
    address: "0x6E67318F5FF243c14Fed135cc6a883631eA254e2",
    decimals: 18,
    displayName: Tokens.ARENA_NFT,
  },
};

export default Arbitrum_Sepolia_Tokens;
