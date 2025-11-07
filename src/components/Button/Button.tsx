// src/components/Button/PrimaryButton.tsx
import clsx from "clsx";
import React from "react";
import { ButtonTheme } from "./theme";

// 扩展自定义的 props 和原生的 button 属性
interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  size?: "small" | "medium" | "large";
  theme?: ButtonTheme;
  isLoading?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  className,
  size = "medium",
  theme = ButtonTheme.Primary,
  isLoading = false,
  ...rest
}) => {
  let sizeClasses = "";
  switch (size) {
    case "small":
      sizeClasses = "py-1 px-3 text-xs";
      break;
    case "medium":
      sizeClasses = "py-1.5 px-4 text-sm";
      break;
    case "large":
      sizeClasses = "py-2.5 px-4 text-base";
      break;
  }
  return (
    <button {...rest} className={clsx(sizeClasses, theme, className)}>
      {isLoading && (
        <span
          className={clsx(
            "inline-block w-[1em] h-[1em] border-2 border-Dark_Tier2/30 border-t-Dark_Tier2 rounded-full animate-spin"
          )}
        ></span>
      )}
      {children}
    </button>
  );
};

export default PrimaryButton;
