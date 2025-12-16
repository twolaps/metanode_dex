"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { http, WagmiProvider } from "wagmi";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import '@rainbow-me/rainbowkit/styles.css';

// 初始化 React Query 的客户端
const queryClient = new QueryClient();

// 创建 Wagmi 客户端配置
const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'c9d5a536ee966c073daf48e1b0444207',
  chains: [mainnet, sepolia],
  ssr: true,
  transports: {
    [mainnet.id]: http('https://eth.rpc.blxrbdn.com'),
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/EI-sjwkwnRwHeb_D6_FsC'),
  },
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
