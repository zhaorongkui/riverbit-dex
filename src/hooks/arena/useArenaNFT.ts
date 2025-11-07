import { usePublicClient, useWalletClient } from "wagmi";
import { getTokenInfo } from "../../config/tokens";
import useWallet from "../useWallet";
import { RiverbitArenaAgentNFT, MockUSDC } from "../../contract";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Tokens } from "../../config/tokens/token.type";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";

export const useArenaNFT = () => {
  const abi = RiverbitArenaAgentNFT;
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { chainId, address: walletAddress } = useWallet();

  const usdcAddress = useMemo(() => {
    return getTokenInfo(chainId, Tokens.USDC)?.address;
  }, [chainId]);
  const address = useMemo(() => {
    return getTokenInfo(chainId, Tokens.ARENA_NFT)?.address;
  }, [chainId]);

  //  获取前 100 免费的 nft 索引
  const nextGenesisId = useQuery({
    queryKey: ["nextGenesisId"],
    queryFn: async () => {
      if (!chainId || !publicClient || !address) return null;
      const nextGenesisId = (await publicClient.readContract({
        address,
        abi,
        functionName: "getNextGenesisId",
      })) as bigint;
      return nextGenesisId.toString();
    },
    staleTime: 60 * 1000,
    enabled: !!publicClient,
  });

  // 获取 100之后 标准的 nft 索引
  const nextStandardId = useQuery({
    queryKey: ["nextStandardId"],
    queryFn: async () => {
      if (!chainId || !publicClient || !address) return null;
      const nextStandardId = (await publicClient.readContract({
        address,
        abi,
        functionName: "getNextStandardId",
      })) as bigint;
      return nextStandardId.toString();
    },
    staleTime: 60 * 1000,
    enabled: !!publicClient,
  });

  // 剩余可以使用的 NFT 数量
  const availableNft = useQuery({
    queryKey: ["availableNft"],
    queryFn: async () => {
      if (!chainId || !publicClient || !address) return null;
      const [available, remaining] = (await publicClient.readContract({
        address,
        abi,
        functionName: "getGenesisAvailability",
      })) as [boolean, bigint];
      return {
        available: available,
        remaining: remaining.toString(),
      };
    },
    staleTime: 60 * 1000,
    enabled: !!publicClient,
  });

  // 获取当前 NFT 铸币价格
  const currentMintPrice = useQuery({
    queryKey: ["currentMintPrice"],
    queryFn: async () => {
      if (!chainId || !publicClient || !address) return null;
      const price = (await publicClient.readContract({
        address,
        abi,
        functionName: "getCurrentMintPrice",
      })) as bigint;
      return price;
    },
    staleTime: 60 * 1000,
    enabled: !!publicClient,
  });
  const currentNftPrice = useMemo(() => {
    if (!chainId) return null;
    const formattedPrice = ethers.formatUnits(
      currentMintPrice.data || "0",
      getTokenInfo(chainId, Tokens.USDC)?.decimals || 6
    );
    return formattedPrice;
  }, [chainId, currentMintPrice.data]);

  // 获取白名单用户已铸造数量
  const whitelistMintCount = useQuery({
    queryKey: ["whitelistMintCount"],
    queryFn: async () => {
      if (!chainId || !publicClient || !address || !walletAddress) return null;
      const whitelistMintCount = (await publicClient.readContract({
        address,
        abi,
        functionName: "getWhitelistMintCount",
        args: [walletAddress],
      })) as bigint;
      return whitelistMintCount.toString();
    },
    staleTime: 60 * 1000,
    enabled: !!publicClient,
  });

  // 是否是白名单用户
  const isWhitelisted = useCallback(
    async (walletAddress: string) => {
      if (!chainId || !publicClient || !address) return null;
      const isWhitelisted = (await publicClient.readContract({
        address,
        abi,
        functionName: "isWhitelisted",
        args: [walletAddress],
      })) as boolean;
      return isWhitelisted;
    },
    [chainId, publicClient, address, abi]
  );

  // 获取指定 NFT 铸币价格
  const getMintPrice = useCallback(
    async (id: string) => {
      if (!chainId || !publicClient || !address) return null;
      const _price = (await publicClient.readContract({
        address,
        abi,
        functionName: "getMintPrice",
        args: [id],
      })) as bigint;
      const formattedPrice = ethers.formatUnits(
        _price,
        getTokenInfo(chainId, Tokens.USDC)?.decimals || 6
      );
      return formattedPrice;
    },
    [chainId, publicClient, address, abi]
  );

  // 查询用户是否拥有 指定 NFT
  const getBalance = useCallback(
    async (userAddress: string) => {
      if (!chainId || !publicClient || !address) return null;
      const balance = (await publicClient.readContract({
        address,
        abi,
        functionName: "balanceOf",
        args: [userAddress],
      })) as bigint;
      return balance.toString();
    },
    [chainId, publicClient, address, abi]
  );
  const userNFTBalance = useQuery({
    queryKey: ["userNFTBalance", walletAddress],
    queryFn: async () => getBalance(walletAddress || ""),
    staleTime: 60 * 1000,
    enabled: !!publicClient || !!walletAddress,
  });

  /**
   *  Arena NFT write 操作
   */

  // 铸造 genesis NFT
  const addToWhitelist = useMutation({
    mutationFn: async () => {
      if (!walletClient || !walletAddress || !address)
        throw new Error("Wallet not connected");
      // 调用合约的 mint 函数
      const hash = await walletClient.writeContract({
        address,
        abi,
        functionName: "addToWhitelist",
        args: ["0x0b465378e56bbb4fee8e75f3ee54d9e815bcb4b7"],
      });
      return hash;
    },
    onSuccess: (hash) => {
      console.log("Mint transaction:", hash);
      // 可以在这里触发重新获取 NFT 列表
    },
    onError: (error) => {
      console.error("Mint failed:", error);
    },
  });

  // 铸造 genesis NFT
  const mintGenesis = useMutation({
    mutationFn: async () => {
      console.log("mint genesis NFT");
      if (!walletClient || !walletAddress || !address)
        throw new Error("Wallet not connected");
      // 调用合约的 mint 函数
      const hash = await walletClient.writeContract({
        address,
        abi,
        functionName: "mintGenesis",
        args: [walletAddress],
      });
      return hash;
    },
    onSuccess: (hash) => {
      console.log("Mint transaction:", hash);
      // 可以在这里触发重新获取 NFT 列表
    },
    onError: (error) => {
      console.error("Mint failed:", error);
    },
  });

  // 铸造 standard NFT
  const mintStandard = useMutation({
    mutationFn: async () => {
      console.log("mint standard NFT");
      if (
        !walletClient ||
        !walletAddress ||
        !publicClient ||
        !usdcAddress ||
        !address
      ) {
        throw new Error("Wallet not connected");
      }
      if (!currentMintPrice.data) {
        throw new Error("Current mint price not available");
      }
      try {
        // 1. 先进行 approve
        const approveHash = await walletClient.writeContract({
          address: usdcAddress, // 确保这是 USDC 合约地址
          abi: MockUSDC,
          functionName: "approve",
          args: [address, currentMintPrice.data], // address 应该是 NFT 合约地址
        });
        // 等待 approve 交易确认
        const approveReceipt = await publicClient.waitForTransactionReceipt({
          hash: approveHash,
        });
        if (approveReceipt.status !== "success") {
          throw new Error("Approve transaction failed");
        }
        // 2. 再进行 mint
        const mintHash = await walletClient.writeContract({
          address, // NFT 合约地址
          abi,
          functionName: "mintStandard",
          args: [walletAddress],
        });
        // // 等待 mint 交易确认
        const mintReceipt = await publicClient.waitForTransactionReceipt({
          hash: mintHash,
        });
        if (mintReceipt.status !== "success") {
          throw new Error("Mint transaction failed");
        }
        return mintHash;
      } catch (error) {
        console.error("Transaction error:", error);
        throw error;
      }
    },
    onSuccess: (hash) => {
      console.log("Mint transaction successful:", hash);
    },
    onError: (error) => {
      console.error("Mint failed:", error);
    },
  });

  // 铸造 NFT
  const mintNFT = useMutation({
    mutationFn: async () => {
      if (!walletClient || !walletAddress || !address)
        throw new Error("Wallet not connected");
      if (!currentMintPrice.data)
        throw new Error("Current mint price not available");
      const isFree = await isWhitelisted(walletAddress);
      const isGenesisMinted = whitelistMintCount.data?.toString() || "0";
      let hash: string;
      // 判断是否是白名单用户 && 当前已经 mint genesis NFT 数量是否超过 100
      if (
        isFree &&
        !(Number(isGenesisMinted) > 0) &&
        !(Number(nextGenesisId.data) > 100)
      ) {
        hash = await mintGenesis.mutateAsync();
      } else {
        hash = await mintStandard.mutateAsync();
      }
      return hash;
    },
    onSuccess: (hash) => {
      console.log("Mint transaction:", hash);
      userNFTBalance.refetch();
    },
    onError: (error) => {
      console.error("Mint failed:", error);
    },
  });

  // 销毁 standard NFT
  const burnNFT = useMutation({
    mutationFn: async (id: string) => {
      if (!walletClient || !walletAddress || !publicClient || !address)
        throw new Error("Wallet not connected");
      if (!currentMintPrice.data)
        throw new Error("Current mint price not available");
      const hash = await walletClient.writeContract({
        address,
        abi,
        functionName: "burn",
        args: [id],
      });
      return hash;
    },
    onSuccess: (hash) => {
      console.log("Burn transaction:", hash);
    },
    onError: (error) => {
      console.error("Burn failed:", error);
    },
  });

  useEffect(() => {
    if (
      !nextStandardId.data ||
      !nextGenesisId.data ||
      !availableNft.data ||
      !whitelistMintCount.data ||
      !walletAddress ||
      !address
    )
      return;

    console.log("userNFTBalance", userNFTBalance.data);
    console.log("nextGenesisId", nextGenesisId.data);
    console.log("nextStandardId", nextStandardId.data);
    console.log("availableNft", availableNft.data);
    console.log("currentNftPrice", currentNftPrice + " USDC");
    console.log("whitelistMintCount", walletAddress, whitelistMintCount.data);

    // 是否是白名单用户
    isWhitelisted(walletAddress).then((isWhitelisted) => {
      console.log("isWhitelisted----", walletAddress, isWhitelisted);
    });

    // 查询用户是否拥有 指定 NFT
    getBalance(walletAddress).then((hasBalance) => {
      console.log(
        walletAddress,
        ">>>> hasBalance:",
        Number(nextStandardId.data),
        hasBalance
      );
    });
  }, [
    address,
    userNFTBalance.data,
    nextStandardId.data,
    nextGenesisId.data,
    currentNftPrice,
    availableNft.data,
    whitelistMintCount.data,
    walletAddress,
    getMintPrice,
    isWhitelisted,
    getBalance,
  ]);

  return {
    nextStandardId,
    nextGenesisId,
    availableNft,
    currentNftPrice,
    userNFTBalance,
    // methods
    addToWhitelist,
    mintGenesis,
    mintStandard,
    mintNFT,
    burnNFT,
  };
};

type ArenaNFTType = ReturnType<typeof useArenaNFT>;
export const ArenaNftContext = createContext<ArenaNFTType | null>(null);

export function useArenaNFTContext() {
  const context = useContext(ArenaNftContext);
  if (!context) {
    throw new Error(
      "useArenaNFTContext must be used within an ArenaNFTProvider"
    );
  }
  return context;
}
