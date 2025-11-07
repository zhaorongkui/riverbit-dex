import { get, post, put, del } from './index';
import request from '../utils/request';
const baseURL = ''

/**
 * 查询所有账户 
 */
export const getAccounts = () => get(`/cosmos/auth/v1beta1/accounts`)

/**
 * 查询所有账户 
 */
export const getAccountsByAddress = (address: string) => get(`/cosmos/auth/v1beta1/accounts/${address}`)

/**
 * 查询认证模块参数
 */
export const getAuthParams = () => get(`/cosmos/auth/v1beta1/params`)

/**
 * 查询模块账户
 */
export const getModuleAccounts = () => get(`/cosmos/auth/v1beta1/module_accounts`)

/**
 * Bech32 地址转换
 */
export const getBech32 = () => get(`/cosmos/auth/v1beta1/bech32`)

/**
 * 查询地址余额
 */
export const getBalancesByAddress = (address: string) => get(`/cosmos/bank/v1beta1/balances/${address}`)

/**
 * 查询地址余额
 */
export const getBalancesByDenom = (address: string) => get(`/cosmos/bank/v1beta1/balances/${address}/by_denom`)

/**
 * 查询总供应量
 */
export const getSupply = () => get(`/cosmos/bank/v1beta1/supply`)

/**
 * 查询特定币种总供应量
 */
export const getSupplyByDenom = () => get(`/cosmos/bank/v1beta1/supply/by_denom`)

/**
 * 查询特定币种总供应量
 */
export const getBankParams = () => get(`/cosmos/bank/v1beta1/params`)

/**
 * 查询查询币种元数据
 */
export const getDenomMetadata = () => get(`/cosmos/bank/v1beta1/denom_metadata`)

/**
 * 查询所有验证者
 */
export const getStakingValidators = () => get(`/cosmos/staking/v1beta1/validators`)

/**
 * 查询特定验证者
 */
export const getStakingValidatorAddr = (validator_addr: string) => get(`/cosmos/staking/v1beta1/validators/cosmos/staking/v1beta1/validators/${validator_addr}`)

/**
 * 查询委托
 */
export const getStakingDelegatorAddr = (delegator_addr: string) => get(`/cosmos/staking/v1beta1/delegations/${delegator_addr}`)

/**
 * 查询质押池
 */
export const getStakingPool = () => get(`/cosmos/staking/v1beta1/pool`)

/**
 * 查询质押参数
 */
export const getStakingPoolParams = () => get(`/cosmos/staking/v1beta1/params`)

/**
 * 查询奖励
 */
export const getRewards = (delegator_address: string) => get(`/cosmos/distribution/v1beta1/delegators/${delegator_address}/rewards`)

/**
 * 查询佣金
 */
export const getCommission = (validator_address: string) => get(`/cosmos/distribution/v1beta1/validators/${validator_address}/commission`)

/**
 * 查询分配参数
 */
export const getDistribution = () => get(`/cosmos/distribution/v1beta1/params`)

/**
 * 查询所有提案
 */
export const getProposals = () => get(`/cosmos/gov/v1beta1/proposals`)

/**
 * 查询特定提案
 */
export const getProposalsById = (proposal_id: string) => get(`/cosmos/gov/v1beta1/proposals/${proposal_id}`)

/**
 * 查询提案投票
 */
export const getProposalsVotesById = (proposal_id: string) => get(`/cosmos/gov/v1beta1/proposals/${proposal_id}/votes`)

/**
 * 查询治理参数
 */
export const getGovParams = (params_type: string) => get(`/cosmos/gov/v1beta1/params/${params_type}`)

/**
 * 查询交易（支持多种条件）
 */
export const getTxs = () => get(`/cosmos/tx/v1beta1/txs`)

/**
 * 通过哈希查询交易
 */
export const getTxsByHash = (hash: string) => get(`/cosmos/tx/v1beta1/txs/${hash}`)

/**
 * 模拟交易
 */
export const simulate = () => get(`/cosmos/tx/v1beta1/simulate`)

/**
 * 查询节点信息
 */
export const getNodeInfo = () => get(`/cosmos/base/tendermint/v1beta1/node_info`)

/**
 * 查询同步状态
 */
export const getSyncing = () => get(`/cosmos/base/tendermint/v1beta1/syncing`)

/**
 * 查询最新区块
 */
export const getLastBlocks = () => get(`/cosmos/base/tendermint/v1beta1/blocks/latest`)

/**
 * 查询特定高度区块
 */
export const getBlockHeight = (height: string | number) => get(`/cosmos/base/tendermint/v1beta1/blocks/${height}`)

/**
 * 查询最新验证者集
 */
export const getLastValidatorsets = () => get(`/cosmos/base/tendermint/v1beta1/validatorsets/latest`)

/**
 * 查询特定高度验证者集
 */
export const getLastValidatorsetsByHeight = (height: string | number) => get(`/cosmos/base/tendermint/v1beta1/validatorsets/${height}`)