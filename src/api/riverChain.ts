import { get, post, put, del } from './index';
import request from '../utils/request';
const baseURL = ''

/**
 * 获取积分历史
 * @param 
 */
export const getPointsHistory = (address: string, limit: number, offset: number) => get(`/api/v1/points/${address}/history?limit=${limit}&offset=${offset}`)

/**
 * 获取用户积分
 * @param 
 */
export const getUserAccountPoints = (address?: string) => get(`/api/v1/points/${address}`)

/**
 * 获取每日统计
 * @param 
 */
export const getPointsDays = (days?: string | number) => get(`/api/v1/stats/daily?days=${days}`)

/**
 * 获取获取指定地址在指定时间区间内的积分历史 记录，支持分页
 * @param 
 */
export const getPointsHistoryRange = (address: string, startTime?:string, endTime?: string, limit?: number, offset?: number) => get(`/api/v1/points/${address}/history/range?start_time=${startTime}&end_time=${endTime}&limit=${limit}&offset=${offset}`)

/**
 * 获取指定地址的交易历史记录，支持分页
 * @param 
 */
export const getRransactions = (address: string, limit: number, offset: number) => get(`/api/v1/points/${address}/transactions?limit=${limit}&offset=${offset}`)

/**
 * 获取指定地址在指定时间区间内的交易历史记录，支持分页
 * @param 
 */
export const getRransactionsRange = (address: string,  startTime?:string, endTime?: string, limit?: number, offset?: number) => get(`/api/v1/points/${address}/transactions/range?start_time=${startTime}&end_time=${endTime}&limit=${limit}&offset=${offset}`)

/**
 * 获取积分排行榜，支持分页和筛选
 * @param 
 */
export const getLeaderboard = (limit?: number, offset?: number) => get(`/api/v1/stats/leaderboard?limit=${limit}&offset=${offset}&pool_type=Earn`)

/**
 * 获取指定地址拥有的所有席位
 * @param 
 */
export const getLpSeats = (address?: string) => get(`/api/v1/lp/seats/${address}`);
