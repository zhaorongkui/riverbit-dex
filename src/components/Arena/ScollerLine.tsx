import clsx from "clsx";
import Marquee from "react-fast-marquee";

export default function ScollerLine() {
  return (
    <Marquee
      speed={50} // 滚动速度（默认50）
      pauseOnHover={true} // 悬停暂停
      gradient={false} // 关闭左右渐变遮罩
      direction="left" // 滚动方向: left / right
      className={clsx("px-4 py-1 bg-Dark_Tier1", "md:py-2")}
    >
      {[1.2, -1.4, 2, 2.1, 3.5, -5, -0.25].map((item, index) => (
        <span
          className={clsx(
            "mx-1 p-2 flex items-center gap-2 text-xs",
            "md:text-base md:pr-4 md:mx-4"
          )}
          key={index}
        >
          <img
            src="/icons/tokens/ETH.svg"
            alt="ETH"
            className={clsx("w-4 h-4", "md:w-8 md:h-8")}
          />
          <span className="text-white">ETH</span>
          <span
            className={clsx(item > 0 ? "text-River_Green" : "text-River_Red")}
          >
            {item > 0 ? "+" : ""}
            {item.toFixed(2)}%
          </span>
        </span>
      ))}
    </Marquee>
  );
}
