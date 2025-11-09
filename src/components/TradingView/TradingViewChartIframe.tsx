import React, { useState } from 'react';

const TradingViewChart = ({ 
  symbol = 'BTCUSDT',
  interval = '15',
  theme = 'dark',
  height = 600,
  hideTopBar = false
}) => {
  const [isLoading, setIsLoading] = useState(true);

  // TradingView 高级图表嵌入
  const iframeSrc = `https://s.tradingview.com/widgetembed/?hideideas=1&overrides=%7B%22paneProperties.background%22%3A%22%230D1417%22%2C%22paneProperties.vertGridProperties.color%22%3A%22%231e293b%22%2C%22paneProperties.horzGridProperties.color%22%3A%22%231e293b%22%2C%22symbolWatermarkProperties.transparency%22%3A90%2C%22scalesProperties.textColor%22%3A%22%2394a3b8%22%2C%22mainSeriesProperties.candleStyle.upColor%22%3A%22%230EECBC%22%2C%22mainSeriesProperties.candleStyle.downColor%22%3A%22%23ef4444%22%2C%22mainSeriesProperties.candleStyle.borderUpColor%22%3A%22%230EECBC%22%2C%22mainSeriesProperties.candleStyle.borderDownColor%22%3A%22%23ef4444%22%2C%22mainSeriesProperties.candleStyle.wickUpColor%22%3A%22%230EECBC%22%2C%22mainSeriesProperties.candleStyle.wickDownColor%22%3A%22%23ef4444%22%2C%22toolbar.background.color%22%3A%22%230D1417%22%2C%22toolbar.separator.color%22%3A%22%231E2A32%22%2C%22side_toolbar.background.color%22%3A%22%230D1417%22%2C%22side_toolbar.backgroundColor%22%3A%22%230D1417%22%2C%22left_toolbar.background.color%22%3A%22%230D1417%22%2C%22left_toolbar.backgroundColor%22%3A%22%230D1417%22%2C%22toolbar.backgroundColor%22%3A%22%230D1417%22%2C%22container.backgroundColor%22%3A%22%230D1417%22%2C%22mainSeriesProperties.priceLine.color%22%3A%22%233b82f6%22%2C%22timeScale.paneBackgroundColor%22%3A%22%230D1417%22%2C%22timeScale.borderColor%22%3A%22%231E2A32%22%2C%22timeScale.textColor%22%3A%22%238B9AAA%22%2C%22legendBackgroundColor%22%3A%22%230D1417%22%2C%22legendTextColor%22%3A%22%23FFFFFF%22%2C%22volume.paneProperties.background%22%3A%22%230D1417%22%2C%22sidePanelBackgroundColor%22%3A%22%230D1417%22%2C%22sidePanelTextColor%22%3A%22%238B9AAA%22%2C%22toolbar.button.background.color%22%3A%22%231E2A32%22%2C%22toolbar.button.hover.background.color%22%3A%22%232A3842%22%2C%22toolbar.button.pressed.background.color%22%3A%22%23354652%22%2C%22toolbar.textColor%22%3A%22%23FFFFFF%22%2C%22dialog.backgroundColor%22%3A%22%230D1417%22%2C%22dialog.borderColor%22%3A%22%231E2A32%22%2C%22dialog.textColor%22%3A%22%23FFFFFF%22%2C%22dropdown.backgroundColor%22%3A%22%230D1417%22%2C%22dropdown.borderColor%22%3A%22%231E2A32%22%2C%22dropdown.textColor%22%3A%22%23FFFFFF%22%7D&enabled_features=%5B%22side_toolbar_in_fullscreen_mode%22%2C%22header_in_fullscreen_mode%22%2C%22header_screenshot%22%2C%22save_chart_screenshot%22%5D&disabled_features=%5B%22use_localstorage_for_settings%22%5D&locale=en#%7B%22symbol%22%3A%22BINANCE%3AETHUSDT%22%2C%22frameElementId%22%3A%22tradingview_92571%22%2C%22interval%22%3A%2260%22%2C%22hide_side_toolbar%22%3A%220%22%2C%22allow_symbol_change%22%3A%221%22%2C%22save_image%22%3A%221%22%2C%22studies%22%3A%22%5B%5D%22%2C%22theme%22%3A%22dark%22%2C%22style%22%3A%221%22%2C%22timezone%22%3A%22Etc%2FUTC%22%2C%22studies_overrides%22%3A%22%7B%5C%22volume.volume.color.0%5C%22%3A%5C%22rgba(239%2C%2068%2C%2068%2C%200.5)%5C%22%2C%5C%22volume.volume.color.1%5C%22%3A%5C%22rgba(14%2C%20236%2C%20188%2C%200.5)%5C%22%2C%5C%22volume.volume.transparency%5C%22%3A70%7D%22%2C%22utm_source%22%3A%22localhost%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22chart%22%2C%22utm_term%22%3A%22BINANCE%3AETHUSDT%22%2C%22page-uri%22%3A%22localhost%3A5173%2Ftrading%22%7D`;

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
          backgroundColor: theme === 'dark' ? '#131722' : '#FFFFFF',
          zIndex: 10,
          color: theme === 'dark' ? '#FFFFFF' : '#000000'
        }}>
          加载 TradingView 图表中...
        </div>
      )}
      <iframe
        src={iframeSrc}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px',
          display: isLoading ? 'none' : 'block'
        }}
        onLoad={() => setIsLoading(false)}
        title={`TradingView Chart - ${symbol}`}
        id={`tradingview_${symbol}`}
        allowFullScreen
      />
    </div>
  );
};

export default TradingViewChart;