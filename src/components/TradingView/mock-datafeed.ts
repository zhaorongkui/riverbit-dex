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
  generateSymbol,
  parseFullSymbol,
  priceScale,
  generateTestBars,
  getResolutionInSeconds
} from './helpers';

type ErrorCallback = (reason: string) => void;

interface DataFeedOptions {
  SymbolInfo?: LibrarySymbolInfo;
  DatafeedConfiguration?: any;
  getBars?: any;
}

const configurationData = {
  supported_resolutions: [
    '1',
    '5',
    '15',
    '60', // 1H
    '240', // 4H
    '1D',
    '3D',
    '1W',
    '1M',
  ] as ResolutionString[],
  exchanges: [{ value: 'TestExchange', name: '测试交易所', desc: '测试用交易所' }],
  symbols_types: [{ name: 'crypto', value: 'crypto' }],
};

/**
 * 获取所有测试交易对符号
 */
async function getAllSymbols() {
  // 返回测试用的交易对列表
  return [
    {
      symbol: 'BTCUSDT',
      full_name: 'TestExchange:BTCUSDT',
      description: '比特币 / 泰达币',
      exchange: 'TestExchange',
      type: 'crypto',
    },
    {
      symbol: 'ETHUSDT',
      full_name: 'TestExchange:ETHUSDT',
      description: '以太坊 / 泰达币',
      exchange: 'TestExchange',
      type: 'crypto',
    },
    {
      symbol: 'BNBUSDT',
      full_name: 'TestExchange:BNBUSDT',
      description: '币安币 / 泰达币',
      exchange: 'TestExchange',
      type: 'crypto',
    }
  ];
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
      
      // 首先尝试匹配完整符号名称
      let symbolItem = symbols.find(({ full_name }) => full_name === symbolName);
      
      // 如果找不到，尝试匹配短符号名称
      if (!symbolItem) {
        symbolItem = symbols.find(({ symbol }) => symbol === symbolName);
        
        // 如果还是找不到，尝试使用默认交易所前缀
        if (!symbolItem && !symbolName.includes(':')) {
          const defaultExchange = configurationData.exchanges?.[0]?.value || 'TestExchange';
          const fullSymbolName = `${defaultExchange}:${symbolName}`;
          symbolItem = symbols.find(({ full_name }) => full_name === fullSymbolName);
        }
      }

      // 如果仍然找不到，创建一个默认的符号信息
      if (!symbolItem) {
        console.log('[resolveSymbol]: Symbol not found, creating default symbol info for', symbolName);
        
        let exchange = 'TestExchange';
        let symbol = symbolName;
        
        if (symbolName.includes(':')) {
          const parts = symbolName.split(':');
          exchange = parts[0];
          symbol = parts[1];
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
        pricescale: priceScale('0.00000100'),
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
        const defaultExchange = configurationData.exchanges?.[0]?.value || 'TestExchange';
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
   * 获取历史 K 线数据 - 使用测试数据
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
    const from = rangeStartDate * 1000; // 转换为毫秒
    const to = rangeEndDate * 1000;
    console.log('[getBars]: Method call', symbolInfo, resolution, from, to, isFirstCall);

    try {
      // 生成测试数据
      const bars = generateTestBars(symbolInfo.symbol, resolution, from, to);
      
      if (isFirstCall && bars.length > 0) {
        this.lastBarsCache.set(symbolInfo.name, {
          ...bars[bars.length - 1],
        });
      }

      console.log(`[getBars]: returned ${bars.length} bar(s)`);
      onResolve(bars, { noData: bars.length === 0 });
    } catch (error) {
      console.log('[getBars]: Get error', error);
      onError(String(error));
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