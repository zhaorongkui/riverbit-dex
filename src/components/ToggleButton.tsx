import clsx from "clsx";
import React from "react";

interface ToggleButtonProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <button
      type="button"
      className="py-2 flex items-center w-full justify-between focus:outline-none"
      onClick={() => onChange(!value)}
    >
      <span className="text-[#C9D1D9] text-sm">{label}</span>
      <div
        className={clsx(
          "w-12 h-7  p-0.5 px-1",
          `shrink-0 flex items-center transition-colors duration-200 rounded-full`,
          value ? "bg-Dark_Riverbit-cyan" : "bg-Dark_Tier3"
        )}
      >
        <div
          className={clsx(
            "w-5 h-5 rounded-full border-solid shadow transition-transform duration-200",
            value
              ? "translate-x-full bg-Dark_Tier0"
              : "translate-x-0 bg-Dark_Main"
          )}
        />
      </div>
    </button>
  );
};

export default ToggleButton;
