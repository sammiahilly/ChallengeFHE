"use client";

interface CheckInRecord {
  txHash: string;
  blockNumber: number;
  participant: string;
  dayIndex: number;
  reportCID: string;
}

export function CheckInHistory({ records }: { records: CheckInRecord[] }) {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-lg animate-slide-in">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-calmGreen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6h13M9 7h13M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
        打卡记录
      </h3>
      <div className="bg-gray-50 rounded-xl p-4 min-h-[80px] max-h-[260px] overflow-y-auto divide-y divide-gray-200">
        {records.length === 0 ? (
          <p className="text-sm text-gray-400 italic">暂无记录</p>
        ) : (
          records.map((r, idx) => (
            <div key={r.txHash + idx} className="py-2 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span className="font-mono">第 {r.dayIndex + 1} 天</span>
                <a className="text-calmGreen hover:underline font-mono" href={`https://sepolia.etherscan.io/tx/${r.txHash}`} target="_blank" rel="noreferrer">Etherscan</a>
              </div>
              {r.reportCID && (
                <div className="mt-1 text-xs text-gray-500 break-all">
                  CID: {r.reportCID}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}


