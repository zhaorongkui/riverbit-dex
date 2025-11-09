// // 自定义 Datafeed 实现（基础版）
// class BinanceDatafeed {
//   constructor() {
//     // 币安 API 基础地址
//     this.baseUrl = 'https://api.binance.com/api/v3';
//   }

//   // 初始化回调（必须实现）
//   onReady(callback) {
//     // 告诉图表支持的时间周期、功能等
//     setTimeout(() => {
//       callback({
//         supported_resolutions: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'], // 币安支持的周期
//         supports_marks: false,
//         supports_time: true,
//       });
//     }, 0);
//   }

//   // 解析交易对信息（必须实现）
//   resolveSymbol(symbolName, onSymbolResolvedCallback, onErrorCallback) {
//     // symbolName 格式为 "BINANCE:BTCUSDT"
//     const [exchange, symbol] = symbolName.split(':');
//     if (!symbol) {
//       onErrorCallback('Invalid symbol');
//       return;
//     }

//     // 模拟交易对信息（实际项目需从 API 获取）
//     const symbolInfo = {
//       symbol: symbol,
//       exchange: exchange,
//       full_name: symbolName,
//       description: symbol,
//       type: 'crypto',
//       session: '24x7', // 加密货币全天交易
//       timezone: 'UTC',
//       minmov: 1, // 最小波动单位
//       pricescale: 100000000, // 价格精度（1e8 对应 8 位小数）
//       has_intraday: true,
//       has_no_volume: false,
//       volume_precision: 0,
//       data_status: 'streaming',
//     };

//     onSymbolResolvedCallback(symbolInfo);
//   }

//   // 获取历史 K 线数据（必须实现）
//   getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
//     // 转换 TradingView 周期为币安周期（如 '15' -> '15m'）
//     const binanceResolution = resolution === 'D' ? '1d' : 
//                              resolution === 'W' ? '1w' : 
//                              resolution === 'M' ? '1M' : 
//                              `${resolution}m`;

//     // 币安 K 线 API 参数
//     const params = new URLSearchParams({
//       symbol: symbolInfo.symbol,
//       interval: binanceResolution,
//       startTime: from * 1000, // 转换为毫秒
//       endTime: to * 1000,
//       limit: 1000,
//     });

//     // 调用币安 API 获取 K 线
//     fetch(`${this.baseUrl}/klines?${params}`)
//       .then(response => response.json())
//       .then(data => {
//         if (data.length === 0) {
//           onHistoryCallback([], { noData: true });
//           return;
//         }

//         // 转换数据格式为 TradingView 要求的结构
//         const bars = data.map(item => ({
//           time: item[0], // 时间戳（毫秒）
//           open: parseFloat(item[1]),
//           high: parseFloat(item[2]),
//           low: parseFloat(item[3]),
//           close: parseFloat(item[4]),
//           volume: parseFloat(item[5]),
//         }));

//         onHistoryCallback(bars, { noData: false });
//       })
//       .catch(error => {
//         console.error('获取 K 线数据失败:', error);
//         onErrorCallback(error);
//       });
//   }

//   // 可选：订阅实时数据（如需实时更新）
//   subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
//     // 实际项目需实现 WebSocket 订阅逻辑
//     console.log('订阅实时数据:', subscriberUID);
//   }

//   // 可选：取消订阅实时数据
//   unsubscribeBars(subscriberUID) {
//     console.log('取消订阅实时数据:', subscriberUID);
//   }
// }
// export default BinanceDatafeed;

export class Datafeed {
  constructor(apiUrl = '/v4') {
    this.apiUrl = apiUrl;
  }

  onReady(callback) {
    setTimeout(() => callback({
      supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'],
      supports_time: true,
      supports_marks: false,
      supports_timescale_marks: false,
      supports_search: true,
    }));
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    const symbolInfo = {
      name: symbolName,
      full_name: symbolName,
      description: symbolName,
      type: 'crypto',
      session: '24x7',
      timezone: 'UTC',
      ticker: symbolName,
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_no_volume: false,
      has_weekly_and_monthly: true,
      supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'],
      volume_precision: 8,
      data_status: 'streaming',
    };
    
    setTimeout(() => onSymbolResolvedCallback(symbolInfo));
  }

  getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
    // 这里调用你的后端API获取K线数据
    const params = {
      symbol: symbolInfo.name,
      resolution: resolution,
      from: Math.floor(from),
      to: Math.floor(to),
    };

    fetch(`${this.apiUrl}/candles/perpetualMarkets/BTC-USD?${new URLSearchParams(params)}`)
      .then(response => response.json())
      .then(data => {
        if (data.s === 'ok' || data.s === 'no_data') {
          const bars = [];
          if (data.t) {
            for (let i = 0; i < data.t.length; i++) {
              bars.push({
                time: data.t[i] * 1000, // 转换为毫秒
                open: data.o[i],
                high: data.h[i],
                low: data.l[i],
                close: data.c[i],
                volume: data.v[i],
              });
            }
          }
          onHistoryCallback(bars, { noData: data.s === 'no_data' });
        } else {
          onErrorCallback('Error loading data');
        }
      })
      .catch(error => {
        console.error('Datafeed error:', error);
        onErrorCallback('Network error');
      });
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    // 实现实时数据订阅（WebSocket）
    console.log('Subscribe to realtime bars');
  }

  unsubscribeBars(subscriberUID) {
    // 取消订阅
    console.log('Unsubscribe from realtime bars');
  }

  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    // 实现搜索功能
    onResultReadyCallback([]);
  }
}