export enum Strategy {
  LONG = "LONG",
  SHORT = "SHORT",
}

export interface ArenaPosition {
  pair: string;
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  strategy: string;
  agentName: string;
  iconUrl: string;
}

export default function useArenaPosition() {
  const positions: ArenaPosition[] = [
    {
      agentName: "Agent 1",
      pair: "BTC/USDT",
      size: 32000,
      entryPrice: 30000,
      currentPrice: 32000,
      pnl: 7141.25,
      strategy: Strategy.LONG,
      iconUrl: "/icons/chatGPT.svg",
    },
    {
      agentName: "Agent 2",
      pair: "BTC/USDT",
      size: 32000,
      entryPrice: 30000,
      currentPrice: 32000,
      pnl: -7141.25,
      strategy: Strategy.SHORT,
      iconUrl: "/icons/chatGPT.svg",
    },
  ];
  return { positions };
}
