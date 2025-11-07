import { WagmiProvider } from "wagmi";
import type { ReactNode } from "react";
import wagmiConfig from "../config/wagmi";

export default function WagmiProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}
