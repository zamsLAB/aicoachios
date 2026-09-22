import React, { useState, useEffect } from "react";
import { CalendarCheck2, Gift, Sparkles, CheckCircle2, Flame } from "lucide-react";
import { Language, translations } from "../utils/i18n";
import { getTodayStr, getYesterdayStr } from "../utils/date";

export interface AttendanceData {
  lastCheckInDate: string; // YYYY-MM-DD
  streak: number; // Current streak count (1, 2, 3, ...)
  totalCheckIns: number; // All-time total check-in count
  history: string[]; // Recent check-in dates
}

interface AttendanceSectionProps {
  language?: Language;
  onAddPoints: (points: number) => void;
  showToast: (msg: string) => void;
}

export const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  language = "ko",
  onAddPoints,
  showToast,
}) => {
  const isEn = language === "en";
  const [attendance, setAttendance] = useState<AttendanceData>({
    lastCheckInDate: "",
    streak: 0,
    totalCheckIns: 0,
    history: [],
  });
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Load attendance data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("coaching_attendance_data");
    if (saved) {
      try {
        const parsed: AttendanceData = JSON.parse(saved);
        const todayStr = getTodayStr();
        const yesterdayStr = getYesterdayStr();

        // Check if streak was broken (last check-in was neither today nor yesterday)
        if (parsed.lastCheckInDate && parsed.lastCheckInDate !== todayStr && parsed.lastCheckInDate !== yesterdayStr) {
          // Streak broke, keep totalCheckIns and history, reset streak
          const updated: AttendanceData = {
            ...parsed,
            streak: 0,
          };
          setAttendance(updated);
          localStorage.setItem("coaching_attendance_data", JSON.stringify(updated));
        } else {
          setAttendance(parsed);
        }
      } catch (e) {
        console.error("Failed to parse attendance data", e);
      }
    }
  }, []);

  const todayStr = getTodayStr();
  const yesterdayStr = getYesterdayStr();
  const isCheckedInToday = attendance.lastCheckInDate === todayStr;

  // Calculate current cycle step (0 to 5)
  // If user checked in today: currentCycleProgress is attendance.streak (1 to 5)
  // If user has not checked in today:
  //   - If streak was 5 (finished yesterday): new cycle starts, progress is 0 (ready for day 1)
  //   - If streak was 1..4: progress is attendance.streak (e.g. 2 means 2 days done, next is day 3)
  const currentCycleProgress = isCheckedInToday
    ? (attendance.streak > 5 ? 5 : attendance.streak)
    : (attendance.streak >= 5 ? 0 : attendance.streak);

  const handleCheckIn = () => {
    if (isCheckedInToday) {
      showToast(isEn ? "You have already checked in today! See you tomorrow 😊" : "오늘 이미 출석체크를 완료했습니다! 내일 또 만나요 😊");
      return;
    }

    let newStreak = 1;
    if (attendance.lastCheckInDate === yesterdayStr) {
      if (attendance.streak >= 5) {
        // 5일차 완료 후 다음 연속 출석 시 1일차로 새 사이클 시작
        newStreak = 1;
      } else {
        newStreak = attendance.streak + 1;
      }
    } else {
      // 하루라도 빠졌거나 첫 출석이면 무조건 1일차부터 다시 시작
      newStreak = 1;
    }

    const newHistory = [todayStr, ...attendance.history.filter((d) => d !== todayStr)].slice(0, 30);
    const newTotal = attendance.totalCheckIns + 1;
    const is5thDay = newStreak === 5;

    const updatedData: AttendanceData = {
      lastCheckInDate: todayStr,
      streak: newStreak,
      totalCheckIns: newTotal,
      history: newHistory,
    };

    setAttendance(updatedData);
    localStorage.setItem("coaching_attendance_data", JSON.stringify(updatedData));

    if (is5thDay) {
      // 5일 연속 출석 시에만 500P 지급
      onAddPoints(500);
      setShowCelebration(true);
      showToast(
        isEn
          ? "🎉 5-day consecutive attendance achieved! 🎁"
          : "🎉 5일 연속 출석 달성! 500P 지급! 🎁"
      );
      setTimeout(() => setShowCelebration(false), 4000);
    } else {
      // 1~4일차는 포인트 지급 없이 출석 일수만 누적
      showToast(
        isEn
          ? `Day ${newStreak}/5 checked in!`
          : `${newStreak}일차 출석 완료!`
      );
    }
  };

  const days = [1, 2, 3, 4, 5];

  return (
    <div className="bg-white rounded-[32px] p-5 border border-purple-100 shadow-sm space-y-4 relative overflow-hidden">
      {/* 5일 연속 출석 축하 세레모니 오버레이 */}
      {showCelebration && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center overflow-hidden bg-slate-950/40 backdrop-blur-md animate-fadeIn">
          
          {/* 1. 금빛 가루 파티클 효과 (Sparkle Particles) */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 left-1/4 w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping opacity-75" />
            <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-yellow-200 rounded-full animate-bounce duration-1000" />
            <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-amber-400 rounded-full animate-ping delay-300" />
            <div className="absolute top-10 right-10 w-1.5 h-1.5 bg-amber-200 rounded-full animate-pulse" />
            <div className="absolute bottom-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-500" />
          </div>

          {/* 2. 중앙 은은한 금빛 글로우 후광 */}
          <div className="absolute w-40 h-40 bg-gradient-to-r from-amber-400/30 via-yellow-300/30 to-amber-500/30 rounded-full blur-2xl animate-pulse pointer-events-none" />

          {/* 3. 보너스 포인트 메인 강렬 뱃지 카드 */}
          <div className="relative z-10 flex flex-col items-center">
            {/* 상단 럭셔리 뱃지 */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 backdrop-blur-md mb-2 shadow-sm">
              <span className="text-xs">✨</span>
              <span className="text-[11px] font-black tracking-wider text-amber-200 uppercase">
                {isEn ? "5-Day Streak!" : "5일 연속 출석 달성!"}
              </span>
            </div>

            {/* 메인 500P 타이틀 (금빛 그라데이션 & 드롭 섀도우) */}
            <h3 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)] animate-pulse">
              {isEn ? "🏆 +500P BONUS!" : "🏆 500P 보너스!"}
            </h3>
          </div>
        </div>
      )}

      {/* 1. Header: Title & Streak status */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-100/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-purple-100/90 border border-purple-200/60 flex items-center justify-center text-purple-600 shadow-2xs">
            <CalendarCheck2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="text-sm font-black text-purple-950 flex items-center gap-1.5">
              <span>{isEn ? "Daily Attendance" : "출석 체크"}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </h4>
            <p className="text-[11px] font-medium text-slate-400">
              {isEn ? "Check in daily & rewards" : "5일 연속 출석시 500p 🏆"}
            </p>
          </div>
        </div>

        {/* Streak Badge */}
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/70 px-2.5 py-1 rounded-full text-amber-800 text-[11px] font-black shadow-2xs">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>
            {attendance.streak > 0
              ? isEn
                ? `${attendance.streak} D`
                : `${attendance.streak}일차 출석`
              : isEn
              ? "0"
              : "0"}
          </span>
        </div>
      </div>


      {/* 3. 5-Day Visual Stamp Board */}
      <div className="grid grid-cols-5 gap-2 py-1">
        {days.map((dayNum) => {
          // Determine status of each day in 5-day cycle
          const isDone = isCheckedInToday
            ? dayNum <= currentCycleProgress
            : dayNum <= currentCycleProgress;

          const isNextTarget = !isCheckedInToday && dayNum === currentCycleProgress + 1;
          const isDay5 = dayNum === 5;

          return (
            <div
              key={dayNum}
              className={`flex flex-col items-center justify-center rounded-2xl p-2.5 text-center transition-all relative ${
                isDone
                  ? isDay5
                    ? "bg-gradient-to-b from-amber-400 to-yellow-400 text-slate-950 border border-amber-300 shadow-md font-black"
                    : "bg-purple-600 text-white border border-purple-500 shadow-sm font-black"
                  : isNextTarget
                  ? "bg-purple-50/80 border-2 border-dashed border-purple-400 text-purple-950 animate-pulse font-bold"
                  : "bg-slate-50 border border-slate-200 text-slate-400 font-medium"
              }`}
            >
              {/* Day Label */}
              <span className={`text-[10px] ${isDone ? (isDay5 ? "text-slate-900 font-black" : "text-purple-100") : "text-slate-500"}`}>
                {isEn ? `Day ${dayNum}` : `${dayNum}일차`}
              </span>

              {/* Icon / Stamp */}
              <div className="my-1 flex items-center justify-center">
                {isDone ? (
                  isDay5 ? (
                    <span className="text-xl">👑</span>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  )
                ) : isDay5 ? (
                  <Gift className="w-5 h-5 text-amber-500 animate-bounce" />
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                    {dayNum}
                  </span>
                )}
              </div>

              {/* Stamp status / point indicator */}
              <span
                className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-black ${
                  isDay5
                    ? isDone
                      ? "bg-slate-900 text-amber-300 shadow-2xs"
                      : "bg-amber-100 text-amber-800"
                    : isDone
                    ? "bg-purple-700/50 text-white"
                    : "bg-slate-200/80 text-slate-500"
                }`}
              >
                {isDay5 ? "500P" : isDone ? (isEn ? "Done" : "완료") : (isEn ? "Wait" : "출석")}
              </span>
            </div>
          );
        })}
      </div>

      {/* 4. Action Button */}
      <div>
        {isCheckedInToday ? (
          <button
            type="button"
            disabled
            className="w-full h-12 rounded-2xl bg-purple-50 border border-purple-200/80 text-purple-700 font-black text-xs flex items-center justify-center gap-2 cursor-default shadow-2xs"
          >
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>
              {currentCycleProgress === 5
                ? isEn
                  ? "🏆 5-Day streak complete! (+500P)"
                  : "🏆 5일 연속 출석 완료! (+500P)"
                : isEn
                ? "Today's check-in complete ✅"
                : "오늘 출석 완료 ✅"}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCheckIn}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition cursor-pointer border border-purple-400/30"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-spin" />
            <span>
              {isEn
                ? `Check In Today (${currentCycleProgress + 1} of 5 Days) ➔`
                : `오늘 출석 (${currentCycleProgress + 1}일차 도장 쾅!) ➔`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
