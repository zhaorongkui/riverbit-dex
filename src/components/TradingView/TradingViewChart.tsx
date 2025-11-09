// components/TradingViewChart.js
import React, { useEffect, useRef } from 'react';

const TradingViewChart = () => {
  const chartContainerRef = useRef(null);
  const tvWidgetRef = useRef(null);

  useEffect(() => {
    // 确保在客户端执行
    if (typeof window !== 'undefined' && chartContainerRef.current) {
      // 动态导入 TradingView 库
      const script = document.createElement('script');
      script.src = '/charting_library/charting_library.min.js';
      script.async = true;
      
      script.onload = () => {
        initializeChart();
      };

      document.head.appendChild(script);

      return () => {
        // 清理函数
        if (tvWidgetRef.current) {
          tvWidgetRef.current.remove();
          tvWidgetRef.current = null;
        }
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, []);

  const initializeChart = () => {
    const widgetOptions = {
      symbol: 'BTCUSDT', // 默认交易对
      interval: '1D',    // 时间间隔
      container: chartContainerRef.current,
      datafeed: new window.Datafeeds.UDFCompatibleDatafeed(
        '/datafeeds/udf'
      ),
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

    tvWidgetRef.current = new window.TradingView.widget(widgetOptions);
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