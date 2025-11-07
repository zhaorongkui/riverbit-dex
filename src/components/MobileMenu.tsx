import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PrimaryButton from "./Button/PrimaryButton";
import { SecondaryButton } from "./Button/SecondaryButton";
import ToggleWithText from "./ToggleWithText";
import { useWallet } from "../context/WalletContext";
import { formatTokenAmount, shortenAddress } from "../utils/format";
import useHeader from "../hooks/useHeader";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  balance?: string;
  points?: string;
  language: string;
  setLanguage: (val: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  balance = "$27,345.12",
  points = "1,250,000",
  language = "EN",
  setLanguage,
}) => {
  const { navItems, moreItems } = useHeader();
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  const {
    account,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    balances,
    balancesLoading,
    connectWallet,
    disconnectWallet,
    ensureCorrectNetwork,
    openDepositModal,
    openWithdrawModal,
  } = useWallet();

  const displayBalance = (() => {
    if (!isConnected || !isCorrectNetwork) {
      return balance;
    }
    if (balancesLoading) {
      return "加载中…";
    }
    const usdcDex = balances.dex.USDC;
    const ethDex = balances.dex.ETH;
    const usdcText = `${formatTokenAmount(usdcDex, 6)} USDC`;
    const ethText =
      ethDex > 0n ? ` / ${formatTokenAmount(ethDex, 18)} ETH` : "";
    return `${usdcText}${ethText}`;
  })();
  if (!isOpen) return null;

  const isActive = (to: string) => {
    if (to === "/trading")
      return location.pathname === "/" || location.pathname === "/trading";
    return location.pathname === to;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex flex-col xl:hidden">
      <div className="w-screen flex flex-col bg-Dark_Tier1 h-full shadow-lg p-6">
        {/* Close button */}
        <button
          className="self-end mb-6"
          onClick={onClose}
          aria-label="Close menu"
        >
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {/* Menu items */}
        <div className="overflow-auto flex flex-col h-full justify-between">
          {/* Upper: Nav items */}
          <div className="flex flex-col">
            {/* Main nav items */}
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex flex-col items-start py-3 px-3 mb-2 rounded-sm ${
                  isActive(item.to)
                    ? "bg-Dark_Tier2 text-white"
                    : "text-zinc-400"
                }`}
              >
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}

            {/* More with inline submenu */}
            {moreItems.length > 0 && (
              <div className="flex flex-col mb-2">
                <button
                  className="flex items-center justify-between py-3 px-3 rounded-sm text-zinc-400 text-sm focus:outline-none"
                  onClick={() => setShowMore((v) => !v)}
                  type="button"
                >
                  <span>More</span>
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZlYhP85oka/wo9zz3y5_expires_30_days.png"
                    className={`w-3 h-[15px] object-fill transform transition-transform ${showMore ? "rotate-180" : ""}`}
                    alt="More"
                  />
                </button>

                {showMore && (
                  <div className="flex flex-col ml-6 text-left">
                    {moreItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className={`py-2 text-sm ${
                          isActive(item.to)
                            ? "text-white font-bold"
                            : "text-zinc-400"
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
