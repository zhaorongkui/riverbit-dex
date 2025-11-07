import { useMemo } from "react";
export enum AgentState {
  RUNNING = "running",
  STOPPED = "stopped",
}
export interface AgentInfoList {
  name: string;
  balance: number;
  pnl: number;
  iconUrl: string;
  daily_consumption: number;
  state: string;
  elapsed_time: number;
  create_time: number;
  trades: number;
  scan_frequency: number;
  trading_pairs: string;
  technical_indicators: string;
  leverage: string;
}
export const useArena = () => {
  const agentList = useMemo(
    () => [
      {
        name: "Agent 1",
        amount: 10000,
        pnlRate: 0.05,
        iconUrl: "/logo-Riverbit.svg",
      },
      {
        name: "Agent2",
        amount: 9995,
        pnlRate: -0.05,
        iconUrl: "/icons/chatGPT.svg",
      },
      {
        name: "Agent 3",
        amount: 10005,
        pnlRate: 1.05,
        iconUrl: "/icons/deepseek.svg",
      },
      {
        name: "Agent 4",
        amount: 10005,
        pnlRate: -12.05,
        iconUrl: "/icons/chatGPT.svg",
      },
      {
        name: "Agent 5",
        amount: 10005,
        pnlRate: 1.05,
        iconUrl: "/icons/deepseek.svg",
      },
      {
        name: "Agent 6",
        amount: 10005,
        pnlRate: 1.05,
        iconUrl: "/icons/chatGPT.svg",
      },
      {
        name: "Agent 7",
        amount: 10005,
        pnlRate: 8.05,
        iconUrl: "/icons/deepseek.svg",
      },
      {
        name: "Agent 8",
        amount: 10005,
        pnlRate: 8.05,
        iconUrl: "/icons/deepseek.svg",
      },
    ],
    []
  );

  const agentInfoList = useMemo(
    () => [
      // {
      //   name: "Agent 1",
      //   state: AgentState.RUNNING,
      //   balance: 10000,
      //   pnl: 0.05,
      //   iconUrl: "/logo-Riverbit.svg",
      //   daily_consumption: 1,
      //   elapsed_time: 1,
      //   create_time: 1,
      //   trades: 1,
      //   scan_frequency: 1,
      //   trading_pairs: "All Pairs",
      //   technical_indicators: "EMA/RSI/BOLL/MACD",
      //   leverage: "Auto (AI Decides)",
      // },
      // {
      //   name: "Agent2",
      //   state: AgentState.STOPPED,
      //   balance: 9995,
      //   pnl: -0.05,
      //   iconUrl: "/icons/chatGPT.svg",
      //   daily_consumption: 3,
      //   elapsed_time: 1,
      //   create_time: 1,
      //   trades: 1,
      //   scan_frequency: 1,
      //   trading_pairs: "All Pairs",
      //   technical_indicators: "EMA/RSI/BOLL/MACD",
      //   leverage: "Auto (AI Decides)",
      // },
    ],
    []
  );
  return { agentList, agentInfoList };
};
