import { type ReactNode } from "react";
import useAgentInit, { AgentContext } from "../hooks/arena/useAgentInit";

export default function AgentProvider({ children }: { children: ReactNode }) {
  const agent = useAgentInit();
  return (
    <AgentContext.Provider value={agent}>{children}</AgentContext.Provider>
  );
}
