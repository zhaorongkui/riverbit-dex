import React, { useEffect, useRef } from 'react';
import { Datafeed } from './datafeed';
import './tradingViewChart.css';

declare global {
  interface Window {
    TradingView: any;
  }
}

export interface ChartWidgetOptions {
  container: HTMLElement;
  symbol?: string;
  interval?: string;
  theme?: string;
  autosize?: boolean;
  [key: string]: any;
}

const TradingViewChart = ({ 
  symbol = 'BTCUSDT',
  interval = '15',
  theme = 'dark',
  autosize = true,
  ...props 
}) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
  if (typeof window.TradingView === 'undefined') {
    console.error('TradingView library not loaded');
    return;
  }

  const cleanupWidget = () => {
    if (widgetRef.current) {
      try {
        widgetRef.current.destroy(); // 优先使用destroy方法
      } catch (error) {
        console.warn('Cleanup error:', error);
      }
      widgetRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  };

  cleanupWidget();

  // 确保容器已挂载到DOM
  if (!containerRef.current || !containerRef.current.parentNode) {
    console.error('Container not mounted');
    return;
  }

  const widgetOptions = {
    container: containerRef.current,
    symbol: symbol,
    interval: interval,
    fullscreen: autosize,
    autosize: autosize,
    theme: theme,
    style: '1',
    locale: 'zh_CN',
    toolbar_bg: '#f4f4f4',
    enable_publishing: false,
    allow_symbol_change: true,
    hide_side_toolbar: false,
    studies: ['MACD@tv-basicstudies', 'RSI@tv-basicstudies'],
    datafeed: new Datafeed(),
    library_path: '/charting_library/', // 确认路径正确
    timezone: 'Asia/Shanghai',
    debug: false,
    ...props
  };

  // 延迟创建，确保DOM就绪
  const timer = setTimeout(() => {
    try {
      widgetRef.current = new window.TradingView.widget(widgetOptions);
    } catch (error) {
      console.error('Widget creation error:', error);
    }
  }, 100);

  return () => {
    clearTimeout(timer);
    cleanupWidget();
  };
}, [symbol, interval, theme, autosize]);

  return (
    <div 
      ref={containerRef} 
      className="tradingview-widget-container"
      style={{ width: '100%', height: '100%', minHeight: '500px' }}
    />
  );
};

export default TradingViewChart;