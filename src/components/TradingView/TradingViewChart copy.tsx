// TradingViewChart.jsx
import { useEffect, useRef, useState } from 'react';
import './tradingview-theme.css';

// 定义配置函数
const getWidgetOptions = (containerId: string) => {
  const disabledFeatures = [
    'header_symbol_search',
    'header_compare',
    'symbol_search_hot_key',
    'symbol_info',
    'go_to_date',
    'timeframes_toolbar',
    'header_layouttoggle',
    'trading_account_manager',
  ];

  return {
    container: containerId,
    library_path: '/tradingview/',  // 保持不变（与 public 下的 tradingview 文件夹对应）
    custom_css_url: '/tradingview/custom-styles.css',  // 确保与实际 URL 一致
    custom_font_family: "'Satoshi', system-ui, -apple-system, Helvetica, Arial, sans-serif",
    autosize: true,
    disabled_features: disabledFeatures,
    timezone: 'Etc/UTC',
    enabled_features: [
      'remove_library_container_border',
      'hide_last_na_study_output',
      'dont_show_boolean_study_arguments',
      'hide_left_toolbar_by_default',
      'hide_right_toolbar',
    ],
  };
};

const tradingViewSymbolMap = {
  'BTC-USD': 'BINANCE:BTCUSDT',
  'ETH-USD': 'BINANCE:ETHUSDT',
  'SOL-USD': 'BINANCE:SOLUSDT',
  'HYPE-USD': 'BINANCE:BTCUSDT',
  'HYPE/USDC': 'BINANCE:BTCUSDT',
  xTSLA: 'NASDAQ:TSLA',
  xAAPL: 'NASDAQ:AAPL',
  xNVDA: 'NASDAQ:NVDA',
  xMSFT: 'NASDAQ:MSFT'
};

const intervalMap = {
  '1m': '1',
  '5m': '5',
  '15m': '15',
  '1h': '60',
  '1d': 'D'
};

const mapToTradingViewSymbol = (symbol) => {
  return tradingViewSymbolMap[symbol] || 'BINANCE:BTCUSDT';
};

