"use client";

interface WalletCardProps {
  chainId?: number;
  account?: string;
  isConnected: boolean;
  onConnect: () => void;
}

export function WalletCard({ chainId, account, isConnected, onConnect }: WalletCardProps) {
  const chainName = chainId === 11155111 ? "Sepolia 测试网" : chainId === 31337 ? "本地节点" : `链 ${chainId}`;
  
  return (
    <div className="glass-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow animate-slide-in">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-calmGreen to-emerald-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">钱包</h3>
              <p className="text-sm text-gray-500">{chainName}</p>
            </div>
          </div>
          {account && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">账户地址</p>
              <p className="text-sm font-mono text-gray-700 break-all">{account}</p>
            </div>
          )}
        </div>
        <div className="ml-4">
          {!isConnected ? (
            <button
              onClick={onConnect}
              className="px-6 py-3 bg-gradient-to-r from-calmGreen to-emerald-600 hover:from-emerald-600 hover:to-calmGreen text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              连接钱包
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-semibold">已连接</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

