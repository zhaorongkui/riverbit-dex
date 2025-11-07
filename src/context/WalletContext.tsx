import { BrowserProvider, JsonRpcSigner, getAddress } from "ethers";
import userInfoStore  from '../stores/userStore'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { NETWORK_CONFIG } from "../config/contracts";
import DepositModal from "../components/wallet/DepositModal";
import WithdrawModal from "../components/wallet/WithdrawModal";
import {
  fetchWalletSnapshot,
  type WalletBalanceSnapshot,
} from "../utils/balances";
import { getNonce, getTokenAuth, getPoints } from '../api/wallet';


const EMPTY_BALANCES: WalletBalanceSnapshot = {
  wallet: {
    ETH: 0n,
    USDC: 0n,
  },
  dex: {
    ETH: 0n,
    USDC: 0n,
  },
};

const AUTO_CONNECT_STORAGE_KEY = "riverbit:autoConnect";

const readAutoConnectPreference = (): boolean => {
  if (typeof window === "undefined") {
    return true;
  }
  const stored = window.localStorage.getItem(AUTO_CONNECT_STORAGE_KEY);
  const token = window.localStorage.getItem('Riverbit_Token');
  if(!token){
    return false;
  }
  // if (stored === null) {
  //   return true;
  // }
  return stored === "true";
  // 通过 window.localStorage.getItem(键名) 读取本地存储的配置值。
  // 若返回 null，说明用户是首次使用、或从未设置过自动连接偏好，此时默认返回 true（开启自动连接，提升新用户体验）。
  // 但是当用户首次没有授权钱包地址时，没有登陆时，应该自动连接逻辑会被跳过，不会强制连接。
  // 当有token 时，默认开启自动连接， 没有token,应该先登录
};

interface WalletContextValue {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  ensureCorrectNetwork: () => Promise<void>;
  getSigner: () => Promise<JsonRpcSigner>;
  getProvider: () => Promise<BrowserProvider>;
  openDepositModal: () => void;
  openWithdrawModal: () => void;
  closeDepositModal: () => void;
  closeWithdrawModal: () => void;
  balances: WalletBalanceSnapshot;
  balancesLoading: boolean;
  refreshBalances: () => Promise<WalletBalanceSnapshot | null>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const chainParams = {
  chainId: NETWORK_CONFIG.chainHex,
  chainName: NETWORK_CONFIG.name,
  rpcUrls: [NETWORK_CONFIG.rpcUrl],
  blockExplorerUrls: [NETWORK_CONFIG.blockExplorer],
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
};

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [autoConnectEnabled, setAutoConnectEnabled] = useState<boolean>(
    readAutoConnectPreference,
  );
  const [balances, setBalances] =
    useState<WalletBalanceSnapshot>(EMPTY_BALANCES);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [points, setPoints] = useState(0);

