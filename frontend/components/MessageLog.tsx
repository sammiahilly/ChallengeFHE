"use client";

interface MessageLogProps {
  message: string;
}

export function MessageLog({ message }: MessageLogProps) {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-lg animate-slide-in">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-calmGreen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        操作日志
      </h3>
      <div className="bg-gray-50 rounded-xl p-4 min-h-[80px] max-h-[200px] overflow-y-auto">
        {message ? (
          <p className="text-sm text-gray-700 font-mono leading-relaxed">{message}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">等待操作...</p>
        )}
      </div>
    </div>
  );
}

