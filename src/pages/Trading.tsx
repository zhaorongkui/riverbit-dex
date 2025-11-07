import { useState, useRef, useEffect, useCallback } from 'react';
import RiverbitLogo from '../components/RiverbitLogo';
import PrimaryButton from '../components/Button/PrimaryButton';
import Tabs from '../components/Tabs';
import TPSLModal from '../components/TPSLModal';
import AdjustMarginModal from '../components/AdjustMarginModal';
import ToggleButton from '../components/ToggleButton';
import Tips from '../components/Tips';
import ToggleWithText from '../components/ToggleWithText';
import Select from '../components/Select';
import AdjustLeverageModal from '../components/AdjustLeverageModal';
import AIChatWidget from '../components/AIChatWidget';
import Toast from '../components/Toast';
import ConfirmCloseModal from '../components/ConfirmCloseModal';
import ConfirmCancelModal from '../components/ConfirmCancelModal';
import ShareModal from '../components/ShareModal';
import OrderBook from '../components/OrderBook';
import Trades from '../components/Trades';
import AmountInput from '../components/AmountInput';
import CategoryTab from '../components/CategoryTab';
import AdjustOrderModal from '../components/AdjustOrderModal';
import useWebSocket from '../hooks/useWebSocket';
import {
  getOrderbooks,
  getTradesHistory,
  getOrders,
  getPerpetualPositions,
  getOrdersByStatus,
  getLatestOrders,
  getPnlData,
  getPerpetual,
  getFundingPayments, // 获取资金支付
  getPerpetualMarkets
} from '../api/indexer';
import { getBalancesByAddress } from '../api/protocol';
import { formatDate } from '@/utils/date';
import TradingViewChart from '../components/TradingView/TradingViewChart';

