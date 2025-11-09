// components/TradingViewChart.tsx
import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
    Datafeeds?: any;
  }
}

const TradingViewChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tvWidgetRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && chartContainerRef.current) {
      // 先加载基础的 datafeed 文件
      loadScript('/datafeeds/udf/src/udf-compatible-datafeed.js', () => {
        // 然后加载图表库
        loadScript('/charting_library/charting_library.js', initializeChart);
      });

      return () => {
        if (tvWidgetRef.current) {
          tvWidgetRef.current.remove();
          tvWidgetRef.current = null;
        }
      };
    }
  }, []);

  const loadScript = (src: string, onLoad: () => void) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = onLoad;
    script.onerror = () => {
      console.error(`Failed to load script: ${src}`);
    };
    document.head.appendChild(script);
  };

  const initializeChart = () => {
    if (!chartContainerRef.current) {
      console.error('Chart container not available');
      return;
    }

    // 检查 Datafeeds 是否已加载
    if (!window.Datafeeds) {
      console.error('Datafeeds not loaded');
      return;
    }

    const widgetOptions = {
      symbol: 'BTCUSDT',
      interval: '1D',
      container: chartContainerRef.current,
      datafeed: new window.Datafeeds.UDFCompatibleDatafeed('/datafeeds/udf'),
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
      theme: 'dark',
      timezone: 'Asia/Shanghai',
    };

    try {
      tvWidgetRef.current = new window.TradingView.widget(widgetOptions);
    } catch (error) {
      console.error('Error creating TradingView widget:', error);
    }
  };

  return (
    <div 
      ref={chartContainerRef} 
      style={{ 
        width: '100%', 
        height: '500px',
        border: '1px solid #2a2e39',
        borderRadius: '8px'
      }} 
    />
  );
};

export default TradingViewChart;