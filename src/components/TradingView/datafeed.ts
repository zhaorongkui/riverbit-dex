/**
 * TradingView Datafeed 实现
 */
import type {
  HistoryCallback,
  LibrarySymbolInfo,
  OnReadyCallback,
  ResolutionString,
  ResolveCallback,
  SearchSymbolsCallback,
  SubscribeBarsCallback,
} from '../../../public/charting_library/charting_library.min.d';
import { subscribeOnStream, unsubscribeFromStream } from './streaming';
import {
  makeApiRequest,
  makeBinanceRequest,
  generateSymbol,
  parseFullSymbol,
  priceScale,
} from './helpers';

type ErrorCallback = (reason: string) => void;

interface DataFeedOptions {
  SymbolInfo?: LibrarySymbolInfo;
  DatafeedConfiguration?: any;
  getBars?: any;
}

const configurationData = {
  // Represents the resolutions for bars supported by your datafeed
  supported_resolutions: [
    '1',
    '5',
    '15',
    '1H',
    '4H',
    '1D',
    '3D',
    '1W',
    '1M',
  ] as ResolutionString[],
  // The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
  exchanges: [{ value: 'Binance', name: 'Binance', desc: 'Binance' }],
  // The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
  symbols_types: [{ name: 'crypto', value: 'crypto' }],
};

export const BINANCE_RESOLUSION: Record<string, string> = {
  '1': '1m',
  '3': '3m',
  '5': '5m',
  '15': '15m',
  '60': '1h',
  '120': '2h',
  '240': '4h',
  '360': '6h',
  '720': '12h',
  '1D': '1d',
  '2D': '2d',
  '3D': '3d',
  '1W': '1w',
  '1M': '1M',
};

/**
 * 获取所有交易对符号
 */
async function getAllSymbols() {
  try {
    const data = await makeApiRequest('data/v3/all/exchanges');
    let allSymbols: any[] = [];

    if (configurationData.exchanges) {
      for (const exchange of configurationData.exchanges) {
        const pairs = data.Data?.[exchange.value]?.pairs;

        if (pairs) {
          for (const leftPairPart of Object.keys(pairs)) {
            const symbols = pairs[leftPairPart].map((rightPairPart: any) => {
              const symbol = generateSymbol(exchange.value, leftPairPart, rightPairPart);
              return {
                symbol: symbol.short,
                full_name: symbol.full,
                description: symbol.short,
                exchange: exchange.value,
                type: 'crypto',
              };
            });
            allSymbols = [...allSymbols, ...symbols];
          }
        }
      }
      return allSymbols;
    } else {
      allSymbols = [
        {
          symbol: 'Token',
          full_name: 'Token full name',
          description: 'Description',
          exchange: 'Binance',
          type: 'crypto',
        },
      ];
      return allSymbols;
    }
  } catch (error) {
    console.error('[getAllSymbols] Error:', error);
    // 返回默认符号列表
    return [
      {
        symbol: 'BTCUSDT',
        full_name: 'Binance:BTCUSDT',
        description: 'Bitcoin / Tether',
        exchange: 'Binance',
        type: 'crypto',
      },
    ];
  }
}

/**
 * DefinedDataFeed 类实现 TradingView IExternalDatafeed 和 IDatafeedChartApi 接口
 */
export default class DefinedDataFeed {
  private options: DataFeedOptions;
  private lastBarsCache: Map<string, any>;

  constructor(options: DataFeedOptions = {}) {
    this.options = options;
    this.lastBarsCache = new Map();
    if (!options.DatafeedConfiguration) {
      this.options.DatafeedConfiguration = configurationData;
    }
  }

  /**
   * 当图表库准备好接收数据时调用
   */
  public async onReady(callback: OnReadyCallback): Promise<void> {
    console.log('[onReady]: Method call');
    setTimeout(() => callback(configurationData as any), 0);
  }

