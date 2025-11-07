import React, { useState, useEffect } from "react";
import {formatDate} from '@/utils/date';
type TradeItem = {
  createdAtHeight: string;
  createdAt: string;
  price: string;
  side: string;
  size: string;
  type: string;
}
interface TradesDataInterface {
  trades: TradeItem[];
}
const Trades: React.FC = ({ tradesData }: TradesDataInterface) => {
  const [rows, setRows] = useState<any[]>([]);

  // 隨機生成 mock data
  const generateMockData = () => {
    if(!tradesData || !tradesData.trades){
      console.log("tradesData 数据尚未加载完成");
      return;
    }
    const colors = ["text-[#2DA44E]", "text-[#F85149]"]; // green / red
    const treadesList = tradesData.trades.slice(0, 20).map((item: TradeItem) => {
      return {
        price: item.price,
        priceColor: colors[Math.floor(Math.random() * colors.length)],
        qty: item.size,
        time: formatDate(item.createdAt, 'HH:mm:ss')
      }
    })
    // console.log(343434, treadesList);
    return treadesList;
   /*  const now = new Date();
    return Array.from({ length: 20 }, (_, i) => {
      const price = (110500 + Math.floor(Math.random() * 100)).toFixed(2);
      const qty = (Math.random() * 3).toFixed(3);
      const time = now.toLocaleTimeString("en-GB", { hour12: false });
      return {
        price,
        priceColor: colors[Math.floor(Math.random() * colors.length)],
        qty,
        time,
      };
    }); */
  };

  useEffect(() => {
    // 初始
    setRows(generateMockData());

    // 每 5 秒 refresh
    /* const interval = setInterval(() => {
      setRows(generateMockData());
    }, 5000);

    return () => clearInterval(interval); */
  }, [tradesData]);

  return (
    <div className="flex flex-col items-start w-full">
      <div className="flex flex-col items-center py-1 w-full">
        <div className="flex items-start pr-[1px] w-full">
          <span className="text-zinc-400 text-sm my-1 w-full">{"Price"}</span>
          <span className="text-zinc-400 text-sm my-1 w-full">{"Size"}</span>
          <span className="text-zinc-400 text-sm my-1 w-full">{"Time"}</span>
        </div>
      </div>
      <div className="flex flex-col w-full">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-3 w-full text-sm py-2 border-b border-[#30363D]"
          >
            <span className={row.priceColor}>{row.price}</span>
            <span className="text-white">{row.qty}</span>
            <span className="text-zinc-400">{row.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trades;
