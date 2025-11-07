// ...existing code...
import { CaretDownIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import React from "react";

interface SelectProps {
  value: string | number;
  onChange: (val: string | number | React.SetStateAction<any>) => void;
  options: { label: string; value: string | number }[];
  className?: string;
  placeholder?: string;
  minWidth?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [maxContentWidth, setMaxContentWidth] = React.useState<number>(0);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);

  // 计算最大内容宽度
  React.useEffect(() => {
    if (!buttonRef.current) return;

    const tempElement = document.createElement("div");
    tempElement.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      visibility: hidden;
      white-space: nowrap;
      font-size: 14px;
      padding: 10px 32px 10px 10px;
    `;

    const widths: number[] = [];

    if (placeholder) {
      tempElement.textContent = placeholder;
      document.body.appendChild(tempElement);
      widths.push(tempElement.getBoundingClientRect().width);
      document.body.removeChild(tempElement);
    }

    options.forEach((opt) => {
      tempElement.textContent = opt.label;
      document.body.appendChild(tempElement);
      widths.push(tempElement.getBoundingClientRect().width);
      document.body.removeChild(tempElement);
    });

    if (value) {
      const selectedOption = options.find((opt) => opt.value === value);
      if (selectedOption) {
        tempElement.textContent = selectedOption.label;
        document.body.appendChild(tempElement);
        widths.push(tempElement.getBoundingClientRect().width);
        document.body.removeChild(tempElement);
      }
    }

    const maxWidth = Math.max(...widths, 120);
    setMaxContentWidth(maxWidth + 8);
  }, [options, placeholder, value]);

  // 点击外部关闭
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      ref={containerRef}
      className={clsx("relative inline-block")}
      style={{
        width: maxContentWidth ? `${maxContentWidth}px` : "auto",
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className={clsx(
          `w-full flex items-center justify-between bg-Dark_Tier2 text-right p-2.5 rounded-sm border border-solid border-[#30363D] text-sm transition-colors duration-150`,
          value ? "text-Dark_Main" : "text-Dark_Secondary",
          isOpen && "border-zinc-500",
          className
        )}
      >
        <span className="truncate flex-1">
          {selectedOption?.label || placeholder || "Select an option"}
        </span>
        <span
          className={`ml-2 text-zinc-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <CaretDownIcon />
        </span>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className={clsx(
            "absolute top-full left-0 z-select p-2 mt-1 bg-Dark_Tier2",
            "border border-[#30363D] rounded-sm max-h-60 overflow-auto shadow-lg",
            "scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent"
          )}
          style={{
            width: maxContentWidth ? `${maxContentWidth}px` : "100%",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;

            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={clsx(
                  "cursor-pointer px-3 py-2 flex items-center justify-between rounded-sm transition-colors duration-150 text-right",
                  isSelected
                    ? "font-semibold bg-zinc-700"
                    : "hover:bg-zinc-800/50"
                )}
              >
                <span className="truncate flex-1">{opt.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;
