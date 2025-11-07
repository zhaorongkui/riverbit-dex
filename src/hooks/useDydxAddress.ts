import { keccak_256 } from '@noble/hashes/sha3.js';
import { mnemonicToSeedSync, entropyToMnemonic } from '@scure/bip39'; // 关键：替换 generateMnemonic 为 entropyToMnemonic
import { HDKey } from '@scure/bip32';
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english.js';
import { useCallback } from 'react';
import { bech32 } from 'bech32';

// 浏览器环境适配：十六进制转 Uint8Array
const hexToUint8Array = (hex: string): Uint8Array => {
  const length = hex.length;
  const array = new Uint8Array(length / 2);
  for (let i = 0; i < length; i += 2) {
    array[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return array;
};

interface DydxWallet {
  mnemonic: string;
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  dydxAddress: string;
  ethSignature: string;
}

interface UseDydxAddressReturn {
  generateDydxWallet: (signature: string) => Promise<DydxWallet>;
  validateSignature: (signature: string) => boolean;
  deriveFromMnemonic: (mnemonic: string, path?: string) => DydxWallet;
  generateDydxWalletFromEIP712: (ethAddress: string, signMessageAsync: any) => Promise<DydxWallet>;
}

const stripHexPrefix = (hex: string): string => {
  return hex.startsWith('0x') ? hex.slice(2) : hex;
};

// 公钥转原始地址（符合 Secp256k1 规范）
const rawSecp256k1PubkeyToRawAddress = (publicKey: Uint8Array): Uint8Array => {
  const pubKeyWithoutPrefix = publicKey.slice(1); // 去掉压缩公钥首字节（0x02/0x03）
  const keccakHash = keccak_256(pubKeyWithoutPrefix);
  return keccakHash.slice(-20); // 取后20字节作为原始地址
};

const toBech32 = (prefix: string, data: Uint8Array): string => {
  const words = bech32.toWords(data);
  return bech32.encode(prefix, words);
};

// 确定性熵转助记词（同一熵 → 同一助记词）
const entropyToMnemonicFn = (entropy: Uint8Array): string => {
  const adjustedEntropy = entropy.slice(0, 32); // 确保32字节熵（BIP39 24词规范）
  return entropyToMnemonic(adjustedEntropy, englishWordlist); // 关键：用传入的熵生成，而非随机
};

export const useDydxAddress = (): UseDydxAddressReturn => {
  const validateSignature = useCallback((signature: string): boolean => {
    const cleanSignature = stripHexPrefix(signature);
    return cleanSignature.length === 130; // 65字节 = 130个十六进制字符
  }, []);

  const deriveFromMnemonic = useCallback((mnemonic: string, path: string = "m/44'/118'/0'/0/0"): DydxWallet => {
    const seed = mnemonicToSeedSync(mnemonic);
    const hdKey = HDKey.fromMasterSeed(seed);
    const derivedKey = hdKey.derive(path);
    
    if (!derivedKey.privateKey || !derivedKey.publicKey) {
      throw new Error('Failed to derive keys from mnemonic');
    }

    const rawAddress = rawSecp256k1PubkeyToRawAddress(derivedKey.publicKey);
    const dydxAddress = toBech32('river', rawAddress);

    return {
      mnemonic,
      privateKey: derivedKey.privateKey,
      publicKey: derivedKey.publicKey,
      dydxAddress,
      ethSignature: ''
    };
  }, []);

  const generateDydxWallet = useCallback(async (signature: string): Promise<DydxWallet> => {
    if (!validateSignature(signature)) {
      throw new Error('Invalid signature format: must be 65 bytes (130 hex characters)');
    }

    const cleanSignature = stripHexPrefix(signature);
    const buffer = hexToUint8Array(cleanSignature);

    if (buffer.length !== 65) {
      throw new Error('Signature must be 65 bytes');
    }

    // 确定性链路核心：同一签名 → 同一 rsValues → 同一熵 → 同一助记词 → 同一地址
    const rsValues = buffer.slice(0, 64);
    const entropy = keccak_256(rsValues); // 固定输入 → 固定输出
    const mnemonic = entropyToMnemonicFn(entropy); // 固定熵 → 固定助记词
    const wallet = deriveFromMnemonic(mnemonic); // 固定助记词 → 固定地址

    return {
      ...wallet,
      ethSignature: signature,
    };
  }, [validateSignature, deriveFromMnemonic]);

  const generateDydxWalletFromEIP712 = useCallback(async (
    ethAddress: string, 
    signMessageAsync: any
  ): Promise<DydxWallet> => {
    const eip712Message = {
      primaryType: 'dYdX',
      domain: {
        name: 'RiverChain',
        chainId: 11155111 // Sepolia 测试网
      },
      types: {
        dYdX: [{ name: 'action', type: 'string' }]
      },
      message: {
        action: 'RiverChain Onboarding'
      }
    };

    const signature = await signMessageAsync({ 
      message: eip712Message 
    });

    return generateDydxWallet(signature);
  }, [generateDydxWallet]);

  return {
    generateDydxWallet,
    validateSignature,
    deriveFromMnemonic,
    generateDydxWalletFromEIP712,
  };
};

/* 
生成dydx地址的hooks用法：
import { useDydxAddress } from '../hooks/useDydxAddress';
const { generateDydxWallet } = useDydxAddress();

定义一个函数来生成dydx地址：
const generateDydxAddress = async () => {
    if (!signature) return;
    try {
      const wallet = await generateDydxWallet(signature);
      setDydxWallet(wallet);
      console.log('生成成功！');
      console.log('助记词：', wallet.mnemonic);
      console.log('dYdX地址：', wallet.dydxAddress);
      console.log('私钥（Uint8Array）：', wallet.privateKey);
      console.log('公钥：', wallet.publicKey);
    } catch (error) {
      console.error('Failed to generate dYdX wallet:', error);
    } finally {
      
    }
  };

*/