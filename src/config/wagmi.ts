import { createConfig, type Config } from "wagmi";
import { http } from "viem";
import { metaMask, walletConnect } from "wagmi/connectors";
import { arbitrum, arbitrumSepolia } from "wagmi/chains";
import { CHAIN_INFO } from "./chain";

const wagmiConfig: Config = createConfig({
  chains: [arbitrum, arbitrumSepolia],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: "YOUR_PROJECT_ID",
    }),
  ],
  transports: {
    [arbitrum.id]: http(CHAIN_INFO["Arbitrum One"].rpcUrl),
    [arbitrumSepolia.id]: http(CHAIN_INFO["Arbitrum Sepolia"].rpcUrl),
  },
});

export default wagmiConfig;
