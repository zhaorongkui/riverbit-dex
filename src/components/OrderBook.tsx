import { useState, useEffect } from "react";

type OrderRow = {
  price: string;
  size: string | number;
  total: string | number;
  barWidth?: string;
};
interface OrderBookProps {
  unitGranularity: string;
}
interface OrderBookData {
  asks: OrderRow[];
  bids: OrderRow[];
}
interface OrderBookProps {
  unitGranularity: string;
  orderBookData: OrderBookData;
  onAction: () => void;
}

export default function OrderBook({ unitGranularity, orderBookData, onAction }: OrderBookProps) {
  const [asks, setAsks] = useState<OrderRow[]>([]);
  const [bids, setBids] = useState<OrderRow[]>([]);

  const generateMockData = () => {
    // 1. 先判断 orderBookData 是否有有效数据，避免空对象导致报错
    if (!orderBookData || !orderBookData.asks || !orderBookData.bids) {
      console.log("orderBookData 数据尚未加载完成");
      return; // 数据无效时直接返回，不执行后续逻辑
    }
    const step = Number(unitGranularity) || 0.01;
    // console.log(5555555, orderBookData)
    // 隨機產生 asks
    /* // const newAsks: OrderRow[] = Array.from({ length: 9 }, (_, i) => {
      const price = (110595 - i * step).toFixed(3);
      const size = (Math.random() * 3).toFixed(3);
      const total = (Math.random() * 16 + 0.2).toFixed(3);
      const barWidth = `${Math.random() * 100}%`;
      return { price, size, total, barWidth };
    }); */
    const newAsks: OrderRow[] = orderBookData.asks?.map((item: OrderRow) => {
      return {
        price: item.price,
        size: item.size,
        total: item.total || (Math.random() * 16 + 0.2).toFixed(3),
        barWidth: `${Math.random() * 100}%`,
      }
    });

    // 隨機產生 bids
    const newBids: OrderRow[] = orderBookData.bids?.map((item: OrderRow) => {
      return {
        price: item.price,
        size: item.size,
        total: item.total || (Math.random() * 12 + 0.2).toFixed(3),
        // barWidth: `${Math.random() * 100}%`,
      }
    });

    setAsks(newAsks);
    setBids(newBids);
  };
  const setOrderBookeData = () => {

  }

  useEffect(() => {
    generateMockData(); // 初始化
    const interval = setInterval(onAction, 15000); // 每 5 秒刷新
    return () => clearInterval(interval);
  }, [unitGranularity, orderBookData]); // 👈 unitGranularity 變動會刷新數據

  const maxBidTotal = Math.max(...bids.map((b) => Number(b.total)));

  return (
    <div className="flex flex-col items-start w-full">
      {/* Header */}
      <div className="flex items-start py-1 pr-px w-full">
        <span className="text-zinc-400 text-sm my-1 w-full">Price</span>
        <span className="text-zinc-400 text-sm my-1 w-full">Size</span>
        <span className="text-zinc-400 text-sm my-1 w-full">Total</span>
      </div>

      {/* Asks */}
      <div className="flex flex-col w-full">
        {asks?.length > 0 && asks.map((row, idx) => (
          <div
            key={idx}
            className="relative flex w-full items-center text-sm text-white"
          >
            <div
              className="absolute left-0 top-0 h-full bg-[#EF44441A]"
              style={{ width: row.barWidth }}
            />
            <div className="grid grid-cols-3 w-full relative z-orderBook py-2">
              <span className="text-[#F85149]">{row.price}</span>
              <span>{row.size}</span>
              <span className="text-zinc-400">{row.total}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex w-full flex-col items-center p-3">
        <span className="text-zinc-400 text-sm">
          Spread: {unitGranularity} (
          {((Number(unitGranularity) / 110590) * 100).toFixed(3)}%)
        </span>
      </div>

      {/* Bids */}
      <div className="flex flex-col w-full">
        {bids?.length > 0 && bids.map((row, idx) => {
          const barWidth = `${(Number(row.total) / maxBidTotal) * 100}%`;
          return (
            <div
              key={idx}
              className="relative flex w-full items-center text-sm text-white"
            >
              <div
                className="absolute left-0 top-0 h-full bg-[#22C55E1A]"
                style={{ width: barWidth }}
              />
              <div className="grid grid-cols-3 w-full relative z-10 py-2">
                <span className="text-[#2DA44E]">{row.price}</span>
                <span>{row.size}</span>
                <span className="text-zinc-400">{row.total}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
