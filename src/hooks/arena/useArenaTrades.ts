import { Strategy } from "./useArenaPosition";

export interface ArenaTrade {
  pair: string;
  size: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  strategy: string;
  agentName: string;
  iconUrl: string;
  tradeTime: number;
}
export default function useArenaTrades() {
  const trades: ArenaTrade[] = [
    {
      agentName: "Agent 1",
      pair: "BTC/USDT",
      size: 32000,
      entryPrice: 30000,
      exitPrice: 32000,
      pnl: 7141.25,
      strategy: Strategy.LONG,
      iconUrl: "/icons/chatGPT.svg",
      tradeTime: 0,
    },
  ];
  return { trades };
}
