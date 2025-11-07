import React, { useState, useEffect } from "react";
import PercentSlider from "./PercentSlider";

type AmountInputProps = {
  value: number;
  onChange: (val: number) => void;
  percentValue: number; // 保留
  maxAmount: number;
  assets?: string[];
  selectedAsset: string;
};

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  percentValue,
  maxAmount,
  assets,
  selectedAsset,
}) => {
  const derivedAssets = assets
    ? assets
    : selectedAsset.includes("-")
      ? selectedAsset.split("-")
      : ["USD"];

  const [localAsset, setLocalAsset] = useState(derivedAssets[0]);

  useEffect(() => {
    const newDerivedAssets = assets
      ? assets
      : selectedAsset.includes("-")
        ? selectedAsset.split("-")
        : ["USD"];
    setLocalAsset(newDerivedAssets[0]);
  }, [selectedAsset, assets]);

  return (
    <div className="flex flex-col items-start gap-2 w-full">
      {/* Label */}
      <div className="flex flex-col items-center pb-px">
        <span className="text-[#9D9DAF] text-sm">Amount</span>
      </div>

      <div className="flex flex-col items-start gap-4 w-full">
        {/* Input box */}
        <div className="flex justify-between bg-zinc-950 py-[9px] px-3 rounded-sm border border-solid border-[#30363D] w-full">
          <input
            placeholder="0"
            value={value === 0 ? "" : value.toString()}
            onChange={(e) => {
              const parsed = Number(e.target.value.replace(/,/g, ""));
              onChange(isNaN(parsed) ? 0 : parsed);
            }}
            className="w-full text-white bg-transparent text-base py-[3px] border-0"
          />

          <div className="flex shrink-0 items-center gap-1.5 rounded">
            <select
              value={localAsset}
              onChange={(e) => setLocalAsset(e.target.value)}
              className="bg-Dark_Tier2 text-zinc-400 text-sm font-bold px-4 py-2 rounded appearance-none pr-8"
              style={{
                backgroundImage: `url('https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/bvauf8h6_expires_30_days.png')`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "12px 15px",
              }}
            >
              {derivedAssets.map((asset) => (
                <option key={asset} value={asset}>
                  {asset}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Slider + quick buttons */}
        <PercentSlider
          value={percentValue}
          maxAmount={maxAmount}
          onChangeAmount={onChange} // 直接傳 number
        />
      </div>
    </div>
  );
};

export default AmountInput;
