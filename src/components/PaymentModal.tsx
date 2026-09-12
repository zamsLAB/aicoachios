import React from "react";

interface PaymentModalProps {
  userPoints: number;
  onClose: () => void;
  onPurchasePack: (packType: string, costWon: number, pointsBonus: number, makeAdFree?: boolean) => void;
  onWatchAd: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  userPoints,
  onClose,
  onPurchasePack,
  onWatchAd,
}) => {
  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-5 animate-fadeIn">
      <div className="w-full max-h-[90vh] bg-[#0c0a15] rounded-[32px] p-6 text-white border border-purple-500/30 shadow-2xl overflow-y-auto space-y-5">
        
        {/* Header - Left Aligned */}
        <div className="flex items-center justify-between border-b border-purple-900/50 pb-3.5 pt-1 px-1">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🪙</span>
            <h3 className="font-extrabold text-xl text-purple-100 tracking-tight">포인트 충전</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer transition"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* Pack Options Grid */}
        <div className="space-y-3">

          {/* 1. Subscription Option */}
          <div 
            onClick={() => onPurchasePack("subscription", 2900, 3000, true)}
            className="bg-gradient-to-r from-purple-900/90 to-indigo-900/90 hover:from-purple-800 hover:to-indigo-800 border-2 border-purple-400/50 rounded-2xl p-4 flex flex-col gap-3 relative cursor-pointer transition duration-150 active:scale-99 shadow-xl"
          >
            <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-400 to-yellow-300 text-purple-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
              베스트 👛
            </span>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/30 flex items-center justify-center text-lg flex-shrink-0 shadow-xs">
                💚
              </div>
              <div>
                <p className="text-[10px] font-bold text-purple-300">30일 구독 서비스 (30일 후 자동 해지)</p>
                <h4 className="text-[13px] font-black text-white leading-snug mt-0.5">광고없이 보기 + 3,000 P 적립</h4>
              </div>
            </div>
            <div className="border-t border-purple-900/30 pt-3 flex items-center justify-center">
              <span className="text-sm font-black text-white">₩ 2,900 <span className="text-[10px] text-purple-300 font-bold">(VAT 별도)</span></span>
            </div>
          </div>

          {/* 2. Basic Pack */}
          <div 
            onClick={() => onPurchasePack("starter", 1000, 1000)}
            className="bg-[#151221]/80 hover:bg-[#1e1a2e] border border-blue-500/30 rounded-2xl p-4 flex flex-col gap-3 relative cursor-pointer transition duration-150 active:scale-99 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-900/50 flex items-center justify-center text-lg flex-shrink-0 shadow-xs">
                🥇
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-300">스타터 포인트 팩</p>
                <h4 className="text-[13px] font-black text-white leading-snug mt-0.5">1,000 P + 200 P </h4>
              </div>
            </div>
            <div className="border-t border-blue-900/30 pt-3 flex items-center justify-center">
              <span className="text-sm font-black text-white">₩ 1,000 <span className="text-[10px] text-blue-300 font-bold">(VAT 별도)</span></span>
            </div>
          </div>

          {/* 3. Thrifty Pack */}
          <div 
            onClick={() => onPurchasePack("thrifty", 2000, 2500)}
            className="bg-[#1b1720]/80 hover:bg-[#25202c] border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-3 relative cursor-pointer transition duration-150 active:scale-99 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-900/50 flex items-center justify-center text-lg flex-shrink-0 shadow-xs">
                🏅
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-300">인기있는 포인트 팩</p>
                <h4 className="text-[13px] font-black text-white leading-snug mt-0.5">2,000 P + 500 P</h4>
              </div>
            </div>
            <div className="border-t border-amber-900/30 pt-3 flex items-center justify-center">
              <span className="text-sm font-black text-white">₩ 2,000 <span className="text-[10px] text-amber-300 font-bold">(VAT 별도)</span></span>
            </div>
          </div>

          {/* 4. Advanced Pack */}
          <div 
            onClick={() => onPurchasePack("advanced", 5000, 7000)}
            className="bg-[#1e1320]/80 hover:bg-[#2b1b2e] border border-pink-500/30 rounded-2xl p-4 flex flex-col gap-3 relative cursor-pointer transition duration-150 active:scale-99 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-900/50 flex items-center justify-center text-lg flex-shrink-0 shadow-xs">
                🎖️
              </div>
              <div>
                <p className="text-[10px] font-bold text-pink-300">실속형 포인트 팩</p>
                <h4 className="text-[13px] font-black text-white leading-snug mt-0.5">5,000 P + 2,000 P</h4>
              </div>
            </div>
            <div className="border-t border-pink-900/30 pt-3 flex items-center justify-center">
              <span className="text-sm font-black text-white">₩ 5,000 <span className="text-[10px] text-pink-300 font-bold">(VAT 별도)</span></span>
            </div>
          </div>

        </div>

        {/* Bottom: Ad Watching Reward Option - Enlarged text */}
        <div className="pt-4 border-t border-purple-950/40">
          <button 
            onClick={onWatchAd}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black py-4 px-5 rounded-2xl flex items-center justify-center gap-4 shadow-xl transition active:scale-98 cursor-pointer border border-emerald-400/40"
          >
            <span className="text-3xl">📺</span>
            <div className="text-left">
              <p className="text-base font-black tracking-tight">포인트 무료 적립</p>
              <p className="text-xs text-green-100 font-bold mt-0.5">광고 보기 100P 즉시 적립!</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