  /**
   * 搜索交易对符号
   */
  public async searchSymbols(
    userInput: string,
    exchange: string,
    _symbolType: string,
    onResultReadyCallback: SearchSymbolsCallback
  ): Promise<void> {
    console.log('[searchSymbols]: Method call', userInput);
    try {
      const symbols = await getAllSymbols();
      const newSymbols = symbols.filter((symbol) => {
        const isExchangeValid = exchange === '' || symbol.exchange === exchange;
        const isFullSymbolContainsInput =
          symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1;
        return isExchangeValid && isFullSymbolContainsInput;
      });
      onResultReadyCallback(newSymbols);
    } catch (error) {
      console.error('[searchSymbols] Error:', error);
      onResultReadyCallback([]);
    }
  }

  /**
   * 解析交易对符号
   */
  public async resolveSymbol(
    symbolName: string,
    onResolve: ResolveCallback,
    onError: ErrorCallback,
    _extension?: any
  ): Promise<void> {
    console.log('[resolveSymbol]: Method call', symbolName);
    try {
      const symbols = await getAllSymbols();
      
      // 首先尝试匹配完整符号名称（如 Binance:BTCUSDT）
      let symbolItem = symbols.find(({ full_name }) => full_name === symbolName);
      
      // 如果找不到，尝试匹配短符号名称（如 BTCUSDT）
      if (!symbolItem) {
        symbolItem = symbols.find(({ symbol }) => symbol === symbolName);
        
        // 如果还是找不到，尝试使用默认交易所前缀
        if (!symbolItem && !symbolName.includes(':')) {
          const defaultExchange = configurationData.exchanges?.[0]?.value || 'Binance';
          const fullSymbolName = `${defaultExchange}:${symbolName}`;
          symbolItem = symbols.find(({ full_name }) => full_name === fullSymbolName);
        }
      }

      // 如果仍然找不到，创建一个默认的符号信息
      if (!symbolItem) {
        console.log('[resolveSymbol]: Symbol not found, creating default symbol info for', symbolName);
        
        // 解析符号名称，提取交易所和交易对
        let exchange = 'Binance';
        let symbol = symbolName;
        
        if (symbolName.includes(':')) {
          const parts = symbolName.split(':');
          exchange = parts[0];
          symbol = parts[1];
        } else {
          // 如果没有交易所前缀，使用默认交易所
          exchange = configurationData.exchanges?.[0]?.value || 'Binance';
        }

        const symbolInfo: Partial<LibrarySymbolInfo> = {
          ticker: `${exchange}:${symbol}`,
          name: symbol,
          description: symbol,
          type: 'crypto',
          session: '24x7',
          timezone: 'Etc/UTC',
          exchange: exchange,
          minmov: 1,
          pricescale: priceScale('0.00000100'),
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: false,
          supported_resolutions: configurationData.supported_resolutions!,
          volume_precision: 8,
          data_status: 'streaming',
        };

        console.log('[resolveSymbol]: Symbol resolved (default)', symbolName);
        onResolve(symbolInfo as LibrarySymbolInfo);
        return;
      }

      const symbolInfo: Partial<LibrarySymbolInfo> = {
        ticker: symbolItem.full_name,
        name: symbolItem.symbol,
        description: symbolItem.description,
        type: symbolItem.type,
        session: '24x7',
        timezone: 'Etc/UTC',
        exchange: symbolItem.exchange,
        minmov: 1,
        pricescale: priceScale('0.00000100'), // 修改精度 priceScale('0.00000001'),
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: false,
        supported_resolutions: configurationData.supported_resolutions!,
        volume_precision: 8,
        data_status: 'streaming',
      };

      console.log('[resolveSymbol]: Symbol resolved', symbolName);
      onResolve(symbolInfo as LibrarySymbolInfo);
    } catch (error) {
      console.error('[resolveSymbol] Error:', error);
      // 即使出错，也尝试创建默认符号信息
      try {
        const defaultExchange = configurationData.exchanges?.[0]?.value || 'Binance';
        const symbol = symbolName.includes(':') ? symbolName.split(':')[1] : symbolName;
        const symbolInfo: Partial<LibrarySymbolInfo> = {
          ticker: `${defaultExchange}:${symbol}`,
          name: symbol,
          description: symbol,
          type: 'crypto',
          session: '24x7',
          timezone: 'Etc/UTC',
          exchange: defaultExchange,
          minmov: 1,
          pricescale: priceScale('0.00000100'),
          has_intraday: true,
          has_daily: true,
          has_weekly_and_monthly: false,
          supported_resolutions: configurationData.supported_resolutions!,
          volume_precision: 8,
          data_status: 'streaming',
        };
        onResolve(symbolInfo as LibrarySymbolInfo);
      } catch (fallbackError) {
        onError('failed to resolve symbol');
      }
    }
  }

