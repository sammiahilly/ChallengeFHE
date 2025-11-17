"use client";

import { ethers } from "ethers";
import { useCallback, useMemo, useRef, useState } from "react";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { getChallengeAddressByChainId } from "@/config/addresses";
import { ChallengeFHEABI } from "@/abi/ChallengeFHEABI";
import { pinFileToIPFS } from "@/utils/pinata";

export function useChallengeFHE(parameters: {
  instance: FhevmInstance | undefined;
  storage: GenericStringStorage;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: React.RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: React.RefObject<(ethersSigner: ethers.JsonRpcSigner | undefined) => boolean>;
  challengeId?: number; // 新增：指定挑战ID
}) {
  const { instance, storage, chainId, ethersSigner, ethersReadonlyProvider, sameChain, sameSigner, challengeId } = parameters;

  const [message, setMessage] = useState<string>("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [handle, setHandle] = useState<string | undefined>(undefined);
  const [clear, setClear] = useState<string | bigint | boolean | undefined>(undefined);
  const [checkInLogs, setCheckInLogs] = useState<Array<{ txHash: string; blockNumber: number; participant: string; dayIndex: number; reportCID: string }>>([]);

  const contractAddress = useMemo(() => getChallengeAddressByChainId(chainId), [chainId]);
  const isDecrypted = handle && handle === (clear as any)?.handle ? true : typeof clear !== "undefined";

  const canWrite = useMemo(() => !!contractAddress && !!instance && !!ethersSigner, [contractAddress, instance, ethersSigner]);
  const canRead = useMemo(() => !!contractAddress && !!ethersReadonlyProvider, [contractAddress, ethersReadonlyProvider]);
  const canDecrypt = useMemo(() => !!contractAddress && !!instance && !!ethersSigner && !!handle && !isDecrypting, [contractAddress, instance, ethersSigner, handle, isDecrypting]);

  const challengeIdRef = useRef<number>(challengeId ?? 1);
  if (challengeId && challengeIdRef.current !== challengeId) {
    challengeIdRef.current = challengeId;
  }

  const contractRW = useMemo(() => {
    if (!contractAddress || !ethersSigner) return undefined;
    return new ethers.Contract(contractAddress, ChallengeFHEABI.abi, ethersSigner);
  }, [contractAddress, ethersSigner]);

  const contractRO = useMemo(() => {
    if (!contractAddress || !ethersReadonlyProvider) return undefined;
    return new ethers.Contract(contractAddress, ChallengeFHEABI.abi, ethersReadonlyProvider);
  }, [contractAddress, ethersReadonlyProvider]);

  const createSampleChallenge = useCallback(async () => {
    if (!contractRW) return;
    setMessage("Creating sample challenge...");
    const now = Math.floor(Date.now() / 1000);
    const start = now - 60; // already started
    const end = now + 30 * 24 * 60 * 60;
    const tx = await contractRW.createChallenge(
      "ipfs://sample", start, end, 30, 0, ethers.ZeroAddress, false, 0, { value: 0 }
    );
    const receipt = await tx.wait();
    setMessage(`Challenge created: tx=${receipt?.hash}`);
    // demo：不在此更新ID，正式场景在创建页面解析事件并跳转
  }, [contractRW]);

  const joinSampleChallenge = useCallback(async () => {
    if (!contractRW) return;
    setMessage("Joining challenge...");
    const tx = await contractRW.joinChallenge(challengeIdRef.current, { value: 0 });
    const receipt = await tx.wait();
    setMessage(`Joined: tx=${receipt?.hash}`);
  }, [contractRW]);

  const refreshEncryptedSuccessDays = useCallback(async () => {
    if (!contractRO || !ethersSigner) return;
    setMessage("Loading encrypted success days...");
    try {
      const addr = await ethersSigner.getAddress();
      const h = await contractRO.getEncryptedSuccessDays(challengeIdRef.current, addr);
      setHandle(h);
      setMessage("Loaded handle");
    } catch (e) {
      setMessage(`getEncryptedSuccessDays failed: ${String(e)}`);
    }
  }, [contractRO, ethersSigner]);

  const loadCheckInHistory = useCallback(async () => {
    if (!contractRO || !ethersSigner) return;
    try {
      const me = await ethersSigner.getAddress();
      // Query CheckIn events for this challenge; filter by participant in code to be robust across providers
      const filter = (contractRO as any).filters?.CheckIn?.(challengeIdRef.current);
      const logs = await (contractRO as any).queryFilter(filter);
      const iface = new ethers.Interface(ChallengeFHEABI.abi);
      const parsed = logs
        .map((l: any) => {
          try {
            const p = iface.parseLog({ topics: l.topics, data: l.data });
            if (!p) return undefined;
            const [cidChallengeId, participant, dayIndex, reportCID] = p.args as any;
            if (Number(cidChallengeId) !== challengeIdRef.current) return undefined;
            if (String(participant).toLowerCase() !== me.toLowerCase()) return undefined;
            return {
              txHash: l.transactionHash as string,
              blockNumber: Number(l.blockNumber),
              participant: String(participant),
              dayIndex: Number(dayIndex),
              reportCID: String(reportCID),
            };
          } catch { return undefined; }
        })
        .filter(Boolean) as Array<{ txHash: string; blockNumber: number; participant: string; dayIndex: number; reportCID: string }>;
      // Sort by block asc
      parsed.sort((a, b) => a.blockNumber - b.blockNumber);
      setCheckInLogs(parsed);
    } catch (e) {
      setMessage(`loadCheckInHistory failed: ${String(e)}`);
    }
  }, [contractRO, ethersSigner]);

  const decryptSuccessDays = useCallback(async () => {
    if (!instance || !ethersSigner || !handle || !contractAddress) return;
    setIsDecrypting(true);
    try {
      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [contractAddress],
        ethersSigner,
        storage
      );
      if (!sig) { setMessage("Unable to build FHEVM decryption signature"); return; }
      const res = await instance.userDecrypt(
        [{ handle, contractAddress }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );
      setClear((res as any)[handle]);
      setMessage(`Decrypted clear value: ${(res as any)[handle]}`);
    } finally { setIsDecrypting(false); }
  }, [instance, ethersSigner, handle, contractAddress, storage]);

  const checkIn = useCallback(async (reportCID?: string) => {
    if (!instance || !ethersSigner || !contractRW || !contractAddress) return;
    setIsCheckingIn(true);
    setMessage("Encrypting + check-in...");
    try {
      const input = instance.createEncryptedInput(contractAddress, ethersSigner.address);
      input.add32(1);
      const enc = await input.encrypt();
      const tx: ethers.TransactionResponse = await contractRW.checkIn(
        challengeIdRef.current,
        reportCID ?? "",
        enc.handles[0],
        enc.inputProof
      );
      const receipt = await tx.wait();
      setMessage(`Check-in complete: ${receipt?.hash}`);
      await refreshEncryptedSuccessDays();
      await loadCheckInHistory();
    } catch (e) {
      setMessage(`checkIn failed: ${String(e)}`);
    } finally {
      setIsCheckingIn(false);
    }
  }, [instance, ethersSigner, contractRW, contractAddress, refreshEncryptedSuccessDays, loadCheckInHistory]);

  const uploadToIPFS = useCallback(async (file: File) => {
    const res = await pinFileToIPFS(file);
    setMessage(`Pinned to IPFS: ${res.cid}`);
    return res;
  }, []);

  return {
    contractAddress,
    message,
    isDecrypting,
    isCheckingIn,
    handle,
    clear,
    isDecrypted: typeof clear !== "undefined",
    canWrite,
    canRead,
    canDecrypt,
    createSampleChallenge,
    joinSampleChallenge,
    refreshEncryptedSuccessDays,
    decryptSuccessDays,
    checkIn,
    uploadToIPFS,
    checkInLogs,
    loadCheckInHistory,
  };
}


