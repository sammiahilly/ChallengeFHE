"use client";

import type { ReactNode } from "react";
import { MetaMaskProvider } from "@/hooks/metamask/useMetaMaskProvider";
import { InMemoryStorageProvider } from "@/hooks/useInMemoryStorage";
import { MetaMaskEthersSignerProvider } from "@/hooks/metamask/useMetaMaskEthersSigner";

export function Providers({ children }: { children: ReactNode }) {
  // Ensure Node-style global is available for some browser bundles
  if (typeof window !== "undefined" && !(window as any).global) {
    (window as any).global = window as any;
  }
  return (
    <MetaMaskProvider>
      <MetaMaskEthersSignerProvider initialMockChains={{ 31337: "http://localhost:8545" }}>
        <InMemoryStorageProvider>{children}</InMemoryStorageProvider>
      </MetaMaskEthersSignerProvider>
    </MetaMaskProvider>
  );
}


