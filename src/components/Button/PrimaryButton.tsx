// src/components/Button/PrimaryButton.tsx
import clsx from "clsx";
import React from "react";

interface PrimaryButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  size?: "small" | "medium" | "large"; // 控制大小
  icon?: React.ReactNode; // optional icon
  disabled?: boolean; // optional disabled prop
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onClick,
  children,
  size = "medium",
  icon,
  disabled = false, // 默認 false
}) => {
  // 根據 size 設定不同 class
  let sizeClasses = "";
  switch (size) {
    case "small":
      sizeClasses = "py-2 px-3 text-xs"; // 小
      break;
    case "medium":
      sizeClasses = "py-2.5 px-4 text-xs"; // 中
      break;
    case "large":
      sizeClasses = "py-3.5 px-4 text-base"; // 大
      break;
  }
  // 用 handleClick 確保 disabled 時不會執行 onClick
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={clsx(
        "w-full flex flex-1 justify-center items-center gap-2 rounded-sm border-0 button-Primary",
        sizeClasses
      )}
      onClick={handleClick}
      disabled={disabled}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      <span className="font-bold text-center">{children}</span>
    </button>
  );
};

export default PrimaryButton;
