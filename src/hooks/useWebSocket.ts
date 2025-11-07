import { useState, useRef, useEffect, useCallback } from 'react';
import { webSocket } from 'viem';
const env = import.meta.env;

interface UseWebSocketResult<T> {
  data: T | null;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
  sendMessage: (message: any) => void;
}
type Params = {
  type: string,
  channel: string,
  id?: string
}

export default function useWebSocket<T = any>(
  params: Params,
  options?: {
    autoReconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    onMessage?: (data: T) => void;
  },
  getWsUrl?: () => string = () => '',
): UseWebSocketResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const urlRef = useRef<string>('');
  const isConnecting = useRef(false);
  const onlineListener = useRef<(() => void) | null>(null);

  const {
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage
  } = options || {};

  // 使用 useRef 来存储稳定的回调
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const closeWebSocket = useCallback(() => {
    console.log('关闭 WebSocket 连接');

    // 清理所有定时器
    [reconnectTimer, heartbeatTimer].forEach((timerRef) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    });

    // 移除网络监听
    if (onlineListener.current) {
      window.removeEventListener('online', onlineListener.current);
      onlineListener.current = null;
    }

    if (wsRef.current) {
      // 移除所有事件监听器，避免内存泄漏
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;

      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, '主动关闭');
      }
      wsRef.current = null;
    }

    setIsConnected(false);
    reconnectAttempts.current = 0;
    isConnecting.current = false;
  }, []);

  const connect = useCallback(() => {
    if (isConnecting.current) {
      console.log('正在连接中，跳过重复连接');
      return;
    }

    // 先清理之前的连接
    closeWebSocket();

    isConnecting.current = true;
    setError(null);

    try {
      const wsUrl = getWsUrl() || env?.VITE_WEBSOCKET_URL; // 从环境变量获取默认Ws服务器URL
      console.log('尝试连接 WebSocket:', wsUrl, env?.VITE_WEBSOCKET_URL);
      urlRef.current = wsUrl;

      if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
        throw new Error('WebSocket URL 必须以 ws:// 或 wss:// 开头');
      }

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log(`✅ WebSocket 连接成功: ${wsUrl}`);
        reconnectAttempts.current = 0;
        setIsConnected(true);
        isConnecting.current = false;
        setError(null);

         // 1. 连接成功后，立即发送 params 给后端
        try {
          wsRef.current?.send(JSON.stringify({
            ...params // 传递参数
          }));
          console.log('已发送初始化参数:', params);
        } catch (err) {
          console.error('初始化参数发送失败:', err);
        }

        // 心跳检测
        heartbeatTimer.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            try {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            } catch (err) {
              console.error('心跳发送失败:', err);
            }
          }
        }, 30000); // 30秒心跳
      };

      wsRef.current.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data) as T;
          console.log('📨 接收到推送数据:', parsedData);
          setData(parsedData);
          optionsRef.current?.onMessage?.(parsedData);
        } catch (parseError) {
          const errMsg = `数据解析失败: ${(parseError as Error).message}`;
          setError(errMsg);
          console.error(errMsg, event.data);
        }
      };

      wsRef.current.onerror = (event) => {
        const errMsg = `WebSocket 错误: ${event.type}`;
        setError(errMsg);
        console.error('❌ WebSocket 错误:', event);
        isConnecting.current = false;
      };

      wsRef.current.onclose = (event) => {
        console.log(
          `🔌 WebSocket 关闭: ${wsUrl}，代码: ${event.code}, 原因: ${event.reason}`
        );
        setIsConnected(false);
        isConnecting.current = false;
        setData(null);

        // 清理心跳
        if (heartbeatTimer.current) {
          clearInterval(heartbeatTimer.current);
          heartbeatTimer.current = null;
        }

        // 自动重连逻辑
        if (autoReconnect && event.code !== 1000) {
          console.log(
            '🔄 进入自动重连流程，当前重连次数:',
            reconnectAttempts.current
          );

          reconnectAttempts.current += 1;

          if (reconnectAttempts.current <= maxReconnectAttempts) {
            // 网络离线时等待恢复
            if (navigator && !navigator.onLine) {
              console.log('📶 网络离线，等待恢复...');
              onlineListener.current = () => {
                console.log('🌐 网络恢复，重新连接');
                connect();
              };
              window.addEventListener('online', onlineListener.current);
              return;
            }

            const backoffInterval = Math.min(
              reconnectInterval * Math.pow(1.5, reconnectAttempts.current - 1),
              30000 // 最大30秒
            );

            console.log(
              `第 ${reconnectAttempts.current} 次重连，间隔: ${backoffInterval}ms`
            );
            reconnectTimer.current = setTimeout(() => {
              connect();
            }, backoffInterval);
          } else {
            const finalError = `连接失败，已尝试 ${maxReconnectAttempts} 次，请检查网络后重试`;
            setError(finalError);
            console.error(finalError);
          }
        }
      };
    } catch (initError) {
      isConnecting.current = false;
      const errMsg = `连接初始化失败: ${(initError as Error).message}`;
      setError(errMsg);
      console.error(errMsg);
    }
  }, [autoReconnect, reconnectInterval, maxReconnectAttempts, closeWebSocket]);

  // 组件挂载时连接
  useEffect(() => {
    connect();
    return () => {
      console.log('组件卸载，清理 WebSocket');
      closeWebSocket();
    };
  }, []); // 空依赖，只在挂载和卸载时执行

  // URL 变化时重新连接
  useEffect(() => {
    const currentUrl = getWsUrl();
    if (urlRef.current && urlRef.current !== currentUrl) {
      console.log('🔗 WebSocket URL 变化，重新连接');
      reconnect();
    }
  }, [getWsUrl()]); // 依赖 URL 字符串

  const reconnect = useCallback(() => {
    console.log('手动触发重连');
    reconnectAttempts.current = 0;
    connect();
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        return true;
      } catch (err) {
        console.error('消息发送失败:', err);
        return false;
      }
    }
    console.warn('WebSocket 未连接，消息发送失败');
    return false;
  }, []);

  return { data, isConnected, error, reconnect, sendMessage };
}

/* 
webSocket, hooks中封装了自动链接，心跳机制检测，退出页面自动断开,支持多接口独自调用，互不影响，
使用方法如下：

// 在组件中使用
import useWebSocket from '../hooks/useWebSocket';

const { data, isConnected, error, reconnect } = useWebSocket(
    // 传递给后端的参数,用来区分不同的订阅频道
    {
      type: 'subscribe',
      channel: 'v4_markets'
    },
    {
      autoReconnect: true, // 是否自动重连
      reconnectInterval: 3000, // 初始重连间隔
      maxReconnectAttempts: 10, // 最大重连次数
      onMessage: (data) => {
        console.log('【最新永续市场数据】', data); // 处理接收到的数据
      }
    },
    () => 'ws://13.214.253.55:3003/v4/candles/perpetualMarkets/BTC-USD?resolution=1MIN&limit=100', // 可选的动态获取Ws URL函数
);

*/
