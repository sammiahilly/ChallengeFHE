"use client";

import { useState } from "react";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useFhevm } from "@/fhevm/useFhevm";
import { getChallengeAddressByChainId } from "@/config/addresses";
import { ethers } from "ethers";
import { ChallengeFHEABI } from "@/abi/ChallengeFHEABI";
import { pinFileToIPFS } from "@/utils/pinata";
import { useRouter } from "next/navigation";

export default function NewChallengePage() {
  const router = useRouter();
  const { provider, chainId, ethersSigner, isConnected, connect } = useMetaMaskEthersSigner();
  const { instance } = useFhevm({ provider, chainId, enabled: true, initialMockChains: { 31337: "http://localhost:8545" } });
  const [name, setName] = useState("");
  const [days, setDays] = useState(30);
  const [requireEvidence, setRequireEvidence] = useState(true);
  const [verificationMode, setVerificationMode] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");

  const address = getChallengeAddressByChainId(chainId);

  const onCreate = async () => {
    if (!ethersSigner || !address) return;
    setCreating(true);
    try {
      // 1) 将规则元数据上传到 IPFS
      let cid = "";
      if (file) {
        const res = await pinFileToIPFS(file);
        cid = res.cid;
      }
      const meta = { name, days, requireEvidence, verificationMode, createdAt: Date.now() };
      const blob = new Blob([JSON.stringify(meta)], { type: "application/json" });
      const metaFile = new File([blob], "challenge.json", { type: "application/json" });
      const metaRes = await pinFileToIPFS(metaFile);
      const challengeCID = `ipfs://${metaRes.cid}`;

      // 2) 计算时间窗
      const now = Math.floor(Date.now() / 1000);
      const start = now + 10; // 10 秒后开始
      const end = now + days * 24 * 60 * 60;

      // 3) 调用合约创建挑战
      const contract = new ethers.Contract(address, ChallengeFHEABI.abi, ethersSigner);
      const tx = await contract.createChallenge(
        challengeCID,
        start,
        end,
        days,
        0,
        ethers.ZeroAddress,
        requireEvidence,
        verificationMode,
        { value: 0 }
      );
      setMsg(`已提交交易：${tx.hash}`);
      const receipt = await tx.wait();
      let challengeId: number | undefined = undefined;
      if (receipt?.logs) {
        for (const log of receipt.logs) {
          try {
            const iface = new ethers.Interface(ChallengeFHEABI.abi);
            const parsed = iface.parseLog({ data: log.data, topics: [...log.topics] });
            if (parsed?.name === "ChallengeCreated") {
              challengeId = Number(parsed.args[0]);
              break;
            }
          } catch {}
        }
      }
      if (challengeId === undefined) {
        // 回退：查询最新事件
        try {
          const filter = contract.filters.ChallengeCreated?.();
          const logs = await contract.queryFilter(filter as any, receipt?.blockNumber, receipt?.blockNumber);
          if (logs.length > 0) {
            const first: unknown = logs[0];
            // Narrow to EventLog at runtime
            if (first && typeof first === "object" && "args" in (first as any)) {
              const args = (first as any).args;
              if (Array.isArray(args) && args.length > 0) {
                challengeId = Number(args[0]);
              }
            }
          }
        } catch {}
      }
      if (challengeId !== undefined) {
        router.push(`/challenges/${challengeId}`);
      } else {
        setMsg("创建成功，但未能解析 ChallengeId，请在列表页查看");
      }
    } catch (e) {
      setMsg(String(e));
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold">创建挑战</h1>
      {!isConnected && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
          <span className="text-sm text-gray-700">请先连接钱包（Sepolia 11155111）</span>
          <button onClick={connect} className="px-4 py-2 bg-calmGreen text-white rounded-lg">连接钱包</button>
        </div>
      )}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">挑战名称</label>
          <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-calmGreen outline-none" value={name} onChange={(e)=>setName(e.target.value)} placeholder="例如：30天不抽烟" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">挑战天数</label>
            <input type="number" min={1} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-calmGreen outline-none" value={days} onChange={(e)=>setDays(Number(e.target.value)||30)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">是否需要证据</label>
            <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-calmGreen outline-none" value={requireEvidence?"1":"0"} onChange={(e)=>setRequireEvidence(e.target.value==="1")}> 
              <option value="1">是</option>
              <option value="0">否</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">验证模式</label>
          <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-calmGreen outline-none" value={verificationMode} onChange={(e)=>setVerificationMode(Number(e.target.value))}>
            <option value={0}>无验证</option>
            <option value={1}>白名单验证</option>
            <option value={2}>社区验证</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">封面/规则文件（可选）</label>
          <input type="file" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
        </div>
        <button onClick={onCreate} disabled={creating || !ethersSigner || !address} className="px-6 py-3 bg-calmGreen text-white rounded-xl font-semibold">
          {creating?"创建中...":"创建挑战"}
        </button>
        {msg && <p className="text-sm text-gray-600">{msg}</p>}
      </div>
    </main>
  );
}


