import clsx from "clsx";
import React, { useRef, useEffect, useState, useCallback } from "react";

interface ToggleWithTextProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

const ToggleWithText: React.FC<ToggleWithTextProps> = ({
  options,
  value,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });

  const updateHighlightPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeBtn = Array.from(container.children).find(
      (child) => (child as HTMLElement).dataset.value === value
    ) as HTMLElement;

    if (activeBtn) {
      setHighlightStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      });
    }
  }, [value]);

  useEffect(() => {
    updateHighlightPosition();

    // 添加 resize 事件监听器
    const handleResize = () => {
      updateHighlightPosition();
    };

    window.addEventListener("resize", handleResize);

    // 清理监听器
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [value, options, updateHighlightPosition]);

  return (
    <div
      className="relative flex items-center gap-2 shrink-0 bg-Dark_Tier0 p-1 rounded-sm"
      ref={containerRef}
    >
      {/* Sliding Rectangle */}
      <div
        className="absolute top-1 bottom-1 bg-Dark_Tier3 rounded-sm transition-all duration-300"
        style={{ left: highlightStyle.left, width: highlightStyle.width }}
      />

      {options.map((option) => (
        <button
          key={option}
          data-value={option}
          className={clsx(
            `flex-1 flex flex-col items-center z-1`,
            "p-1 rounded border-0 text-xs!",
            "md:text-sm!",
            "xl:py-2 xl:px-3 ",
            option === value ? "text-Dark_Main" : "text-Dark_Secondary"
          )}
          onClick={() => onChange(option)}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default ToggleWithText;
