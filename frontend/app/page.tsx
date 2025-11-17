"use client";

import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useChallengeFHE } from "@/hooks/useChallengeFHE";
import { Hero } from "@/components/Hero";
import { WalletCard } from "@/components/WalletCard";
import { StatusCard } from "@/components/StatusCard";
import { ActionPanel } from "@/components/ActionPanel";
import { MessageLog } from "@/components/MessageLog";
import { CheckInHistory } from "@/components/CheckInHistory";

export default function Home() {
  const { storage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    accounts,
  } = useMetaMaskEthersSigner();

  const { instance, status, error } = useFhevm({
    provider,
    chainId,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: true,
  });

  const challenge = useChallengeFHE({
    instance,
    storage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  return (
    <main className="min-h-screen bg-neutralBg">
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <WalletCard
          chainId={chainId}
          account={accounts?.[0]}
          isConnected={isConnected}
          onConnect={connect}
        />

        <StatusCard
          fhevmStatus={status}
          fhevmError={error}
          contractAddress={challenge.contractAddress}
          handle={challenge.handle}
          clear={challenge.clear}
          isDecrypted={challenge.isDecrypted}
        />

        <ActionPanel
          canWrite={challenge.canWrite}
          canRead={challenge.canRead}
          canDecrypt={challenge.canDecrypt}
          isDecrypting={challenge.isDecrypting}
          isCheckingIn={challenge.isCheckingIn}
          onCreateChallenge={challenge.createSampleChallenge}
          onJoinChallenge={challenge.joinSampleChallenge}
          onRefreshHandle={() => { challenge.refreshEncryptedSuccessDays(); challenge.loadCheckInHistory(); }}
          onDecrypt={challenge.decryptSuccessDays}
          onCheckIn={challenge.checkIn}
          onUpload={challenge.uploadToIPFS}
        />

        <CheckInHistory records={challenge.checkInLogs} />
        <MessageLog message={challenge.message} />
      </div>
    </main>
  );
}


