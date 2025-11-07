import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import PrimaryButton from "../components/Button/PrimaryButton";
import { SecondaryButton } from "../components/Button/SecondaryButton";
import {
  preloadTranslate,
  translatePage,
  revertPage,
} from "../utils/translatePage";
import { useWallet as useOldWallat } from "../context/WalletContext";
import useWallet from "../hooks/useWallet";
import { formatTokenAmount, shortenAddress } from "../utils/format";
import { CaretDownIcon, CaretRightIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { useLocation } from "react-router-dom";
import CreateAgentButton from "./Arena/CreateAgentButton";
import ConnectWallet from "./wallet/ConnectWallet";
import { useArenaNFTContext } from "../hooks/arena/useArenaNFT";

interface DesktopNavRightProps {
  language: string;
  setLanguage: (lang: string) => void;
}

enum Language {
  EN = "EN",
  ZH = "简体中文",
}

export default function DesktopNavRight({
  language,
  setLanguage,
}: DesktopNavRightProps) {
  const route = useLocation();
  const { address, isConnected, disconnectWallet } = useWallet();
  const { userNFTBalance } = useArenaNFTContext();

  const languages = Object.entries(Language).map(([key, value]) => ({
    label: value,
    value: key,
  }));

  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const walletDropdownRef = useRef<HTMLDivElement | null>(null);

  const {
    isCorrectNetwork,
    balances,
    balancesLoading,
    connectWallet,
    openDepositModal,
    openWithdrawModal,
  } = useOldWallat();

  // Handle language change (变化语种)
  const handleLangChange = useCallback(
    (lang: Language) => {
      setLanguage(lang);
      setShowLangDropdown(false);
      if (lang === Language.ZH) translatePage();
      else revertPage();
    },
    [setLanguage]
  );

  const displayDexBalance = useMemo(() => {
    if (!isConnected || !isCorrectNetwork) {
      return "--";
    }
    if (balancesLoading) {
      return "加载中…";
    }
    const usdcBalance = formatTokenAmount(balances.dex.USDC, 6);
    const ethBalance =
      balances.dex.ETH > 0n
        ? ` / ${formatTokenAmount(balances.dex.ETH, 18)} ETH`
        : "";
    return `${usdcBalance} USDC${ethBalance}`;
  }, [balances, balancesLoading, isConnected, isCorrectNetwork]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } finally {
      setShowWalletDropdown(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowWalletDropdown(false);
  };

  const handleDeposit = () => {
    openDepositModal();
    setShowWalletDropdown(false);
  };

  const handleWithdraw = () => {
    openWithdrawModal();
    setShowWalletDropdown(false);
  };

  useEffect(() => {
    // preloadTranslate("en", "zh-CN");
    handleLangChange(language as Language);
  }, [handleLangChange, language, route.pathname]);

  // Close dropdowns when clicking outside of them.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        walletDropdownRef.current &&
        !walletDropdownRef.current.contains(event.target as Node)
      ) {
        setShowWalletDropdown(false);
        setShowLangDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={clsx(
        "flex items-center justify-end relative",
        "xl:flex xl:gap-4"
      )}
    >
      <CreateAgentButton className="hidden! xl:flex!" />
      {/* Wallet dropdown */}
      {isConnected && (
        <div
          className={clsx("relative transition-default")}
          ref={walletDropdownRef}
        >
          <button
            className={clsx(
              "flex shrink-0 items-center bg-Dark_Tier1 py-2.5 px-3 gap-2 rounded-sm ",
              "border border-solid border-[#30363D] text-sm text-white",
              "hover:border-zinc-600"
            )}
            onClick={() => setShowWalletDropdown((v) => !v)}
          >
            <img src={"/images/arbitrum.png"} className="w-5 h-5 rounded-sm" />
            <span className="hidden md:inline font-semibold">
              {address ? shortenAddress(address) : "Wallet"}
            </span>
            <CaretDownIcon
              className={clsx(
                "transition-all",
                showWalletDropdown && " rotate-180"
              )}
            ></CaretDownIcon>
          </button>
          {showWalletDropdown && (
            <div
              className={clsx(
                "absolute right-0 mt-2 p-2 z-1 min-w-70",
                "bg-Dark_Tier1 rounded-2xl shadow-lg border border-Dark_Tier4"
              )}
            >
              <DropMenuItem
                label={"My Wallet"}
                value={address ? shortenAddress(address) : "No Connected"}
                icon={"/icons/walletDrop/icon-wallet.svg"}
              />
              <DropMenuItem
                label={"My Points"}
                value={"0"}
                icon={"/icons/walletDrop/icon-point.svg"}
                customDom={
                  <CaretRightIcon className="w-6 h-6 text-Dark_Secondary" />
                }
              />
              <DropMenuItem
                label={"Energy Balance"}
                value={"0"}
                icon={"/icons/icon-energy.svg"}
                customDom={
                  <CaretRightIcon className="w-6 h-6 text-Dark_Secondary" />
                }
              />
              <DropMenuItem
                label={"Arena NFT"}
                icon={""}
                customDom={
                  <section className="flex items-center ">
                    <img src="/images/NFT.png" className="w-12 h-12" alt="" />
                    <span className="ml-2">
                      X {Number(userNFTBalance.data || 0)}
                    </span>
                    <CaretRightIcon className="w-6 h-6 text-Dark_Secondary" />
                  </section>
                }
                value={undefined}
              />
              <section className="mt-4 grid gap-2 transition-default text-Dark_Main">
                <div
                  className={clsx(
                    "w-full text-left px-4 py-2 text-sm rounded-2xl ",
                    "relative flex justify-between items-center cursor-pointer",
                    "hover:bg-Dark_Tier3"
                  )}
                  onClick={() => setShowLangDropdown((v) => !v)}
                >
                  <span>Language</span>
                  <CaretRightIcon
                    className={clsx(
                      "w-6 h-6 text-Dark_Secondary",
                      showLangDropdown && "rotate-90"
                    )}
                  />
                  {showLangDropdown && (
                    <div
                      className={clsx(
                        "absolute top-10 translate-x-[-5%] mt-2 p-2 z-50 min-w-60",
                        "bg-Dark_Tier1 border border-[#30363D] rounded-2xl shadow-lg text-Dark_Main",
                        "md:top-0 md:translate-x-[-115%]"
                      )}
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.label}
                          className={clsx(
                            "mt-2 w-full text-left px-4 py-2  text-sm",
                            "flex justify-between items-center rounded-lg",
                            "hover:bg-Dark_Tier3/40",
                            language === lang.label && "bg-Dark_Tier3"
                          )}
                          onClick={() =>
                            handleLangChange(lang.label as Language)
                          }
                        >
                          <span> {lang.label}</span>
                          <span className="text-Dark_Secondary">
                            {lang.value}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className={clsx(
                    "w-full text-left px-4 py-2 text-sm rounded-2xl ",
                    "flex justify-between items-center",
                    "hover:bg-Dark_Tier3"
                  )}
                >
                  <span>Notification</span>
                  <span className="w-5 h-5 grid justify-center items-center rounded-full bg-Dark_Main text-Dark_Tier0">
                    0
                  </span>
                </button>
                <button
                  className={clsx(
                    "w-full text-left px-4 py-2 text-sm rounded-2xl text-River_Red",
                    "hover:bg-Dark_Tier3"
                  )}
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              </section>
            </div>
          )}
        </div>
      )}

      {/* Withdraw & Deposit */}
      {/* {isConnected && (
        <div className="flex gap-2">
          <SecondaryButton size="medium" onClick={handleWithdraw}>
            Withdraw
          </SecondaryButton>
          <PrimaryButton size="medium" onClick={handleDeposit}>
            Deposit
          </PrimaryButton>
        </div>
      )} */}

      {!isConnected && <ConnectWallet />}
    </div>
  );
}

function DropMenuItem({
  label,
  value,
  icon,
  onClick,
  customDom,
}: {
  label: string;
  value?: ReactNode;
  icon: string;
  onClick?: () => void;
  customDom?: ReactNode;
}) {
  return (
    <div
      className={clsx("text-left py-1.5 border-b border-Dark_Tier3 ")}
      onClick={onClick}
    >
      <section
        className={clsx(
          "px-3.5 p-2 rounded-2xl w-full h-full flex justify-between items-center",
          "hover:cursor-pointer hover:bg-Dark_Riverbit-cyan/5"
        )}
      >
        <div>
          <p className="text-Dark_Secondary">{label}</p>
          {value && (
            <p className="mt-2 flex items-center gap-2">
              {icon && <img className="w-5 h-5" src={icon} alt="" />}
              <span>{value}</span>
            </p>
          )}
        </div>
        {customDom}
      </section>
    </div>
  );
}
