export interface TOKEN_INFO {
  address: `0x${string}`;
  decimals: number;
  displayName: string;
}

export const enum Tokens {
  ETH = "ETH",
  USDC = "USDC",
  ARENA_NFT = "Arena_NFT",
}
