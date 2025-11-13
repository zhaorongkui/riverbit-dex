/**
 * TradingView Datafeed 模拟流式数据订阅
 */
import type {
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from '../../../public/charting_library/charting_library.min.d';
import { getResolutionInSeconds } from './helpers';

interface StreamSubscriber {
  symbolInfo: LibrarySymbolInfo;
  resolution: ResolutionString;
  onRealtimeCallback: SubscribeBarsCallback;
  onResetCacheNeededCallback: () => void;
  lastBar?: any;
  intervalId?: NodeJS.Timeout;
}

const subscribers: Map<string, StreamSubscriber> = new Map();

/**
 * 订阅模拟流式数据
 */
export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: ResolutionString,
  onRealtimeCallback: SubscribeBarsCallback,
  subscriberUID: string,
  onResetCacheNeededCallback: () => void,
  lastBar?: any
): void {
  // 如果已有订阅，先取消
  if (subscribers.has(subscriberUID)) {
    const existing = subscribers.get(subscriberUID);
    if (existing?.intervalId) {
      clearInterval(existing.intervalId);
    }
  }

  // 计算更新间隔（秒）
  const intervalSeconds = getResolutionInSeconds(resolution);
  
  // 创建模拟数据的定时器
  const intervalId = setInterval(() => {
    const subscriber = subscribers.get(subscriberUID);
    if (!subscriber) return;
    
    let lastBar = subscriber.lastBar;
    let price;
    
    if (lastBar) {
      // 基于最后一根K线生成新价格
      price = lastBar.close;
    } else {
      // 初始价格
      price = 1000 + Math.random() * 9000;
    }
    
    // 随机价格变动 (-0.5% 到 +0.5%)
    const change = (Math.random() - 0.5) * 0.01 * price;
    const now = new Date();
    // 确保时间是分辨率的整数倍
    const time = Math.floor(now.getTime() / (intervalSeconds * 1000)) * intervalSeconds * 1000;
    
    const bar = {
      time,
      open: price,
      high: Math.max(price, price + change) + Math.random() * 0.005 * price,
      low: Math.min(price, price + change) - Math.random() * 0.005 * price,
      close: price + change,
      volume: 1000 + Math.random() * 9000,
    };
    
    subscriber.lastBar = bar;
    subscriber.onRealtimeCallback(bar);
  }, intervalSeconds * 1000); // 按分辨率间隔更新

  subscribers.set(subscriberUID, {
    symbolInfo,
    resolution,
    onRealtimeCallback,
    onResetCacheNeededCallback,
    lastBar,
    intervalId
  });
}

/**
 * 取消订阅流式数据
 */
export function unsubscribeFromStream(subscriberUID: string): void {
  const subscriber = subscribers.get(subscriberUID);
  if (subscriber?.intervalId) {
    clearInterval(subscriber.intervalId);
  }
  subscribers.delete(subscriberUID);
}