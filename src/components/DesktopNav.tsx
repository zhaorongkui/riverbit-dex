import { CaretDownIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useHeader from "../hooks/useHeader";

const DesktopNav: React.FC = () => {
  const location = useLocation();
  const { navItems, moreItems } = useHeader();
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);

  // 判斷是否 active
  const isActive = (to: string) => {
    if (to === "/trading")
      return location.pathname === "/" || location.pathname === "/trading";
    return location.pathname === to;
  };

  return (
    <div className={clsx("hidden shrink-0 items-center", "xl:flex")}>
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex flex-col shrink-0 py-3 mr-2 rounded-sm px-2 ${
            isActive(item.to)
              ? "bg-Dark_Tier2 text-Dark_Riverbit-cyan"
              : "text-Dark_Main"
          }`}
        >
          <span className="text-sm">{item.label}</span>
        </Link>
      ))}
      <div className="flex items-center text-Dark_Secondary">
        <span className={"flex flex-col shrink-0 py-3 rounded-sm px-2"}>
          DEX
        </span>
        <span className="bg-Dark_Tier2 px-2 py-1">Coming Soon</span>
      </div>
      {/* More dropdown */}
      {moreItems.length > 0 && (
        <div className="relative">
          <button
            className="flex shrink-0 items-center py-[11px] gap-2 rounded-sm focus:outline-none"
            onClick={() => setShowMoreDropdown((v) => !v)}
            type="button"
          >
            <span className="text-zinc-400 text-sm">More</span>
            <CaretDownIcon
              className={clsx(
                "transition-all",
                showMoreDropdown && " rotate-180"
              )}
            />
          </button>
          {showMoreDropdown && (
            <div className="text-left absolute left-0 mt-2 z-50 min-w-[180px] bg-Dark_Tier1 border border-[#30363D] rounded shadow-lg">
              {moreItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block px-4 py-3 text-sm text-white hover:bg-zinc-800"
                  onClick={() => setShowMoreDropdown(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DesktopNav;
