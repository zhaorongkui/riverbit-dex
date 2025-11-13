/**
 * TradingViewChart 组件
 * 使用 public/charting_library 中的 TradingView 图表库
 * 
 * @param {string} symbol - 交易对符号，例如 'BTCUSDT'
 * @param {string} theme - 主题，'light' 或 'dark'
 * @param {string} interval - 时间间隔，例如 '1D', '1h', '15m' 等
 */
import React, { useEffect, useRef } from 'react';
import type {
  ChartingLibraryWidgetOptions,
  ResolutionString,
} from '../../../public/charting_library/charting_library.min.d';
import DefinedDataFeed from './datafeed';

interface TradingViewChartProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  interval?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = 'BTCUSDT',
  theme = 'dark',
  interval = '1D',
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tvWidgetRef = useRef<any>(null);
  const containerIdRef = useRef<string>(`tv_chart_container_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    // 创建 DefinedDataFeed 实例
    const datafeed = new DefinedDataFeed({});

    /**
     * 初始化图表
     */
    const initializeChart = async () => {
      if (!chartContainerRef.current) {
        return;
      }

      const container = chartContainerRef.current;
      
      // 确保容器有 ID
      if (!container.id) {
        container.id = containerIdRef.current;
      }

      // 确保容器是空的
      if (container.children.length > 0) {
        container.innerHTML = '';
      }

      // 确保容器有尺寸
      if (!container.offsetWidth || !container.offsetHeight) {
        setTimeout(() => {
          initializeChart();
        }, 100);
        return;
      }

      // 如果已经存在 widget，先移除
      if (tvWidgetRef.current) {
        try {
          tvWidgetRef.current.remove();
        } catch (error) {
          // 忽略移除错误
        }
        tvWidgetRef.current = null;
      }

      // 加载 TradingView widget
      const loadWidget = () => {
        // 检查 TradingView 是否已加载
        if ((window as any).TradingView?.widget) {
          const widgetOptions: ChartingLibraryWidgetOptions = {
            symbol: symbol,
            interval: interval as ResolutionString,
            container_id: container.id, // 使用 container_id 作为字符串 ID
            datafeed: datafeed as any,
            library_path: '/charting_library/',
            locale: 'zh',
            disabled_features: [
              'use_localstorage_for_settings',
              'header_widget_dom_node',
            ],
            enabled_features: ['study_templates'],
            charts_storage_url: 'https://saveload.tradingview.com',
            charts_storage_api_version: '1.1',
            client_id: 'tradingview.com',
            user_id: 'public_user_id',
            fullscreen: false,
            autosize: true,
            theme: theme === 'dark' ? 'Dark' : 'Light',
            timezone: 'Asia/Shanghai',
            // 设置背景颜色为 rgb(13, 20, 23) = #0D1417
            overrides: {
              'paneProperties.backgroundType': 'solid',
              'paneProperties.background': '#0D1417',
              'paneProperties.backgroundGradientStartColor': '#0D1417',
              'paneProperties.backgroundGradientEndColor': '#0D1417',
              'scalesProperties.backgroundColor': '#0D1417',
              'scalesProperties.lineColor': '#1E2A32',
              'scalesProperties.textColor': '#8B9AAA',
              // 工具栏和标题栏背景色
              'mainSeriesProperties.candleStyle.upColor': '#26a69a',
              'mainSeriesProperties.candleStyle.downColor': '#ef5350',
              'mainSeriesProperties.candleStyle.borderUpColor': '#26a69a',
              'mainSeriesProperties.candleStyle.borderDownColor': '#ef5350',
            },
            // 设置加载屏幕背景色
            loading_screen: {
              backgroundColor: '#0D1417',
              foregroundColor: '#0D1417',
            },
            // 设置工具栏背景色
            toolbar_bg: '#0D1417',
          };

          try {
            tvWidgetRef.current = new (window as any).TradingView.widget(widgetOptions);
          } catch (error) {
            console.error('Error creating TradingView widget:', error);
          }
        } else {
          // 如果未加载，动态加载脚本
          const existingScript = document.querySelector(
            'script[src="/charting_library/charting_library.min.js"]'
          );
          
          if (existingScript) {
            existingScript.addEventListener('load', loadWidget);
            return;
          }

          const script = document.createElement('script');
          script.src = '/charting_library/charting_library.min.js';
          script.onload = loadWidget;
          script.onerror = () => {
            console.error('Failed to load TradingView library');
          };
          document.head.appendChild(script);
        }
      };

      loadWidget();
    };

    // 使用 requestAnimationFrame 确保 DOM 已渲染
    requestAnimationFrame(() => {
      setTimeout(() => {
        initializeChart();
      }, 100);
    });

    return () => {
      if (tvWidgetRef.current) {
        try {
          tvWidgetRef.current.remove();
        } catch (error) {
          console.error('Error removing TradingView widget:', error);
        }
        tvWidgetRef.current = null;
      }
    };
  }, [symbol, theme, interval]);

  return (
    <div
      id={containerIdRef.current}
      ref={chartContainerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '450px',
      }}
    />
  );
};

export default TradingViewChart;