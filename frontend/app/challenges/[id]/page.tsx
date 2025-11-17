"use client";

import { useParams } from "next/navigation";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useChallengeFHE } from "@/hooks/useChallengeFHE";
import { useMemo, useState, useEffect } from "react";
import { getChallengeAddressByChainId } from "@/config/addresses";
import { ethers } from "ethers";
import { ChallengeFHEABI } from "@/abi/ChallengeFHEABI";

type ChallengeInfo = {
  challengeId: bigint;
  organizer: string;
  challengeCID: string;
  startTime: bigint;
  endTime: bigint;
  daysTotal: bigint;
  stakeAmount: bigint;
  stakeToken: string;
  requireEvidence: boolean;
  verificationMode: number;
  rewardPool: bigint;
  settled: boolean;
};

export default function ChallengeDetailPage() {
  const params = useParams<{ id: string }>();
  const challengeId = Number(params?.id);
  const { storage } = useInMemoryStorage();
  const { provider, chainId, isConnected, connect, ethersSigner, ethersReadonlyProvider, sameChain, sameSigner, accounts } = useMetaMaskEthersSigner();
  const { instance, status, error } = useFhevm({ provider, chainId, enabled: true, initialMockChains: { 31337: "http://localhost:8545" } });

  const challenge = useChallengeFHE({ instance, storage, chainId, ethersSigner, ethersReadonlyProvider, sameChain, sameSigner, challengeId });

  const [info, setInfo] = useState<ChallengeInfo | null>(null);
  const [joined, setJoined] = useState<boolean>(false);
  const [joining, setJoining] = useState(false);

  const address = useMemo(() => getChallengeAddressByChainId(chainId), [chainId]);

  const loadInfo = async () => {
    if (!address || !ethersReadonlyProvider) return;
    const c = new ethers.Contract(address, ChallengeFHEABI.abi, ethersReadonlyProvider);
    try {
      const res = await c.getChallenge(challengeId);
      setInfo(res as ChallengeInfo);

      // 检查当前用户是否已报名
      if (ethersSigner) {
        try {
          const me = await ethersSigner.getAddress();
          const rec = await c.getParticipantRecord(challengeId, me);
          const alreadyJoined = String(rec.participant).toLowerCase() === me.toLowerCase();
          setJoined(alreadyJoined);
        } catch {}
      }
    } catch (e) {
      console.error("loadInfo failed", e);
    }
  };

  useEffect(() => {
    loadInfo();
  }, [address, ethersReadonlyProvider, ethersSigner, challengeId]);

  const onJoin = async () => {
    if (!address || !ethersSigner) return;
    setJoining(true);
    try {
      const c = new ethers.Contract(address, ChallengeFHEABI.abi, ethersSigner);
      const stakeValue = info?.stakeAmount ?? 0n;
      const tx = await c.joinChallenge(challengeId, { value: stakeValue });
      await tx.wait();
      setJoined(true);
      await loadInfo();
    } catch (e: any) {
      alert(`报名失败：${e?.message || String(e)}`);
    } finally {
      setJoining(false);
    }
  };

  const now = Math.floor(Date.now() / 1000);
  const notStarted = info && Number(info.startTime) > now;
  const ended = info && Number(info.endTime) < now;
  const canJoin = info && !joined && !notStarted && !ended && isConnected;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">挑战详情 #{challengeId}</h1>
        {!isConnected && (
          <button onClick={connect} className="px-4 py-2 rounded-lg bg-calmGreen text-white font-semibold">连接钱包</button>
        )}
      </div>

      {/* 挑战基本信息 */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold mb-4">挑战信息</h3>
        {!info ? (
          <p className="text-sm text-gray-500">加载中...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">组织者：</span><span className="font-mono">{info.organizer}</span></div>
            <div><span className="text-gray-500">总天数：</span><span className="font-semibold">{String(info.daysTotal)} 天</span></div>
            <div><span className="text-gray-500">开始时间：</span>{new Date(Number(info.startTime) * 1000).toLocaleString()}</div>
            <div><span className="text-gray-500">结束时间：</span>{new Date(Number(info.endTime) * 1000).toLocaleString()}</div>
            <div><span className="text-gray-500">是否需要证据：</span>{info.requireEvidence ? "是" : "否"}</div>
            <div><span className="text-gray-500">验证模式：</span>{info.verificationMode === 0 ? "无验证" : info.verificationMode === 1 ? "白名单" : "社区"}</div>
            <div><span className="text-gray-500">质押金额：</span>{ethers.formatEther(info.stakeAmount)} ETH</div>
            <div><span className="text-gray-500">奖励池：</span>{ethers.formatEther(info.rewardPool)} ETH</div>
            <div className="col-span-2"><span className="text-gray-500">规则CID：</span><span className="font-mono text-xs break-all">{info.challengeCID}</span></div>
          </div>
        )}
        {notStarted && <p className="mt-3 text-sm text-orange-600">⚠ 挑战未开始</p>}
        {ended && <p className="mt-3 text-sm text-red-600">✕ 挑战已结束</p>}
        {joined && <p className="mt-3 text-sm text-green-600">✓ 你已报名</p>}
      </div>

      {/* FHEVM & 合约状态 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold mb-2">FHEVM 实例</h3>
          <p className="text-sm">状态：{status}</p>
          <p className="text-sm">错误：{error ? error.message : "无"}</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold mb-2">合约地址</h3>
          <p className="text-xs font-mono break-all">{address}</p>
        </div>
      </div>

      {/* 报名按钮 */}
      {!joined && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold mb-4">报名参加</h3>
          <button
            onClick={onJoin}
            disabled={!canJoin || joining}
            className="px-6 py-3 rounded-xl bg-calmGreen text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joining ? "报名中..." : canJoin ? "确认报名" : "不可报名"}
          </button>
          {info && Number(info.stakeAmount) > 0 && (
            <p className="mt-2 text-sm text-gray-600">需要质押：{ethers.formatEther(info.stakeAmount)} ETH</p>
          )}
        </div>
      )}

      {/* 打卡 & 解密区域（仅已报名可见） */}
      {joined && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold mb-4">打卡 & 解密</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <button className="px-4 py-3 rounded-xl bg-white border-2 hover:border-calmGreen" onClick={challenge.refreshEncryptedSuccessDays}>
              刷新密文句柄
            </button>
            <button
              className="px-4 py-3 rounded-xl bg-white border-2 hover:border-calmGreen disabled:opacity-50"
              disabled={!challenge.canDecrypt || challenge.isDecrypting}
              onClick={challenge.decryptSuccessDays}
            >
              {challenge.isDecrypting ? "解密中..." : "解密成功天数"}
            </button>
            <button
              className="px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-50"
              disabled={!challenge.canWrite || challenge.isCheckingIn}
              onClick={() => challenge.checkIn("")}
            >
              {challenge.isCheckingIn ? "打卡中..." : "打卡 +1"}
            </button>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">密文句柄</p>
                <p className="font-mono text-xs break-all">{challenge.handle || "-"}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">明文成功天数</p>
                {challenge.isDecrypted ? (
                  <p className="text-2xl font-bold text-calmGreen">{String(challenge.clear)} 天</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">未解密</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-700 bg-white p-3 rounded-xl border">
            <p className="font-semibold mb-1">操作日志</p>
            <p className="font-mono text-xs">{challenge.message || "-"}</p>
          </div>
        </div>
      )}
    </main>
  );
}


