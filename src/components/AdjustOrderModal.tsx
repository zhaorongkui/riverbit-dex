import React, { useState } from "react";
import PrimaryButton from "./Button/PrimaryButton";
import Select from "./Select";
import AmountInput from "./AmountInput";

interface AdjustOrderModalProps {
  orderType: string; // e.g. "Limit Buy"
  currentPrice: number;
  currentAmount: number;
  status: string;
  coin: string; // coin name
  onClose: () => void;
  onConfirm?: (data: {
    price: number;
    amount: number;
    leverage: number;
    marginMode: string;
  }) => void;
}

const AdjustOrderModal: React.FC<AdjustOrderModalProps> = ({
  orderType,
  currentPrice,
  currentAmount,
  status,
  coin,
  onClose,
  onConfirm,
}) => {
  const [price, setPrice] = useState<number>(Number(currentPrice) || 0);
  const [amount, setAmount] = useState<number>(Number(currentAmount) || 0);

  const [leverage, setLeverage] = useState<number>(10);
  const [marginMode, setMarginMode] = useState<string>("Cross");

  const maxAmount = 10000;
  const percentValue = maxAmount ? (amount / maxAmount) * 100 : 0;
  const selectedAssetSymbol = coin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="relative w-full h-full md:w-[500px] md:h-auto md:rounded-xl flex flex-col justify-center"
        style={{ maxWidth: "100vw", maxHeight: "100vh" }}
      >
        <div className="bg-[#272B2F] rounded-lg border border-gray-700 w-full max-w-md md:h-auto h-screen p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-white text-lg font-bold">Adjust Order</h2>
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/73d3cc65_expires_30_days.png"
              alt="close"
              className="w-8 h-8 cursor-pointer"
              onClick={onClose}
            />
          </div>

          {/* Order Info */}
          <div className="flex flex-col gap-1 text-sm text-[#9D9DAF] mb-3">
            <div className="flex justify-between">
              <span>Order Type:</span>
              <span className="text-white">{orderType}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Price:</span>
              <span className="text-white">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Amount:</span>
              <span className="text-white">${currentAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-white">{status}</span>
            </div>
          </div>

          <div className="h-px bg-gray-700 mb-3" />

          {/* Adjustable Parameters */}
          <div className="flex flex-col gap-4 text-left">
            <div className="flex flex-row gap-4">
              {/* Margin Mode */}
              <div className="flex flex-col gap-2 w-full">
                <span className="text-[#9D9DAF] text-sm">Margin Mode</span>
                <Select
                  value={marginMode}
                  onChange={(v) => setMarginMode(String(v))}
                  options={[
                    { label: "Cross", value: "Cross" },
                    { label: "Isolated", value: "Isolated" },
                  ]}
                />
              </div>

              {/* Leverage */}
              <div className="flex flex-col gap-2 w-full">
                <span className="text-[#9D9DAF] text-sm">Leverage</span>
                <Select
                  value={leverage}
                  onChange={(v) => setLeverage(Number(v))}
                  options={[
                    { label: "1x", value: 1 },
                    { label: "5x", value: 5 },
                    { label: "10x", value: 10 },
                    { label: "20x", value: 20 },
                    { label: "50x", value: 50 },
                  ]}
                />
              </div>
            </div>

            {/* Price */}
            <div className="flex flex-col gap-2">
              <span className="text-[#9D9DAF] text-sm">Price</span>
              <input
                type="number"
                value={isNaN(price) ? "" : price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="bg-zinc-950 text-white py-2 px-3 rounded-md border border-[#30363D] focus:outline-none"
              />
            </div>

            {/* Amount */}
            <AmountInput
              value={amount}
              onChange={setAmount} // 直接更新 amount
              percentValue={percentValue} // 父層計算百分比
              maxAmount={maxAmount}
              selectedAsset={selectedAssetSymbol}
            />
          </div>

          {/* Confirm Button */}
          <div className="flex items-start self-stretch gap-3 mt-6">
            <PrimaryButton
              size="large"
              onClick={() => {
                onConfirm?.({
                  price,
                  amount: Number(amount),
                  leverage,
                  marginMode,
                });
                onClose();
              }}
            >
              Confirm
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdjustOrderModal;
