import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import AgentProvider from "./AgentProvider";
import WagmiProvider from "./wagmiProvider";
import ArenaNFTProvider from "./ArenaNFTProvider";

export default function Provider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <WagmiProvider>
      <QueryClientProvider client={client}>
        <ArenaNFTProvider>
          <AgentProvider>{children}</AgentProvider>
        </ArenaNFTProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
