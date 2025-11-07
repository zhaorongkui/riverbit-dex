import { useMemo, useState } from "react";
import { Dialog } from "../Dialog";
import Button from "../Button/Button";
import { ButtonTheme } from "../Button/theme";
import { ArrowRightIcon, CaretDownIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import useWallet from "../../hooks/useWallet";
import type { Connector, CreateConnectorFn } from "wagmi";
import useWindowWidth from "../../hooks/useWindowWidht";

export default function ConnectWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoreWallet, setShowMoreWallet] = useState(false);
  const { isMobile } = useWindowWidth();
  const {
    address,
    connectors,
    isConnecting,
    isConnected,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  // 获取插件列表中的 walletConnect 插件
  const walletConnect = useMemo(
    () => connectors.find((connector) => connector.id === "walletConnect"),
    [connectors]
  );
  // 获取插件列表中的 metaMaskSDK 插件
  const metaMask = useMemo(
    () => connectors.find((connector) => connector.id === "metaMaskSDK"),
    [connectors]
  );
  // 获取其他钱包插件
  const moreWallets = useMemo(
    () =>
      connectors.filter(
        (connector) =>
          connector.id !== "metaMaskSDK" && connector.id !== "walletConnect"
      ),
    [connectors]
  );
  const btnText = useMemo(() => {
    if (isConnecting) return "Connecting …";
    if (isConnected) return "Disconnect Wallet";
    if (isMobile) return "Connect";
    return "Connect Wallet";
  }, [isConnecting, isConnected, isMobile]);

  // 钱包连接
  const handleConnect = async (
    walletConnect: Connector<CreateConnectorFn> | undefined
  ) => {
    if (!walletConnect) return;
    try {
      await connectWallet(walletConnect);
    } finally {
      setIsOpen(false);
    }
  };

  // 开启钱包连接弹窗或断开钱包连接
  const handleClick = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <Dialog
      open={isOpen}
      trigger={
        <Button onClick={handleClick} disabled={isConnecting}>
          {btnText}
        </Button>
      }
    >
      <section className="text-center w-[85vw] md:w-100">
        <p className="text-xl text-Dark_Main">Connect Wallet</p>
        <p className="mt-1 text-sm text-Dark_Secondary">
          Connect your wallet to access your account.
        </p>
        <div className="mt-6 grid gap-6 text-Dark_Main">
          <p
            className={clsx(
              "p-4 flex justify-between items-center px-4 border border-Dark_Tier3 rounded-2xl",
              "hover:cursor-pointer hover:bg-Dark_Riverbit-cyan/5"
            )}
            // onClick={() => handleConnect(walletConnect)}
          >
            <span className="flex items-center gap-2">
              <img
                className="w-8 h-8 rounded-sm"
                src="/images/wallet/walletConnect.png"
                alt=""
              />{" "}
              Wallet Connectimg (Coming Soon)
            </span>
            <ArrowRightIcon />
          </p>
          <p
            className={clsx(
              "p-4 flex justify-between items-center px-4 border border-Dark_Tier3 rounded-2xl",
              "hover:cursor-pointer hover:bg-Dark_Riverbit-cyan/5"
            )}
            onClick={() => handleConnect(metaMask)}
          >
            <span className="flex items-center gap-2">
              <img
                className="w-8 h-8 rounded-sm"
                src="/images/wallet/metaMask.png"
                alt=""
              />{" "}
              MetaMask
            </span>
          </p>
          <div
            className={clsx(
              "border border-Dark_Tier3 rounded-2xl overflow-hidden"
            )}
          >
            <div
              className={clsx(
                "p-4 w-full flex justify-between items-center ",
                "hover:cursor-pointer hover:bg-Dark_Riverbit-cyan/5"
              )}
              onClick={() => setShowMoreWallet(!showMoreWallet)}
            >
              <div className="flex items-center">
                <p className="flex items-center">
                  {moreWallets.slice(0, 4).map((connector, index) => (
                    <img
                      key={connector.id}
                      style={{ transform: `translateX(-${index * 8}px)` }}
                      className={clsx("w-8 h-8 rounded-full")}
                      src={connector.icon}
                    />
                  ))}
                </p>
                <span>More wallets</span>
              </div>
              <CaretDownIcon
                className={clsx(showMoreWallet && "rotate-180", "w-6 h-6")}
              />
            </div>
            {showMoreWallet && (
              <div className="p-4 grid grid-cols-4 gap-2 items-center max-h-40 custom-scrollbar">
                {moreWallets.map((connector) => (
                  <button
                    className={clsx(
                      "grid gap-1 py-2.5 rounded-2xl",
                      "hover:cursor-pointer hover:bg-Dark_Riverbit-cyan/10"
                    )}
                    onClick={() => handleConnect(connector)}
                  >
                    <img
                      className={clsx("m-auto w-12 h-12 rounded-2xl")}
                      src={connector.icon}
                    />
                    <span className="text-sm text-center text-Dark_Secondary">
                      {connector.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            className="w-full"
            theme={ButtonTheme.Secondary}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </section>
    </Dialog>
  );
}
