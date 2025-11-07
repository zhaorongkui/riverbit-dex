import React, { useState, useRef, useEffect } from 'react';
import PrimaryButton from '../components/Button/PrimaryButton';
import PercentSlider from '../components/PercentSlider';
import Tabs from '../components/Tabs';
import Tips from '../components/Tips';
import Select from '../components/Select';
import StatusTag from '../components/StatusTag';
import Toast from '../components/Toast';
import {
  getPointsHistory,
  getPointsHistoryRange,
  getRransactions,
  getLpSeats
} from '../api/riverChain';
import { getAssets, getVaultAllOwnerShares } from '../api/dYdX';
import useWallet from '../hooks/useWallet';
import { useDydxAddress } from '../hooks/useDydxAddress';
import { useWithdrawalSignature } from '../hooks/useWithdrawDepositSigned';
import {
  getMegavaulPositions,
  getMegavaultHistoricalPnl,
  getVaultsHistoricalPnl
} from '../api/indexer';
import userInfoStore from '../stores/userStore';
import { formatDate } from '../utils/date';
import { signCompliancePayload } from '../utils/compliance';

const RiverPool = () => {
  const {
    generateDydxWallet,
    signMessage,
    verifySignature,
    recoverPublicKeyFromSignature,
    publicKeyToDydxAddress
  } = useDydxAddress();
  const { userInfo } = userInfoStore();
  const { generateWithdrawalSignature } = useWithdrawalSignature();
  const { address, isConnected, chainId } = useWallet();
  const [input1, onChangeInput1] = useState('');
  const [riverPoolTab, setRiverPoolTab] = useState('Foundation');
  const [depositWithdrawTab, setdepositWithdrawTab] = useState('Deposit');
  const [recordsTab, setRecordsTab] = useState('Records');
  const [timeRange, setTimeRange] = React.useState('All Time');
  const [error, setError] = useState<string | null>(null);
  const [dydxWallet, setDydxWallet] = useState<any>(null);

  // Assume a total amount for percent calculation
  const AMOUNT_TOTAL = 1000;

  // Calculate percent from input1 (amount)
  const percentValue = input1
    ? Math.max(
        0,
        Math.min(100, Math.round((Number(input1) / AMOUNT_TOTAL) * 100))
      )
    : 0;

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

  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const walletDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const [pointsHistory, setPointsHistory] = useState<Array<any>>([]);
  const [positions, setPositions] = useState<Array<any>>([]);
  const [records, setRecords] = useState<Array<any>>([]);
  const [tradeHistory, setTradeHistory] = useState<Array<any>>([]);
  const [lpSeats, setLpSeats] = useState(null);
  const signature = localStorage.getItem('signature') || '';
  const accountAddress = 'dydx1abc123def456ghi789jkl012mno345pqr678stu901vwx';
  //  const accountAddress = 'river199tqg4wdlnu4qjlxchpd7seg454937hjzn0qfk';
  // console.log('getsignature---', signature);
  const [withdrawalMessage, setWithdrawalMessage] =
    useState('测试一下提现消息签名，提现100元！');

  // 1. 用户发起提现时生成签名
  const handleSignature = async () => {
    const payload = {
      message: withdrawalMessage,
      action: 'withdraw',
      status: 'pending'
    };
    // 调用 Hook 生成签名
    const result = await generateWithdrawalSignature(payload);
    if (result.status === 'SUCCESS' && result.data) {
      const { signedMessage, publicKey, timestamp } = result.data;
      // 签名成功，可继续处理后续逻辑（如提交到后端）
      console.log('使用签名结果:', { signedMessage, publicKey, timestamp });
    } else {
      // 签名失败，提示用户
      console.error('签名生成失败');
    }
  };

  // 获取资金支付 Funding History 数据
  const getPointsHistoryList = async () => {
    console.log(2222222, address, typeof address, signature);
    const res = await getPointsHistory(address, 50, 0);
    console.log(res.code, 444444444);
    if (res.code == 0) {
      const items = [
        {
          id: 1,
          address: '0x79543329b47FF411691A6DAD24F964A9a7A91a3C',
          points: '100',
          source: 'deposit',
          timestamp: 1234567890
        },
        {
          id: 1,
          address: '0x79543329b47FF411691A6DAD24F964A9a7A91a3C',
          points: '100',
          source: 'deposit',
          timestamp: 1234567890
        }
      ];
      // res.data.data
      setPointsHistory(items);
    }
    console.log(1111, res, pointsHistory);
  };
  useEffect(() => {
    if (isConnected && signature) {
      generateDydxAddress();
    }
  }, [isConnected, signature]);

  const generateDydxAddress = async () => {
    if (!signature) return;

    try {
      const wallet = await generateDydxWallet(signature);
      setDydxWallet(wallet);
      console.log('生成成功！');
      console.log('助记词：', wallet.mnemonic);
      console.log('dYdX地址：', wallet.dydxAddress);
      console.log('私钥（Uint8Array）：', wallet.privateKey);

      // setTimeout(()=> {

      // }, 2000)
    } catch (error) {
      console.error('Failed to generate dYdX wallet:', error);
    } finally {
    }
  };
  // 获取positions 数据/Megavault 仓位
  const getMegavaulPositionsList = async () => {
    const res = await getMegavaulPositions();
    console.log(1111, '/Megavault 仓位--positions 数据', res);
    setPositions(res.positions); // positions 数据赋值
  };
  // 获取DePositions 数据
  const getVaultAllOwnerSharesList = async () => {
    // 不确定
    const res = await getVaultAllOwnerShares();
    console.log(777777, '金库所有的share  --DePositions 数据', res);
    // setPositions(res.positions); // DePositions 数据赋值
  };
  // 获取MegavaultHistoricalPnl 数据/Megavault 历史盈亏
  const getMegavaultHistoricalPnlList = async () => {
    const res = await getMegavaultHistoricalPnl();
    console.log(22222222, 'Megavault 历史盈亏', res);
  };
  // VaultsHistoricalPnlList 数据/所有 Vault 历史盈亏
  const getVaultsHistoricalPnlList = async () => {
    const res = await getVaultsHistoricalPnl();
    console.log(5555555, '所有 Vault 历史盈亏', res);
  };

  // VaultsHistoricalPnlList 数据/所有 Vault 历史盈亏
  const getLpSeatsList = async () => {
    const data = {
      address: '0x123...',
      count: 3,
      total_deposit_amount: '30000.00',
      total_lp_points: '15000.50',
      seats: [
        {
          id: 1,
          address: '0x123...',
          seat_number: 1,
          deposit_amount: '10000.00',
          deposited_at: '2025-01-01T00:00:00Z',
          lock_period_days: 180,
          unlock_date: '2025-07-01T00:00:00Z',
          is_redeemed: false,
          points_earned: '5000.00',
          dd_guard_triggered: false
        },
        {
          id: 2,
          address: '0x123...',
          seat_number: 5,
          deposit_amount: '20000.00',
          deposited_at: '2025-01-15T00:00:00Z',
          lock_period_days: 180,
          unlock_date: '2025-07-15T00:00:00Z',
          is_redeemed: false,
          points_earned: '10000.50',
          dd_guard_triggered: false
        }
      ]
    };
    setLpSeats(data);
    const res = await getLpSeats(accountAddress);
    console.log(787878787, '所有 席位相关数据', res);
  };

  // 获取Recode
  const getPointsHistoryRangeList = async () => {
    const res = await getPointsHistoryRange(
      address,
      '1609459200',
      '1640995200',
      50,
      0
    );
    console.log(6666666, 'Recode数据', res);
    // const items = [
    //   {
    //     "id": 1,
    //     "tx_hash": "0xabc123...",
    //     "block_height": 1234567,
    //     "block_time": "2025-10-31T10:30:00Z",
    //     "tx_type": "place_order",
    //     "address": "0x123...",
    //     "clob_pair_id": 1,
    //     "size": "1000.50",
    //     "fee": "0.25"
    //   },
    //   {
    //     "id": 2,
    //     "tx_hash": "0xdef456...",
    //     "block_height": 1234568,
    //     "block_time": "2025-10-31T10:35:00Z",
    //     "tx_type": "transfer",
    //     "address": "0x123...",
    //     "size": "500.00",
    //     "fee": "0.10"
    //   }
    // ]
    const items = [
      {
        id: 1,
        address: '0x123...',
        points: '100',
        source: 'deposit',
        timestamp: 1609459500
      },
      {
        id: 2,
        address: '0x123...',
        points: '50',
        source: 'swap',
        timestamp: 1609460000
      }
    ];
    setRecords(items);
    // setRecords(res.data.data);
  };
  // 获取TradeHistory
  const getRransactionsList = async () => {
    const res = await getRransactions(
      address,
      '1609459200',
      '1640995200',
      50,
      0
    );
    console.log(6666666, '获取TradeHistory数据', res);
    const items = [
      {
        id: 1,
        tx_hash: '0xabc123...',
        block_height: 1234567,
        block_time: '2025-10-31T10:30:00Z',
        tx_type: 'place_order',
        address: '0x123...',
        clob_pair_id: 1,
        size: '1000.50',
        fee: '0.25'
      },
      {
        id: 2,
        tx_hash: '0xdef456...',
        block_height: 1234568,
        block_time: '2025-10-31T10:35:00Z',
        tx_type: 'transfer',
        address: '0x123...',
        size: '500.00',
        fee: '0.10'
      }
    ];
    setTradeHistory(items);
    // setTradeHistory(res.data.data);
  };
  useEffect(() => {
    // console.log(44444444, pointsHistory, positions)
  }, [pointsHistory, positions, records, tradeHistory, lpSeats]);
  useEffect(() => {
    // 防抖动：300ms内连续切换类型，只执行最后一次
    const timer = setTimeout(() => {
      getPointsHistoryList(); // 积分历史
      getPointsHistoryRangeList(); // 获取Recode

      // getMegavaulPositionsList();
      getMegavaultHistoricalPnlList();
      getVaultsHistoricalPnlList();
      getLpSeatsList(); // 获取制定用户所有席位
    }, 300);
    // 清理：组件卸载或orderBookType变化时，清除上一个定时器
    return () => clearTimeout(timer);
  }, []);
  const changeFooterTab = (type: string) => {
    console.log(type);
    setRecordsTab(type);
    if (type === 'Records') {
      getPointsHistoryRangeList();
    } else if (type === 'Depositors') {
      getVaultAllOwnerSharesList();
    } else if (type === 'Pool Positions') {
      getMegavaulPositionsList();
    } else if (type === 'Trade History') {
      getRransactionsList();
    }
  };
  const changeRiverPoolTab = (type: string) => {
    console.log(type);
    setRiverPoolTab(type);
  };

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

  return (
    <div className="flex flex-col bg-black min-h-screen">
      <div className="flex flex-col self-stretch gap-2  main-content w-full max-w-[1440px] mx-auto px-4">
        <div className="flex flex-col self-stretch py-12 lg:mx-20 gap-8">
          <div className="flex items-start self-stretch border-b border-[#30363D] w-full">
            <div className="xl:max-w-1/4 w-full">
              <button className="text-[#fff]" onClick={handleSignature}>
                签名
              </button>
              <Tabs
                tabs={['Foundation', 'Main']}
                activeTab={riverPoolTab}
                onTabChange={changeRiverPoolTab}
              />
            </div>
          </div>
          {/* Tab Content */}
          {riverPoolTab === 'Foundation' && (
            <div className="flex flex-col self-stretch gap-4">
              <div className="flex flex-col self-stretch gap-8 w-full">
                <div className="w-full flex flex-col lg:flex-row justify-between items-start self-stretch gap-4">
                  <div className="flex flex-col shrink-0 items-start gap-1">
                    <span className="text-white text-3xl font-bold">
                      {'Foundation LP'}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#8B949E] text-base">
                        {'0x•••abcd'}
                      </span>
                      <img
                        src={
                          'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/8y7btkl5_expires_30_days.png'
                        }
                        className="w-3.5 h-5 object-fill"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col self-stretch gap-3">
                  <div className="flex flex-col lg:flex-row items-start self-stretch gap-3">
                    {/* border border-solid border-[#30363D] */}
                    <div className="w-full flex lg:basis-1/4 flex-col items-start bg-[#161B22] py-6 rounded-md">
                      <span className="text-[#8B949E] text-sm mb-[7px] mx-6">
                        {'Total Value Locked (TVL)'}
                      </span>
                      <span className="text-white text-2xl font-bold mb-[3px] mx-6">
                        {'$8.8M'}
                      </span>
                    </div>
                    <div className="w-full flex lg:basis-1/4 flex-col items-start bg-[#161B22] py-6 rounded-md">
                      <span className="text-[#8B949E] text-sm mb-[7px] mx-6">
                        {'Last Month’s Yield'}
                      </span>
                      <span className="text-[#2DA44E] text-2xl font-bold mb-[3px] mx-6">
                        {'385.2%'}
                      </span>
                    </div>
                    <div className="w-full flex lg:basis-1/4 flex-col items-start bg-[#161B22] py-6 rounded-md">
                      <span className="text-[#8B949E] text-sm mb-[7px] mx-6">
                        {'Your Deposit'}
                      </span>
                      <span className="text-white text-2xl font-bold mb-[3px] mx-6">
                        {lpSeats?.total_deposit_amount}
                      </span>
                    </div>
                    <div className="w-full flex lg:basis-1/4 flex-col items-start bg-[#161B22] py-6 rounded-md">
                      <span className="text-[#8B949E] text-sm mb-[7px] mx-6">
                        {'Cumulative Earnings'}
                      </span>
                      <span className="text-white text-2xl font-bold mb-[3px] mx-6">
                        {'$104,000'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full flex flex-col lg:flex-row items-start self-stretch gap-3">
                    <div className="w-full flex lg:basis-2/3 flex-col bg-[#161B22] py-6 gap-[21px] rounded-md">
                      <div className="flex items-center self-stretch mx-6 justify-between text-left">
                        <span className="w-full flex-1 text-white text-xl font-bold">
                          {'Account Value / PNL'}
                        </span>
                        <div className="relative">
                          <Select
                            value={timeRange}
                            onChange={setTimeRange}
                            options={['All Time', '1D', '1W', '1M', '1Y'].map(
                              (v) => ({ label: v, value: v })
                            )}
                            placeholder="Time Range"
                            className="min-w-32"
                          />
                        </div>
                      </div>
                      <div className="self-stretch h-[300px] mx-6"></div>
                      <div className="flex flex-col xl:flex-row justify-between items-start self-stretch mx-6">
                        <div className="flex shrink-0 items-center pr-0.5 gap-2">
                          <span className="text-[#8B949E] text-sm">
                            {'Deposit:'}
                          </span>
                          <span className="text-white text-sm">
                            {'100,000 USDC / Seat'}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center pr-0.5 gap-2.5">
                          <span className="text-[#8B949E] text-sm">
                            {'Lock-up:'}
                          </span>
                          <span className="text-white text-sm">
                            {'180 days'}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center pr-0.5 gap-3.5">
                          <span className="text-[#8B949E] text-sm">
                            {'Drawdown (DD):'}
                          </span>
                          <span className="text-red-400 text-sm">{'10%'}</span>
                        </div>
                      </div>
                    </div>
                    {/* border border-solid border-[#30363D] */}
                    <div className="w-full flex lg:basis-1/3 flex-col items-center bg-[#161B22] rounded-md">
                      <div className="relative w-full">
                        <Tabs
                          tabs={['Deposit', 'Withdraw']}
                          activeTab={depositWithdrawTab}
                          onTabChange={setdepositWithdrawTab}
                        />
                      </div>

                      <div className="flex flex-col items-start p-6 gap-[17px] w-full">
                        <div className="flex items-center w-full justify-between">
                          <span className="text-[#8B949E] text-sm ">
                            {'Available Balance:'}
                          </span>
                          <span className="text-white text-sm font-bold">
                            {'$10,000'}
                          </span>
                        </div>
                        {/* 價格輸入框 */}
                        <div className="flex flex-col items-start gap-2 w-full">
                          <div className="flex flex-col items-center pb-px">
                            <span className="text-[#9D9DAF] text-sm">
                              {'Amount'}
                            </span>
                          </div>
                          {/* 金額輸入框與貨幣標籤 */}
                          <div className="flex justify-between bg-zinc-950 py-[9px] px-3 rounded-sm border border-solid border-[#30363D] w-full ">
                            <input
                              placeholder="0"
                              value={input1}
                              onChange={(e) => {
                                const value = Number(
                                  e.target.value.replace(/,/g, '')
                                );
                                onChangeInput1(
                                  isNaN(value) ? '' : value.toString()
                                );
                              }}
                              className="w-full text-white bg-transparent text-base py-[3px] border-0"
                            />
                            <div className="flex shrink-0 items-center bg-Dark_Tier2 py-[7px] pl-2 pr-[7px] gap-1.5 rounded">
                              <span className="text-zinc-400 text-sm font-bold">
                                USDC (Arbitrum)
                              </span>
                              <img
                                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/bvauf8h6_expires_30_days.png"
                                className="w-3 h-[15px] rounded-sm object-fill"
                              />
                            </div>
                          </div>
                          {/* 滑桿與快捷百分比按鈕 */}
                          <PercentSlider
                            value={percentValue}
                            maxAmount={AMOUNT_TOTAL}
                            onChangeAmount={(amount) =>
                              onChangeInput1(amount.toString())
                            }
                          />
                        </div>

                        <Tips
                          tips={[
                            'Limited to 100 Seats – First Come, First Served',
                            'Unlocks Automatically at Maturity T+1'
                          ]}
                        />

                        {/* Confirm Button */}
                        <PrimaryButton
                          size="large"
                          onClick={() => {
                            if (!input1 || Number(input1) <= 0) {
                              setError('Please enter a valid amount');
                              return;
                            }

                            // 清除錯誤
                            setError(null);

                            // 顯示 toast
                            showToast(
                              `${depositWithdrawTab} Successful`,
                              'success',
                              `Amount: ${input1} USDT`,
                              `Processing time: ~15s`
                            );
                          }}
                        >
                          {depositWithdrawTab}
                        </PrimaryButton>

                        {/* Error message */}
                        {error && (
                          <div className="text-red-500 text-xs mt-2">
                            {error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="flex flex-col items-start self-stretch py-4 rounded-lg border-l-4 border-solid border-fuchsia-800"
                style={{
                  background: 'linear-gradient(180deg, #92318D33, #00000000)'
                }}
              >
                <span className="text-white text-base font-bold ml-5">
                  {'Seat #12 Activated'}
                </span>
                <span className="text-[#8B949E] text-sm ml-5">
                  {'Expected Value: 500,000 Points'}
                </span>
                <span className="text-[#8B949E] text-sm ml-5">
                  {'Earnings Start in 88 Days'}
                </span>
              </div>
              {/* border border-solid border-[#30363D] */}
              <div className="flex flex-col items-start self-stretch bg-[#161B22] py-px rounded-md">
                <span className="text-white text-2xl font-bold my-6 ml-[25px] mr-px">
                  {'My Points History'}
                </span>
                <div className="overflow-x-auto w-full pb-6 px-6 mx-px">
                  <table className="min-w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[#8B949E] text-sm font-bold border-b border-[#30363D]">
                        <th className="py-4 px-4">Date</th>
                        <th className="py-4 px-4">Earned Points</th>
                        <th className="py-4 px-4">Cumulative Points</th>
                        <th className="py-4 px-4">Value</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        /* [
                        {
                          date: "2025-09-05",
                          earnedPoints: "+0 Points",
                          cumulativePoints: "0 Points",
                          value: "$0",
                          status: "Pending Launch",
                          note: "No rewards before launch",
                        },
                        {
                          date: "2025-09-04",
                          earnedPoints: "+0 Points",
                          cumulativePoints: "0 Points",
                          value: "$0",
                          status: "Pending Launch",
                          note: "No rewards before launch",
                        },
                        {
                          date: "2025-09-03",
                          earnedPoints: "+0 Points",
                          cumulativePoints: "0 Points",
                          value: "$0",
                          status: "Pending Launch",
                          note: "No rewards before launch",
                        },
                      ] */
                        pointsHistory.map((row, idx) => (
                          <tr
                            key={idx}
                            className="text-[#E6EDF3] text-sm border-b border-[#30363D]"
                          >
                            <td className="py-4 px-4">
                              {formatDate(row.timestamp, 'DD/MM/YYYY HH:mm:ss')}
                            </td>
                            <td className="py-4 px-4">{row.points}</td>
                            <td className="py-4 px-4">
                              {row.cumulativePoints || '--'}
                            </td>
                            <td className="py-4 px-4">{row.value || '--'}</td>
                            <td className="py-4 px-4">
                              <StatusTag status={row.status} />
                            </td>
                            <td className="py-4 px-4">{row.note || '--'}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="w-full self-stretch bg-[#161B22] rounded-md ">
                <div className="w-full border-b border-[#30363D] overflow-auto">
                  <div className="xl:max-w-1/3 w-full">
                    <Tabs
                      tabs={[
                        'Records',
                        'Depositors',
                        'Pool Positions',
                        'Trade History'
                      ]}
                      activeTab={recordsTab}
                      onTabChange={changeFooterTab}
                    />
                  </div>
                </div>
                {/* Tab Content */}
                {recordsTab === 'Records' && (
                  <div className="overflow-x-auto w-full py-4 px-6">
                    <table className="min-w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[#8B949E] text-sm font-bold border-b border-[#30363D]">
                          <th className="py-3 px-4">Time</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Network</th>
                          <th className="py-3 px-4">Tx</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          // [
                          //   {
                          //     time: '2025-09-01',
                          //     type: 'Foundation LP Deposit',
                          //     amount: '$100,000',
                          //     network: 'Arbitrum',
                          //     tx: '0x8a…9f',
                          //     status: 'Confirmed',
                          //     statusColor: '#2DA44E'
                          //   }
                          // ]
                          records.map((row, idx) => (
                            <tr
                              key={idx}
                              className="text-sm border-b border-[#30363D]"
                            >
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {formatDate(
                                  row.timestamp,
                                  'DD/MM/YYYY HH:mm:ss'
                                ) || '--'}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.type || '--'}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                ${row.points}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.source}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.address}
                              </td>
                              <td className="py-4 px-4">
                                <StatusTag status={row.status} />
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                )}
                {recordsTab === 'Depositors' && (
                  <div className="overflow-x-auto w-full py-4 px-6">
                    <table className="min-w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[#8B949E] text-sm font-bold border-b border-[#30363D]">
                          <th className="py-3 px-4">Address</th>
                          <th className="py-3 px-4">Seat</th>
                          <th className="py-3 px-4">Value</th>
                          <th className="py-3 px-4">Last Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            address: '0x67d…8e7',
                            seat: '#12',
                            value: '-',
                            lastAction: '2025-09-01'
                          }
                          // add more rows here if needed
                        ].map((row, idx) => (
                          <tr
                            key={idx}
                            className="text-sm border-b border-[#30363D]"
                          >
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.address}
                            </td>
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.seat}
                            </td>
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.value}
                            </td>
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.lastAction}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {recordsTab === 'Pool Positions' && (
                  <div className="overflow-x-auto w-full py-4 px-6">
                    <table className="min-w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[#8B949E] text-sm font-bold border-b border-[#30363D]">
                          <th className="py-3 px-4">Asset</th>
                          <th className="py-3 px-4">Direction</th>
                          <th className="py-3 px-4">Size</th>
                          <th className="py-3 px-4">Average Price</th>
                          <th className="py-3 px-4">PnL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          // [
                          //   {
                          //     asset: 'ETH',
                          //     direction: 'Long',
                          //     size: '2.5',
                          //     avgPrice: '$1,850',
                          //     pnl: '$125'
                          //   }
                          //   // 可以加多行資料
                          // ]
                          positions.map((row, idx) => (
                            <tr
                              key={idx}
                              className="text-sm border-b border-[#30363D]"
                            >
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.assetPosition.symbol}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.assetPosition.side}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.assetPosition.size}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.equity}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.assetPosition.pnl || '--'}
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                )}
                {recordsTab === 'Trade History' && (
                  <div className="overflow-x-auto w-full py-4 px-6">
                    <table className="min-w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[#8B949E] text-sm font-bold border-b border-[#30363D]">
                          <th className="py-3 px-4">Time</th>
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Direction</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          // [
                          //   {
                          //     time: '2025-09-01 14:30',
                          //     orderId: '#12345',
                          //     direction: 'Buy',
                          //     price: '$1,850',
                          //     amount: '0.5 ETH'
                          //   }
                          //   // 可以加更多行資料
                          // ]
                          tradeHistory.map((row, idx) => (
                            <tr
                              key={idx}
                              className="text-sm border-b border-[#30363D]"
                            >
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {formatDate(
                                  row.block_time,
                                  'DD/MM/YYYY HH:mm:ss'
                                )}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.id}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.tx_type}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                ${row.size}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.fee} ETH
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          {riverPoolTab === 'Main' && (
            <div className="flex flex-col self-stretch gap-4">
              <div className="flex flex-col self-stretch gap-8 w-full">
                <div className="w-full flex flex-col lg:flex-row justify-between items-start self-stretch gap-4">
                  <div className="flex flex-col shrink-0 items-start gap-1">
                    <span className="text-white text-3xl font-bold">
                      {'Foundation LP'}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#8B949E] text-base">
                        {'0x•••abcd'}
                      </span>
                      <img
                        src={
                          'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/8y7btkl5_expires_30_days.png'
                        }
                        className="w-3.5 h-5 object-fill"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col self-stretch gap-3">
                  <div className="flex flex-col lg:flex-row items-start self-stretch gap-3">
                    {/* border border-solid border-[#30363D] */}
                    <div className="w-full flex lg:basis-1/4 flex-col items-start bg-[#161B22] py-6 rounded-md">
                      <span className="text-[#8B949E] text-sm mb-[7px] mx-6">
                        {'Total Value Locked (TVL)'}
                      </span>
                      <span className="text-white text-2xl font-bold mb-[3px] mx-6">
                        {'$120.8M'}
                      </span>
                    </div>
                    <div className="w-full flex lg:basis-1/4 flex-col items-start bg-[#161B22] py-6 rounded-md">
                      <span className="text-[#8B949E] text-sm mb-[7px] mx-6">
                        {'30-Day Annualised Yield'}
                      </span>
                      <span className="text-[#2DA44E] text-2xl font-bold mb-[3px] mx-6">
                        {'30%'}
                      </span>
                    </div>
                    <div className="w-full flex lg:basis-1/4 flex-col items-start bg-[#161B22] py-6 rounded-md">
                      <span className="text-[#8B949E] text-sm mb-[7px] mx-6">
                        {'Your Deposit'}
                      </span>
                      <span className="text-white text-2xl font-bold mb-[3px] mx-6">
                        {'$5,000'}
                      </span>
                    </div>
                    <div className="w-full flex lg:basis-1/4 flex-col items-start bg-[#161B22] py-6 rounded-md">
                      <span className="text-[#8B949E] text-sm mb-[7px] mx-6">
                        {'Cumulative Earnings'}
                      </span>
                      <span className="text-white text-2xl font-bold mb-[3px] mx-6">
                        {'$120'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full flex flex-col lg:flex-row items-start self-stretch gap-3">
                    {/* border border-solid border-[#30363D] */}
                    <div className="w-full flex lg:basis-2/3 flex-col bg-[#161B22] py-6 gap-[21px] rounded-md">
                      <div className="flex items-center self-stretch mx-6 justify-between text-left">
                        <span className="w-full flex-1 text-white text-xl font-bold">
                          {'Account Value / PNL'}
                        </span>
                        <div className="relative">
                          <Select
                            value={timeRange}
                            onChange={setTimeRange}
                            options={['All Time', '1D', '1W', '1M', '1Y'].map(
                              (v) => ({ label: v, value: v })
                            )}
                            placeholder="Time Range"
                            minWidth="min-w-32"
                          />
                        </div>
                      </div>
                      <div className="self-stretch h-[300px] mx-6"></div>
                      <div className="flex flex-col xl:flex-row justify-between items-start self-stretch mx-6">
                        <div className="flex shrink-0 items-center pr-0.5 gap-2">
                          <span className="text-[#8B949E] text-sm">
                            {'Redemption: '}
                          </span>
                          <span className="text-white text-sm">
                            {'T+4 Settlement'}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center pr-0.5 gap-2.5">
                          <span className="text-[#8B949E] text-sm">
                            {'Daily Limit:'}
                          </span>
                          <span className="text-white text-sm">
                            {'15% TVL/day'}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center pr-0.5 gap-3.5">
                          <span className="text-[#8B949E] text-sm">
                            {'Cooling Period:'}
                          </span>
                          <span className="text-sm">{'Off'}</span>
                        </div>
                      </div>
                    </div>
                    {/* border border-solid border-[#30363D] */}
                    <div className="w-full flex lg:basis-1/3 flex-col items-center bg-[#161B22] rounded-md">
                      <div className="relative w-full">
                        <Tabs
                          tabs={['Deposit', 'Withdraw']}
                          activeTab={depositWithdrawTab}
                          onTabChange={setdepositWithdrawTab}
                        />
                      </div>

                      <div className="flex flex-col items-start p-6 gap-[17px] w-full">
                        <div className="flex items-center w-full justify-between">
                          <span className="text-[#8B949E] text-sm ">
                            {'Available Balance:'}
                          </span>
                          <span className="text-white text-sm font-bold">
                            {'$10,000'}
                          </span>
                        </div>
                        {/* 價格輸入框 */}
                        <div className="flex flex-col items-start gap-2 w-full">
                          <div className="flex flex-col items-center pb-px">
                            <span className="text-[#9D9DAF] text-sm">
                              {'Amount'}
                            </span>
                          </div>
                          {/* 金額輸入框與貨幣標籤 */}
                          <div className="flex justify-between bg-zinc-950 py-[9px] px-3 rounded-sm border border-solid border-[#30363D] w-full ">
                            <input
                              placeholder="0"
                              value={input1}
                              onChange={(e) => {
                                const value = Number(
                                  e.target.value.replace(/,/g, '')
                                );
                                onChangeInput1(
                                  isNaN(value) ? '' : value.toString()
                                );
                              }}
                              className="w-full text-white bg-transparent text-base py-[3px] border-0"
                            />
                            <div className="flex shrink-0 items-center bg-Dark_Tier2 py-[7px] pl-2 pr-[7px] gap-1.5 rounded">
                              <span className="text-zinc-400 text-sm font-bold">
                                USDC (Arbitrum)
                              </span>
                              <img
                                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/bvauf8h6_expires_30_days.png"
                                className="w-3 h-[15px] rounded-sm object-fill"
                              />
                            </div>
                          </div>
                          {/* 滑桿與快捷百分比按鈕 */}
                          <PercentSlider
                            value={percentValue}
                            maxAmount={AMOUNT_TOTAL}
                            onChangeAmount={(amount) =>
                              onChangeInput1(amount.toString())
                            }
                          />
                        </div>

                        <Tips
                          tips={[
                            'Deposit: T+0',
                            'Withdraw: T+4',
                            'Daily Redemption Limit: 15% TVL/day',
                            'Optional Cooling Period: 24–72h'
                          ]}
                        />
                        {/* Confirm Button */}
                        <PrimaryButton
                          size="large"
                          onClick={() => {
                            if (!input1 || Number(input1) <= 0) {
                              setError('Please enter a valid amount');
                              return;
                            }

                            // 清除錯誤
                            setError(null);

                            // 顯示 toast
                            showToast(
                              `${depositWithdrawTab} Successful`,
                              'success',
                              `Amount: ${input1} USDT`,
                              `Processing time: ~15s`
                            );
                          }}
                        >
                          {depositWithdrawTab}
                        </PrimaryButton>

                        {/* Error message */}
                        {error && (
                          <div className="text-red-500 text-xs mt-2">
                            {error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="flex flex-col items-start self-stretch py-4 rounded-lg border-l-4 border-solid border-fuchsia-800"
                style={{
                  background: 'linear-gradient(180deg, #92318D33, #00000000)'
                }}
              >
                <span className="text-white text-base font-bold ml-5">
                  {'Seat #12 Activated'}
                </span>
                <span className="text-[#8B949E] text-sm ml-5">
                  {'Expected Value: 500,000 Points'}
                </span>
                <span className="text-[#8B949E] text-sm ml-5">
                  {'Earnings Start in 88 Days'}
                </span>
              </div>
              {/* border border-solid border-[#30363D] */}
              <div className="flex flex-col items-start self-stretch bg-[#161B22] py-px rounded-md ">
                <span className="text-white text-2xl font-bold my-6 ml-[25px] mr-px">
                  {'My Points History'}
                </span>
                <div className="overflow-x-auto w-full pb-6 px-6 mx-px">
                  <table className="min-w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[#8B949E] text-sm font-bold border-b border-[#30363D]">
                        <th className="py-4 px-4">Date</th>
                        <th className="py-4 px-4">Earned Points</th>
                        <th className="py-4 px-4">Cumulative Points</th>
                        <th className="py-4 px-4">Value</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          date: '2025-09-05',
                          earnedPoints: '+0 Points',
                          cumulativePoints: '0 Points',
                          value: '$0',
                          status: 'Pending Launch',
                          note: 'No rewards before launch'
                        },
                        {
                          date: '2025-09-04',
                          earnedPoints: '+0 Points',
                          cumulativePoints: '0 Points',
                          value: '$0',
                          status: 'Pending Launch',
                          note: 'No rewards before launch'
                        },
                        {
                          date: '2025-09-03',
                          earnedPoints: '+0 Points',
                          cumulativePoints: '0 Points',
                          value: '$0',
                          status: 'Pending Launch',
                          note: 'No rewards before launch'
                        }
                      ].map((row, idx) => (
                        <tr
                          key={idx}
                          className="text-[#E6EDF3] text-sm border-b border-[#30363D]"
                        >
                          <td className="py-4 px-4">{row.date}</td>
                          <td className="py-4 px-4">{row.earnedPoints}</td>
                          <td className="py-4 px-4">{row.cumulativePoints}</td>
                          <td className="py-4 px-4">{row.value}</td>
                          <td className="py-4 px-4">
                            <StatusTag status={row.status} />
                          </td>
                          <td className="py-4 px-4">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="w-full self-stretch bg-[#161B22] rounded-md ">
                <div className="w-full border-b border-[#30363D] overflow-auto">
                  <div className="xl:max-w-1/3 w-full">
                    <Tabs
                      tabs={[
                        'Records',
                        'Depositors',
                        'Pool Positions',
                        'Trade History'
                      ]}
                      activeTab={recordsTab}
                      onTabChange={setRecordsTab}
                    />
                  </div>
                </div>
                {/* Tab Content */}
                {recordsTab === 'Records' && (
                  <div className="overflow-x-auto w-full py-4 px-6">
                    <table className="min-w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[#8B949E] text-sm font-bold border-b border-[#30363D]">
                          <th className="py-3 px-4">Time</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Network</th>
                          <th className="py-3 px-4">Tx</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            time: '2025-09-04',
                            type: 'Deposit',
                            amount: '$5,000',
                            network: 'Arbitrum',
                            tx: '0xab…cd',
                            status: 'Confirmed',
                            statusColor: '#2DA44E'
                          },
                          {
                            time: '2025-09-04',
                            type: 'Withdrawal',
                            amount: '$1,500',
                            network: 'Arbitrum',
                            tx: '0xff…22',
                            status: 'In Queue (T+4)',
                            statusColor: '#DFA42F'
                          }
                        ].map((row, idx) => (
                          <tr
                            key={idx}
                            className="text-sm border-b border-[#30363D]"
                          >
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.time}
                            </td>
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.type}
                            </td>
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.amount}
                            </td>
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.network}
                            </td>
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.tx}
                            </td>
                            <td className="py-4 px-4">
                              <StatusTag status={row.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {recordsTab === 'Depositors' && (
                  <div className="overflow-x-auto w-full py-4 px-6">
                    <table className="min-w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[#8B949E] text-sm font-bold border-b border-[#30363D]">
                          <th className="py-3 px-4">Address</th>
                          <th className="py-3 px-4">Shares</th>
                          <th className="py-3 px-4">Value</th>
                          <th className="py-3 px-4">Last Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            address: '0xaa1…bb2',
                            shares: '12,345',
                            value: '$23,456',
                            lastAction: '2025-09-02'
                          }
                        ].map((row, idx) => (
                          <tr
                            key={idx}
                            className="text-sm border-b border-[#30363D]"
                          >
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.address}
                            </td>
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.shares}
                            </td>
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.value}
                            </td>
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.lastAction}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {recordsTab === 'Pool Positions' && (
                  <div className="overflow-x-auto w-full py-4 px-6">
                    <table className="min-w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[#8B949E] text-sm font-bold border-b border-[#30363D]">
                          <th className="py-3 px-4">Asset</th>
                          <th className="py-3 px-4">Direction</th>
                          <th className="py-3 px-4">Size</th>
                          <th className="py-3 px-4">Average Price</th>
                          <th className="py-3 px-4">PnL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          // [
                          //   {
                          //     asset: 'xAAPL',
                          //     direction: 'Short',
                          //     size: '$0.8M',
                          //     avgPrice: '227.80',
                          //     pnl: '$-4,120'
                          //   }
                          // ]

                          positions.map((row, idx) => (
                            <tr
                              key={idx}
                              className="text-sm border-b border-[#30363D]"
                            >
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.assetPosition.symbol}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.assetPosition.side}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.assetPosition.size}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.equity}
                              </td>
                              <td className="py-4 px-4 text-[#E6EDF3]">
                                {row.assetPosition.pnl || '--'}
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                )}

                {recordsTab === 'Trade History' && (
                  <div className="overflow-x-auto w-full py-4 px-6">
                    <table className="min-w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[#8B949E] text-sm font-bold border-b border-[#30363D]">
                          <th className="py-3 px-4">Time</th>
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Direction</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            time: '17:10',
                            orderId: '0xc0…ff',
                            direction: 'Sell',
                            price: '228.10',
                            amount: '$120k'
                          }
                        ].map((row, idx) => (
                          <tr
                            key={idx}
                            className="text-sm border-b border-[#30363D]"
                          >
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.time}
                            </td>
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.orderId}
                            </td>
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.direction}
                            </td>
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.price}
                            </td>
                            <td className="py-4 px-4 text-[#E6EDF3]">
                              {row.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Toast Notification - Global */}
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          subMessage={toast.subMessage}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default RiverPool;
