/**
 * TradingView Datafeed 流式数据订阅
 */
import type {
  LibrarySymbolInfo,
  ResolutionString,
  SubscribeBarsCallback,
} from '../../../public/charting_library/charting_library.min.d';

interface StreamSubscriber {
  symbolInfo: LibrarySymbolInfo;
  resolution: ResolutionString;
  onRealtimeCallback: SubscribeBarsCallback;
  onResetCacheNeededCallback: () => void;
  lastBar?: any;
}

const subscribers: Map<string, StreamSubscriber> = new Map();
let ws: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

/**
 * 订阅流式数据
 */
export function subscribeOnStream(
  symbolInfo: LibrarySymbolInfo,
  resolution: ResolutionString,
  onRealtimeCallback: SubscribeBarsCallback,
  subscriberUID: string,
  onResetCacheNeededCallback: () => void,
  lastBar?: any
): void {
  subscribers.set(subscriberUID, {
    symbolInfo,
    resolution,
    onRealtimeCallback,
    onResetCacheNeededCallback,
    lastBar,
  });

  // 如果 WebSocket 未连接，则建立连接
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    connectWebSocket();
  }
}

/**
 * 取消订阅流式数据
 */
export function unsubscribeFromStream(subscriberUID: string): void {
  subscribers.delete(subscriberUID);

  // 如果没有订阅者了，关闭 WebSocket
  if (subscribers.size === 0 && ws) {
    ws.close();
    ws = null;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }
}

/**
 * 连接 WebSocket
 */
function connectWebSocket(): void {
  try {
    // 构建币安 WebSocket 流地址
    const streams: string[] = [];
    subscribers.forEach((subscriber) => {
      const parsedSymbol = parseSymbol(subscriber.symbolInfo.full_name);
      if (parsedSymbol) {
        const stream = `${parsedSymbol.symbol.toLowerCase()}@kline_${mapResolutionToInterval(subscriber.resolution)}`;
        streams.push(stream);
      }
    });

    if (streams.length === 0) {
      return;
    }

    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WebSocket] Connected');
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.stream && data.data) {
          handleWebSocketMessage(data.stream, data.data);
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    ws.onclose = () => {
      console.log('[WebSocket] Closed');
      ws = null;
      // 如果还有订阅者，尝试重连
      if (subscribers.size > 0) {
        reconnectTimer = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      }
    };
  } catch (error) {
    console.error('[WebSocket] Connection error:', error);
  }
}

/**
 * 处理 WebSocket 消息
 */
function handleWebSocketMessage(stream: string, data: any): void {
  const symbol = stream.split('@')[0].toUpperCase();
  const kline = data.k;

  subscribers.forEach((subscriber) => {
    const parsedSymbol = parseSymbol(subscriber.symbolInfo.full_name);
    if (parsedSymbol && parsedSymbol.symbol.toUpperCase() === symbol) {
      const bar = {
        time: kline.t,
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
        volume: parseFloat(kline.v),
      };

      subscriber.onRealtimeCallback(bar);
      subscriber.lastBar = bar;
    }
  });
}

/**
 * 解析符号
 */
function parseSymbol(fullName: string): { symbol: string } | null {
  const match = fullName.match(/^(\w+):(.+)$/);
  if (!match) {
    return null;
  }
  return {
    symbol: match[2],
  };
}

/**
 * 将 TradingView 分辨率映射到币安间隔
 */
function mapResolutionToInterval(resolution: ResolutionString): string {
  const mapping: Record<string, string> = {
    '1': '1m',
    '3': '3m',
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '1h',
    '120': '2h',
    '240': '4h',
    '360': '6h',
    '720': '12h',
    '1D': '1d',
    '1W': '1w',
    '1M': '1M',
  };
  return mapping[resolution] || '1m';
}

