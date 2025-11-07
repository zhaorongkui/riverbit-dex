import { get, post, put, del } from './index';
import request from '../utils/request';
const baseURL = ''

/**
 * 获取永续合约 
 */
export const getPerpetual = () => get(`/v4/perpetualMarkets`)

/**
 * 获取价格走势图数据 
 */
export const getparklines = () => get(`/v4/sparklines`)

/**
 * 获取特定市场详情 
 * @param 
 * ticker参数传交易对，比如BTC-USD
 * 是两个币种的买卖，一般买盘是USD买BTC，卖盘是卖BTC换USD
 * bids 代表买盘（买入订单），asks 代表卖盘（卖出订单）
 */
export const getPerpetualMarkets = (ticker: string) => get(`/v4/perpetualMarkets/${ticker}`)

/**
 * 获取订单簿（买卖盘） 
 * @param 
 */
export const getOrderbooks = (ticker: string) => get(`/v4/orderbooks/perpetualMarket/${ticker}`)

/**
 * 获取交易历史
 * @param 
 */
export const getTradesHistory = (ticker: string) => get(`/v4/trades/perpetualMarket/${ticker}`)

/**
 * 获取K线数据
 * @param 
 */
export const getCandles = (ticker: string) => get(`/v4/candles/perpetualMarkets/${ticker}`)

/**
 * 获取地址信息和子账户
 * @param 
 */
export const getAddresses = (address: string) => get(`/v4/addresses/${address}`)

/**
 * 获取子账户详情
 * @param 
 */
export const getSubaccount = (address: string, subaccountNumber: string) => get(`/v4/addresses/${address}/subaccountNumber/${subaccountNumber}`)

/**
 * 获取永续合约仓位 
 */
export const getPerpetualPositions = (address: string, subaccountNumber: string | number) => get(`/v4/perpetualPositions?address=${address}&subaccountNumber=${subaccountNumber}`)

/**
 * 查询订单列表 Order History
 */
export const getOrders = (address: string, subaccountNumber: string | number) => get(`/v4/orders?address=${address}&parentSubaccountNumber=${subaccountNumber}`)

/**
 * 查询Open Orders/ order history订单列表
 */
export const getOrdersByStatus = (address: string, parentSubaccountNumber: string | number, status?: string, limit?: number) => get(`/v4/orders/parentSubaccountNumber
?address=${address}&parentSubaccountNumber=${parentSubaccountNumber}&status=${status}&limit=${limit}`)

/**
 * 查询最新订单列表(暂时未用)
 */
export const getLatestOrders = (address: string, parentSubaccountNumber: string | number, status?: string) => get(`/v4/orders/parentSubaccountNumber
?address=${address}&parentSubaccountNumber=${parentSubaccountNumber}&returnLatestOrders=true`)

/**
 * 查询最新全部交易fills记录
 */
export const getAllfills = (address: string, parentSubaccountNumber: string | number) => get(`/v4/fills/parentSubaccountNumber
?address=${address}&parentSubaccountNumber=${parentSubaccountNumber}&tickerType=PERPETUAL`)

/**
 * 获取特定订单 
 */
export const getOrdersById = (orderId: string) => get(`/v4/orders/${orderId}`)

/**
 * 获取成交记录 
 */
export const getFills = () => get(`/v4/fills`)

/**
 * 获取资金费用支付记录 Funding History
 */
export const getFundingPayments = (address: string, subaccountNumber: string | number) => get(`/v4/fundingPayments?address=${address}&subaccountNumber=${subaccountNumber}`)

/**
 * 获取历史资金费率 
 */
export const geThistoricalFunding = () => get(`/v4/historicalFunding`)

/**
 * 获取盈亏数据
 */
export const getPnlData = (address: string, subaccountNumber: string | number) => get(`/v4/historical-pnl?address=${address}&subaccountNumber=${subaccountNumber}`)

/**
 * 获取历史盈亏
 */
export const getHistoricalPnl = () => get(`/v4/historical-pnl`)

/**
 * 获取交易奖励汇总
 */
export const getTradingRewardAll = () => get(`/v4/historicalTradingRewardAggregations`)

/**
 * 获取区块交易奖励
 */
export const getBlockTradingReward = () => get(`/v4/historicalBlockTradingRewards`)

/**
 * 获取Megavault 历史盈亏
 * 接口前应该加/v4
 */
export const getMegavaultHistoricalPnl = () => get(`/v4/vault/v1/megavault/historicalPnl`)

/**
 * 获取Megavault 仓位
 * 接口前应该加/v4
 */
export const getMegavaulPositions = () => get(`/v4/vault/v1/megavault/positions`)

/**
 * 获取所有 Vault 历史盈亏
 * 接口前应该加/v4
 */
export const getVaultsHistoricalPnl = () => get(`/v4/vault/v1/vaults/historicalPnl`)

/**
 * 获取交易员数据
 */
export const getTrader = () => get(`/v4/trader`)

/**
 * 获取交易员数据
 */
export const getAffiliates = () => get(`/v4/affiliates`)

/**
 * 获取跨链桥接
 */
export const getBridging = () => get(`/v4/bridging`)