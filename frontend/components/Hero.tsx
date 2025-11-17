"use client";
import Link from "next/link";

export function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-calmGreen via-emerald-600 to-teal-700 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="animate-slide-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            戒烟戒酒挑战
          </h1>
          <p className="text-xl md:text-2xl text-emerald-50 mb-6 max-w-2xl">
            链上可审计的习惯挑战，用 FHE 保护你的隐私进度
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              ✓ 完全链上可验证
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              ✓ 加密保护隐私
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              ✓ 社群互助激励
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/challenges/new"
              className="px-6 py-3 rounded-xl bg-white text-emerald-700 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              创建挑战
            </Link>
            <Link
              href="/challenges"
              className="px-6 py-3 rounded-xl bg-emerald-900/30 text-white font-semibold border border-white/40 hover:bg-emerald-900/50 transition-colors"
            >
              浏览挑战
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-1 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-24">
          <path d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z" fill="#F7F8FA"/>
        </svg>
      </div>
    </div>
  );
}

