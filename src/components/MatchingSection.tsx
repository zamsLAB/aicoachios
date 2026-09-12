import React from "react";
import { Users, Heart, Plus, Trash2, MessageCircle, Camera } from "lucide-react";
import { MatchingTarget, UserProfile } from "../types";
import { analyzeMatching } from "../utils/matching";
import { shareElementAsImage } from "../utils/capture";
import { BannerCard } from "./BannerCard";
import { Language, translations } from "../utils/i18n";
import { getTodayStr } from "../utils/date";

interface MatchingSectionProps {
  language: Language;
  matchingTargets: MatchingTarget[];
  activeMatchingTargetId: string | null;
  userProfile: UserProfile | null;
  isAddMatchOpen: boolean;
  setIsAddMatchOpen: (open: boolean) => void;
  matchName: string;
  setMatchName: (name: string) => void;
  matchYear: string;
  setMatchYear: (year: string) => void;
  matchMonth: string;
  setMatchMonth: (month: string) => void;
  matchDay: string;
  setMatchDay: (day: string) => void;
  matchRelation: string;
  setMatchRelation: (relation: string) => void;
  onAddTarget: () => void;
  onDeleteTarget: (id: string, name: string) => void;
  setActiveMatchingTargetId: (id: string | null) => void;
  onCheckMatch: (targetId: string) => void;
  unlockedTargets: string[];
  cachedMatchResults: Record<string, any>;
  isMatchingLoading: boolean;
  userBattery?: number;
  showToast?: (msg: string) => void;
}

