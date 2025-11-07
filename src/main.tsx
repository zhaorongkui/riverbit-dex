import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WalletProvider } from "./context/WalletContext";
import App from "./App";
import "./index.css";
import Provider from "./providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <WalletProvider>
        <App />
      </WalletProvider>
    </Provider>
  </StrictMode>
);