  /**
   * 获取历史 K 线数据
   * 注意：根据 TradingView 类型定义，getBars 的签名是：
   * getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onResult, onError, isFirstCall)
   */
  public async getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    rangeStartDate: number,
    rangeEndDate: number,
    onResolve: HistoryCallback,
    onError: ErrorCallback,
    isFirstCall: boolean
  ): Promise<void> {
    const from = rangeStartDate;
    const to = rangeEndDate;
    console.log('[getBars]: Method call', symbolInfo, resolution, from, to, isFirstCall);

    // 验证时间参数
    if (from === undefined || to === undefined || isNaN(Number(from)) || isNaN(Number(to))) {
      console.error('[getBars]: Invalid time parameters', { from, to, rangeStartDate, rangeEndDate });
      onError('Invalid time parameters');
      return;
    }

    // 解析符号，支持带或不带交易所前缀
    let parsedSymbol = parseFullSymbol(symbolInfo.full_name);
    
    // 如果解析失败，尝试使用符号名称直接作为交易对
    if (!parsedSymbol) {
      const defaultExchange = configurationData.exchanges?.[0]?.value || 'Binance';
      if (symbolInfo.full_name.includes(':')) {
        const parts = symbolInfo.full_name.split(':');
        parsedSymbol = {
          exchange: parts[0],
          symbol: parts[1],
        };
      } else {
        parsedSymbol = {
          exchange: defaultExchange,
          symbol: symbolInfo.full_name,
        };
      }
    }
    
    if (parsedSymbol) {
      // 确保时间参数是有效的数字
      const startTime = Math.floor(from) * 1000;
      const endTime = Math.floor(to) * 1000;
      
      const urlParameters: Record<string, any> = {
        symbol: parsedSymbol.symbol,
        interval: BINANCE_RESOLUSION[resolution] || '1m',
        startTime: startTime,
        endTime: endTime,
        limit: 1000,
      };

      const query = Object.keys(urlParameters)
        .map(
          (name) =>
            `${name}=${encodeURIComponent(urlParameters[name])}`
        )
        .join('&');

      try {
        const data = await makeBinanceRequest(`api/v3/klines?${query}`);
        console.log('[getBars]: Request resolved', data);

        if (!data || data.length === 0) {
          // "noData" should be set if there is no data in the requested period
          onResolve([], { noData: true });
          return;
        }

        let bars: {
          time: number;
          low: number;
          high: number;
          open: number;
          close: number;
          volume: number;
        }[] = [];

        data.forEach((bar: any[]) => {
          if (parseInt(bar[0]) >= from * 1000 && parseInt(bar[0]) < to * 1000) {
            bars = [
              ...bars,
              {
                time: parseInt(bar[0]),
                open: parseFloat(bar[1]),
                high: parseFloat(bar[2]),
                low: parseFloat(bar[3]),
                close: parseFloat(bar[4]),
                volume: parseFloat(bar[5]),
              },
            ];
          }
        });

        if (isFirstCall && bars.length > 0) {
          this.lastBarsCache.set(symbolInfo.name, {
            ...bars[bars.length - 1],
          });
        }

        console.log(`[getBars]: returned ${bars.length} bar(s)`, bars);
        onResolve(bars, { noData: false });
      } catch (error) {
        console.log('[getBars]: Get error', error);
        onError(String(error));
      }
    } else {
      onError('Invalid symbol');
    }
  }

  /**
   * 订阅实时 K 线数据
   */
  public subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onRealtimeCallback: SubscribeBarsCallback,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void
  ): void {
    console.log(
      '[subscribeBars]: Method call with subscriberUID:',
      subscriberUID,
      symbolInfo,
      this.lastBarsCache
    );
    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      this.lastBarsCache.get(symbolInfo.name)
    );
  }

  /**
   * 取消订阅实时 K 线数据
   */
  public unsubscribeBars(subscriberUID: string): void {
    console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
    unsubscribeFromStream(subscriberUID);
  }
}

