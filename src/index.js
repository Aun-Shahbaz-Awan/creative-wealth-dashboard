import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
// Rainbow KIT
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
// import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ContractProvider } from "./context/contracts";

const binanceChain = {
  id: 56,
  name: "Binance Smart Chain Mainnet",
  network: "binance",
  iconUrl: "https://icons.llamao.fi/icons/chains/rsz_binance.jpg",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "Binance",
    symbol: "BNB",
  },
  rpcUrls: {
    default: {
      http: ["https://bsc-dataseed1.ninicoin.io"],
    },
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "https://bscscan.com/" },
    etherscan: { name: "SnowTrace", url: "https://bscscan.com/" },
  },
  testnet: false,
};

const { chains, provider } = configureChains(
  [binanceChain],
  [
    // alchemyProvider({ alchemyId: "yJKPlv6vVpN7wcG0-eeLfIw9jRS0CJ1p" }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Creative Wealth",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains}>
      <ContractProvider>
        <App />
      </ContractProvider>
    </RainbowKitProvider>
  </WagmiConfig>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
