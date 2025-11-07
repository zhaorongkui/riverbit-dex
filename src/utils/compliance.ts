/**
 * 使用本地HD钱包私钥对合规信息进行签名
 * 场景：用户使用本地管理的私钥（非Keplr等外部钱包）时，生成合规签名
 * @param message 待签名的核心消息内容
 * @param action 操作类型（如"withdraw"提现、"deposit"存款等）
 * @param status 操作状态（可选，如"pending"、"completed"）
 * @param hdkey HD钱包密钥对（包含私钥和公钥）
 * @returns 签名结果和时间戳（秒级）
 */
const signComplianceSignature = async (
  message: string,
  action: string,
  status: string,
  hdkey: Hdkey
): Promise<{ signedMessage: string; timestamp: number }> => {
  // 校验密钥对是否完整
  if (!hdkey.privateKey || !hdkey.publicKey) {
    throw new Error('Missing hdkey'); // 缺少私钥或公钥时抛出错误
  }

  // 生成当前时间戳（秒级，用于防止重放攻击）
  const timestampInSeconds = Math.floor(Date.now() / 1000);
  // 构建待签名的完整消息（拼接核心消息、操作、状态和时间戳）
  const messageToSign: string = `${message}:${action}"${status || ''}:${timestampInSeconds}`;
  
  // 1. 对消息进行SHA-256哈希（符合Cosmos生态签名规范）
  // 浏览器环境用 TextEncoder 替代 Buffer 转换字符串为 Uint8Array
  const encoder = new TextEncoder();
  const messageHash = (await import('@cosmjs/crypto')).sha256(
    encoder.encode(messageToSign) // 字符串 → Uint8Array（浏览器原生API，无依赖）
  );

  // 2. 使用Secp256k1算法和私钥对哈希结果进行签名
  const signed = await (
    await import('@cosmjs/crypto')
  ).Secp256k1.createSignature(messageHash, hdkey.privateKey);
  
  // 3. 转换签名格式为固定长度，并转为base64字符串
  const signedMessage = signed.toFixedLength();
  // 浏览器环境用 btoa + String.fromCharCode 替代 Buffer.from 转base64
  const signedMessageBase64 = btoa(
    String.fromCharCode(...new Uint8Array(signedMessage))
  );
  // console.log('签名成功');
  return {
    signedMessage: signedMessageBase64, // 返回base64格式的签名
    timestamp: timestampInSeconds,
  };
};

/**
 * 一般使用这个进行签名
 * 生成合规签名 payload（对外暴露的主函数）
 * 场景：用户进行需要合规验证的操作（如提现、KYC验证等）时，生成签名信息
 * 自动判断使用本地私钥还是Keplr钱包签名
 * @param address 用户地址（dYdX格式）
 * @param nonce 随机数（用于增强签名唯一性，防止重放）
 * @param params 签名参数（消息、操作类型、状态、链ID）
 * @returns 序列化的签名信息（JSON字符串）
 */
export const signCompliancePayload = async (
  address: string,
  nonce: number,
  params: {
    message: string;
    action: string;
    status: string;
    chainId: string;
  },
  hdkey: any
): Promise<string> => {
  try {
    // 1. 尝试从本地HD密钥管理器获取当前地址的密钥对
    // 若本地密钥存在，则使用本地私钥签名
    if (hdkey?.privateKey && hdkey.publicKey) {
      const { signedMessage, timestamp } = await signComplianceSignature(
        params.message,
        params.action,
        params.status,
        hdkey
      );

      // 浏览器环境：将公钥（Uint8Array）转为base64
      // 步骤：Uint8Array → 字符序列 → base64
      const publicKeyBase64 = btoa(
        String.fromCharCode(...new Uint8Array(hdkey.publicKey))
      );

      // 返回包含签名、公钥和时间戳的JSON
      return JSON.stringify({
        signedMessage,
        // publicKey: Buffer.from(hdkey.publicKey).toString('base64'), // 公钥转base64
        publicKey: publicKeyBase64, // 公钥转base64
        timestamp,
        isKeplr: false, // 标记为不是Keplr签名
      });
    }
    // 3. 若均无法签名，抛出错误
    throw new Error('Missing hdkey');
  } catch (error) {
    console.log(error)
    throw new Error(error);
  }
};