export const MatchingSection: React.FC<MatchingSectionProps> = ({
  language,
  matchingTargets,
  activeMatchingTargetId,
  userProfile,
  isAddMatchOpen,
  setIsAddMatchOpen,
  matchName,
  setMatchName,
  matchYear,
  setMatchYear,
  matchMonth,
  setMatchMonth,
  matchDay,
  setMatchDay,
  matchRelation,
  setMatchRelation,
  onAddTarget,
  onDeleteTarget,
  setActiveMatchingTargetId,
  onCheckMatch,
  unlockedTargets,
  cachedMatchResults,
  isMatchingLoading,
  userBattery,
  showToast,
}) => {
  const t = translations[language];

  return (
    <div className="space-y-4 pb-20">
      
      {/* Compatibility Intro Card */}
      <div className="bg-white rounded-[32px] p-6 border border-purple-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-xl shadow-xs text-purple-700 border border-purple-200">
              🔮
            </div>
            <div>
              <h3 className="text-base font-black text-purple-950">{t.matchingIntroTitle}</h3>
              <p className="text-[11px] text-slate-500 font-bold mt-0.5">{t.matchingIntroSubtitle}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsAddMatchOpen(!isAddMatchOpen)}
            className="w-8 h-8 rounded-full bg-[#FFFDF0] hover:bg-[#FFF9E6] text-purple-950 border border-purple-300/80 shadow-xs flex items-center justify-center transition active:scale-95 cursor-pointer"
            title={language === "en" ? "Add match connection" : "인연 추가하기"}
          >
            <Plus className={`w-4 h-4 text-purple-800 transition duration-200 ${isAddMatchOpen ? "rotate-45 text-rose-600" : ""}`} />
          </button>
        </div>

        {/* Form to add matching targets */}
        {isAddMatchOpen && (
          <div className="mt-4 pt-4 border-t border-purple-100 space-y-4 animate-fadeIn">
            <div className="space-y-3 bg-purple-50/50 border border-purple-200/60 rounded-2xl p-4">
              <div>
                <label className="block text-[9px] font-extrabold text-purple-800 mb-1 pl-1">{t.targetNameLabel}</label>
                <input
                  type="text"
                  value={matchName}
                  onChange={(e) => {
                    if (e.target.value.length <= 8) {
                      setMatchName(e.target.value);
                    }
                  }}
                  maxLength={8}
                  placeholder={t.targetNamePlaceholder}
                  className="w-full h-9 rounded-xl bg-white border border-purple-200 px-3 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-bold placeholder-purple-300"
                />
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-purple-800 mb-1 pl-1">{t.targetBirthdateLabel}</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <select
                    value={matchYear}
                    onChange={(e) => setMatchYear(e.target.value)}
                    className="h-9 rounded-xl bg-white border border-purple-200 px-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
                  >
                    {Array.from({ length: 87 }, (_, i) => 2026 - i).map(year => (
                      <option key={year} value={year} className="text-slate-800 bg-white">{year}{language === "ko" ? "년" : ""}</option>
                    ))}
                  </select>

                  <select
                    value={matchMonth}
                    onChange={(e) => setMatchMonth(e.target.value)}
                    className="h-9 rounded-xl bg-white border border-purple-200 px-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                      const monthStr = String(month).padStart(2, "0");
                      return (
                        <option key={month} value={monthStr} className="text-slate-800 bg-white">{month}{language === "ko" ? "월" : " /"}</option>
                      );
                    })}
                  </select>

                  <select
                    value={matchDay}
                    onChange={(e) => setMatchDay(e.target.value)}
                    className="h-9 rounded-xl bg-white border border-purple-200 px-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-bold cursor-pointer"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                      const dayStr = String(day).padStart(2, "0");
                      return (
                        <option key={day} value={dayStr} className="text-slate-800 bg-white">{day}{language === "ko" ? "일" : ""}</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-purple-800 mb-1 pl-1">{t.relationLabel}</label>
                <input
                  type="text"
                  value={matchRelation}
                  onChange={(e) => setMatchRelation(e.target.value)}
                  placeholder={t.relationPlaceholder}
                  className="w-full h-9 rounded-xl bg-white border border-purple-200 px-3 text-xs text-slate-800 focus:outline-none focus:border-purple-500 font-bold placeholder-purple-300"
                />
              </div>

              <button
                type="button"
                onClick={onAddTarget}
                className="w-full h-10 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                {t.addSubmit}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Registered List */}
      <div className="space-y-2">
        <h4 className="text-xs font-black text-purple-700 pl-1">{t.targetListTitle} ({matchingTargets.length})</h4>
        
        {matchingTargets.length === 0 ? (
          <div className="bg-white border border-dashed border-purple-200 rounded-3xl p-6 text-center text-xs text-slate-400 font-medium">
            {t.noTargetsYet}
          </div>
        ) : (
          <div className="space-y-2.5">
            {matchingTargets.map((target) => {
              const isActive = activeMatchingTargetId === target.id;
              const todayStr = getTodayStr();
              const unlockKey = `${target.id}_${todayStr}`;
              const isUnlockedToday = unlockedTargets.includes(unlockKey);

              const matchingResultData = isActive && userProfile
                ? (cachedMatchResults[unlockKey] || cachedMatchResults[target.id] || analyzeMatching(
                    userProfile.name,
                    userProfile.birthdate || "2010-01-01",
                    userProfile.gender || "여자",
                    target.name,
                    target.birthdate,
                    target.relationType,
                    userBattery,
                    language
                  ))
                : null;

              return (
                <div 
                  key={target.id}
                  className={`bg-white rounded-[28px] border transition-all overflow-hidden ${
                    isActive ? "border-purple-400 shadow-md" : "border-purple-100 hover:border-purple-200"
                  }`}
                >
                  {/* Card Header clickable */}
                  <div className="p-4 flex items-center justify-between">
                    <div
                      onClick={() => {
                        if (isUnlockedToday) {
                          setActiveMatchingTargetId(isActive ? null : target.id);
                        } else {
                          onCheckMatch(target.id);
                        }
                      }}
                      className="flex-1 text-left flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-lg flex-shrink-0">
                        {(() => {
                          const clean = (target.relationType || "").toLowerCase();
                          if (clean.includes("친구") || clean.includes("찐친") || clean.includes("선배") || clean.includes("베프") || clean.includes("쌤") || clean.includes("friend") || clean.includes("best")) return "🏫";
                          if (clean.includes("썸") || clean.includes("연인") || clean.includes("사랑") || clean.includes("남친") || clean.includes("여친") || clean.includes("내꺼") || clean.includes("커플") || clean.includes("애인") || clean.includes("love") || clean.includes("partner") || clean.includes("crush")) return "❤️";
                          if (clean.includes("가족") || clean.includes("엄마") || clean.includes("아빠") || clean.includes("동생") || clean.includes("형") || clean.includes("누나") || clean.includes("언니") || clean.includes("오빠") || clean.includes("부모") || clean.includes("딸") || clean.includes("아들") || clean.includes("family")) return "🏠";
                          return "🔮";
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-xs text-purple-950 truncate max-w-[120px]">{target.name}</span>
                          <span className="text-[9.5px] font-black px-2 py-0.5 bg-[#FFFDF0] text-slate-900 rounded-md border border-amber-200/80 max-w-[140px] truncate shadow-2xs">
                            {target.relationType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-medium">{t.birthdayLabel}: {target.birthdate}</span>
                          
                          {/* '오늘 매칭 확인' or '분석 체크' button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isUnlockedToday) {
                                setActiveMatchingTargetId(isActive ? null : target.id);
                              } else {
                                onCheckMatch(target.id);
                              }
                            }}
                            className={`px-2.5 py-1 text-[9.5px] font-black rounded-full transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-2xs ${
                              isUnlockedToday
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                                : "bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white hover:opacity-95 border border-purple-400/30"
                            }`}
                          >
                            {isUnlockedToday ? (
                              <>
                                <span className="text-emerald-600 font-bold">☑️</span>
                                <span>{t.analysisDone}</span>
                              </>
                            ) : (
                              <>
                                <span>{t.checkTodayMatch}</span>
                                <span className="bg-white/20 px-1 py-0.2 rounded-[4px] text-[8px] tracking-wide font-black">100p</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onDeleteTarget(target.id, target.name)}
                        className="p-2 text-rose-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Active Card Body: Loading or Analysis result */}
                  {isActive && isMatchingLoading && (
                    <div className="px-5 pb-6 pt-4 border-t border-purple-100 bg-purple-50/40 rounded-b-[28px] flex flex-col items-center justify-center min-h-[140px]">
                      <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin flex items-center justify-center text-xs">
                        🔮
                      </div>
                      <p className="text-[11px] font-extrabold text-purple-700 mt-3.5 animate-pulse">{t.matchingLoadingFrequency}</p>
                      <p className="text-[9px] text-slate-500 font-bold mt-1">{t.matchingLoadingAi}</p>
                    </div>
                  )}

                  {isActive && !isMatchingLoading && matchingResultData && (() => {
                    const todayChem = matchingResultData.todayChemistryMatch ?? matchingResultData.score;
                    const physMatch = matchingResultData.physicalMatch ?? matchingResultData.score;
                    const emoMatch = matchingResultData.emotionalMatch ?? matchingResultData.score;
                    const intelMatch = matchingResultData.intellectualMatch ?? matchingResultData.score;
                    const exactAverage = Math.round((todayChem + physMatch + emoMatch + intelMatch) / 4);

                    return (
                    <div className="matching-card-result px-5 pb-5 pt-3 border-t border-purple-100 bg-purple-50/30 rounded-b-[28px] space-y-4 animate-fadeIn relative">
                      {/* Top Right Screen Capture Share Button */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const cardEl = e.currentTarget.closest(".matching-card-result") as HTMLElement;
                            if (cardEl) {
                              shareElementAsImage(
                                cardEl,
                                `Match_Report_${target.id.slice(-4)}.png`,
                                `${target.name}${language === "en" ? " Match Report" : "님과의 매칭 리포트"}`,
                                showToast
                              );
                            }
                          }}
                          className="px-3 py-1 bg-[#FFFDF0] hover:bg-[#FFF9E6] text-purple-950 border border-purple-300/80 rounded-full text-[10.5px] font-extrabold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer no-capture"
                          title={`${target.name} result share`}
                        >
                          <Camera className="w-3.5 h-3.5 text-purple-700" />
                          <span>{t.shareResult}</span>
                        </button>
                      </div>

                      <div className="flex flex-col items-center justify-center pt-0 pb-1 text-center -mt-3">
                        <div className="relative w-20 h-20 flex items-center justify-center bg-white rounded-full border-4 border-purple-200 shadow-sm">
                          <span className="text-xl font-black text-black">{exactAverage}%</span>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white shadow-xs">
                            💚
                          </div>
                        </div>
                        <h5 className="font-black text-xs text-purple-950 mt-3"> {t.todayMatchStatus}: {matchingResultData.chemistryLevel}</h5>
                      </div>

                      <div className="bg-white border border-purple-100 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-purple-700 mb-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-purple-500" />
                          <span className="text-[10px] font-extrabold uppercase tracking-widest"> {t.aiRelationReport}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-bold">
                          "{matchingResultData.coachingMessage}"
                        </p>
                      </div>

                      {/* Dynamic Biorhythm Chemistry Visualizer */}
                      <div className="bg-white border border-purple-100 rounded-2xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between text-xs font-black text-purple-950 border-b border-purple-100 pb-2">
                          <span className="flex items-center gap-1">
                            <span>🧬</span>
                            <span>{t.bioMatchAnalysis}</span>
                          </span>
                          <span className="text-[10px] text-black font-black bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                            {t.averageScore} {exactAverage}{language === "ko" ? "점" : " pts"}
                          </span>
                        </div>

                        {/* Today Chemistry Bar */}
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-extrabold mb-1">
                            <span className="text-slate-700 flex items-center gap-1">
                              <span>✨</span>
                              <span>{t.todayChemistry}</span>
                            </span>
                            <span className="text-black font-black">
                              {(matchingResultData.todayChemistryMatch ?? matchingResultData.score)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2.5 overflow-hidden flex p-0.5">
                            <div
                              className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                              style={{
                                width: `${matchingResultData.todayChemistryMatch ?? matchingResultData.score}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Physical Chemistry Bar */}
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-extrabold mb-1">
                            <span className="text-slate-700 flex items-center gap-1">
                              <span>🕺</span>
                              <span>{t.physicalMatchLabel}</span>
                            </span>
                            <span className="text-black font-black">
                              {(matchingResultData.physicalMatch ?? matchingResultData.score)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2.5 overflow-hidden flex p-0.5">
                            <div
                              className="bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(132,204,22,0.8)]"
                              style={{
                                width: `${matchingResultData.physicalMatch ?? matchingResultData.score}%`,
                              }}
                            />
                          </div>
                          {matchingResultData.userBio && matchingResultData.targetBio && (
                            <div className="flex justify-between text-[8px] text-slate-400 mt-0.5 font-bold">
                              <span>{t.meLabel}: {matchingResultData.userBio.physical.score}%</span>
                              <span>{t.targetLabel}: {matchingResultData.targetBio.physical.score}%</span>
                            </div>
                          )}
                        </div>

                        {/* Emotional Chemistry Bar */}
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-extrabold mb-1">
                            <span className="text-slate-700 flex items-center gap-1">
                              <span>💕</span>
                              <span>{t.emotionalMatchLabel}</span>
                            </span>
                            <span className="text-black font-black">
                              {(matchingResultData.emotionalMatch ?? matchingResultData.score)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2.5 overflow-hidden flex p-0.5">
                            <div
                              className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-rose-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(232,121,249,0.8)]"
                              style={{
                                width: `${matchingResultData.emotionalMatch ?? matchingResultData.score}%`,
                              }}
                            />
                          </div>
                          {matchingResultData.userBio && matchingResultData.targetBio && (
                            <div className="flex justify-between text-[8px] text-slate-400 mt-0.5 font-bold">
                              <span>{t.meLabel}: {matchingResultData.userBio.emotional.score}%</span>
                              <span>{t.targetLabel}: {matchingResultData.targetBio.emotional.score}%</span>
                            </div>
                          )}
                        </div>

                        {/* Intellectual Chemistry Bar */}
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-extrabold mb-1">
                            <span className="text-slate-700 flex items-center gap-1">
                              <span>🧠</span>
                              <span>{t.intellectualMatchLabel}</span>
                            </span>
                            <span className="text-black font-black">
                              {(matchingResultData.intellectualMatch ?? matchingResultData.score)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2.5 overflow-hidden flex p-0.5">
                            <div
                              className="bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(103,232,249,0.8)]"
                              style={{
                                width: `${matchingResultData.intellectualMatch ?? matchingResultData.score}%`,
                              }}
                            />
                          </div>
                          {matchingResultData.userBio && matchingResultData.targetBio && (
                            <div className="flex justify-between text-[8px] text-slate-400 mt-0.5 font-bold">
                              <span>{t.meLabel}: {matchingResultData.userBio.intellectual.score}%</span>
                              <span>{t.targetLabel}: {matchingResultData.targetBio.intellectual.score}%</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom AI Daily Coaching Banner */}
                      <BannerCard 
                        badgeText={language === "en" ? "Who is it today?" : "오늘 케미는 누구?"} 
                        title={language === "en" ? "AI Daily Coaching" : "AI 데일리 코칭"} 
                      />
                    </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