  const getPointsData = async (address: string) => {
    console.log(2222222222);
    const res = await getPoints(address);
    console.log(111111, res);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      AUTO_CONNECT_STORAGE_KEY,
      autoConnectEnabled ? "true" : "false",
    );
  }, [autoConnectEnabled]);

  const getOrCreateProvider =
    useCallback(async (): Promise<BrowserProvider> => {
      if (provider) {
        return provider;
      }

      if (!window.ethereum) {
        throw new Error("检测不到钱包扩展，请安装 MetaMask");
      }

      const browserProvider = new BrowserProvider(window.ethereum, "any");
      setProvider(browserProvider);
      return browserProvider;
    }, [provider]);

  const ensureCorrectNetwork = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("检测不到钱包扩展");
    }

    const currentChainHex = (await window.ethereum.request({
      method: "eth_chainId",
    })) as string;
    if (currentChainHex === NETWORK_CONFIG.chainHex) {
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK_CONFIG.chainHex }],
      });
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err?.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [chainParams],
        });
      } else {
        throw error;
      }
    }
  }, []);
  const { setUserInfo } = userInfoStore ()
  // 抽离通用的“签名+获取Token”函数
  const signAndGetToken = useCallback(
    
    async (provider: BrowserProvider, account: string): Promise<boolean> => {
      try {
        // 统一转换为校验和地址（Checksum Address）
        const checksumAddress = getAddress(account);
        setUserInfo({address: checksumAddress});
        if (!checksumAddress) {
          throw new Error('无效的账户地址，无法进行签名');
        }

        // 1. 用地址获取nonce（与后端交互获取待签名消息）
        const nonceRes = await getNonce(checksumAddress);
        const { data: nonceData } = await nonceRes;
        const { message } = nonceData;

        // 校验待签名消息格式
        if (typeof message !== 'string') {
          throw new Error('后端返回的待签名消息格式错误，必须为字符串');
        }

        // 2. 获取签名器并签名
        const signer = await provider.getSigner();

        // 新增日志：检查签名器地址
        const signerAddress = await signer.getAddress();
        // console.log("当前账户地址：", checksumAddress);
        // console.log("签名器地址：", signerAddress);
        console.log("地址是否一致：", signerAddress === checksumAddress);
        if (!signer) {
          throw new Error('无法获取钱包签名器，无法完成身份验证');
        }
        // 使用校验和地址进行比较
        if (getAddress(signerAddress) !== checksumAddress) {
          throw new Error(
            `签名器地址不匹配：期望 ${checksumAddress}，实际 ${signerAddress}`
          );
        }
        const signature = await signer.signMessage(message);

        // 3. 校验签名格式（以太坊签名为132位十六进制字符串）
        if (!signature || signature.length !== 132) {
          throw new Error('钱包签名失败，签名格式不符合要求');
        }

        // 4. 调用后端接口获取token并存储
        const tokenRes = await getTokenAuth({
          address: checksumAddress,
          signature: signature,
          message: message
        });
        const { data: tokenData } = tokenRes;
        const token = `${tokenData.token_type} ${tokenData.token}`;

        // 存储token到本地
        localStorage.setItem('Riverbit_Token', token);
        console.log('签名成功，Token已存储到本地：', token);
        return true; // 标识Token获取成功
      } catch (error) {
        console.error('签名或获取Token失败：', error);
        // 失败时清空本地残留Token，避免脏数据
        localStorage.removeItem('Riverbit_Token');
        throw error;
      }
    },
    []
  );

  const connectWallet = useCallback(async () => {
    console.log(12121212, window.ethereum);
    // localStorage.setItem('Riverbit_Token', '');
    if (!window.ethereum) {
      throw new Error("检测不到钱包扩展，请先安装 MetaMask");
    }

    
    try {
      const browserProvider = await getOrCreateProvider();
      const accounts = (await browserProvider.send(
        "eth_requestAccounts",
        [],
      )) as string[];
      const primaryAccount = accounts?.[0] ?? null;

      // 标准化地址（关键：确保后续使用的地址是小写）
      if (!primaryAccount) {
        throw new Error('未获取到授权地址');
      }
      // 2. 关键：强制完成签名并获取Token（不获取Token则不进入后续）
      console.log('开始进行签名以获取Token...', primaryAccount);
      await signAndGetToken(browserProvider, primaryAccount);
      
      setIsConnecting(true);
      setAccount(primaryAccount);
     
      const chainHex = (await browserProvider.send(
        "eth_chainId",
        [],
      )) as string;
      setChainId(parseInt(chainHex, 16));

      await ensureCorrectNetwork();

      const finalChainHex = (await browserProvider.send(
        "eth_chainId",
        [],
      )) as string;
      setChainId(parseInt(finalChainHex, 16));
      if (primaryAccount) {
        try {
          const snapshot = await fetchWalletSnapshot(
            browserProvider,
            primaryAccount,
          );
          setBalances(snapshot);
        } catch (balanceError) {
          console.warn("Failed to fetch balances after connect", balanceError);
          setBalances(EMPTY_BALANCES);
        }
      } else {
        setBalances(EMPTY_BALANCES);
      }
      setAutoConnectEnabled(true);
    } finally {
      setIsConnecting(false);
    }
  }, [ensureCorrectNetwork, getOrCreateProvider]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setAutoConnectEnabled(false);
    setShowDeposit(false);
    setShowWithdraw(false);
    setBalances(EMPTY_BALANCES);
    localStorage.setItem('Riverbit_Token', '');
  }, []);

  const getSigner = useCallback(async () => {
    const browserProvider = await getOrCreateProvider();
    return browserProvider.getSigner();
  }, [getOrCreateProvider]);

  const getProvider = useCallback(async () => {
    return getOrCreateProvider();
  }, [getOrCreateProvider]);

  const refreshBalances =
    useCallback(async (): Promise<WalletBalanceSnapshot | null> => {
      if (!account) {
        setBalances(EMPTY_BALANCES);
        return null;
      }

      try {
        setBalancesLoading(true);
        const providerInstance = await getOrCreateProvider();
        const snapshot = await fetchWalletSnapshot(providerInstance, account);
        setBalances(snapshot);
        return snapshot;
      } catch (error) {
        console.warn("Failed to refresh balances", error);
        return null;
      } finally {
        setBalancesLoading(false);
      }
    }, [account, getOrCreateProvider]);

  // Auto connect (if enabled) and hydrate initial state
  useEffect(() => {
    if (!window.ethereum) {
      return;
    }

    let isMounted = true;

    const initialise = async () => {
      if (!autoConnectEnabled) return;
      try {
        const browserProvider = await getOrCreateProvider();
        const [accounts, chainHex] = await Promise.all([
          browserProvider.send("eth_accounts", []) as Promise<string[]>,
          browserProvider.send("eth_chainId", []) as Promise<string>,
        ]);

        if (!isMounted) return;

        setAccount(accounts?.[0] ?? null);
        setChainId(parseInt(chainHex, 16));
        if (accounts?.[0]) {
          try {
            const snapshot = await fetchWalletSnapshot(
              browserProvider,
              accounts[0],
            );
            if (isMounted) {
              setBalances(snapshot);
            }
          } catch (error) {
            console.warn("Failed to load initial balances", error);
            if (isMounted) {
              setBalances(EMPTY_BALANCES);
            }
          }
        } else {
          setBalances(EMPTY_BALANCES);
        }
      } catch (error) {
        console.warn("Failed to initialise provider", error);
      }
    };

    initialise();

    const handleAccountsChanged = (accounts: string[]) => {
      if (!isMounted) return;
      const nextAccount = accounts?.[0] ?? null;
      setAccount(nextAccount);
      setAutoConnectEnabled(accounts.length > 0 && localStorage.getItem('Riverbit_Token'));
      if (accounts.length === 0) {
        setChainId(null);
        setBalances(EMPTY_BALANCES);
      }
    };

    const handleChainChanged = (chainHex: string) => {
      if (!isMounted) return;
      setChainId(parseInt(chainHex, 16));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      isMounted = false;
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [autoConnectEnabled, getOrCreateProvider]);

  useEffect(() => {
    if (!account) {
      setBalances(EMPTY_BALANCES);
      return;
    }
    void refreshBalances();
  }, [account, chainId, refreshBalances]);

  const contextValue = useMemo<WalletContextValue>(
    () => ({
      account,
      chainId,
      isConnected: Boolean(account),
      isCorrectNetwork: chainId === NETWORK_CONFIG.chainId,
      isConnecting,
      connectWallet,
      disconnectWallet,
      ensureCorrectNetwork,
      getSigner,
      getProvider,
      openDepositModal: () => setShowDeposit(true),
      openWithdrawModal: () => setShowWithdraw(true),
      closeDepositModal: () => setShowDeposit(false),
      closeWithdrawModal: () => setShowWithdraw(false),
      balances,
      balancesLoading,
      refreshBalances,
    }),
    [
      account,
      chainId,
      connectWallet,
      disconnectWallet,
      ensureCorrectNetwork,
      getSigner,
      getProvider,
      isConnecting,
      balances,
      balancesLoading,
      refreshBalances,
    ],
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
      <DepositModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
      />
      <WithdrawModal
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
      />
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
};
