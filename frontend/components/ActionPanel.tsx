"use client";

interface ActionPanelProps {
  canWrite: boolean;
  canRead: boolean;
  canDecrypt: boolean;
  isDecrypting: boolean;
  isCheckingIn: boolean;
  onCreateChallenge: () => void;
  onJoinChallenge: () => void;
  onRefreshHandle: () => void;
  onDecrypt: () => void;
  onCheckIn: (cid: string) => void;
  onUpload: (file: File) => Promise<{ cid: string }>;
}

export function ActionPanel(props: ActionPanelProps) {
  const [ipfsFile, setIpfsFile] = React.useState<File | null>(null);
  const [cid, setCid] = React.useState<string>("");
  const [uploading, setUploading] = React.useState(false);

  const handleUpload = async () => {
    if (!ipfsFile) return;
    setUploading(true);
    try {
      const res = await props.onUpload(ipfsFile);
      setCid(res.cid);
    } finally {
      setUploading(false);
    }
  };

  const buttonClass = "px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  const primaryBtn = `${buttonClass} bg-gradient-to-r from-calmGreen to-emerald-600 hover:from-emerald-600 hover:to-calmGreen text-white`;
  const secondaryBtn = `${buttonClass} bg-white border-2 border-gray-200 hover:border-calmGreen text-gray-700 hover:text-calmGreen`;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Challenge Actions */}
      <div className="glass-card rounded-2xl p-6 shadow-lg animate-slide-in">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-calmGreen text-white rounded-lg flex items-center justify-center text-sm">⚡</span>
          挑战操作
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={props.onCreateChallenge} disabled={!props.canWrite} className={primaryBtn}>
              创建挑战
            </button>
            <button onClick={props.onJoinChallenge} disabled={!props.canWrite} className={secondaryBtn}>
              报名参加
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={props.onRefreshHandle} disabled={!props.canRead} className={secondaryBtn}>
              刷新数据
            </button>
            <button onClick={props.onDecrypt} disabled={!props.canDecrypt} className={secondaryBtn}>
              {props.isDecrypting ? "解密中..." : "解密"}
            </button>
            <button onClick={() => props.onCheckIn(cid)} disabled={!props.canWrite || props.isCheckingIn} className={primaryBtn}>
              {props.isCheckingIn ? "打卡中..." : "打卡 +1"}
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Upload */}
      <div className="glass-card rounded-2xl p-6 shadow-lg animate-slide-in">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-energyOrange text-white rounded-lg flex items-center justify-center text-sm">📷</span>
          证据上传 (IPFS)
        </h3>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-energyOrange transition-colors">
            <input
              type="file"
              onChange={(e) => setIpfsFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-energyOrange file:text-white file:font-semibold hover:file:bg-orange-600 file:cursor-pointer"
              accept="image/*,video/*"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleUpload} disabled={!ipfsFile || uploading} className={primaryBtn}>
              {uploading ? "上传中..." : "上传到 IPFS"}
            </button>
            <input
              type="text"
              placeholder="或手动输入 CID"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-energyOrange focus:outline-none transition-colors"
            />
          </div>
          {cid && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-800 mb-2 font-semibold">✓ IPFS CID</p>
              <p className="text-xs font-mono text-green-700 break-all mb-2">{cid}</p>
              <a
                href={`https://ipfs.io/ipfs/${cid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                在 IPFS 上查看 →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add React import at top
import React from "react";

