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
 * 生成测试K线数据
 */
export function generateTestBars(
  symbol: string,
  resolution: string,
  from: number,
  to: number
) {
  const barsCount = Math.floor((to - from) / (getResolutionInSeconds(resolution) * 1000));
  const bars = [];
  
  // 随机起始价格
  let price = 1000 + Math.random() * 9000;
  const volumeBase = 1000 + Math.random() * 9000;
  
  for (let i = 0; i < barsCount; i++) {
    const time = from + i * getResolutionInSeconds(resolution) * 1000;
    
    // 随机价格变动 (-2% 到 +2%)
    const change = (Math.random() - 0.5) * 0.04 * price;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 0.01 * price;
    const low = Math.min(open, close) - Math.random() * 0.01 * price;
    const volume = volumeBase * (0.5 + Math.random());
    
    bars.push({
      time,
      open,
      high,
      low,
      close,
      volume
    });
    
    price = close;
  }
  
  return bars;
}

/**
 * 将分辨率转换为秒数
 */
export function getResolutionInSeconds(resolution: string): number {
  const unit = resolution.slice(-1);
  const value = parseInt(resolution);
  
  switch (unit) {
    case 'S': return value;
    case 'M': return value * 60;
    case 'H': return value * 3600;
    case 'D': return value * 86400;
    case 'W': return value * 604800;
    case 'M': return value * 2592000; // 月 (30天)
    default: return parseInt(resolution) * 60; // 默认按分钟
  }
}