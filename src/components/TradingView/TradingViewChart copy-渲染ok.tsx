import React, { useEffect, useRef, useState } from 'react';

const TradingViewChart = ({ 
  symbol = 'BTCUSDT',
  interval = '15',
  theme = 'dark',
  height = 600,
  hideTopBar = false
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 检查 TradingView 库是否加载
    if (typeof window.TradingView === 'undefined') {
      setError('TradingView 库未加载');
      setIsLoading(false);
      return;
    }

    if (!containerRef.current) {
      return;
    }

    let widget = null;
    let isMounted = true;

    const initializeChart = () => {
      try {
        // 彻底清空容器
        containerRef.current.innerHTML = '';

        // 创建新的容器
        const containerId = `tradingview_${Date.now()}`;
        const chartContainer = document.createElement('div');
        chartContainer.id = containerId;
        chartContainer.style.width = '100%';
        chartContainer.style.height = '100%';
        containerRef.current.appendChild(chartContainer);

        // 极简配置 - 只包含必需参数
        const widgetOptions = {
          // 必需参数
          container_id: containerId,
          symbol: `ETHUSDT`,
          interval: interval,
          
          // 基本配置
          theme: theme,
          style: '1',
          locale: 'en',
          timezone: 'Etc/UTC',
          
          // 功能配置
          enable_publishing: false,
          allow_symbol_change: true,
          hide_top_toolbar: hideTopBar,
          save_image: false,
          
          // 尺寸
          width: '100%',
          height: '100%',
          autosize: false, // 设置为 false 避免内部调整
          fullscreen: false,
          
          // 研究指标 'Volume@tv-basicstudies'
          studies: [],
          
          // 明确禁用 datafeed
          datafeed: undefined,
          
          // 简化样式覆盖
          overrides: {
            'paneProperties.background': theme === 'dark' ? '#0D1417' : '#FFFFFF',
            'mainSeriesProperties.candleStyle.upColor': '#0EECBC',
            'mainSeriesProperties.candleStyle.downColor': '#ef4444',
            'mainSeriesProperties.candleStyle.borderUpColor': '#0EECBC',
            'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
            'mainSeriesProperties.candleStyle.wickUpColor': '#0EECBC',
            'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
          },
          
          // 禁用可能引起问题的功能
          disabled_features: [
            'use_localstorage_for_settings',
            'header_widget',
            'symbol_info',
            'timeframes_toolbar',
          ],
          
          // 启用基本功能
          enabled_features: [
            'side_toolbar_in_fullscreen_mode',
          ],
        };

        console.log('初始化 TradingView Widget...');

        // 延迟初始化确保 DOM 准备好
        setTimeout(() => {
          if (!isMounted) return;

          try {
            widget = new window.TradingView.widget(widgetOptions);
            console.log('Widget 实例创建成功');

            // 监听图表就绪事件
            if (widget && typeof widget.onChartReady === 'function') {
              widget.onChartReady(() => {
                console.log('图表加载完成');
                if (isMounted) {
                  setIsLoading(false);
                  setError(null);
                }
              });
            }

            // 监听错误事件
            if (widget && typeof widget.onError === 'function') {
              widget.onError((error) => {
                console.error('Widget 错误:', error);
                if (isMounted) {
                  setError('图表加载失败');
                  setIsLoading(false);
                }
              });
            }

            // 备用：如果事件没触发，设置超时
            setTimeout(() => {
              if (isMounted && isLoading) {
                console.log('备用超时触发');
                setIsLoading(false);
              }
            }, 5000);

          } catch (widgetError) {
            console.error('Widget 创建错误:', widgetError);
            if (isMounted) {
              setError('创建图表失败: ' + widgetError.message);
              setIsLoading(false);
            }
          }
        }, 100);

      } catch (initError) {
        console.error('初始化错误:', initError);
        if (isMounted) {
          setError('初始化失败: ' + initError.message);
          setIsLoading(false);
        }
      }
    };

    // 延迟执行初始化
    const initTimer = setTimeout(initializeChart, 200);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      
      // 彻底清理 widget
      if (widget) {
        try {
          console.log('清理 Widget...');
          if (typeof widget.remove === 'function') {
            widget.remove();
          }
        } catch (removeError) {
          console.warn('清理 Widget 时出错:', removeError);
        }
        widget = null;
      }
      
      // 清理容器
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval, theme, hideTopBar]);

  const retry = () => {
    setError(null);
    setIsLoading(true);
  };

  return (
    <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme === 'dark' ? '#0D1417' : '#FFFFFF',
          zIndex: 10,
          color: theme === 'dark' ? '#FFFFFF' : '#000000',
          borderRadius: '8px',
        }}>
          加载 TradingView 图表中...
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme === 'dark' ? '#0D1417' : '#FFFFFF',
          zIndex: 20,
          color: theme === 'dark' ? '#FFFFFF' : '#000000',
          borderRadius: '8px',
        }}>
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
          <button 
            onClick={retry}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            重试
          </button>
        </div>
      )}
      
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          opacity: isLoading || error ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
};

export default TradingViewChart;