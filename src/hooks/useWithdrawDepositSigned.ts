import { useCallback, useEffect, useState } from "react";
import { signCompliancePayload } from '../utils/compliance';
import useWallet from "./useWallet";
import { useDydxAddress } from "./useDydxAddress";



interface DydxWallet {
  dydxAddress: string;
  publicKey: Uint8Array;
  privatekey: Uint8Array;
}

interface SignCompliancePayloadParams {
  message: string;
  action: string;
  status: string;
  chainId: string | number;
}

interface SigningResponse {
  signedMessage: string; 
  publicKey: string; 
  timestamp: string; 
  isKeplr: boolean;
}
/**
 * 用于处理提现签名的自定义 Hook
 * 封装了生成随机 nonce、调用签名函数、解析响应等逻辑
 */
export const useWithdrawalSignature = () => {
  const { address, isConnected, chainId } = useWallet();
  const { generateDydxWallet,
    signMessage, 
    verifySignature, 
    recoverPublicKeyFromSignature,
    publicKeyToDydxAddress  } = useDydxAddress();
  /**
   * 生成提现签名
   * @param dydxWallet 用户的 dYdX 钱包信息（包含地址、公钥、私钥）
   * @param payload 签名所需参数（消息、操作类型、状态、链ID）
   * @returns 签名结果（包含签名信息或错误状态）
   */
  const generateWithdrawalSignature = useCallback(
    async (
      // payload: SignCompliancePayloadParams
      param: {
        message: string;
        action: string;
        status: string;
      }
    ): Promise<{ status: 'SUCCESS' | 'UNKNOWN'; data?: SigningResponse }> => {
      try {
        const signature = localStorage.getItem('signature') || '';
        if (!signature) return;
          const wallet = await generateDydxWallet(signature);
          // setDydxWallet(wallet);
          console.log('生成成功！');
          console.log('chainId', chainId);
          console.log('助记词：', wallet.mnemonic);
          console.log('dYdX地址：', wallet.dydxAddress);
          // console.log('私钥（Uint8Array）：', wallet.privateKey);
          console.log('公钥（Uint8Array）：', wallet.publicKey);
        // 1. 生成随机 nonce（1 到 9999999 之间的整数）
        const min = 1;
        const max = 9999999;
        const randomInt = Math.floor(Math.random() * (max - min + 1)) + min;

        // 2. 构造 hdkey 对象（包含公钥和私钥）
        const hdkey = {
          publicKey: wallet.publicKey,
          privateKey: wallet.privateKey,
        };

        // 3. 调用签名函数生成合规签名
        const payload: SignCompliancePayloadParams= {
          ...param ,
          chainId: chainId
        }
        const signingResponse = await signCompliancePayload(
          wallet.dydxAddress,
          randomInt,
          payload,
          hdkey
        );

        // 4. 处理签名响应
        if (!signingResponse) {
          return { status: 'UNKNOWN' };
        }

        const parsedResponse: SigningResponse = JSON.parse(signingResponse);

        // 5. 检查是否有错误
        if (parsedResponse.error) {
          console.error('签名失败:', parsedResponse.error);
          return { status: 'UNKNOWN' };
        }

        // 6. 签名成功，返回结果
        console.log('签名成功:', parsedResponse);
        return {
          status: 'SUCCESS',
          data: parsedResponse,
        };
      } catch (error) {
        console.error('生成提现签名时发生错误:', error);
        return { status: 'UNKNOWN' };
      }
    },
    []
  );

  return {
    generateWithdrawalSignature,
  };
};


/* // 1. 用户发起提现时生成签名
const handleSignature = async () => {
  const payload = {
    message: withdrawalMessage, // 待签名的核心消息内容
    action: 'withdraw', // 操作类型（如"withdraw"提现、"deposit"存款等）
    status: 'pending' // 操作状态（可选，如"pending"、"completed"）
  };
  // 调用 Hook 生成签名
  const result = await generateWithdrawalSignature(payload);
  if (result.status === 'SUCCESS' && result.data) {
    const { signedMessage, publicKey, timestamp } = result.data;
    // 签名成功，可继续处理后续逻辑（如提交到后端）
    console.log('使用签名结果:', { signedMessage, publicKey, timestamp });
  } else {
    // 签名失败，提示用户
    console.error('签名生成失败');
  }
}; */