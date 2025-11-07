import { get, post, put, del } from './index';
import request from '../utils/request';
const baseURL = '/ms'
/**
 * get  demo
 * @param 
 * @returns {}
 */
// 采用公共封装事件
export const getDemo2 = (id?: number | string) => get(baseURL + `/provider/ailabLogicalDataModel/dataSourceList?dataSource=`)

export const getDemo = (id?: number | string) => {
    return request({
        url: baseURL + `/provider/ailabLogicalDataModel/dataSourceList?dataSource=`,
        method: 'get'
    })
}
