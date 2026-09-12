import React from "react";
import { ArrowRight, PlayCircle, Settings2, Trash2 } from "lucide-react";
import { UserProfile } from "../types";
import { AttendanceSection } from "./AttendanceSection";
import { Language, translations } from "../utils/i18n";

interface ProfileSectionProps {
  language?: Language;
  userProfile: UserProfile;
  diaryLogsCount: number;
  onSelectLanguage?: (lang: Language) => void;
  onEditProfile: () => void;
  onOpenResetModal: () => void;
  onUpdateProfile: (updatedFields: Partial<UserProfile>) => void;
  showToast: (msg: string) => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
  onAppleLogin?: () => void;
  onAddPoints: (points: number) => void;
  onWatchRewardedAd?: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  language = "ko",
  userProfile,
  onSelectLanguage,
  onEditProfile,
  onOpenResetModal,
  onUpdateProfile,
  showToast,
  onOpenTerms,
  onOpenPrivacy,
  onAddPoints,
  onWatchRewardedAd,
}) => {
  const t = translations[language] || translations.ko;

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      <button
        type="button"
        onClick={onWatchRewardedAd}
        className="group relative isolate w-full overflow-hidden rounded-[28px] border border-amber-300/70 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-5 text-left text-white shadow-lg shadow-orange-200/50 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-200/60 active:translate-y-0 active:scale-[0.99] cursor-pointer"
      >
        <div className="pointer-events-none absolute -right-8 -top-10 -z-10 h-32 w-32 rounded-full bg-yellow-200/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-16 -z-10 h-28 w-28 rounded-full bg-rose-300/25 blur-2xl" />

        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/20 shadow-inner backdrop-blur-sm">
            <span aria-hidden="true" className="text-[30px] leading-none drop-shadow-sm">🪙</span>
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-black tracking-tight">{t.freePoints}</span>
              <span className="rounded-full border border-white/30 bg-white/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-yellow-50">
                {t.freePointsUnlimited}
              </span>
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-white/90">
              <PlayCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t.watchAdForPoints}</span>
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-1 rounded-2xl border border-yellow-200/80 bg-yellow-300 px-3 py-2.5 text-xs font-black text-slate-950 shadow-md transition group-hover:bg-yellow-200">
            {t.get100P}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.8} />
          </span>
        </div>
      </button>

      {/* Daily Attendance Check Section (5-Day Streak -> 500P Reward) */}
      <AttendanceSection
        language={language}
        onAddPoints={onAddPoints}
        showToast={showToast}
      />

      {/* Actions Section (언어 선택, 정보 수정, 약관, 초기화) */}
      <div className="bg-white rounded-[32px] p-6 border border-purple-100 shadow-sm space-y-3 text-center">
        <div className="rounded-[22px] bg-slate-100 p-1.5 border border-slate-200 shadow-inner">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => onSelectLanguage?.("ko")}
              className={`h-10 rounded-[16px] text-xs font-black transition-all cursor-pointer ${
                language === "ko"
                  ? "bg-white text-purple-950 shadow-sm border border-purple-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              🇰🇷 한국어
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage?.("en")}
              className={`h-10 rounded-[16px] text-xs font-black transition-all cursor-pointer ${
                language === "en"
                  ? "bg-white text-purple-950 shadow-sm border border-purple-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        <button 
          onClick={onEditProfile}
          className="w-full h-12 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 bg-purple-50/80 text-purple-950 hover:bg-purple-100 border border-purple-200"
        >
          <Settings2 className="w-4 h-4" />
          {t.editProfile}
        </button>

        <button 
          onClick={onOpenResetModal}
          className="w-full h-12 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          {t.resetApp}
        </button>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-slate-400 font-medium">
          <button
            type="button"
            onClick={onOpenTerms}
            className="hover:text-purple-600 underline transition cursor-pointer"
          >
            {t.termsOfService}
          </button>
          <span>|</span>
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="hover:text-purple-600 underline transition cursor-pointer"
          >
            {t.privacyPolicy}
          </button>
          <span>|</span>
          <a
            href="/delete-account.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-600 underline transition cursor-pointer"
          >
            {t.dataDeletion}
          </a>
        </div>
      </div>
    </div>
  );
};
