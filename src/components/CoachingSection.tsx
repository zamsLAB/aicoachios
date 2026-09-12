import React, { useEffect, useRef } from "react";
import { Sparkles, MessageCircle, Camera } from "lucide-react";
import { UserProfile, DiaryLog, CoachingResponse } from "../types";
import { MoodCalendar } from "./MoodCalendar";
import { shareElementAsImage } from "../utils/capture";
import { BannerCard } from "./BannerCard";
import { Language, translations } from "../utils/i18n";

interface CoachingSectionProps {
  language: Language;
  userProfile: UserProfile | null;
  currentYear: number;
  currentMonth: number;
  diaryLogs: DiaryLog[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCellClick: (dayNum: number) => void;
  getLogForDate: (dateStr: string) => DiaryLog | undefined;
  todayMood: string;
  setTodayMood: (val: string) => void;
  isLoading: boolean;
  coachingResult: CoachingResponse | null;
  onCoachingRequest: () => void;
  getCoachingTags: (battery: number, birthdate?: string, gender?: string) => { emoji: string; text: string }[];
  calculateBiorhythm: (birthdate: string) => any;
  showToast?: (msg: string) => void;
}

export const CoachingSection: React.FC<CoachingSectionProps> = ({
  language,
  userProfile,
  currentYear,
  currentMonth,
  diaryLogs,
  onPrevMonth,
  onNextMonth,
  onCellClick,
  getLogForDate,
  todayMood,
  setTodayMood,
  isLoading,
  coachingResult,
  onCoachingRequest,
  getCoachingTags,
  calculateBiorhythm,
  showToast,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  useEffect(() => {
    if (coachingResult && !isLoading && reportRef.current) {
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [coachingResult, isLoading]);

  return (
    <div className="space-y-4">
      {/* Today Mood Entry & Integrated Calendar Card */}
      <div className="bg-white rounded-[32px] p-6 border border-purple-100 shadow-sm">
        <h3 className="text-base font-black text-purple-950 flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-4 h-4 text-purple-500 animate-spin" />
          {t.writeTodayMood}
        </h3>
        
        <div className="relative">
          <input 
            type="text"
            value={todayMood}
            onChange={(e) => setTodayMood(e.target.value)}
            placeholder={t.moodPlaceholder}
            className="w-full h-12 bg-purple-50/50 border border-purple-200/60 rounded-2xl px-4 text-sm text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white transition-all placeholder-purple-300 font-bold shadow-inner"
          />
        </div>

        {/* Integrated 기분 캘린더 다이어리 */}
        <div className="mt-6 md:mt-8">
          <MoodCalendar
            currentYear={currentYear}
            currentMonth={currentMonth}
            diaryLogs={diaryLogs}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
            onCellClick={onCellClick}
            getLogForDate={getLogForDate}
          />
        </div>

        {/* Today Coaching Trigger Button */}
        <button 
          onClick={onCoachingRequest}
          disabled={isLoading}
          className="w-full mt-6 h-13 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white text-sm font-black rounded-2xl shadow-md hover:shadow-purple-300/40 active:scale-98 transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <span className="text-base animate-pulse">🔮</span>
          <span>{t.checkTodayCondition}</span>
        </button>
      </div>

      {/* AI Coaching Results Display */}
      {coachingResult && !isLoading && (
        <div ref={reportRef} className="space-y-4 animate-fadeIn">
          {/* 1. Pastel Battery Card */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-[28px] p-6 border border-purple-200/80 shadow-sm flex flex-col gap-4 text-purple-950 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-purple-700 uppercase tracking-widest flex items-center gap-1">
                {t.todayCondition}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (reportRef.current) {
                    shareElementAsImage(
                      reportRef.current,
                      "Daily_Condition_Report.png",
                      language === "en" ? "Today AI Condition Report" : "오늘의 AI 컨디션 리포트",
                      showToast
                    );
                  }
                }}
                className="px-3 py-1 bg-[#FFFDF0] hover:bg-[#FFF9E6] text-purple-950 border border-purple-300/80 rounded-full text-[10.5px] font-extrabold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer no-capture"
                title="오늘의 컨디션 캡쳐 및 공유하기"
              >
                <Camera className="w-3.5 h-3.5 text-purple-700" />
                <span>{t.shareResult}</span>
              </button>
            </div>

            <div className="flex items-center gap-5">
              <div className="flex items-baseline">
                <span className="text-6xl font-black text-black tracking-tighter">
                  {coachingResult.conditionBattery}
                </span>
                <span className="text-2xl font-black text-black ml-0.5">%</span>
              </div>

              <div className="relative w-28 h-9 border-2 border-slate-800 rounded-xl p-0.5 flex items-center pr-1 bg-slate-900 shadow-md">
                <div 
                  style={{ width: `${coachingResult.conditionBattery}%` }} 
                  className="h-full bg-gradient-to-r from-lime-300 via-lime-400 to-green-400 rounded-lg transition-all duration-1000 shadow-[0_0_12px_rgba(132,204,22,0.9)]"
                />
                <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-[4px] h-3.5 bg-slate-700 rounded-r-sm" />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-3 border-t border-purple-100">
              <MessageCircle className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
              <p className="text-[12.5px] font-bold text-slate-700 leading-relaxed whitespace-pre-line">
                {coachingResult.coachingComment}
              </p>
            </div>

            {/* Crisis Support Hotlines Banner (Shown when crisis words are detected) */}
            {coachingResult.isCrisis && (
              <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 space-y-2.5 text-rose-950 shadow-2xs">
                <div className="flex items-center gap-1.5 text-rose-800 font-black text-xs">
                  <span className="text-base">🛡️</span>
                  <span>{language === "en" ? "24/7 Crisis Helplines (Tap to Call)" : "24시간 무료 긴급 상담전화 (터치하여 통화)"}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {language === "en" ? (
                    <>
                      <a
                        href="tel:988"
                        className="flex items-center justify-center gap-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-2xs transition active:scale-98"
                      >
                        <span>📞 988 (Lifeline 24/7)</span>
                      </a>
                      <a
                        href="tel:911"
                        className="flex items-center justify-center gap-1 py-2 px-3 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-xl text-xs font-black shadow-2xs transition active:scale-98"
                      >
                        <span>🚨 911 Emergency</span>
                      </a>
                    </>
                  ) : (
                    <>
                      <a
                        href="tel:109"
                        className="flex items-center justify-center gap-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-2xs transition active:scale-98"
                      >
                        <span>📞 109 (24시간 무료)</span>
                      </a>
                      <a
                        href="tel:1577-0199"
                        className="flex items-center justify-center gap-1 py-2 px-3 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-xl text-xs font-black shadow-2xs transition active:scale-98"
                      >
                        <span>📞 1577-0199</span>
                      </a>
                      <a
                        href="tel:1388"
                        className="flex items-center justify-center gap-1 py-2 px-3 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-xl text-xs font-black shadow-2xs transition active:scale-98"
                      >
                        <span>📞 1388 (청소년)</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Coaching Tags / 코칭 헬퍼 태그 (한국어 버전에서만 노출, 한 줄에 3개 균등 배치) */}
            {language === "ko" && !coachingResult.isCrisis && (
              <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-purple-100">
                {getCoachingTags(coachingResult.conditionBattery, userProfile?.birthdate, userProfile?.gender || "여성").map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="bg-white border border-purple-200 text-purple-800 font-bold py-1 px-1.5 rounded-full text-[11px] flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap"
                  >
                    <span className="text-xs leading-none">{tag.emoji}</span>
                    <span className="leading-tight">{tag.text}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 1.5. Biorhythm Graph Card */}
          {userProfile?.birthdate && (() => {
            const bio = calculateBiorhythm(userProfile.birthdate);
            return (
              <div className="bg-white rounded-[28px] p-5 border border-purple-100 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🧬</span>
                    <h4 className="text-xs font-black text-purple-950">{t.biorhythmAnalysis}</h4>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 bg-purple-50 text-black rounded-full border border-purple-200">
                    {t.averageScore} {bio.averageScore}{language === "ko" ? "점" : " pts"}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 font-bold leading-tight">
                  {bio.summaryComment}
                </p>

                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between items-center text-xs font-black mb-1">
                      <span className="text-slate-700 flex items-center gap-1">
                        <span>🏃</span>
                        <span>{t.physicalIndex}</span>
                      </span>
                      <span className="text-black font-black text-[11px]">
                        {bio.physical.score}% ({bio.physical.status})
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
                      <div
                        className="bg-gradient-to-r from-lime-300 via-lime-400 to-green-400 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(132,204,22,0.8)]"
                        style={{ width: `${bio.physical.score}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-black mb-1">
                      <span className="text-slate-700 flex items-center gap-1">
                        <span>❤️</span>
                        <span>{t.emotionalIndex}</span>
                      </span>
                      <span className="text-black font-black text-[11px]">
                        {bio.emotional.score}% ({bio.emotional.status})
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
                      <div
                        className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(232,121,249,0.8)]"
                        style={{ width: `${bio.emotional.score}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-black mb-1">
                      <span className="text-slate-700 flex items-center gap-1">
                        <span>🧠</span>
                        <span>{t.intellectualIndex}</span>
                      </span>
                      <span className="text-black font-black text-[11px]">
                        {bio.intellectual.score}% ({bio.intellectual.status})
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
                      <div
                        className="bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(103,232,249,0.8)]"
                        style={{ width: `${bio.intellectual.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2. Side-by-Side Recommendations Grid (ONLY in Korean version as requested) */}
          {language === "ko" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-1 mb-2 pb-1.5 border-b border-purple-100">
                  <span className="text-xs">{coachingResult.isCrisis ? "📞" : "🧸"}</span>
                  <span className="text-[11px] font-black text-purple-800 uppercase tracking-wider">
                    {coachingResult.isCrisis ? "추천 실천 사항" : t.recommendedItems}
                  </span>
                </div>
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  {coachingResult.items.slice(0, coachingResult.isCrisis ? 2 : 1).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-lg flex-shrink-0 mt-0.5">{item.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-1 mb-2 pb-1.5 border-b border-purple-100">
                  <span className="text-xs">{coachingResult.isCrisis ? "🛋️" : "🍰"}</span>
                  <span className="text-[11px] font-black text-purple-800 uppercase tracking-wider">
                    {coachingResult.isCrisis ? "안심 공간 & 지원" : t.recommendedMenus}
                  </span>
                </div>
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  {coachingResult.places.slice(0, coachingResult.isCrisis ? 2 : 1).map((place, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-lg flex-shrink-0 mt-0.5">{place.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{place.name}</p>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{place.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom AI Daily Coaching Banner */}
          <BannerCard 
            badgeText={language === "en" ? "How's your condition?" : "오늘 내 컨디션은?"} 
            title={language === "en" ? "AI Daily Coaching" : "AI 데일리 코칭"} 
          />
        </div>
      )}
    </div>
  );
};
