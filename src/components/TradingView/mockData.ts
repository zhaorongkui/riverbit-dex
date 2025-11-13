/**
 * 模拟数据生成器
 */

// 模拟K线数据结构
export interface MockKline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 模拟交易对信息
export const MOCK_SYMBOLS = [
  {
    symbol: 'BTCUSDT',
    full_name: 'Binance:BTCUSDT',
    description: 'Bitcoin / Tether',
    exchange: 'Binance',
    type: 'crypto',
  },
  {
    symbol: 'ETHUSDT',
    full_name: 'Binance:ETHUSDT',
    description: 'Ethereum / Tether',
    exchange: 'Binance',
    type: 'crypto',
  },
  {
    symbol: 'BNBUSDT',
    full_name: 'Binance:BNBUSDT',
    description: 'Binance Coin / Tether',
    exchange: 'Binance',
    type: 'crypto',
  },
  {
    symbol: 'ADAUSDT',
    full_name: 'Binance:ADAUSDT',
    description: 'Cardano / Tether',
    exchange: 'Binance',
    type: 'crypto',
  },
  {
    symbol: 'DOTUSDT',
    full_name: 'Binance:DOTUSDT',
    description: 'Polkadot / Tether',
    exchange: 'Binance',
    type: 'crypto',
  },
];

/**
 * 生成模拟K线数据
 */
export function generateMockKlines(
  symbol: string,
  resolution: string,
  from: number,
  to: number,
  barCount: number = 1000
): MockKline[] {
  const klines: MockKline[] = [];
  
  // 基础价格（根据符号不同设置不同的基础价格）
  const basePrice: Record<string, number> = {
    'BTCUSDT': 45000,
    'ETHUSDT': 3000,
    'BNBUSDT': 400,
    'ADAUSDT': 1.2,
    'DOTUSDT': 25,
  };
  
  const basePriceValue = basePrice[symbol] || 100;
  const volatility = basePriceValue * 0.02; // 2% 波动率
  
  // 计算时间间隔（毫秒）
  const intervalMs = getIntervalMs(resolution);
  let currentTime = from * 1000;
  let lastClose = basePriceValue;
  
  for (let i = 0; i < barCount && currentTime < to * 1000; i++) {
    // 生成随机价格波动
    const change = (Math.random() - 0.5) * 2 * volatility;
    const open = lastClose;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = 1000 + Math.random() * 5000;
    
    klines.push({
      time: currentTime,
      open,
      high,
      low,
      close,
      volume,
    });
    
    lastClose = close;
    currentTime += intervalMs;
  }
  
  return klines;
}

/**
 * 根据分辨率获取时间间隔（毫秒）
 */
function getIntervalMs(resolution: string): number {
  const intervalMap: Record<string, number> = {
    '1': 60 * 1000, // 1分钟
    '3': 3 * 60 * 1000, // 3分钟
    '5': 5 * 60 * 1000, // 5分钟
    '15': 15 * 60 * 1000, // 15分钟
    '30': 30 * 60 * 1000, // 30分钟
    '60': 60 * 60 * 1000, // 1小时
    '120': 2 * 60 * 60 * 1000, // 2小时
    '240': 4 * 60 * 60 * 1000, // 4小时
    '360': 6 * 60 * 60 * 1000, // 6小时
    '720': 12 * 60 * 60 * 1000, // 12小时
    '1D': 24 * 60 * 60 * 1000, // 1天
    '1W': 7 * 24 * 60 * 60 * 1000, // 1周
    '1M': 30 * 24 * 60 * 60 * 1000, // 1月
  };
  
  return intervalMap[resolution] || 60 * 1000;
}

/**
 * 模拟实时数据更新
 */
export function simulateRealtimeData(
  symbol: string,
  callback: (kline: MockKline) => void,
  interval: number = 5000 // 5秒更新一次
): NodeJS.Timeout {
  const basePrice: Record<string, number> = {
    'BTCUSDT': 45000,
    'ETHUSDT': 3000,
    'BNBUSDT': 400,
    'ADAUSDT': 1.2,
    'DOTUSDT': 25,
  };
  
  let lastClose = basePrice[symbol] || 100;
  const volatility = lastClose * 0.01; // 1% 波动率
  
  return setInterval(() => {
    const change = (Math.random() - 0.5) * 2 * volatility;
    const open = lastClose;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.3;
    const low = Math.min(open, close) - Math.random() * volatility * 0.3;
    const volume = 1000 + Math.random() * 5000;
    
    const kline: MockKline = {
      time: Date.now(),
      open,
      high,
      low,
      close,
      volume,
    };
    
    callback(kline);
    lastClose = close;
  }, interval);
}