"use client";

interface StatusCardProps {
  fhevmStatus: string;
  fhevmError?: Error;
  contractAddress?: string;
  handle?: string;
  clear?: string | bigint | boolean;
  isDecrypted: boolean;
}

export function StatusCard({ fhevmStatus, fhevmError, contractAddress, handle, clear, isDecrypted }: StatusCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "text-green-600 bg-green-50";
      case "loading": return "text-blue-600 bg-blue-50";
      case "error": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": return "✓";
      case "loading": return "⟳";
      case "error": return "✕";
      default: return "○";
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* FHEVM Instance */}
      <div className="glass-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all animate-slide-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
            FHE
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">FHEVM 实例</h3>
            <p className="text-xs text-gray-500">加密计算引擎</p>
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold ${getStatusColor(fhevmStatus)}`}>
          <span>{getStatusIcon(fhevmStatus)}</span>
          <span className="capitalize">{fhevmStatus}</span>
        </div>
        {fhevmError && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">{fhevmError.message}</p>
        )}
      </div>

      {/* Contract */}
      <div className="glass-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all animate-slide-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">合约状态</h3>
            <p className="text-xs text-gray-500">链上部署信息</p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">合约地址</p>
            <p className="text-sm font-mono text-gray-700 bg-gray-50 p-2 rounded break-all">
              {contractAddress || "-"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${contractAddress ? "bg-green-500" : "bg-gray-300"}`}></span>
            <span className="text-gray-600">{contractAddress ? "已部署" : "未部署"}</span>
          </div>
        </div>
      </div>

      {/* Encrypted Days */}
      <div className="glass-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all animate-slide-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">成功天数</h3>
            <p className="text-xs text-gray-500">加密保护</p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">密文句柄</p>
            <p className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded break-all">
              {handle || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">明文数值</p>
            {isDecrypted ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-calmGreen">{String(clear)}</span>
                <span className="text-sm text-gray-500">天</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">未解密</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

