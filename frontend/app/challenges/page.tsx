"use client";

import Link from "next/link";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useMemo, useEffect, useState } from "react";
import { ethers } from "ethers";
import { ChallengeFHEABI } from "@/abi/ChallengeFHEABI";
import { getChallengeAddressByChainId } from "@/config/addresses";

type Item = { id: number; organizer: string; cid: string; start: number; end: number };

export default function ChallengesListPage() {
  const { chainId, ethersReadonlyProvider } = useMetaMaskEthersSigner();
  const address = useMemo(() => getChallengeAddressByChainId(chainId), [chainId]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address || !ethersReadonlyProvider) return;
    setLoading(true);
    const contract = new ethers.Contract(address, ChallengeFHEABI.abi, ethersReadonlyProvider);
    (async () => {
      try {
        const filter = contract.filters.ChallengeCreated();
        const logs = await contract.queryFilter(filter, 0, "latest");
        const parsed: Item[] = logs.map((l) => {
          const lo: any = l as any;
          const id = Number(lo.args?.[0]);
          const organizer = String(lo.args?.[1]);
          const cid = String(lo.args?.[2]);
          return { id, organizer, cid, start: 0, end: 0 };
        }).reverse();
        setItems(parsed);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [address, ethersReadonlyProvider]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">挑战列表</h1>
        <Link href="/challenges/new" className="px-4 py-2 rounded-lg bg-calmGreen text-white font-semibold">创建挑战</Link>
      </div>
      {loading ? (
        <p className="text-gray-500">加载中...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">暂无挑战，点击右上角创建。</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((it) => (
            <Link key={it.id} href={`/challenges/${it.id}`} className="block glass-card rounded-xl p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">挑战ID</p>
                  <p className="text-lg font-semibold">#{it.id}</p>
                </div>
                <span className="text-calmGreen font-semibold">进入详情 →</span>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500">组织者</p>
                <p className="text-sm font-mono break-all">{it.organizer}</p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">规则CID</p>
                <p className="text-sm font-mono break-all">{it.cid}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}


