/**
 * TradingView Datafeed 辅助函数
 */
import type { LibrarySymbolInfo } from '../../../public/charting_library/charting_library.min.d';

/**
 * 生成交易对符号
 */
export function generateSymbol(
  exchange: string,
  leftPairPart: string,
  rightPairPart: string
): { short: string; full: string } {
  const short = `${leftPairPart}${rightPairPart}`;
  const full = `${exchange}:${short}`;
  return { short, full };
}

/**
 * 解析完整符号名称
 */
export function parseFullSymbol(fullName: string): {
  exchange: string;
  symbol: string;
} | null {
  const match = fullName.match(/^(\w+):(.+)$/);
  if (!match) {
    return null;
  }
  return {
    exchange: match[1],
    symbol: match[2],
  };
}

/**
 * 计算价格精度
 */
export function priceScale(price: string): number {
  const match = price.match(/\.(\d+)/);
  if (!match) {
    return 100;
  }
  const decimals = match[1].length;
  return Math.pow(10, decimals);
}

/**
 * 发送 API 请求
 */
export async function makeApiRequest(path: string): Promise<any> {
  try {
    const response = await fetch(`https://min-api.cryptocompare.com/${path}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[makeApiRequest] Error:', error);
    throw error;
  }
}

/**
 * 发送币安 API 请求
 * 通过 Vite 代理避免 CORS 问题
 */
export async function makeBinanceRequest(path: string): Promise<any> {
  try {
    // 使用 Vite 代理路径，避免 CORS 问题
    const proxyUrl = `/binance-proxy/${path}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Binance API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[makeBinanceRequest] Error:', error);
    throw error;
  }
}