const Trading = () => {
  const [input1, onChangeInput1] = useState('');
  const [input3, onChangeInput3] = useState('');
  const [input4, onChangeInput4] = useState('');
  const [input5, onChangeInput5] = useState('');
  const [input6, onChangeInput6] = useState('');
  const [input7, onChangeInput7] = useState('');
  const [input8, onChangeInput8] = useState('');
  const [input9, onChangeInput9] = useState('');
  const [input10, onChangeInput10] = useState('');
  const [input11, onChangeInput11] = useState('Strict');
  const [inputTPSLPrice, setInputTPSLPrice] = useState('');
  const [inputTPSLPercent, setInputTPSLPercent] = useState('');
  const [isOn, setIsOn] = useState(false);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [orderPanelTab, setOrderPanelTab] = useState('Market');
  const [orderBookTab, setOrderBookTab] = useState('Order Book');
  const [accountTab, setAccountTab] = useState('Balance');
  const [searchCategoryTab, setSearchCategoryTab] = useState('All Coins');
  const [savedSymbols, setSavedSymbols] = useState<string[]>([]);
  const [granularity, setGranularity] = useState('1h');
  const [stoplossType, setStoplossType] = useState('Stop Market');
  const [indicator, setIndicator] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [tif, setTif] = useState('GTC');
  const [showTifTooltip, setShowTifTooltip] = useState(false);
  const [leverage, setLeverage] = useState<number>(20);
  const [crossSelected, setCrossSelected] = useState<boolean>(true);
  const [showAIWidget, setShowAIWidget] = useState(false);
  const [showAssetPopup, setShowAssetPopup] = useState(false);
  const [showAdjustLeverageModal, setShowAdjustLeverageModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCloseAllModal, setShowCloseAllModal] = useState(false);
  const [modalCoin, setModalCoin] = useState('');
  const [modalLiqPrice, setModalLiqPrice] = useState('');
  const [modalPercent, setModalPercent] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAllTradeHistory, setShowAllTradeHistory] = useState(false);
  const [showAllFundingHistory, setShowAllFundingHistory] = useState(false);
  const [showAllOrderHistory, setShowAllOrderHistory] = useState(false);
  const [unitGranularity, setUnitGranularity] = useState('0.001');
  const [perpetualMarkets, setPerpetualMarkets] = useState({});
  const [perpetualMarketsInType, setPerpetualMarketsInType] = useState({});

  // Amount Input
  const [amount, setAmount] = useState<number>(0); // number

  // Assume a total for percent calculation
  const AMOUNT_TOTAL = 1000;
  // Calculate percent from amount
  const percentValue = amount
    ? Math.max(
        0,
        Math.min(100, Math.round((Number(amount) / AMOUNT_TOTAL) * 100))
      )
    : 0;

  const handleClosePosition = (coinName: string) => {
    // TODO: 實際平倉邏輯，例如更新 table data
    console.log('Closing position for', coinName);
  };

  const handleCloseAllConfirm = () => {
    console.log('Confirmed: close all positions');
    // 清空所有持仓
    setPositions([]);
    setShowCloseAllModal(false);
  };

  // Open Orders Table component
  const [cancelModalOrder, setCancelModalOrder] = useState<null | {
    id: number;
    coin: string;
    price: string;
  }>(null);

  const [orderBookType, setOrderBookType] = useState<string>('BTC-USD');
  const [orderBookData, setOrderBookData] = useState({});

  const [tradesData, setTradesData] = useState({});

  const wsConfig = {
    autoReconnect: true, // 是否自动重连
    reconnectInterval: 3000, // 初始重连间隔
    maxReconnectAttempts: 10 // 最大重连次数
  };

  useWebSocket(
    // 传递给后端的参数,用来区分不同的订阅频道
    {
      type: 'subscribe',
      channel: 'v4_markets',
      id: orderBookType || 'BTC-USD' // 获取币种时时获取数据
    },
    {
      ...wsConfig,
      onMessage: (data) => {
        const value = data?.contents?.markets[orderBookType];
        setPerpetualMarketsInType(value);
        console.log('【最新BTC-USD市场交易数据---->】', data);
      }
    }
  );

  // 获取买卖盘订单簿数据
  const getOrderbooksData = async () => {
    const res = await getOrderbooks(orderBookType);
    // console.log(8888888, res);
    setOrderBookData(res);
  };
  const getTradesHistoryList = async () => {
    const tradRes = await getTradesHistory(orderBookType);
    setTradesData(tradRes);
    setTradeHistory([...tradRes.trades]);
  };
  // const address = 'dydx1abc123def456ghi789jkl012mno345pqr678stu901vwx';
  const address = 'river199tqg4wdlnu4qjlxchpd7seg454937hjzn0qfk';

  const subaccountNumber = 0;
  const parentSubaccountNumber = 0;
  // 获取订单列表 Order History
  // const getOrdersList = async () => {
  //   const res = await getOrders(address, 1);
  //   console.log(222222, res);
  // };
  // 获取仓位 Positions 数据
  const getPerpetualPositionsList = async () => {
    const res = await getPerpetualPositions(address, 8);
    console.log(333333, res.positions);
  };
  // 获 Open Orders/ 数据
  const getOrdersByStatusList = async (status?: string) => {
    const res = await getOrdersByStatus(
      address,
      parentSubaccountNumber,
      status,
      20
    );
    const orderStatusList = [
      {
        id: '60d960d9-12b7-56a2-bd35-c667089fa9dc',
        subaccountId: '42f593b3-c0e4-5ba2-b3fd-ce454bbf9318',
        clientId: '740527443',
        clobPairId: '5',
        side: 'BUY',
        size: '0.1',
        totalFilled: '0.1',
        price: '182.11',
        type: 'LIMIT',
        status: 'FILLED',
        timeInForce: 'GTT',
        reduceOnly: false,
        orderFlags: '64',
        goodTilBlockTime: '2025-11-09T12:45:12.000Z',
        createdAtHeight: '58684512',
        clientMetadata: '0',
        updatedAt: '2025-10-12T12:45:13.730Z',
        updatedAtHeight: '58684513',
        orderRouterAddress: '',
        postOnly: false,
        ticker: 'SOL-USD',
        subaccountNumber: 0
      },
      {
        id: 'a46dc3a2-0eb8-55f6-8e22-cc435b7279ab',
        subaccountId: '42f593b3-c0e4-5ba2-b3fd-ce454bbf9318',
        clientId: '1399337174',
        clobPairId: '5',
        side: 'BUY',
        size: '0.1',
        totalFilled: '0',
        price: '180.88',
        type: 'LIMIT',
        status: 'OPEN',
        timeInForce: 'GTT',
        reduceOnly: false,
        orderFlags: '64',
        goodTilBlockTime: '2025-11-27T02:36:52.000Z',
        createdAtHeight: '61175432',
        clientMetadata: '0',
        updatedAt: '2025-10-30T02:36:52.164Z',
        updatedAtHeight: '61175432',
        orderRouterAddress: '',
        postOnly: false,
        ticker: 'SOL-USD',
        subaccountNumber: 0
      }
    ];
    if (status === 'FILLED') {
      if (res.length > 0) {
        setOrderHistory([...res]);
        return;
      }
      setOrderHistory(orderStatusList);
    }
    if (status === 'OPEN') {
      if (res.length > 0) {
        setOrders([...res]);
        return;
      }
      setOrders([...orderStatusList]);
    }
    console.log(44444, res);
  };
  // // 获取最新订单数据
  // const getLatestOrdersList = async () => {
  //   const res = await getLatestOrders(address, parentSubaccountNumber);
  //   console.log(44444, res);
  // };
  // 获取余额 Balance 数据
  const getBalancesList = async () => {
    const res = await getBalancesByAddress(address);
    setBalanceTableData(res?.balances);
    console.log(444, res);
  };
  // 获取资金支付 Funding History 数据
  const getFundingPaymentsList = async () => {
    const res = await getFundingPayments(address, subaccountNumber);
    console.log(55555, res);
  };
  useEffect(() => {
    console.log(44444444, orderBookType, perpetualMarketsInType);
  }, [tradesData, perpetualMarkets, perpetualMarketsInType]);
  useEffect(() => {
    // 防抖动：300ms内连续切换类型，只执行最后一次
    const timer = setTimeout(() => {
      getOrderbooksData();
      getTradesHistoryList();
      // getOrdersList();
      // getPerpetualPositionsList();
      // getOpenOrdersList(); // Open Orders 数据
    }, 300);
    // 清理：组件卸载或orderBookType变化时，清除上一个定时器
    return () => clearTimeout(timer);
  }, [orderBookType]);
  // tab切换事件
  const changeTablesList = (type: string) => {
    setAccountTab(type);
    console.log(type);
    if (type === 'Positions') {
      getPerpetualPositionsList();
    } else if (type === 'Open Orders') {
      getOrdersByStatusList('OPEN');
    } else if (type === 'Order History') {
      getOrdersByStatusList('FILLED');
    } else if (type === 'Trade History') {
      getTradesHistoryList();
    } else if (type === 'Funding History') {
      getFundingPaymentsList();
    } else if (type === 'Balance') {
      getBalancesList();
    }
    // setOrderBookType(type);
  };
  // Adjust Order Modal component
  const [adjustOrderModal, setAdjustOrderModal] = useState<{
    coin: string;
    orderType: string;
    currentPrice: number;
    currentAmount: number;
    status: string;
  } | null>(null);

  // Positions state
  const [positions, setPositions] = useState([
    {
      coin: 'xAAPL',
      tags: ['8x', 'Cross'],
      extra: '$12.50/day',
      position: { value: '$25,000 @227.10', side: 'Long' },
      fundingRate: '+0.0100%',
      pnl: { value: '+$98.00', roe: '+3.92%' },
      liqPrice: '198.20',
      margin: { value: '$3,125', percent: '42%' },
      tpSl: '--/--',
      action: 'Close'
    }
  ]);

  // New mock positions
  const newPosition = {
    coin: 'ETH',
    tags: ['10x', 'Cross'],
    extra: '$15.00/day',
    position: { value: '$500 @ 60.00', side: 'Long' },
    fundingRate: '+0.0200%',
    pnl: { value: '+$0.00', roe: '0.00%' },
    liqPrice: '45.00',
    margin: { value: '$500', percent: '10%' },
    tpSl: '--/--',
    action: 'Close'
  };

  // Trade History state
  const [tradeHistory, setTradeHistory] = useState([
    // {
    //   time: "9/12/2025 16:41:34",
    //   coin: "HYPE",
    //   direction: { text: "Open Long", color: "text-[#2DA44E]" },
    //   price: "55.116",
    //   size: "8.09 HYPE",
    //   tradeValue: "445.89 USDC",
    //   fee: "0.20 USDC",
    //   pnl: "-0.20 USDC",
    // },
    // {
    //   time: "9/12/2025 14:23:10",
    //   coin: "BTC",
    //   direction: { text: "Close Long", color: "text-[#CF222E]" },
    //   price: "64250.50",
    //   size: "0.05 BTC",
    //   tradeValue: "3212.53 USDC",
    //   fee: "1.61 USDC",
    //   pnl: "+125.40 USDC",
    // },
    // {
    //   time: "9/12/2025 12:15:42",
    //   coin: "ETH",
    //   direction: { text: "Open Short", color: "text-[#CF222E]" },
    //   price: "3456.80",
    //   size: "1.5 ETH",
    //   tradeValue: "5185.20 USDC",
    //   fee: "2.59 USDC",
    //   pnl: "-2.59 USDC",
    // },
    // {
    //   time: "9/12/2025 10:08:55",
    //   coin: "SOL",
    //   direction: { text: "Close Short", color: "text-[#2DA44E]" },
    //   price: "145.30",
    //   size: "20 SOL",
    //   tradeValue: "2906.00 USDC",
    //   fee: "1.45 USDC",
    //   pnl: "+89.75 USDC",
    // },
    // {
    //   time: "9/12/2025 08:45:21",
    //   coin: "xAAPL",
    //   direction: { text: "Open Long", color: "text-[#2DA44E]" },
    //   price: "227.10",
    //   size: "110 xAAPL",
    //   tradeValue: "24981.00 USDC",
    //   fee: "12.49 USDC",
    //   pnl: "-12.49 USDC",
    // },
    // {
    //   time: "9/11/2025 22:33:18",
    //   coin: "AVAX",
    //   direction: { text: "Close Long", color: "text-[#CF222E]" },
    //   price: "38.75",
    //   size: "50 AVAX",
    //   tradeValue: "1937.50 USDC",
    //   fee: "0.97 USDC",
    //   pnl: "+45.20 USDC",
    // },
    // {
    //   time: "9/11/2025 18:12:05",
    //   coin: "LINK",
    //   direction: { text: "Open Short", color: "text-[#CF222E]" },
    //   price: "15.85",
    //   size: "200 LINK",
    //   tradeValue: "3170.00 USDC",
    //   fee: "1.59 USDC",
    //   pnl: "-1.59 USDC",
    // },
    // {
    //   time: "9/11/2025 15:55:30",
    //   coin: "DOGE",
    //   direction: { text: "Close Short", color: "text-[#2DA44E]" },
    //   price: "0.0825",
    //   size: "10000 DOGE",
    //   tradeValue: "825.00 USDC",
    //   fee: "0.41 USDC",
    //   pnl: "+32.15 USDC",
    // },
  ]);

  // Funding History state
  const [fundingHistory] = useState([
    {
      time: '9/12/2025 17:00:00',
      coin: 'HYPE',
      size: '8.09 HYPE',
      side: { text: 'Long', color: 'text-[#2DA44E]' },
      payment: { text: '$0.0012', color: 'text-[#2DA44E]' },
      rate: '-0.0003%'
    },
    {
      time: '9/12/2025 13:00:00',
      coin: 'BTC',
      size: '0.05 BTC',
      side: { text: 'Long', color: 'text-[#2DA44E]' },
      payment: { text: '-$0.85', color: 'text-[#CF222E]' },
      rate: '0.0012%'
    },
    {
      time: '9/12/2025 09:00:00',
      coin: 'ETH',
      size: '1.5 ETH',
      side: { text: 'Short', color: 'text-[#CF222E]' },
      payment: { text: '$0.45', color: 'text-[#2DA44E]' },
      rate: '-0.0008%'
    },
    {
      time: '9/12/2025 05:00:00',
      coin: 'SOL',
      size: '20 SOL',
      side: { text: 'Short', color: 'text-[#CF222E]' },
      payment: { text: '$0.32', color: 'text-[#2DA44E]' },
      rate: '-0.0005%'
    },
    {
      time: '9/12/2025 01:00:00',
      coin: 'xAAPL',
      size: '110 xAAPL',
      side: { text: 'Long', color: 'text-[#2DA44E]' },
      payment: { text: '-$3.25', color: 'text-[#CF222E]' },
      rate: '0.0015%'
    },
    {
      time: '9/11/2025 21:00:00',
      coin: 'AVAX',
      size: '50 AVAX',
      side: { text: 'Long', color: 'text-[#2DA44E]' },
      payment: { text: '-$0.18', color: 'text-[#CF222E]' },
      rate: '0.0009%'
    },
    {
      time: '9/11/2025 17:00:00',
      coin: 'LINK',
      size: '200 LINK',
      side: { text: 'Short', color: 'text-[#CF222E]' },
      payment: { text: '$0.28', color: 'text-[#2DA44E]' },
      rate: '-0.0007%'
    },
    {
      time: '9/11/2025 13:00:00',
      coin: 'DOGE',
      size: '10000 DOGE',
      side: { text: 'Short', color: 'text-[#CF222E]' },
      payment: { text: '$0.08', color: 'text-[#2DA44E]' },
      rate: '-0.0002%'
    }
  ]);

  // Order History state
  const [orderHistory, setOrderHistory] = useState([
    {
      time: '9/12/2025 17:30:13',
      type: 'Take Profit Market',
      coin: 'HYPE',
      direction: { text: 'Close Long', color: 'text-[#F85149]' },
      size: '-- / --',
      orderValue: '--',
      trigger: 'Market /Price > 60',
      reduceOnly: 'Yes',
      tpSl: '--',
      status: 'Open',
      orderId: '160687782672'
    },
    {
      time: '9/12/2025 17:03:27',
      type: 'Take Profit Market',
      coin: 'HYPE',
      direction: { text: 'Close Long', color: 'text-[#F85149]' },
      size: '-- / --',
      orderValue: '--',
      trigger: 'Market /Price > 56',
      reduceOnly: 'Yes',
      tpSl: '--',
      status: 'Cancelled',
      orderId: '160656988197'
    },
    {
      time: '9/12/2025 14:15:32',
      type: 'Limit',
      coin: 'BTC',
      direction: { text: 'Buy Long', color: 'text-[#2DA44E]' },
      size: '0.1 / 0.1',
      orderValue: '$6,400',
      trigger: '64000.00',
      reduceOnly: 'No',
      tpSl: '65000/63000',
      status: 'Filled',
      orderId: '160642531288'
    },
    {
      time: '9/12/2025 12:08:45',
      type: 'Market',
      coin: 'ETH',
      direction: { text: 'Sell Short', color: 'text-[#CF222E]' },
      size: '1.5 / 1.5',
      orderValue: '$5,185.20',
      trigger: 'Market',
      reduceOnly: 'No',
      tpSl: '--',
      status: 'Filled',
      orderId: '160628745193'
    },
    {
      time: '9/12/2025 10:22:11',
      type: 'Stop Loss Market',
      coin: 'SOL',
      direction: { text: 'Close Short', color: 'text-[#2DA44E]' },
      size: '-- / --',
      orderValue: '--',
      trigger: 'Market /Price < 140',
      reduceOnly: 'Yes',
      tpSl: '--',
      status: 'Cancelled',
      orderId: '160615829447'
    },
    {
      time: '9/12/2025 08:45:21',
      type: 'Market',
      coin: 'xAAPL',
      direction: { text: 'Buy Long', color: 'text-[#2DA44E]' },
      size: '110 / 110',
      orderValue: '$24,981.00',
      trigger: 'Market',
      reduceOnly: 'No',
      tpSl: '--',
      status: 'Filled',
      orderId: '160603721556'
    },
    {
      time: '9/11/2025 22:35:50',
      type: 'Limit',
      coin: 'AVAX',
      direction: { text: 'Sell Short', color: 'text-[#CF222E]' },
      size: '0 / 100',
      orderValue: '$3,900',
      trigger: '39.00',
      reduceOnly: 'No',
      tpSl: '--',
      status: 'Cancelled',
      orderId: '160589314822'
    },
    {
      time: '9/11/2025 18:10:33',
      type: 'Market',
      coin: 'LINK',
      direction: { text: 'Sell Short', color: 'text-[#CF222E]' },
      size: '200 / 200',
      orderValue: '$3,170.00',
      trigger: 'Market',
      reduceOnly: 'No',
      tpSl: '15.00/16.50',
      status: 'Filled',
      orderId: '160572445911'
    }
  ]);

  // Open Orders Table data
  const [orders, setOrders] = useState<Array<any>>([
    // {
    //   id: 1,
    //   time: '9/12/2025 17:30:13',
    //   type: 'Take Profit Market',
    //   coin: 'HYPE',
    //   direction: { text: 'Close Long', color: 'text-[#F85149]' },
    //   size: '-- / --',
    //   orderValue: '--',
    //   price: 'Market / Price > 60',
    //   reduceOnly: 'Yes',
    //   tpSl: '--',
    //   action: { text: 'Cancel', color: 'text-fuchsia-800' }
    // },
    // {
    //   id: 2,
    //   time: '9/12/2025 17:32:05',
    //   type: 'Limit Buy',
    //   coin: 'ETH',
    //   direction: { text: 'Open Long', color: 'text-[#2DA44E]' },
    //   size: '0.5 / 0.5',
    //   orderValue: '$227.20',
    //   price: '$227.20',
    //   reduceOnly: 'No',
    //   tpSl: '--',
    //   action: { text: 'Cancel', color: 'text-fuchsia-800' }
    // }
  ]);

  const handleConfirmCancel = () => {
    if (!cancelModalOrder) return;
    console.log(
      `Cancelled order: ${cancelModalOrder.coin} ${cancelModalOrder.price}`
    );
    // 這裡可加呼叫 API 取消訂單
    setCancelModalOrder(null);
  };

  {
    /* Toast Notification */
  }
  const [toast, setToast] = useState<{
    title: string;
    message?: string;
    subMessage?: string;
    type?: 'success' | 'loading' | 'error';
  } | null>(null);

  const showToast = (
    title: string,
    type: 'success' | 'loading' | 'error',
    message?: string,
    subMessage?: string
  ) => {
    setToast({ title, type, message, subMessage });
  };

  // Balance Table data state
  const [balanceTableData, setBalanceTableData] = useState([
    // {
    //   currency: 'USDC',
    //   available: '12,345.67',
    //   inOrders: '1,000.00',
    //   value: '$13,345.67'
    // },
    // {
    //   currency: 'Points',
    //   available: '1,250,000',
    //   inOrders: '0',
    //   value: 'Points'
    // }
  ]);

  // 模擬不同模式Cross / Isolated 下的資料
  const estimation = crossSelected
    ? {
        liquidationPrice: '$39,130.00',
        estFee: '$2.50',
        mode: 'Cross'
      }
    : {
        liquidationPrice: '$39,500.00',
        estFee: '$1.80',
        mode: 'Isolated'
      };

  // Selected asset for the main chart (mocked interaction)
  const [selectedAssetSymbol, setSelectedAssetSymbol] =
    useState<string>('ETH-USD');

  /* // Map our asset symbols to TradingView symbols
  const tradingViewSymbolMap: Record<string, string> = {
    'BTC-USD': 'BINANCE:BTCUSDT',
    'ETH-USD': 'BINANCE:ETHUSDT',
    'SOL-USD': 'BINANCE:SOLUSDT',
    'HYPE-USD': 'BINANCE:BTCUSDT', // fallback example
    'HYPE/USDC': 'BINANCE:BTCUSDT', // fallback example
    // xStocks → US equities on TradingView
    xTSLA: 'NASDAQ:TSLA',
    xAAPL: 'NASDAQ:AAPL',
    xNVDA: 'NASDAQ:NVDA',
    xMSFT: 'NASDAQ:MSFT'
  };

  const mapToTradingViewSymbol = (symbol: string): string => {
    return tradingViewSymbolMap[symbol] || 'BINANCE:ETHUSDT';
  };

  // Map granularity to TradingView interval
  const intervalMap: Record<string, string> = {
    '1m': '1',
    '5m': '5',
    '15m': '15',
    '1h': '60',
    '1d': 'D'
  };

  const tradingViewInterval = intervalMap[granularity] || '60';
  const tradingViewSymbol = mapToTradingViewSymbol(selectedAssetSymbol);
  const tvSrc = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(tradingViewSymbol)}&interval=${encodeURIComponent(tradingViewInterval)}&theme=dark&style=1&timezone=Etc%2FUTC&hide_side_toolbar=0&allow_symbol_change=1&hideideas=1&withdateranges=1&locale=en`;
 */
  {
    /* Show and Hide TP/SL modal */
  }
  interface TpslModalData {
    time: string;
    coin: string;
    position: string;
    entryPrice: string;
    markPrice: string;
    takeProfit: string;
    stopLoss: string;
    orderId: string;
    expectedProfit: string;
  }
  const [showTPSLModal, setShowTPSLModal] = useState(false); // 控制 modal 顯示
  const [modalData, setModalData] = useState<TpslModalData | null>(null); // 儲存傳遞給 modal 的資料

  {
    /* Adjust Margin modal */
  }
  const [showAdjustMarginModal, setShowAdjustMarginModal] = useState(false);
  interface AdjustMarginData {
    coin: string;
    currentMargin: number;
    availableMargin: number;
  }
  const [adjustMarginData, setAdjustMarginData] =
    useState<AdjustMarginData | null>(null);

  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const walletDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  const assetPopupRef = useRef<HTMLDivElement>(null);

  {
    /* Close dropdowns when clicking outside */
  }
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMoreDropdown(false);
      }
      if (
        walletDropdownRef.current &&
        !walletDropdownRef.current.contains(event.target as Node)
      ) {
        setShowWalletDropdown(false);
      }
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLangDropdown(false);
      }
    }
    if (showMoreDropdown || showWalletDropdown || showLangDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreDropdown, showWalletDropdown, showLangDropdown]);

  {
    /* Close asset popup when clicking outside or pressing ESC */
  }
  useEffect(() => {
    function handleClickOrEsc(event: MouseEvent | KeyboardEvent) {
      // Click outside
      if (
        showAssetPopup &&
        assetPopupRef.current &&
        event instanceof MouseEvent &&
        !assetPopupRef.current.contains(event.target as Node)
      ) {
        setShowAssetPopup(false);
      }
      // ESC key
      if (
        showAssetPopup &&
        event instanceof KeyboardEvent &&
        event.key === 'Escape'
      ) {
        setShowAssetPopup(false);
      }
    }
    if (showAssetPopup) {
      document.addEventListener('mousedown', handleClickOrEsc);
      document.addEventListener('keydown', handleClickOrEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOrEsc);
      document.removeEventListener('keydown', handleClickOrEsc);
    };
  }, [showAssetPopup]);

  const allMarkets = [
    {
      symbol: 'BTC-USD',
      name: 'Bitcoin',
      bg: 'bg-orange-500',
      leverage: '40x',
      price: '$113,479',
      change: '+2,530 / +2.28%',
      funding: '0.0100%',
      volume: '$3,294,291,814',
      oi: '$3,989,216,288',
      type: 'Perps'
    },
    {
      symbol: 'ETH-USD',
      name: 'Ethereum',
      bg: 'bg-blue-500',
      leverage: '25x',
      price: '$4,350.7',
      change: '+66.3 / +1.55%',
      funding: '0.0100%',
      volume: '$2,603,760,484',
      oi: '$2,911,409,736',
      type: 'Perps'
    },
    {
      symbol: 'SOL-USD',
      name: 'Solana',
      bg: 'bg-purple-500',
      leverage: '20x',
      price: '$221.94',
      change: '+7.47 / +3.48%',
      funding: '0.0100%',
      volume: '$1,314,153,194',
      oi: '$1,516,333,384',
      type: 'Perps'
    },
    {
      symbol: 'HYPE-USD',
      name: 'Hyperliquid',
      bg: 'bg-pink-500',
      leverage: '10x',
      price: '$54.531',
      change: '+1.625 / +3.07%',
      funding: '0.0100%',
      volume: '$709,614,355',
      oi: '$1,487,051,890',
      type: 'Perps'
    },
    {
      symbol: 'HYPE/USDC',
      name: 'SPOT',
      bg: 'bg-pink-500',
      leverage: '-',
      price: '$54.511',
      change: '+1.593 / +3.01%',
      funding: '-',
      volume: '$250,910,508',
      oi: '-',
      type: 'Spot'
    },
    // xStocks category (tokenized U.S. equities)
    {
      symbol: 'xTSLA',
      name: 'Tokenized Tesla',
      bg: 'bg-red-500',
      leverage: '5x',
      price: '$252.31',
      change: '+1.20 / +0.48%',
      funding: '-',
      volume: '$10,910,508',
      oi: '-',
      type: 'xStocks'
    },
    {
      symbol: 'xAAPL',
      name: 'Tokenized Apple',
      bg: 'bg-green-600',
      leverage: '5x',
      price: '$225.12',
      change: '+0.50 / +0.22%',
      funding: '-',
      volume: '$9,210,508',
      oi: '-',
      type: 'xStocks'
    },
    {
      symbol: 'xNVDA',
      name: 'Tokenized Nvidia',
      bg: 'bg-yellow-600',
      leverage: '5x',
      price: '$120.11',
      change: '-0.75 / -0.62%',
      funding: '-',
      volume: '$8,110,508',
      oi: '-',
      type: 'xStocks'
    },
    {
      symbol: 'xMSFT',
      name: 'Tokenized Microsoft',
      bg: 'bg-blue-700',
      leverage: '5x',
      price: '$412.50',
      change: '+1.35 / +0.33%',
      funding: '-',
      volume: '$7,910,508',
      oi: '-',
      type: 'xStocks'
    }
  ];

  // 根據 searchCategoryTab 過濾市場列表
  const filteredMarkets =
    searchCategoryTab === 'All Coins'
      ? allMarkets
      : allMarkets.filter((m) => {
          if (searchCategoryTab === 'Perps') return m.type === 'Perps';
          if (searchCategoryTab === 'Spot') return m.type === 'Spot';
          if (searchCategoryTab === 'xStocks') return m.type === 'xStocks';
          if (searchCategoryTab === 'Saved')
            return savedSymbols.includes(m.symbol);
          return false;
        });

  // 切換收藏
  const toggleSaved = (symbol: string) => {
    setSavedSymbols(
      (prev) =>
        prev.includes(symbol)
          ? prev.filter((s) => s !== symbol) // 已收藏 → 取消
          : [...prev, symbol] // 未收藏 → 加入
    );
  };

  return (
    <div className="flex flex-col bg-black">
      <div className="grid grid-cols-1 xl:grid-cols-5 items-start p-2 gap-2">
        {/* Left side: Chart + Order Book + Account Overview (span 4 cols on xl) */}
        <div className="xl:col-span-4 flex flex-col gap-2 w-full">
          {/* Top row: Asset Info + Main Chart + Order Book */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-2">
            {/* Main Chart (3 cols) */}
            <div className="xl:col-span-3 flex flex-col gap-2">
              {/* Asset Info */}
              {/* border border-solid border-[#30363D] */}
              <div className="flex flex-col self-stretch bg-Dark_Tier1 py-2 gap-3 rounded-lg ">
                <div className="flex flex-col md:flex-row items-start self-stretch mx-3 gap-3">
                  <div className="flex flex-col shrink-0 gap-1">
                    {/* Asset Name + Select Asset */}
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-gray-200 text-lg font-bold">
                        {selectedAssetSymbol}
                      </span>
                      {/* Select Asset */}
                      <div className="relative">
                        <button
                          type="button"
                          className="flex items-center gap-1 px-3 py-2 bg-Dark_Tier1 rounded-sm  text-zinc-400 text-sm font-bold focus:outline-none"
                          onClick={() => setShowAssetPopup((v) => !v)}
                        >
                          <img
                            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/rnvmw36i_expires_30_days.png"
                            className="w-3 h-[15px] rounded-sm object-fill"
                            alt="Select Asset"
                          />
                        </button>
                        {showAssetPopup && (
                          <div className="fixed inset-0 z-10 flex items-start md:mt-30 md:ml-4">
                            {/* 背景遮罩 */}
                            <div
                              className="absolute inset-0 bg-black/50 md:bg-transparent"
                              // Remove onClick here, handled by effect
                            />
                            {/* Popup 內容 */}
                            <div
                              ref={assetPopupRef}
                              className="relative w-full max-w-[910px] bg-[#272B2F] overflow-auto flex flex-col
                                         md:rounded-lg md:border md:border-[#30363D] md:ml-0 md:mr-0
                                         h-screen md:h-auto
                                         mt-auto md:mt-0
                                         rounded-t-lg"
                            >
                              {/* Close button for mobile */}
                              <div className="md:hidden w-full flex justify-end p-4">
                                <button
                                  className="text-white text-lg font-bold"
                                  onClick={() => setShowAssetPopup(false)}
                                >
                                  ✕
                                </button>
                              </div>

                              {/* Search + Filter */}
                              <div className="flex items-center justify-between w-full px-4 py-4 gap-2 border-b border-[#374151]">
                                <div className="flex items-center flex-1 bg-[#0D1117] py-3 px-2 rounded-sm border border-[#30363D]">
                                  <img
                                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/alyycaw7_expires_30_days.png"
                                    className="w-4 h-6 mx-4 object-fill"
                                  />
                                  <input
                                    placeholder="Search"
                                    value={input10}
                                    onChange={(event) =>
                                      onChangeInput10(event.target.value)
                                    }
                                    className="w-full flex-1 text-[#ADAEBC] text-base border-0"
                                  />
                                </div>
                                <ToggleWithText
                                  options={['Strict', 'All']}
                                  value={input11}
                                  onChange={onChangeInput11}
                                />
                              </div>

                              {/* Category Tab */}
                              <div className="w-full px-4 py-2 mb-2 border-b border-[#374151]">
                                <CategoryTab
                                  tabs={[
                                    'All Coins',
                                    'xStocks',
                                    'Saved',
                                    'Perps',
                                    'Spot',
                                    'Trending',
                                    'DEX Only',
                                    'Pre-launch',
                                    'AI',
                                    'DeFi',
                                    'Layer 1',
                                    'Layer 2',
                                    'Meme'
                                  ]}
                                  activeTab={searchCategoryTab}
                                  onTabChange={setSearchCategoryTab}
                                />
                              </div>
                              {/* Table */}
                              <div className="w-full overflow-auto text-left">
                                <table className="min-w-[700px] w-full text-sm">
                                  <thead>
                                    <tr className="text-zinc-400 font-bold border-b border-[#30363D]">
                                      <th className="px-4 py-3 text-left">
                                        Symbol
                                      </th>
                                      <th className="px-4 py-3 text-left">
                                        Leverage
                                      </th>
                                      <th className="px-4 py-3 text-left">
                                        Last Price
                                      </th>
                                      <th className="px-4 py-3 text-left">
                                        24h Change
                                      </th>
                                      <th className="px-4 py-3 text-left">
                                        8h Funding
                                      </th>
                                      <th className="px-4 py-3 text-left">
                                        24h Volume
                                      </th>
                                      <th className="px-4 py-3 text-left">
                                        Open Interest
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {filteredMarkets.map((row, idx) => (
                                      <tr
                                        key={idx}
                                        className="border-b border-[#30363D] text-white hover:bg-[#1f2326] cursor-pointer"
                                        onClick={() => {
                                          setSelectedAssetSymbol(row.symbol);
                                          setShowAssetPopup(false);
                                        }}
                                      >
                                        <td className="px-4 py-2">
                                          <div className="flex items-center gap-3">
                                            {/* Saved Button */}
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation(); // 避免觸發 row onClick
                                                toggleSaved(row.symbol);
                                              }}
                                              className="ml-2 text-lg"
                                            >
                                              {savedSymbols.includes(
                                                row.symbol
                                              ) ? (
                                                // Solid Bookmark (已收藏)
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  fill="currentColor"
                                                  viewBox="0 0 24 24"
                                                  className="w-5 h-5"
                                                >
                                                  <path
                                                    fillRule="evenodd"
                                                    d="M6.32 3.375A49.255 49.255 0 0 1 12 3c1.91 0 3.78.128 5.68.375a1.88 1.88 0 0 1 1.64 1.86v15.91c0 .299-.158.576-.417.729a.812.812 0 0 1-.83.01L12 18.69l-6.073 3.194a.812.812 0 0 1-.83-.01 0.84 0.84 0 0 1-.417-.729V5.236c0-.928.668-1.72 1.64-1.861Z"
                                                    clipRule="evenodd"
                                                  />
                                                </svg>
                                              ) : (
                                                // Outline Bookmark (未收藏)
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  strokeWidth={1.5}
                                                  stroke="currentColor"
                                                  className="w-5 h-5"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M17.68 4.235A48.3 48.3 0 0 0 12 3c-1.91 0-3.78.128-5.68.375A1.88 1.88 0 0 0 4.68 5.236v15.91c0 .3.158.577.417.73.259.152.58.165.83.01L12 18.691l6.073 3.195c.25.155.571.142.83-.01.259-.153.417-.43.417-.73V5.236c0-.928-.668-1.72-1.64-1.861Z"
                                                  />
                                                </svg>
                                              )}
                                            </button>
                                            <button
                                              className={`${row.bg} text-white py-2 px-3 rounded-full border-0`}
                                            >
                                              {row.symbol.charAt(0)}
                                            </button>
                                            <div className="flex flex-col">
                                              <span className="font-bold">
                                                {row.symbol}
                                              </span>
                                              <span className="text-gray-400 text-sm">
                                                {row.name}
                                              </span>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-2">
                                          {row.leverage}
                                        </td>
                                        <td className="px-4 py-2 font-bold">
                                          {row.price}
                                        </td>
                                        <td className="px-4 py-2 text-[#2DA44E]">
                                          {row.change}
                                        </td>
                                        <td className="px-4 py-2">
                                          {row.funding}
                                        </td>
                                        <td className="px-4 py-2">
                                          {row.volume}
                                        </td>
                                        <td className="px-4 py-2">{row.oi}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between px-4 py-2 text-sm text-zinc-400 mt-4">
                                <span>Showing 5 of 247 markets</span>
                                <span className="max-md:hidden">
                                  Press{' '}
                                  <button className="px-2 py-1 bg-gray-600 rounded text-sm">
                                    ESC
                                  </button>{' '}
                                  to close
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Granularity + Indicator */}
                    <div className="flex gap-2 flex-row shrink-0">
                      {/* Granularity */}
                      <Select
                        value={granularity}
                        onChange={setGranularity}
                        placeholder="Granularity"
                        options={[
                          { label: '1m', value: '1m' },
                          { label: '5m', value: '5m' },
                          { label: '15m', value: '15m' },
                          { label: '1h', value: '1h' },
                          { label: '1d', value: '1d' }
                        ]}
                        className="min-w-20"
                      />

                      {/* Indicator */}
                      <Select
                        value={indicator}
                        onChange={setIndicator}
                        placeholder="Indicator"
                        options={[
                          { label: 'None', value: 'None' },
                          { label: 'EMA', value: 'EMA' },
                          { label: 'SMA', value: 'SMA' },
                          { label: 'RSI', value: 'RSI' },
                          { label: 'MACD', value: 'MACD' }
                        ]}
                        className="min-w-20"
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="w-full grid grid-rows-2 grid-cols-4">
                    <div className="flex flex-1 flex-col items-start min-w-24">
                      <span className="text-zinc-400 text-xs">
                        {'Mark Price'}
                      </span>
                      <span className="text-gray-200 text-sm font-bold  ">
                        {'227.34'}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col items-start min-w-24">
                      <span className="text-zinc-400 text-xs">
                        {'Index Price'}
                      </span>
                      <span className="text-gray-200 text-sm font-bold ">
                        {'227.30'}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col items-start min-w-24">
                      <span className="text-zinc-400 text-xs">
                        {'24h Change'}
                      </span>
                      <span className="text-[#F85149] text-sm font-bold  ">
                        {perpetualMarketsInType?.priceChange24H}%
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col items-start min-w-24">
                      <span className="text-zinc-400 text-xs">
                        {'24h Volume'}
                      </span>
                      <span className="text-gray-200 text-sm font-bold  ">
                        {perpetualMarketsInType?.volume24H} B
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col items-start min-w-24">
                      <span className="text-zinc-400 text-xs">
                        {'Open Interest'}
                      </span>
                      <span className="text-gray-200 text-sm font-bold ">
                        {perpetualMarketsInType?.baseOpenInterest}B
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col items-start min-w-24">
                      <span className="text-zinc-400 text-xs">
                        {'Funding Rate'}
                      </span>
                      <span className="text-[#2DA44E] text-sm font-bold ">
                        {perpetualMarketsInType?.defaultFundingRate1H}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col items-start min-w-24">
                      <span className="text-zinc-400 text-xs">
                        {'Next Settlement'}
                      </span>
                      <span className="text-gray-200 text-sm font-bold ">
                        {'00:52:54'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* TradingView Chart + Account Overview */}
              {/* border border-solid border-[#30363D] */}
              <div className="flex flex-col self-stretch bg-Dark_Tier1 h-full p-0 rounded-lg ">
                {/* TradingView Widget */}
                <div className="h-full min-h-[450px]">
                  {/* <iframe
                    title="TradingView Chart"
                    id="tradingview_widget"
                    src={tvSrc}
                    className="w-full h-full rounded-sm"
                    frameBorder="0"
                    allowTransparency={true}
                    scrolling="no"
                    allowFullScreen
                  /> */}
                  <TradingViewChart
                    granularity={granularity}
                    selectedAssetSymbol={selectedAssetSymbol}
                  />
                </div>

                {/* Account Overview */}
                <div className="flex flex-col items-start self-stretch p-4 gap-2">
                  <span className="text-white text-lg">
                    {'Account Overview'}
                  </span>
                  <div className="flex flex-wrap justify-between items-start self-stretch text-left gap-3">
                    <div className="flex flex-1 flex-col items-start min-w-32">
                      <span className="text-zinc-400 text-sm">
                        {'Total Account Value'}
                      </span>
                      <span className="text-white text-base">
                        {'$42,845.67'}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col items-start min-w-32">
                      <span className="text-zinc-400 text-sm">
                        {'Total Margin Used'}
                      </span>
                      <span className="text-white text-base">
                        {'$5,525.00'}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col items-start min-w-32">
                      <span className="text-zinc-400 text-sm">
                        {'Total Notional Position'}
                      </span>
                      <span className="text-white text-base">
                        {'$37,000.00'}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col items-start min-w-32">
                      <span className="text-zinc-400 text-sm">
                        {'Withdrawable Amount'}
                      </span>
                      <span className="text-white text-base">
                        {'$37,320.67'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Order Book (1 col) */}
            {/* border border-[#30363D] */}
            <div className="xl:col-span-1 flex flex-col bg-Dark_Tier1 rounded-lg">
              {/* Tabs for Order Book/Trades */}
              <div className="w-full">
                <Tabs
                  tabs={['Order Book', 'Trades']}
                  activeTab={orderBookTab}
                  onTabChange={setOrderBookTab}
                />
              </div>

              {/* Tab Content */}
              {orderBookTab === 'Order Book' && (
                <div>
                  <div className="m-2 max-w-24">
                    <Select
                      value={unitGranularity}
                      onChange={setUnitGranularity}
                      options={[
                        { label: '0.001', value: '0.001' },
                        { label: '0.002', value: '0.002' },
                        { label: '0.005', value: '0.005' },
                        { label: '0.01', value: '0.01' },
                        { label: '0.1', value: '0.1' },
                        { label: '1', value: '1' }
                      ]}
                      minWidth="min-w-24"
                    />
                  </div>
                  <OrderBook
                    onAction={getOrderbooksData}
                    unitGranularity={unitGranularity}
                    orderBookData={orderBookData}
                  />
                </div>
              )}
              {orderBookTab === 'Trades' && <Trades tradesData={tradesData} />}
            </div>
          </div>
          {/* Tabs + Filter (below, span 4 cols) */}
          {/* border border-[#30363D]  */}
          <div className="bg-Dark_Tier1 rounded-lg px-2 flex flex-col w-full">
            {/* Tabs */}
            <div className="">
              <div className="flex gap-4 justify-between items-center border-b border-[#30363D] min-w-[600px] flex-nowrap">
                <Tabs
                  tabs={[
                    'Balance',
                    'Positions',
                    'Open Orders',
                    'Trade History',
                    'Funding History',
                    'Order History'
                  ]}
                  activeTab={accountTab}
                  onTabChange={changeTablesList}
                />

                {/* Filter Selector */}
                <div className="relative ">
                  <Select
                    value={filterValue}
                    onChange={setFilterValue}
                    placeholder="Filter"
                    options={[
                      { label: 'All', value: 'All' },
                      { label: 'Active', value: 'Active' },
                      { label: 'Long', value: 'Long' },
                      { label: 'Short', value: 'Short' }
                    ]}
                    minWidth="min-w-32"
                  />
                </div>
              </div>
            </div>
            {/* Balance */}
            {accountTab === 'Balance' && (
              <div className="overflow-x-auto py-4 text-left">
                <table className="w-full text-left border-collapse min-w-[400px]">
                  <thead className="text-sm text-zinc-400 font-bold">
                    <tr>
                      <th className="py-2 px-2">Currency</th>
                      <th className="py-2 px-2">Available</th>
                      <th className="py-2 px-2">In Orders</th>
                      <th className="py-2 px-2">Value($)</th>
                    </tr>
                  </thead>
                  <tbody className="text-white text-sm">
                    {balanceTableData.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#30363D]">
                        <td className="py-2 px-2">{row.denom}</td>
                        <td className="py-2 px-2">{row.available}</td>
                        <td className="py-2 px-2">{row.inOrders}</td>
                        <td className="py-2 px-2">{row.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Positions */}
            {accountTab === 'Positions' && (
              <div className="py-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    {/* Table Head */}
                    <thead>
                      <tr className="text-zinc-400 text-sm font-bold gap-2">
                        <th className="py-2 px-2">Coin</th>
                        <th className="py-2 px-2">Position</th>
                        <th className="py-2 px-2">Funding Rate</th>
                        <th className="py-2 px-2">PNL (ROE%)</th>
                        <th className="py-2 px-2">Liq. Price</th>
                        <th className="py-2 px-2">Margin</th>
                        <th className="py-2 px-2">TP/SL</th>
                        <th className="py-2 px-2">Actions</th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="text-white text-sm">
                      {positions.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-[#30363D] gap-2 py-2"
                        >
                          {/* Coin */}
                          <td>
                            <div className="flex flex-col items-start">
                              <span>{row.coin}</span>
                              <div className="flex gap-1 mt-1">
                                {row.tags.map((tag, i) => (
                                  <div
                                    key={i}
                                    className="inline-flex bg-[#30363D] py-1 px-2 rounded text-zinc-400 text-[10px] font-bold"
                                  >
                                    {tag}
                                  </div>
                                ))}
                              </div>
                              <div className="inline-flex bg-[#30363D] py-1 px-2 rounded text-zinc-400 text-[10px] font-bold mt-1">
                                {row.extra}
                              </div>
                            </div>
                          </td>

                          {/* Position */}
                          <td className="py-2 px-2">
                            <div className="flex flex-wrap gap-2 items-start">
                              <span>{row.position.value}</span>
                              <div className="inline-flex bg-[#30363D] py-1 px-2 rounded text-zinc-400 text-[10px] font-bold">
                                {row.position.side}
                              </div>
                            </div>
                          </td>

                          {/* Funding Rate */}
                          <td className="py-2 px-2">{row.fundingRate}</td>

                          {/* PNL */}
                          <td className="py-2 px-2">
                            <div className="flex flex-wrap gap-2">
                              <span>{row.pnl.value}</span>
                              <div className="inline-flex bg-[#22C55E1A] py-1 px-2 rounded text-[#2DA44E] text-[10px] font-bold">
                                {row.pnl.roe}
                              </div>
                            </div>
                          </td>

                          {/* Liq Price */}
                          <td className="py-2 px-2">{row.liqPrice}</td>

                          {/* Margin */}
                          <td className="py-2 px-2">
                            <div className="flex flex-wrap gap-2 items-center">
                              <span>{row.margin.value}</span>
                              <div className="inline-flex bg-[#30363D] py-1 px-2 rounded text-zinc-400 text-[10px] font-bold cursor-pointer">
                                {row.margin.percent}
                              </div>
                              <img
                                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/l0hc3xdh_expires_30_days.png"
                                className="w-4 h-4 object-fill cursor-pointer"
                                onClick={() => {
                                  // currentMargin
                                  const currentMargin =
                                    parseFloat(
                                      row.margin.value.replace(/[$,]/g, '')
                                    ) || 0;

                                  // percent
                                  let percentUsed =
                                    parseFloat(
                                      row.margin.percent.replace('%', '')
                                    ) || 0;

                                  // availableMargin
                                  const availableMargin =
                                    percentUsed > 0
                                      ? currentMargin * (100 / percentUsed - 1)
                                      : 0;

                                  // 傳入 modal
                                  setAdjustMarginData({
                                    coin: row.coin,
                                    currentMargin,
                                    availableMargin
                                  });
                                  setShowAdjustMarginModal(true);
                                }}
                                alt="Adjust Margin"
                              />
                            </div>
                          </td>

                          {/* TP/SL */}
                          <td className="py-2 px-2">
                            <div className="flex gap-1 items-center">
                              <span>{row.tpSl}</span>
                              <img
                                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/l0hc3xdh_expires_30_days.png"
                                className="w-4 h-4 object-fill cursor-pointer"
                                onClick={() => {
                                  setModalData({
                                    time: '9/12/2025 17:30:13',
                                    coin: row.coin,
                                    position: row.position.value,
                                    entryPrice: '55.116',
                                    markPrice: '55.252',
                                    takeProfit: 'Price above 60',
                                    stopLoss: '--',
                                    orderId: '160687782672',
                                    expectedProfit: '39.51 USDC'
                                  } as TpslModalData);
                                  setShowTPSLModal(true);
                                }}
                                alt="TP/SL"
                              />
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-2 px-2 font-bold text-fuchsia-800 gap-2">
                            <button
                              className="py-2 mr-4"
                              onClick={() => {
                                setModalCoin(row.coin);
                                setShowCloseModal(true);
                              }}
                            >
                              {row.action}
                            </button>
                            <button
                              className="py-2"
                              onClick={() => {
                                setModalCoin(row.coin);
                                setModalLiqPrice(row.liqPrice);
                                setModalPercent(row.pnl.roe);
                                setShowShareModal(true);
                              }}
                            >
                              Share
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {showCloseModal && (
                    <ConfirmCloseModal
                      coinName={modalCoin}
                      onClose={() => setShowCloseModal(false)}
                      onConfirm={() => {
                        handleClosePosition(modalCoin);
                        setShowCloseModal(false);
                      }}
                    />
                  )}

                  {showAdjustMarginModal && adjustMarginData && (
                    <AdjustMarginModal
                      coin={adjustMarginData.coin}
                      currentMargin={adjustMarginData.currentMargin}
                      availableMargin={adjustMarginData.availableMargin}
                      onClose={() => setShowAdjustMarginModal(false)}
                      onConfirm={(amount: number) => {
                        console.log('Add margin:', amount);
                        setShowAdjustMarginModal(false);
                      }}
                    />
                  )}

                  {showTPSLModal && modalData && (
                    <TPSLModal
                      data={modalData}
                      inputTPSLPrice={inputTPSLPrice}
                      onChangeInputTPSLPrice={setInputTPSLPrice}
                      inputTPSLPercent={inputTPSLPercent}
                      onChangeInputTPSLPercent={setInputTPSLPercent}
                      onClose={() => setShowTPSLModal(false)}
                      onConfirm={() => {
                        console.log(
                          'Confirmed',
                          inputTPSLPrice,
                          inputTPSLPercent
                        );
                        setShowTPSLModal(false);
                      }}
                    />
                  )}
                  {showShareModal && (
                    <ShareModal
                      coinName={modalCoin}
                      logoUrl={<RiverbitLogo />}
                      changePercent={modalPercent}
                      liqPrice={modalLiqPrice}
                      onClose={() => setShowShareModal(false)}
                    />
                  )}
                </div>
                {/* Close All button */}
                <div className="flex justify-end mt-3">
                  <button
                    className="bg-fuchsia-800 w-[100px] py-3.5 rounded-md text-white font-bold"
                    onClick={() => setShowCloseAllModal(true)}
                  >
                    Close All
                  </button>
                </div>

                {/* Confirm Close Modal */}
                {showCloseAllModal && (
                  <ConfirmCloseModal
                    coinName="all positions"
                    onClose={() => setShowCloseAllModal(false)}
                    onConfirm={handleCloseAllConfirm}
                  />
                )}
              </div>
            )}
            {/* Open Orders */}
            {accountTab === 'Open Orders' && (
              <div className="py-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    {/* Table Head */}
                    <thead>
                      <tr className="text-zinc-400 text-sm font-bold">
                        <th className="py-2 px-2">Time</th>
                        <th className="py-2 px-2">Type</th>
                        <th className="py-2 px-2">Coin</th>
                        <th className="py-2 px-2">Direction</th>
                        <th className="py-2 px-2">Size / Original Size</th>
                        <th className="py-2 px-2">Order Value</th>
                        <th className="py-2 px-2">Price / Trigger</th>
                        <th className="py-2 px-2">Reduce Only</th>
                        <th className="py-2 px-2">TP/SL</th>
                        <th className="py-2 px-2">Actions</th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="text-sm text-white">
                      {orders.map((row) => (
                        <tr key={row.id} className="border-b border-[#30363D]">
                          <td className="py-2 px-2 whitespace-pre">
                            {formatDate(row.updatedAt, 'DD/MM/YYYY HH:mm:ss')}
                          </td>
                          <td className="py-2 px-2">{row.type}</td>
                          <td className="py-2 px-2">{row.coin}</td>
                          <td className={`py-2 px-2 ${row.direction?.color}`}>
                            {row.direction?.text}
                          </td>
                          <td className="py-2 px-2">{row.size}</td>
                          <td className="py-2 px-2">{row.orderFlags}</td>
                          <td className="py-2 px-2">{row.price}</td>
                          <td className="py-2 px-2">
                            {row.reduceOnly.toString()}
                          </td>
                          <td className="py-2 px-2 flex flex-wrap gap-2 items-center">
                            {row.tpSl}
                            <img
                              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/l0hc3xdh_expires_30_days.png"
                              className="w-4 h-4 object-fill cursor-pointer"
                              onClick={() => {
                                setModalData({
                                  time: formatDate(
                                    row.updatedAt,
                                    'DD/MM/YYYY HH:mm:ss'
                                  ),
                                  coin: row.coin,
                                  // position: row.position.value,
                                  entryPrice: '55.116',
                                  markPrice: '55.252',
                                  takeProfit: 'Price above 60',
                                  stopLoss: '--',
                                  orderId: row.id,
                                  expectedProfit: '39.51 USDC'
                                } as TpslModalData);
                                setShowTPSLModal(true);
                              }}
                              alt="TP/SL"
                            />
                          </td>
                          <td
                            className={`py-2 px-2 font-bold gap-2 ${row.action?.color}`}
                          >
                            <button
                              className="py-2 mr-4"
                              onClick={() => {
                                setAdjustOrderModal({
                                  coin: row.coin,
                                  orderType: row.type,
                                  currentPrice: row.price
                                    ? Number(
                                        row.price
                                          .toString()
                                          .replace(/[^0-9.]/g, '')
                                      )
                                    : 0,
                                  currentAmount: row.size
                                    ? Number(
                                        row.size
                                          .toString()
                                          .split('/')[0]
                                          .trim()
                                          .replace(/[^0-9.]/g, '')
                                      )
                                    : 0,
                                  status: 'Pending'
                                });
                              }}
                            >
                              Adjust
                            </button>

                            <button
                              className="py-2"
                              onClick={() =>
                                setCancelModalOrder({
                                  id: row.id,
                                  coin: row.coin,
                                  price: row.price
                                })
                              }
                            >
                              {row.action?.text}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* View All button */}
                <div className="flex justify-end mt-3">
                  <button className="bg-fuchsia-800 w-[100px] py-3.5 rounded-md text-white font-bold">
                    View All
                  </button>
                </div>

                {/* Adjust Order Modal */}
                {adjustOrderModal && (
                  <AdjustOrderModal
                    coin={adjustOrderModal.coin}
                    orderType={adjustOrderModal.orderType}
                    currentPrice={adjustOrderModal.currentPrice}
                    currentAmount={adjustOrderModal.currentAmount}
                    status={adjustOrderModal.status}
                    onClose={() => setAdjustOrderModal(null)}
                    onConfirm={(data) => console.log('Adjusted:', data)}
                  />
                )}

                {/* Confirm Cancel Modal */}
                {cancelModalOrder && (
                  <ConfirmCancelModal
                    orderName={`Price / Trigger ${cancelModalOrder.price}`}
                    onClose={() => setCancelModalOrder(null)}
                    onConfirm={handleConfirmCancel}
                  />
                )}

                {showTPSLModal && modalData && (
                  <TPSLModal
                    data={modalData}
                    inputTPSLPrice={inputTPSLPrice}
                    onChangeInputTPSLPrice={setInputTPSLPrice}
                    inputTPSLPercent={inputTPSLPercent}
                    onChangeInputTPSLPercent={setInputTPSLPercent}
                    onClose={() => setShowTPSLModal(false)}
                    onConfirm={() => {
                      console.log(
                        'Confirmed',
                        inputTPSLPrice,
                        inputTPSLPercent
                      );
                      setShowTPSLModal(false);
                    }}
                  />
                )}
              </div>
            )}
            {/* Trade History */}
            {accountTab === 'Trade History' && (
              <div className="py-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    {/* Table Head */}
                    <thead>
                      <tr className="text-zinc-400 text-sm font-bold">
                        <th className="py-2 px-2">Time</th>
                        <th className="py-2 px-2">Coin</th>
                        <th className="py-2 px-2">Direction</th>
                        <th className="py-2 px-2">Price</th>
                        <th className="py-2 px-2">Size</th>
                        <th className="py-2 px-2">Trade Value</th>
                        <th className="py-2 px-2">Fee</th>
                        <th className="py-2 px-2">Closed PNL</th>
                        <th className="py-2 px-2">Actions</th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="text-sm text-white">
                      {(
                        (showAllTradeHistory
                          ? tradeHistory
                          : tradeHistory.slice(0, 5)) || []
                      ).map((row, idx) => (
                        <tr key={idx} className="border-b border-[#30363D]">
                          <td className="py-2 px-2 whitespace-pre">
                            {formatDate(row.createdAt, 'DD/MM/YYYY HH:mm:ss')}
                          </td>
                          <td className="py-2 px-2">{row.coin}</td>
                          <td className={`py-2 px-2 ${row.direction?.color}`}>
                            {row.direction?.text}
                          </td>
                          <td className="py-2 px-2">{row.price}</td>
                          <td className="py-2 px-2">{row.size}</td>
                          <td className="py-2 px-2">{row.tradeValue}</td>
                          <td className="py-2 px-2">{row.fee}</td>
                          <td className="py-2 px-2">{row.pnl}</td>
                          {/* Actions */}
                          <td className="py-2 px-2 font-bold text-fuchsia-800 gap-2">
                            <button
                              className="py-2"
                              onClick={() => {
                                setModalCoin(row.coin);
                                setModalLiqPrice(row.price);
                                setModalPercent(row.pnl);
                                setShowShareModal(true);
                              }}
                            >
                              Share
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {showShareModal && (
                    <ShareModal
                      coinName={modalCoin}
                      logoUrl={<RiverbitLogo />}
                      changePercent={modalPercent}
                      liqPrice={modalLiqPrice}
                      onClose={() => setShowShareModal(false)}
                    />
                  )}
                </div>
                {/* Buttons */}
                <div className="flex justify-end mt-3 gap-4">
                  <button
                    className="bg-fuchsia-800 py-3.5 px-[19px] rounded-md text-white font-bold"
                    onClick={() => setShowAllTradeHistory(!showAllTradeHistory)}
                  >
                    {showAllTradeHistory ? 'Show Less' : 'View All'}
                  </button>
                  <button
                    className="bg-fuchsia-800 py-3.5 px-4 rounded-md text-white font-bold"
                    onClick={() => {
                      // Convert trade history to CSV
                      const headers = [
                        'Time',
                        'Coin',
                        'Direction',
                        'Price',
                        'Size',
                        'Trade Value',
                        'Fee',
                        'Closed PNL'
                      ];
                      const csvContent = [
                        headers.join(','),
                        ...tradeHistory.map((row) =>
                          [
                            row.time,
                            row.coin,
                            row.direction?.text,
                            row.price,
                            row.size,
                            row.tradeValue,
                            row.fee,
                            row.pnl
                          ].join(',')
                        )
                      ].join('\n');

                      // Create download link
                      const blob = new Blob([csvContent], {
                        type: 'text/csv'
                      });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `trade-history-${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    Export as CSV
                  </button>
                </div>
              </div>
            )}
            {/* Funding History */}
            {accountTab === 'Funding History' && (
              <div className="py-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    {/* Table Head */}
                    <thead>
                      <tr className="text-zinc-400 text-sm font-bold">
                        <th className="py-2 px-2">Time</th>
                        <th className="py-2 px-2">Coin</th>
                        <th className="py-2 px-2">Size</th>
                        <th className="py-2 px-2">Position Side</th>
                        <th className="py-2 px-2">Payment</th>
                        <th className="py-2 px-2">Rate</th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="text-sm text-white">
                      {(showAllFundingHistory
                        ? fundingHistory
                        : fundingHistory.slice(0, 5)
                      ).map((row, idx) => (
                        <tr key={idx} className="border-b border-[#30363D]">
                          <td className="py-2 px-2 whitespace-pre">
                            {row.time}
                          </td>
                          <td className="py-2 px-2">{row.coin}</td>
                          <td className="py-2 px-2">{row.size}</td>
                          <td className={`py-2 px-2 ${row.side.color}`}>
                            {row.side.text}
                          </td>
                          <td className={`py-2 px-2 ${row.payment.color}`}>
                            {row.payment.text}
                          </td>
                          <td className="py-2 px-2">{row.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Buttons */}
                <div className="flex justify-end mt-3 gap-4">
                  <button
                    className="bg-fuchsia-800 py-3.5 px-[19px] rounded-md text-white font-bold"
                    onClick={() =>
                      setShowAllFundingHistory(!showAllFundingHistory)
                    }
                  >
                    {showAllFundingHistory ? 'Show Less' : 'View All'}
                  </button>
                  <button
                    className="bg-fuchsia-800 py-3.5 px-4 rounded-md text-white font-bold"
                    onClick={() => {
                      // Convert funding history to CSV
                      const headers = [
                        'Time',
                        'Coin',
                        'Size',
                        'Position Side',
                        'Payment',
                        'Rate'
                      ];
                      const csvContent = [
                        headers.join(','),
                        ...fundingHistory.map((row) =>
                          [
                            row.time,
                            row.coin,
                            row.size,
                            row.side.text,
                            row.payment.text,
                            row.rate
                          ].join(',')
                        )
                      ].join('\n');

                      // Create download link
                      const blob = new Blob([csvContent], {
                        type: 'text/csv'
                      });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `funding-history-${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    Export as CSV
                  </button>
                </div>
              </div>
            )}
            {/* Order History */}
            {accountTab === 'Order History' && (
              <div className="py-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    {/* Table Head */}
                    <thead>
                      <tr className="text-zinc-400 text-sm font-bold">
                        <th className="py-2 px-2">Time</th>
                        <th className="py-2 px-2">Type</th>
                        <th className="py-2 px-2">Coin</th>
                        <th className="py-2 px-2">Direction</th>
                        <th className="py-2 px-2">Size / Filled Size</th>
                        <th className="py-2 px-2">Order Value</th>
                        <th className="py-2 px-2">Price / Trigger</th>
                        <th className="py-2 px-2">Reduce Only</th>
                        <th className="py-2 px-2">TP/SL</th>
                        <th className="py-2 px-2">Status</th>
                        <th className="py-2 px-2">Order ID</th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="text-sm text-white">
                      {(showAllOrderHistory
                        ? orderHistory
                        : orderHistory.slice(0, 5)
                      ).map((row, idx) => (
                        <tr key={idx} className="border-b border-[#30363D]">
                          <td className="py-2 px-2 whitespace-pre">
                            {formatDate(row.updatedAt, 'DD/MM/YYYY HH:mm:ss')}
                          </td>
                          <td className="py-2 px-2">{row.type}</td>
                          <td className="py-2 px-2">{row.coin}</td>
                          <td className={`py-2 px-2 ${row.direction?.color}`}>
                            {row.direction?.text}
                          </td>
                          <td className="py-2 px-2">{row.size}</td>
                          <td className="py-2 px-2">{row.orderFlags}</td>
                          <td className="py-2 px-2">{row.price}</td>
                          <td className="py-2 px-2">
                            {row.reduceOnly.toString()}
                          </td>
                          <td className="py-2 px-2">{row.tpSl}</td>
                          <td className="py-2 px-2">{row.status}</td>
                          <td className="py-2 px-2">{row.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Buttons */}
                <div className="flex justify-end mt-3">
                  <button
                    className="bg-fuchsia-800 py-3.5 px-[19px] rounded-md text-white font-bold"
                    onClick={() => setShowAllOrderHistory(!showAllOrderHistory)}
                  >
                    {showAllOrderHistory ? 'Show Less' : 'View All'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trading Form (col-span-1 on desktop, full width on mobile) */}
        {/* border border-[#30363D]  */}
        <div className="xl:col-span-1 flex flex-col bg-Dark_Tier1 p-4 rounded-lg gap-2 h-full">
          {/* Cross Margin, Leverage and AI Trading */}
          <div className="flex items-center justify-between w-full gap-2">
            {/* Cross Margin Toggle */}
            <button
              className={`flex-1 flex flex-col items-center justify-center text-center bg-zinc-950 py-3 px-2 rounded-sm border border-[#30363D]`}
              onClick={() => setCrossSelected((v) => !v)}
            >
              <span className="text-[#A6A6B5] text-sm text-nowrap">
                {crossSelected ? 'Cross' : 'Isolated'}
              </span>
            </button>

            {/* Leverage Dropdown */}
            <div className="flex-1 flex items-center justify-center">
              <button
                className="flex-1 flex flex-col items-center justify-center text-center bg-zinc-950 py-3 px-2 rounded-sm border-[#30363D] border"
                onClick={() => setShowAdjustLeverageModal(true)}
              >
                <span className="text-[#A6A6B5] text-sm">{leverage}x</span>
              </button>
            </div>

            {/* AI Trading Toggle */}
            <button
              className={`text-nowrap flex-1 flex flex-col items-center justify-center text-center bg-zinc-950 py-3 px-2 rounded-sm border ${
                showAIWidget
                  ? 'border-fuchsia-800 border-2'
                  : 'border-[#30363D]'
              } border-solid`}
              onClick={() => setShowAIWidget((prev) => !prev)}
            >
              <span className="text-[#A6A6B5] text-sm">{'AI Trading'}</span>
            </button>
          </div>

          <div className="flex flex-col w-full h-full">
            {showAIWidget ? (
              <AIChatWidget onClose={() => setShowAIWidget(false)} />
            ) : (
              <div>
                <Tabs
                  tabs={['Market', 'Limit', 'Advanced']}
                  activeTab={orderPanelTab}
                  onTabChange={setOrderPanelTab}
                />
                {/* Tab Content */}
                {orderPanelTab === 'Market' && (
                  <div className="w-full flex flex-col items-start py-4 gap-4">
                    {/* --- BEGIN Market Tab Content --- */}
                    <div className="flex items-center bg-zinc-950 py-1 pl-1 pr-[5px] gap-6 rounded-sm w-full">
                      {/* Toggle Buttons */}
                      <div className="flex w-full gap-2 text-nowrap">
                        <button
                          type="button"
                          className={`w-full py-3 flex flex-col items-center rounded-sm transition-all
                                                            ${
                                                              input1 !==
                                                              'Sell / Short'
                                                                ? 'bg-[#2DA44E33] text-[#2DA44E]'
                                                                : 'bg-transparent text-zinc-400'
                                                            }`}
                          onClick={() => onChangeInput1('Buy / Long')}
                        >
                          <span className="text-sm">{'Buy / Long'}</span>
                        </button>
                        <button
                          type="button"
                          className={`w-full py-3 flex flex-col items-center rounded-sm transition-all
                                                            ${
                                                              input1 ===
                                                              'Sell / Short'
                                                                ? 'bg-[#EF444433] text-[#F85149]'
                                                                : 'bg-transparent text-zinc-400'
                                                            }`}
                          onClick={() => onChangeInput1('Sell / Short')}
                        >
                          <span className="text-sm">{'Sell / Short'}</span>
                        </button>
                      </div>
                    </div>
                    {/* 價格輸入框 */}
                    <AmountInput
                      value={amount}
                      onChange={setAmount}
                      percentValue={percentValue}
                      maxAmount={AMOUNT_TOTAL}
                      selectedAsset={selectedAssetSymbol}
                    />

                    <ToggleButton
                      label="Reduce Only"
                      value={reduceOnly}
                      onChange={setReduceOnly}
                    />
                    <ToggleButton
                      label="Take Profit / Stop Loss"
                      value={isOn}
                      onChange={setIsOn}
                    />
                    {/* Conditional TP/SL inputs */}
                    {isOn && (
                      <div className="flex flex-col gap-4 py-2 w-full">
                        {/* Take Profit */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                          <div className="flex flex-col gap-2 min-w-0 text-left">
                            <span className="text-[#9D9DAF] text-sm">
                              Take Profit Price
                            </span>
                            <input
                              placeholder="230.00"
                              value={input3}
                              onChange={(e) => onChangeInput3(e.target.value)}
                              className="w-full text-white bg-zinc-950 text-base p-3 rounded-sm border border-[#30363D] focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-2 min-w-0 text-left">
                            <span className="text-[#9D9DAF] text-sm">
                              Take Profit %
                            </span>
                            <div className="flex items-center bg-zinc-950 p-3 rounded-sm border border-[#30363D] w-full">
                              <input
                                placeholder="%"
                                value={input4}
                                onChange={(e) => onChangeInput4(e.target.value)}
                                className="flex-1 text-white bg-transparent text-base font-bold border-0 focus:outline-none min-w-0"
                              />
                              <span className="text-white text-base ml-2">
                                %
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stop Loss */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                          <div className="flex flex-col gap-2 min-w-0 text-left">
                            <span className="text-[#9D9DAF] text-sm">
                              Stop Loss Price
                            </span>
                            <input
                              placeholder="240.00"
                              value={input5}
                              onChange={(e) => onChangeInput5(e.target.value)}
                              className="w-full text-white bg-zinc-950 text-base p-3 rounded-sm border border-[#30363D] focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-2 min-w-0 text-left">
                            <span className="text-[#9D9DAF] text-sm">
                              Stop Loss %
                            </span>
                            <div className="flex items-center bg-zinc-950 p-3 rounded-sm border border-[#30363D] w-full">
                              <input
                                placeholder="%"
                                value={input6}
                                onChange={(e) => onChangeInput6(e.target.value)}
                                className="flex-1 text-white bg-transparent text-base font-bold border-0 focus:outline-none min-w-0"
                              />
                              <span className="text-white text-base ml-2">
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col items-start w-full gap-2 ">
                      <div className="flex flex-col items-center pb-px">
                        <span className="text-zinc-400 text-sm">
                          {'Max Slippage %'}
                        </span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.1"
                        placeholder={'0.5'}
                        value={input7}
                        onChange={(event) => onChangeInput7(event.target.value)}
                        className="w-full text-white bg-zinc-950 text-base p-3 rounded-sm border border-solid border-[#30363D]"
                      />
                    </div>
                    {/* AI Insight */}
                    <Tips
                      title="AI Insight"
                      iconUrl="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/1uh405kh_expires_30_days.png"
                      tips={[
                        'Bullish trend 78% · Resistance $228.50 ·',
                        'Suitable for small position entry'
                      ]}
                    />

                    {/* Estimation */}
                    <div className="flex flex-col items-start pt-4 gap-2 w-full">
                      <span className="text-[#9D9DAF] text-sm font-bold">
                        Estimation
                      </span>
                      <div className="flex flex-col items-start gap-1 w-full">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[#9D9DAF] text-sm">Mode</span>
                          <span className="text-white text-sm">
                            {estimation.mode}
                          </span>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[#9D9DAF] text-sm">
                            Liquidation Price
                          </span>
                          <span className="text-white text-sm">
                            {estimation.liquidationPrice}
                          </span>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[#9D9DAF] text-sm">
                            Est. Fee
                          </span>
                          <span className="text-white text-sm">
                            {estimation.estFee}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <PrimaryButton
                      size="large"
                      onClick={() => {
                        // Show toast
                        showToast(
                          'Order Placed',
                          'success',
                          `Amount: ${amount} USDT`,
                          'Processing time: ~15s'
                        );

                        // Update table data
                        setBalanceTableData((prev) =>
                          prev.map((row, idx) => {
                            if (idx === 0) {
                              const available =
                                parseFloat(row.available.replace(/,/g, '')) -
                                500;
                              const inOrders =
                                parseFloat(row.inOrders.replace(/,/g, '')) +
                                500;
                              const value = `$${(
                                available + inOrders
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}`;
                              return {
                                ...row,
                                available: available.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }),
                                inOrders: inOrders.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }),
                                value
                              };
                            }
                            return row;
                          })
                        );

                        setPositions((prev) => [newPosition, ...prev]); // insert top
                      }}
                    >
                      {input1 === 'Sell / Short'
                        ? 'Sell / Short'
                        : 'Buy / Long'}
                    </PrimaryButton>

                    {toast && (
                      <Toast
                        title={toast.title}
                        message={toast.message}
                        subMessage={toast.subMessage}
                        type={toast.type}
                        onClose={() => setToast(null)}
                      />
                    )}
                    {/* --- END Market Tab Content --- */}
                  </div>
                )}
                {orderPanelTab === 'Limit' && (
                  <div className="w-full flex flex-col items-start py-4 gap-4">
                    {/* --- BEGIN Limit Tab Content --- */}
                    <div className="flex items-center bg-zinc-950 py-1 pl-1 pr-[5px] gap-6 rounded-sm w-full">
                      {/* Toggle Buttons */}
                      <div className="flex w-full gap-2 text-nowrap">
                        <button
                          type="button"
                          className={`w-full py-3 flex flex-col items-center rounded-sm transition-all
                                                            ${
                                                              input1 !==
                                                              'Sell / Short'
                                                                ? 'bg-[#2DA44E33] text-[#2DA44E]'
                                                                : 'bg-transparent text-zinc-400'
                                                            }`}
                          onClick={() => onChangeInput1('Buy / Long')}
                        >
                          <span className="text-sm">{'Buy / Long'}</span>
                        </button>
                        <button
                          type="button"
                          className={`w-full py-3 flex flex-col items-center rounded-sm transition-all
                                                            ${
                                                              input1 ===
                                                              'Sell / Short'
                                                                ? 'bg-[#EF444433] text-[#F85149]'
                                                                : 'bg-transparent text-zinc-400'
                                                            }`}
                          onClick={() => onChangeInput1('Sell / Short')}
                        >
                          <span className="text-sm">{'Sell / Short'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 w-full">
                      <div className="flex flex-col items-center pb-px">
                        <span className="text-[#9D9DAF] text-sm">
                          {'Price (USDC)'}
                        </span>
                      </div>
                      <input
                        type="number"
                        placeholder={'227.00'}
                        value={input3}
                        onChange={(event) => onChangeInput3(event.target.value)}
                        className="text-white bg-[#0D1117] text-base p-3 rounded-md border border-solid border-[#30363D] w-full"
                      />
                    </div>
                    {/* 價格輸入框 */}
                    <AmountInput
                      value={amount}
                      onChange={setAmount}
                      percentValue={percentValue}
                      maxAmount={AMOUNT_TOTAL}
                      selectedAsset={selectedAssetSymbol}
                    />
                    <ToggleButton
                      label="Reduce Only"
                      value={reduceOnly}
                      onChange={setReduceOnly}
                    />
                    <ToggleButton
                      label="Take Profit / Stop Loss"
                      value={isOn}
                      onChange={setIsOn}
                    />
                    {/* Conditional TP/SL inputs */}
                    {isOn && (
                      <div className="flex flex-col gap-4 py-2 w-full">
                        {/* Take Profit */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                          <div className="flex flex-col gap-2 min-w-0 text-left">
                            <span className="text-[#9D9DAF] text-sm">
                              Take Profit Price
                            </span>
                            <input
                              placeholder="230.00"
                              value={input3}
                              onChange={(e) => onChangeInput3(e.target.value)}
                              className="w-full text-white bg-zinc-950 text-base p-3 rounded-sm border border-[#30363D] focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-2 min-w-0 text-left">
                            <span className="text-[#9D9DAF] text-sm">
                              Take Profit %
                            </span>
                            <div className="flex items-center bg-zinc-950 p-3 rounded-sm border border-[#30363D] w-full">
                              <input
                                placeholder="%"
                                value={input4}
                                onChange={(e) => onChangeInput4(e.target.value)}
                                className="flex-1 text-white bg-transparent text-base font-bold border-0 focus:outline-none min-w-0"
                              />
                              <span className="text-white text-base ml-2">
                                %
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stop Loss */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                          <div className="flex flex-col gap-2 min-w-0 text-left">
                            <span className="text-[#9D9DAF] text-sm">
                              Stop Loss Price
                            </span>
                            <input
                              placeholder="240.00"
                              value={input5}
                              onChange={(e) => onChangeInput5(e.target.value)}
                              className="w-full text-white bg-zinc-950 text-base p-3 rounded-sm border border-[#30363D] focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-2 min-w-0 text-left">
                            <span className="text-[#9D9DAF] text-sm">
                              Stop Loss %
                            </span>
                            <div className="flex items-center bg-zinc-950 p-3 rounded-sm border border-[#30363D] w-full">
                              <input
                                placeholder="%"
                                value={input6}
                                onChange={(e) => onChangeInput6(e.target.value)}
                                className="flex-1 text-white bg-transparent text-base font-bold border-0 focus:outline-none min-w-0"
                              />
                              <span className="text-white text-base ml-2">
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* AI Insight */}
                    <Tips
                      title="AI Insight"
                      iconUrl="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/1uh405kh_expires_30_days.png"
                      tips={[
                        'Bullish trend 78% · Resistance $228.50 ·',
                        'Suitable for small position entry'
                      ]}
                    />
                    {/* Estimation */}
                    <div className="flex flex-col items-start pt-4 gap-2 w-full">
                      <span className="text-[#9D9DAF] text-sm font-bold">
                        Estimation
                      </span>
                      <div className="flex flex-col items-start gap-1 w-full">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[#9D9DAF] text-sm">Mode</span>
                          <span className="text-white text-sm">
                            {estimation.mode}
                          </span>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[#9D9DAF] text-sm">
                            Liquidation Price
                          </span>
                          <span className="text-white text-sm">
                            {estimation.liquidationPrice}
                          </span>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[#9D9DAF] text-sm">
                            Est. Fee
                          </span>
                          <span className="text-white text-sm">
                            {estimation.estFee}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Submit Button */}
                    <PrimaryButton
                      size="large"
                      onClick={() => {
                        // Show toast
                        showToast(
                          'Order Placed',
                          'success',
                          `Amount: ${amount} USDT`,
                          'Processing time: ~15s'
                        );

                        // Update table data
                        setBalanceTableData((prev) =>
                          prev.map((row, idx) => {
                            if (idx === 0) {
                              const available =
                                parseFloat(row.available.replace(/,/g, '')) -
                                500;
                              const inOrders =
                                parseFloat(row.inOrders.replace(/,/g, '')) +
                                500;
                              const value = `$${(
                                available + inOrders
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}`;
                              return {
                                ...row,
                                available: available.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }),
                                inOrders: inOrders.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }),
                                value
                              };
                            }
                            return row;
                          })
                        );

                        setPositions((prev) => [newPosition, ...prev]); // insert top
                      }}
                    >
                      {input1 === 'Sell / Short'
                        ? 'Sell / Short'
                        : 'Buy / Long'}
                    </PrimaryButton>

                    {toast && (
                      <Toast
                        title={toast.title}
                        message={toast.message}
                        subMessage={toast.subMessage}
                        type={toast.type}
                        onClose={() => setToast(null)}
                      />
                    )}
                    {/* --- END Limit Tab Content --- */}
                  </div>
                )}
                {orderPanelTab === 'Advanced' && (
                  <div className="w-full flex flex-col items-start py-4 gap-4">
                    {/* --- BEGIN Advanced Tab Content --- */}
                    <div className="flex items-center bg-zinc-950 py-1 pl-1 pr-[5px] gap-6 rounded-sm w-full">
                      {/* Toggle Buttons */}
                      <div className="flex w-full gap-2 text-nowrap">
                        <button
                          type="button"
                          className={`w-full py-3 flex flex-col items-center rounded-sm transition-all
                                                            ${
                                                              input1 !==
                                                              'Sell / Short'
                                                                ? 'bg-[#2DA44E33] text-[#2DA44E]'
                                                                : 'bg-transparent text-zinc-400'
                                                            }`}
                          onClick={() => onChangeInput1('Buy / Long')}
                        >
                          <span className="text-sm">{'Buy / Long'}</span>
                        </button>
                        <button
                          type="button"
                          className={`w-full py-3 flex flex-col items-center rounded-sm transition-all
                                                            ${
                                                              input1 ===
                                                              'Sell / Short'
                                                                ? 'bg-[#EF444433] text-[#F85149]'
                                                                : 'bg-transparent text-zinc-400'
                                                            }`}
                          onClick={() => onChangeInput1('Sell / Short')}
                        >
                          <span className="text-sm">{'Sell / Short'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 w-full">
                      <div className="flex flex-col items-center pb-px">
                        <span className="text-[#9D9DAF] text-sm">
                          {'Stop-Loss Type'}
                        </span>
                      </div>
                      {/* Stop-Loss Type Dropdown */}
                      <Select
                        value={stoplossType}
                        onChange={setStoplossType}
                        placeholder="Stop-Loss Type"
                        options={[
                          { label: 'Stop Market', value: 'Stop Market' },
                          { label: 'Stop Limit', value: 'Stop Limit' }
                        ]}
                        minWidth="min-w-32"
                      />
                    </div>
                    {/* Input fields */}
                    <div className="flex flex-col items-start gap-2 w-full">
                      <div className="flex flex-col items-center pb-px">
                        <span className="text-[#9D9DAF] text-sm">
                          {'Trigger Price (USDC)'}
                        </span>
                      </div>
                      <input
                        type="number"
                        placeholder={'226.00'}
                        value={input8}
                        onChange={(event) => onChangeInput8(event.target.value)}
                        className="w-full text-white bg-[#0D1117] text-base p-3 rounded-md border border-solid border-[#30363D]"
                      />
                    </div>
                    <div className="flex flex-col items-start gap-2 w-full">
                      <div className="flex flex-col items-center pb-px">
                        <span className="text-[#9D9DAF] text-sm">
                          {'Limit Price'}
                        </span>
                      </div>
                      <div className="flex flex-col items-start gap-1 w-full">
                        <input
                          type="number"
                          placeholder={'225.78'}
                          value={input9}
                          onChange={(event) =>
                            onChangeInput9(event.target.value)
                          }
                          className="w-full text-white bg-[#0D1117] text-base p-3 rounded-md border border-solid border-[#30363D]"
                        />
                        <span className="text-[#9D9DAF] text-sm">
                          {'Limit Rule: Limit = Stop ± 0.1%'}
                        </span>
                      </div>
                    </div>
                    {/* 價格輸入框 */}
                    <AmountInput
                      value={amount}
                      onChange={setAmount}
                      percentValue={percentValue}
                      maxAmount={AMOUNT_TOTAL}
                      selectedAsset={selectedAssetSymbol}
                    />
                    <ToggleButton
                      label="Reduce Only"
                      value={reduceOnly}
                      onChange={setReduceOnly}
                    />
                    <ToggleButton
                      label="Take Profit / Stop Loss"
                      value={isOn}
                      onChange={setIsOn}
                    />
                    {/* Conditional TP/SL inputs */}
                    {isOn && (
                      <div className="flex flex-col gap-4 py-2 w-full">
                        {/* Take Profit */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                          <div className="flex flex-col gap-2 min-w-0 text-left">
                            <span className="text-[#9D9DAF] text-sm">
                              Take Profit Price
                            </span>
                            <input
                              placeholder="230.00"
                              value={input3}
                              onChange={(e) => onChangeInput3(e.target.value)}
                              className="w-full text-white bg-zinc-950 text-base p-3 rounded-sm border border-[#30363D] focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-2 min-w-0 text-left">
                            <span className="text-[#9D9DAF] text-sm">
                              Take Profit %
                            </span>
                            <div className="flex items-center bg-zinc-950 p-3 rounded-sm border border-[#30363D] w-full">
                              <input
                                placeholder="%"
                                value={input4}
                                onChange={(e) => onChangeInput4(e.target.value)}
                                className="flex-1 text-white bg-transparent text-base font-bold border-0 focus:outline-none min-w-0"
                              />
                              <span className="text-white text-base ml-2">
                                %
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stop Loss */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                          <div className="flex flex-col gap-2 min-w-0 text-left">
                            <span className="text-[#9D9DAF] text-sm">
                              Stop Loss Price
                            </span>
                            <input
                              placeholder="240.00"
                              value={input5}
                              onChange={(e) => onChangeInput5(e.target.value)}
                              className="w-full text-white bg-zinc-950 text-base p-3 rounded-sm border border-[#30363D] focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-2 min-w-0 text-left">
                            <span className="text-[#9D9DAF] text-sm">
                              Stop Loss %
                            </span>
                            <div className="flex items-center bg-zinc-950 p-3 rounded-sm border border-[#30363D] w-full">
                              <input
                                placeholder="%"
                                value={input6}
                                onChange={(e) => onChangeInput6(e.target.value)}
                                className="flex-1 text-white bg-transparent text-base font-bold border-0 focus:outline-none min-w-0"
                              />
                              <span className="text-white text-base ml-2">
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 w-full">
                      <div className="flex flex-col items-start w-full gap-2">
                        <div className="flex flex-col items-center pb-px h-6">
                          <span className="text-zinc-400 text-sm ">
                            {'Max Slippage %'}
                          </span>
                        </div>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.1"
                          placeholder={'0.5'}
                          value={input7}
                          onChange={(event) =>
                            onChangeInput7(event.target.value)
                          }
                          className="w-full text-white bg-zinc-950 text-base p-3 rounded-sm border border-solid border-[#30363D]"
                        />
                      </div>
                      <div className="flex flex-col items-start w-full gap-2">
                        <div className="flex items-center pb-px gap-2 h-6">
                          <span className="text-[#9D9DAF] text-sm">
                            {'TIF'}
                          </span>

                          {/* Wrap icon + tooltip in relative */}
                          <div className="relative">
                            <button
                              type="button"
                              className="focus:outline-none"
                              onClick={() => setShowTifTooltip((v) => !v)}
                              tabIndex={0}
                            >
                              <img
                                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/32hekqyb_expires_30_days.png"
                                className="w-3 h-3 object-fill"
                                alt="TIF Info"
                              />
                            </button>

                            {showTifTooltip && (
                              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-10 bg-Dark_Tier1 text-sm text-white rounded px-3 py-2 border border-[#30363D] shadow-lg w-56">
                                <span className="font-bold">
                                  TIF (Time in Force)
                                </span>
                                <br />
                                <br />
                                <span>
                                  TIF determines how long an order remains
                                  active.
                                  <br />
                                  <b>GTC</b>: Good Till Cancelled
                                  <br />
                                  <b>IOC</b>: Immediate Or Cancel
                                  <br />
                                  <b>ALO</b>: Add Liquidity Only
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="relative w-full">
                          <select
                            className="appearance-none w-full flex items-center bg-zinc-950 text-left p-3 pr-8 rounded-sm border border-solid border-[#30363D] text-white text-base"
                            value={tif}
                            onChange={(e) => setTif(e.target.value)}
                          >
                            <option value="GTC">GTC</option>
                            <option value="IOC">IOC</option>
                            <option value="ALO">ALO</option>
                          </select>
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                            <img
                              src={
                                'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/w4taczak_expires_30_days.png'
                              }
                              className="w-3 h-[15px] rounded-md object-fill"
                              alt="Dropdown"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* AI Insight */}
                    <Tips
                      title="AI Insight"
                      iconUrl="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/1uh405kh_expires_30_days.png"
                      tips={[
                        'Bullish trend 78% · Resistance $228.50 ·',
                        'Suitable for small position entry'
                      ]}
                    />
                    {/* Estimation */}
                    <div className="flex flex-col items-start pt-4 gap-2 w-full">
                      <span className="text-[#9D9DAF] text-sm font-bold">
                        Estimation
                      </span>
                      <div className="flex flex-col items-start gap-1 w-full">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[#9D9DAF] text-sm">Mode</span>
                          <span className="text-white text-sm">
                            {estimation.mode}
                          </span>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[#9D9DAF] text-sm">
                            Liquidation Price
                          </span>
                          <span className="text-white text-sm">
                            {estimation.liquidationPrice}
                          </span>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[#9D9DAF] text-sm">
                            Est. Fee
                          </span>
                          <span className="text-white text-sm">
                            {estimation.estFee}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Submit Button */}
                    <PrimaryButton
                      size="large"
                      onClick={() => {
                        // Show toast
                        showToast(
                          'Order Placed',
                          'success',
                          `Amount: ${amount} USDT`,
                          'Processing time: ~15s'
                        );

                        // Update table data
                        setBalanceTableData((prev) =>
                          prev.map((row, idx) => {
                            if (idx === 0) {
                              const available =
                                parseFloat(row.available.replace(/,/g, '')) -
                                500;
                              const inOrders =
                                parseFloat(row.inOrders.replace(/,/g, '')) +
                                500;
                              const value = `$${(
                                available + inOrders
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}`;
                              return {
                                ...row,
                                available: available.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }),
                                inOrders: inOrders.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }),
                                value
                              };
                            }
                            return row;
                          })
                        );

                        setPositions((prev) => [newPosition, ...prev]); // insert top
                      }}
                    >
                      {input1 === 'Sell / Short'
                        ? 'Sell / Short'
                        : 'Buy / Long'}
                    </PrimaryButton>

                    {toast && (
                      <Toast
                        title={toast.title}
                        message={toast.message}
                        subMessage={toast.subMessage}
                        type={toast.type}
                        onClose={() => setToast(null)}
                      />
                    )}
                    {/* --- END Advanced Tab Content --- */}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {showAdjustLeverageModal && (
        <AdjustLeverageModal
          leverage={leverage}
          setLeverage={setLeverage}
          onClose={() => setShowAdjustLeverageModal(false)}
          onConfirm={() => {
            console.log('Confirmed leverage:', leverage);
            setShowAdjustLeverageModal(false);
          }}
        />
      )}
    </div>
  );
};
export default Trading;
