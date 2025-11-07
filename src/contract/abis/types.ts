/**
 * TypeScript type definitions for Riverbit Arena NFT contracts
 * Auto-generated from contract ABIs
 */

// ============================================================
// Contract Address Types
// ============================================================

export interface ContractAddresses {
  nftContract: `0x${string}`;
  usdcToken: `0x${string}`;
}

export interface NetworkConfig {
  arbitrum: ContractAddresses;
  arbitrumSepolia: ContractAddresses;
  localhost: ContractAddresses;
}

// ============================================================
// NFT Contract Types
// ============================================================

export interface PriceTier {
  minTokenId: bigint;
  maxTokenId: bigint;
  price: bigint; // USDC amount with 6 decimals
}

export interface RentalInfo {
  user: `0x${string}`;
  expires: bigint; // Unix timestamp
}

export interface MintEligibility {
  canMint: boolean;
  reason: string;
  phase: 'genesis' | 'standard';
  price: string; // Formatted USDC amount
}

export interface NFTMetadata {
  tokenId: bigint;
  owner: `0x${string}`;
  passType: 'Genesis' | 'Standard';
  isGenesis: boolean;
  uri: string;
}

// ============================================================
// Event Types
// ============================================================

export interface AgentMintedEvent {
  tokenId: bigint;
  to: `0x${string}`;
}

export interface AgentBurnedEvent {
  tokenId: bigint;
  from: `0x${string}`;
}

export interface RentalUpdatedEvent {
  tokenId: bigint;
  user: `0x${string}`;
  expires: bigint;
}

export interface WhitelistAddedEvent {
  account: `0x${string}`;
}

export interface WhitelistRemovedEvent {
  account: `0x${string}`;
}

export interface PriceTierUpdatedEvent {
  tierIndex: bigint;
  minTokenId: bigint;
  maxTokenId: bigint;
  price: bigint;
}

// ============================================================
// Transaction Result Types
// ============================================================

export interface MintResult {
  success: boolean;
  tokenId?: bigint;
  transactionHash?: `0x${string}`;
  error?: string;
}

export interface ApprovalResult {
  success: boolean;
  transactionHash?: `0x${string}`;
  error?: string;
}

// ============================================================
// Hook Return Types (for wagmi)
// ============================================================

export interface UseNFTContractRead<T> {
  data: T | undefined;
  isError: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseNFTContractWrite {
  data: { hash: `0x${string}` } | undefined;
  write: ((args?: any) => void) | undefined;
  writeAsync: ((args?: any) => Promise<any>) | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

// ============================================================
// User State Types
// ============================================================

export interface UserNFTState {
  address: `0x${string}`;
  isWhitelisted: boolean;
  genesisMintCount: bigint;
  ownedTokenIds: bigint[];
  totalBalance: bigint;
  usdcBalance: bigint;
  canClaimFaucet: boolean;
  faucetWaitTime: bigint;
}

export interface MintState {
  nextTokenId: bigint;
  currentPhase: 'genesis' | 'standard';
  currentPrice: bigint;
  canMint: boolean;
  eligibilityReason: string;
}

// ============================================================
// Contract Call Parameter Types
// ============================================================

export interface MintParams {
  to: `0x${string}`;
}

export interface SetUserParams {
  tokenId: bigint;
  user: `0x${string}`;
  expires: bigint;
}

export interface UpdatePriceTierParams {
  tierIndex: bigint;
  minTokenId: bigint;
  maxTokenId: bigint;
  price: bigint;
}

export interface AddPriceTierParams {
  minTokenId: bigint;
  maxTokenId: bigint;
  price: bigint;
}

export interface ApproveParams {
  spender: `0x${string}`;
  amount: bigint;
}

// ============================================================
// Error Types
// ============================================================

export enum ContractErrorCode {
  NotWhitelisted = 'NotWhitelisted',
  GenesisMintLimitReached = 'GenesisMintLimitReached',
  IncorrectPayment = 'IncorrectPayment',
  InvalidRecipient = 'InvalidRecipient',
  TokenDoesNotExist = 'TokenDoesNotExist',
  NotTokenOwner = 'NotTokenOwner',
  TokenIsRented = 'TokenIsRented',
  InvalidExpiration = 'InvalidExpiration',
  EnforcedPause = 'EnforcedPause',
  InvalidPriceTier = 'InvalidPriceTier',
}

export interface ContractError {
  code: ContractErrorCode | string;
  message: string;
  details?: any;
}

// ============================================================
// Constants
// ============================================================

export const GENESIS_THRESHOLD = 100n;
export const GENESIS_MINT_LIMIT = 1n;
export const USDC_DECIMALS = 6;
export const FAUCET_AMOUNT = 1000n * 10n ** BigInt(USDC_DECIMALS); // 1000 USDC
export const FAUCET_COOLDOWN = 3600n; // 1 hour in seconds

// ============================================================
// Helper Types
// ============================================================

export type Address = `0x${string}`;
export type Hash = `0x${string}`;
export type Bytes32 = `0x${string}`;

// Role types
export type Role =
  | 'DEFAULT_ADMIN_ROLE'
  | 'UPGRADER_ROLE'
  | 'PAUSER_ROLE'
  | 'ROYALTY_ADMIN_ROLE'
  | 'WHITELIST_ADMIN_ROLE';

// Network types
export type Network = 'arbitrum' | 'arbitrumSepolia' | 'localhost';
export type ChainId = 42161 | 421614 | 31337;
