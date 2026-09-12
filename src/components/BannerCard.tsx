import React from "react";

interface BannerCardProps {
  badgeText?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const BannerCard: React.FC<BannerCardProps> = ({
  badgeText = "오늘 내 컨디션은?",
  title = "AI 데일리 코칭",
  subtitle,
  className = "",
}) => {
  return (
    <div
      style={{ fontFamily: 'var(--font-cute)' }}
      className={`relative overflow-hidden rounded-xl px-2.5 py-2 text-white shadow-sm bg-gradient-to-r from-[#2a0845] via-[#4b125f] to-[#1e0735] border border-purple-400/30 ${className}`}
    >
      {/* Background Glow */}
      <div className="absolute -top-8 -left-8 w-28 h-28 bg-purple-600/25 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 right-8 w-32 h-32 bg-pink-600/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-1.5">
        {/* Left: Badge Pill */}
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-amber-200 text-[11.5px] font-bold shadow-2xs flex-shrink-0 whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          <span className="text-amber-300">✨</span>
          <span>{badgeText}</span>
        </div>

        {/* Center: Main Title & Optional Subtitle */}
        <div className="flex-1 min-w-0 text-center flex items-center justify-center gap-1 px-0.5">
          <h2 className="text-[13.5px] sm:text-[15px] font-bold text-white tracking-tight drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] whitespace-nowrap">
            {title}
          </h2>
          {subtitle && (
            <span className="text-[11.5px] font-bold text-purple-100 whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              • {subtitle}
            </span>
          )}
        </div>

        {/* Right 3D Robot Graphic */}
        <div className="relative flex-shrink-0 w-7 h-7 flex items-center justify-center">
          {/* Outer Glowing Sphere Bubble */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/30 via-pink-400/30 to-white/30 border border-white/40 shadow-[0_0_8px_rgba(192,132,252,0.4)] backdrop-blur-2xs" />

          {/* 3D Robot Graphic SVG */}
          <div className="relative z-10 w-5 h-5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            <svg viewBox="0 0 120 120" className="w-full h-full">
              <defs>
                <linearGradient id="botHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="70%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>

                <linearGradient id="earGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff7eb6" />
                  <stop offset="100%" stopColor="#e85d9e" />
                </linearGradient>

                <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>

                <linearGradient id="botScreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>
              </defs>

              <rect x="52" y="14" width="16" height="8" rx="4" fill="url(#capGrad)" />
              <rect x="18" y="32" width="10" height="18" rx="5" fill="url(#earGrad)" />
              <rect x="92" y="32" width="10" height="18" rx="5" fill="url(#earGrad)" />

              <rect
                x="24"
                y="20"
                width="72"
                height="70"
                rx="28"
                fill="url(#botHeadGrad)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              <rect
                x="34"
                y="34"
                width="52"
                height="38"
                rx="16"
                fill="url(#botScreenGrad)"
                stroke="#6366f1"
                strokeWidth="1"
              />

              <rect x="44" y="45" width="9" height="16" rx="4.5" fill="#38bdf8" />
              <rect x="67" y="45" width="9" height="16" rx="4.5" fill="#38bdf8" />

              <circle cx="47" cy="48" r="1.5" fill="#ffffff" />
              <circle cx="70" cy="48" r="1.5" fill="#ffffff" />
              <circle cx="60" cy="65" r="2.5" fill="#38bdf8" opacity="0.9" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
