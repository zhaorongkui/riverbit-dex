import { useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { getAddress } from "viem";
import { getNonce, getTokenAuth } from "../api/wallet";
import { LocalStorageKeys } from "../stores/localstorage";

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const signAndGetToken = useCallback(
    async (callback?: () => void): Promise<boolean> => {
      if (!isConnected || !address) {
        throw new Error("wallet not connected!");
      }
      try {
        // 1️⃣ 转换为校验和格式
        const checksumAddress = getAddress(address);
        // 2️⃣ 请求后端获取待签名信息
        const nonceRes = await getNonce(checksumAddress);
        const { message } = nonceRes.data;
        if (typeof message !== "string") {
          throw new Error("Response nonce message error!");
        }
        // 3️⃣ 使用 wagmi 的 signMessageAsync 签名
        const signature = await signMessageAsync({ message });
        console.log("Signature:", signature);
        localStorage.setItem("signature", signature);
        if (!signature || signature.length !== 132) {
          throw new Error("Wallet sign message error!");
        }
        // 4️⃣ 调用后端认证接口，换取 token
        const tokenRes = await getTokenAuth({
          address: checksumAddress,
          signature,
          message,
        });
        const { token_type, token } = tokenRes.data;
        const tokenValue = `${token_type} ${token}`;
        // 5️⃣ 本地保存 token
        localStorage.setItem(LocalStorageKeys.RIVERBIT_TOKEN_KEY, tokenValue);
        console.log(
          "✅ Wallet sign message success, token stored:",
          tokenValue
        );
        callback?.();
        return true;
      } catch (error) {
        console.error("❌ Wallet sign message or auth failed:", error);
        localStorage.removeItem(LocalStorageKeys.RIVERBIT_TOKEN_KEY);
        throw error;
      }
    },
    [address, isConnected, signMessageAsync]
  );

  return { signAndGetToken };
}
