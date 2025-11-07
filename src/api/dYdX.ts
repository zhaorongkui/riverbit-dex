import { get, post, put, del } from './index';
import request from '../utils/request';
const baseURL = ''

/**
 * 查询所有资产
 */
export const getAssets = () => get(`/dydxprotocol/assets/asset`)

/**
 * 查询特定资产 
 */
export const getAssetsById = (id: string | number) => get(`/dydxprotocol/assets/asset/${id}`)

/**
 * 查询金库所有的share 
 */
export const getVaultAllOwnerShares = () => get(`/dydxprotocol/vault/megavault/all_owner_shares`)
/**
 * 查某个地址的份额份额 
 */
export const getVaultTotalShares = () => get(`/dydxprotocol/vault/megavault/total_shares `)

/**
 * 查询金库所有的share 
 */
export const getVaultSharesByAddress = (address: string) => get(`/dydxprotocol/vault/megavault/owner_shares/${address}`)

/**
 * 查询所有永续合约参数
 */
export const getPerpetualParams = () => get(`/dydxprotocol/perpetuals/params`)

/**
 * 查询所有永续合约
 */
export const getPerpetual = () => get(`/dydxprotocol/perpetuals/perpetual`)

/**
 * 查询所有市场价格
 */
export const getMarketPrices = () => get(`/dydxprotocol/prices/market`)

/**
 * 查询特定市场价格
 */
export const getMarketPricesById = (id: string | number) => get(`/dydxprotocol/prices/market/${id}`)

/**
 * 查询价格模块参数
 */
export const getPricesParams = () => get(`/dydxprotocol/prices/params`)

/**
 * 查询所有 CLOB 交易对
 */
export const getClobPair = () => get(`/dydxprotocol/clob/clob_pair`)

/**
 * 查询特定 CLOB 交易对
 */
export const getClobPairById = (id: string | number) => get(`/dydxprotocol/clob/clob_pair/${id}`)

/**
 * 查询权益层级限制配置
 */
export const getEquityLimit = () => get(`/dydxprotocol/clob/equity_tier_limit_config`)

/**
 * 查询权益层级限制配置
 */
export const getBlockLimit = () => get(`/dydxprotocol/clob/block_rate_limit_config`)

/**
 * 查询所有子账户
 */
export const getSubaccount = () => get(`/dydxprotocol/subaccounts/subaccount`)

/**
 * 查询特定子账户
 */
export const getSubaccountByOwner = (owner:string, number: string | number) => get(`/dydxprotocol/subaccounts/subaccount/${owner}/${number}`)

/**
 * 查询桥接事件参数
 */
export const getEventParams = () => get(`/dydxprotocol/bridge/event_params`)

/**
 * 查询桥接提案参数
 */
export const getProposeParams = () => get(`/dydxprotocol/bridge/propose_params`)

/**
 * 查询桥接安全参数
 */
export const getSafetyParams = () => get(`/dydxprotocol/bridge/safety_params`)

/**
 * 查询已确认事件信息
 */
export const getAcknowledgedEventInfo = () => (`/dydxprotocol/bridge/acknowledged_event_info`)

/**
 * 查询所有纪元信息
 */
export const getEpochInfo = () => (`/dydxprotocol/epochs/epoch_info`)

/**
 * 查询特定纪元信息
 */
export const getEpochInfoByName = (name: string) => (`/dydxprotocol/epochs/epoch_info/${name}`)

/**
 * 查询永续合约费用参数
 */
export const getPerpetualFeeParams = () => (`/dydxprotocol/feetiers/perpetual_fee_params`)

/**
 * 查询用户费率层级
 */
export const getUserFeeTier = () => (`/dydxprotocol/feetiers/user_fee_tier`)

/**
 * 查询奖励参数
 */
export const getRewards = () => (`/dydxprotocol/rewards/params`)

/**
 * 查询统计参数
 */
export const getStatsParams = () => (`/dydxprotocol/stats/params`)

/**
 * 查询统计元数据
 */
export const getStatsMetadata = () => (`/dydxprotocol/stats/stats_metadata`)

/**
 * 查询全局统计
 */
export const getGlobalStats = () => (`/dydxprotocol/stats/global_stats`)

/**
 * 查询用户统计
 */
export const getUserStats = () => (`/dydxprotocol/stats/user_stats`)

/**
 * 查询归属条目
 */
export const getVestEntry = () => (`/dydxprotocol/vest/vest_entry`)

/**
 * 查询发送参数
 */
export const getSendParams = () => (`/dydxprotocol/sending/params`)

/**
 * 查询币种追踪
 */
export const getDenomTraces = () => (`/ibc/apps/transfer/v1/denom_traces`)

/**
 * 查询特定币种追踪
 */
export const getDenomTracesHash = (hash: string | number) => (`/ibc/apps/transfer/v1/denom_traces/${hash}`)

/**
 * 查询 IBC 转账参数
 */
export const getIBCTransferParams = () => (`/ibc/apps/transfer/v1/params`)

/**
 * 查询所有客户端状态
 */
export const getClientStates = () => (`/ibc/core/client/v1/client_states`)

/**
 * 查询特定客户端状态
 */
export const getClientStatesById = (client_id: string | number) => (`/ibc/core/client/v1/client_states/${client_id}`)

/**
 * 查询共识状态
 */
export const getConsensusStatesById = (client_id: string | number) => (`/ibc/core/client/v1/consensus_states/${client_id}`)

/**
 * 查询所有连接
 */
export const getConnections = () => (`/ibc/core/connection/v1/connections`)

/**
 * 查询特定连接
 */
export const getConnectionsById = (connection_id: string | number) => (`/ibc/core/connection/v1/connections/${connection_id}`)

/**
 * 查询所有通道
 */
export const getChannels = () => (`/ibc/core/channel/v1/channels`)

/**
 * 查询特定通道
 */
export const getChannelsByParams = (channel_id: string | number, port_id: string | number,) => (`/ibc/core/channel/v1/channels/${channel_id}/ports/${port_id}`)