const TradingViewChart = ({ granularity, selectedAssetSymbol }) => {
  const chartRef = useRef(null);
  const widgetRef = useRef(null);
  const containerIdRef = useRef(
    `tradingview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 动态向 iframe 注入外部 CSS + 内联样式
    const injectStyles = () => {
      const tvIframe = document.querySelector('iframe[src*="tradingview.com"]');
      if (!tvIframe || !tvIframe.contentDocument) return;
  
      const iframeDoc = tvIframe.contentDocument;
  
      // 1. 注入外部 CSS 文件（保留原有逻辑）
      const link = iframeDoc.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/tradingview/custom-styles.css';
      link.onload = () => console.log('外部 CSS 加载成功');
      link.onerror = () => console.error('外部 CSS 加载失败');
      iframeDoc.head.appendChild(link);
  
      // 2. 添加内联样式（新增逻辑）
      const style = iframeDoc.createElement('style');
      style.id = 'tv-inline-styles'; // 加唯一 ID 方便后续管理
      // 内联样式内容（直接写 CSS 规则，优先级高于外部 CSS）
      style.textContent = `
        /* 覆盖 .group-MBOVGQRI 样式 */
        .group-MBOVGQRI {
          background-color: #0D1417 !important;
          border-color: #1E2A32 !important;
        }
  
        /* 补充其他需要强制覆盖的样式 */
        [class^="group-"] { /* 匹配所有以 group- 开头的类（应对类名变化） */
          background-color: #0D1417 !important;
        }
  
        .tv-chart-container {
          background-color: #0D1417 !important;
        }
  
        .tv-time-scale {
          background-color: #0D1417 !important;
        }
      `;
      iframeDoc.head.appendChild(style);
    };
  
    // 等待 iframe 加载完成后执行
    const interval = setInterval(() => {
      const tvIframe = document.querySelector('iframe[src*="tradingview.com"]');
      if (tvIframe && tvIframe.contentDocument?.readyState === 'complete') {
        clearInterval(interval);
        injectStyles(); // 调用合并后的注入函数
      }
    }, 300);
  
    return () => clearInterval(interval);
  }, []);

  



  const tradingViewInterval = intervalMap[granularity] || '60';
  const tradingViewSymbol = mapToTradingViewSymbol(selectedAssetSymbol);

  useEffect(() => {
    let script = null;
    let retryCount = 0;
    const maxRetries = 3;

    const cleanup = () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
          widgetRef.current = null;
        } catch (e) {
          console.warn('Cleanup warning:', e);
        }
      }
    };

    const initChart = () => {
      if (!chartRef.current) {
        console.error('Chart container not found');
        setError('图表容器未找到');
        setLoading(false);
        return;
      }

      if (!window.TradingView) {
        console.error('TradingView not available');
        setError('TradingView 库未加载');
        setLoading(false);
        return;
      }

      try {
        cleanup();

        // 确保容器存在且可见
        const container = document.getElementById(containerIdRef.current);
        if (!container) {
          console.error('Container element not found');
          return;
        }

        widgetRef.current = new window.TradingView.widget({
          ...getWidgetOptions(containerIdRef.current),
          autosize: true,
          symbol: tradingViewSymbol,
          interval: tradingViewInterval,
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          enable_publishing: false,
          allow_symbol_change: true,
          save_image: true,
          container_id: containerIdRef.current,
          hide_side_toolbar: false,

          // 简化配置，先确保基本功能
          studies: [], // 'Volume@tv-basicstudies'
          hide_volume: false, // 确保主成交量显示

          // === 禁用可能导致重复的功能 ===
          disabled_features: [
            "use_localstorage_for_settings",
            // 'volume_force_overlay', // 禁止成交量叠加显示
            // 'create_volume_indicator_by_default', // 禁止默认创建成交量指标
            // 'use_localstorage_for_settings', // 避免保存错误设置
            // 'left_toolbar', // 隐藏左侧工具栏（可选）
            // 'header_widget', // 隐藏头部小部件（可选）
            // 'timeframes_toolbar' // 隐藏时间框架工具栏（可选）
          ],
          // === 启用必要的功能 ===
          enabled_features: [
            'side_toolbar_in_fullscreen_mode',
            'header_in_fullscreen_mode',
            // 'hide_left_toolbar_by_default', // 强制隐藏左侧工具栏
            'header_screenshot', // 确保截图功能启用
            'save_chart_screenshot', // 启用图表截图功能
          ],

          // 自定义样式配置
          overrides: {
            // 图表背景颜色 - 设置整个图表区域的背景色
            'paneProperties.background': '#0D1417', // 深蓝色背景0f172a
            // 垂直网格线颜色 - 时间轴的网格线
            'paneProperties.vertGridProperties.color': '#1e293b', // 深灰色网格线
            // 水平网格线颜色 - 价格轴的网格线
            'paneProperties.horzGridProperties.color': '#1e293b', // 深灰色网格线
            // 水印透明度 - TradingView logo 的透明度
            'symbolWatermarkProperties.transparency': 90, // 90% 透明度（几乎看不见）
            // 坐标轴文字颜色 - 价格和时间的刻度文字
            'scalesProperties.textColor': '#94a3b8', // 浅灰色文字

            // K线图样式配置
            // 上涨K线颜色 - 阳线主体颜色
            'mainSeriesProperties.candleStyle.upColor': '#0EECBC', // 绿色 原来（#22c55e）
            // 下跌K线颜色 - 阴线主体颜色
            'mainSeriesProperties.candleStyle.downColor': '#D74251', // 红色
            // 上涨K线边框颜色 - 阳线边框
            'mainSeriesProperties.candleStyle.borderUpColor': '#0EECBC', // 绿色边框
            // 下跌K线边框颜色 - 阴线边框
            'mainSeriesProperties.candleStyle.borderDownColor': '#D74251', // 红色边框
            // 上涨K线影线颜色 - 阳线上影线和下影线
            'mainSeriesProperties.candleStyle.wickUpColor': '#0EECBC', // 绿色影线
            // 下跌K线影线颜色 - 阴线上影线和下影线
            'mainSeriesProperties.candleStyle.wickDownColor': '#D74251', // 红色影线


            // === 工具栏背景 ===
            'toolbar.background.color': '#0D1417', // 工具栏背景
            'toolbar.separator.color': '#1E2A32', // 工具栏分隔线

            // === 左边工具栏背景色 ===
            'side_toolbar.background.color': '#0D1417',
            'side_toolbar.backgroundColor': '#0D1417',
            
            // === 左侧面板背景 ===
            'left_toolbar.background.color': '#0D1417',
            'left_toolbar.backgroundColor': '#0D1417',
            
            // === 工具栏按钮背景 ===
            'toolbar.backgroundColor': '#0D1417',
            
            // === 图表容器背景 ===
            'container.backgroundColor': '#0D1417',
            
            // === 价格标签背景 ===
            'mainSeriesProperties.priceLine.color': '#3b82f6',

            // === 时间轴背景 ===
            'timeScale.paneBackgroundColor': '#0D1417', // 时间轴区域背景
            'timeScale.borderColor': '#1E2A32', // 时间轴边框
            'timeScale.textColor': '#8B9AAA', // 时间轴文字

            // === 图例背景 ===
            legendBackgroundColor: '#0D1417', // 图例背景
            legendTextColor: '#FFFFFF', // 图例文字

            // === 成交量面板背景 ===
            'volume.paneProperties.background': '#0D1417', // 成交量区域背景

            // === 侧边栏背景 ===
            sidePanelBackgroundColor: '#0D1417', // 侧边栏背景
            sidePanelTextColor: '#8B9AAA', // 侧边栏文字

            // === 按钮样式 ===
            'toolbar.button.background.color': '#1E2A32', // 按钮背景
            'toolbar.button.hover.background.color': '#2A3842', // 按钮悬停背景
            'toolbar.button.pressed.background.color': '#354652', // 按钮按下背景
            'toolbar.textColor': '#FFFFFF', // 工具栏文字颜色

            // === 对话框和弹出框背景 ===
            'dialog.backgroundColor': '#0D1417', // 对话框背景
            'dialog.borderColor': '#1E2A32', // 对话框边框
            'dialog.textColor': '#FFFFFF', // 对话框文字

            // === 下拉菜单背景 ===
            'dropdown.backgroundColor': '#0D1417', // 下拉菜单背景
            'dropdown.borderColor': '#1E2A32', // 下拉菜单边框
            'dropdown.textColor': '#FFFFFF', // 下拉菜单文字

            
          },

          // 技术指标样式覆盖
          studies_overrides: {
            // 成交量指标配置
            // 下跌时的成交量颜色 - 对应阴线的成交量柱
            'volume.volume.color.0': 'rgba(215, 66, 81, 0.5)', // 半透明红色
            // 上涨时的成交量颜色 - 对应阳线的成交量柱
            'volume.volume.color.1': 'rgba(14, 236, 188, 0.5)', // 半透明绿色
            // 成交量柱的透明度
            'volume.volume.transparency': 70 // 70% 不透明度
            // 'volume.volume.display': 'histogram', // 确保显示为柱状图
          }
        });

        console.log('TradingView chart initialized successfully');
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error('Error initializing TradingView chart:', error);
        setError(`图表初始化失败: ${error.message}`);
        setLoading(false);
      }
    };

    const loadTradingViewScript = () => {
      // 检查是否已加载
      if (window.TradingView) {
        console.log('TradingView already loaded');
        initChart();
        return;
      }

      // 检查是否正在加载
      if (
        document.querySelector('script[src="https://s3.tradingview.com/tv.js"]')
      ) {
        console.log('TradingView script already loading');
        // 等待脚本加载完成
        const checkInterval = setInterval(() => {
          if (window.TradingView) {
            clearInterval(checkInterval);
            initChart();
          }
        }, 100);
        setTimeout(() => clearInterval(checkInterval), 5000);
        return;
      }

      // 创建并加载脚本
      script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;

      script.onload = () => {
        console.log('TradingView script loaded successfully');
        // 给一点时间让库完全初始化
        setTimeout(initChart, 100);
      };

      script.onerror = (err) => {
        console.error('Failed to load TradingView script:', err);
        setError('加载 TradingView 脚本失败，请检查网络连接');
        setLoading(false);

        // 重试机制
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(
            `Retrying to load script (${retryCount}/${maxRetries})...`
          );
          setTimeout(loadTradingViewScript, 2000 * retryCount);
        }
      };

      document.head.appendChild(script);
    };

    setLoading(true);
    loadTradingViewScript();

    // 清理函数
    return () => {
      cleanup();
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [tradingViewSymbol, tradingViewInterval]);

  


  return (
    <div className="relative h-full min-h-[450px] w-full bg-gray-100 rounded-lg">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">加载图表中...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <div className="text-center p-4">
            <div className="text-red-500 text-lg mb-2">⚠️</div>
            <p className="text-red-600 font-medium">图表加载失败</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              重新加载
            </button>
          </div>
        </div>
      )}

      <div
        ref={chartRef}
        id={containerIdRef.current}
        className={`h-full w-full tradingviewCom ${loading || error ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export default TradingViewChart;
