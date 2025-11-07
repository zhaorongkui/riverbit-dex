import { get, post, put, del } from './index';
import request from '../utils/request';
const baseURL = ''

/**
 * 获取nonce事件 
 * @param 
 * @returns {}
 */
export const getNonce = (address: string) => get(`/api/v1/auth/nonce/${address}`)

/**
 * 获取token事件 
 * @param 
 * @returns {}
 */
export const getTokenAuth = (params: object) => post(`/api/v1/auth/login`, params)

/**
 * 获取积分事件 
 * @param 
 * @returns {}
 */
export const getPoints = (address: string) => get(`/api/v1/points/${address}`)