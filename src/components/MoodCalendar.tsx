import React from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { DiaryLog, EMOTICONS } from "../types";
import { Language, translations } from "../utils/i18n";

interface MoodCalendarProps {
  language?: Language;
  currentYear: number;
  currentMonth: number;
  diaryLogs: DiaryLog[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCellClick: (dayNum: number) => void;
  getLogForDate: (dateStr: string) => DiaryLog | undefined;
}

export const MoodCalendar: React.FC<MoodCalendarProps> = ({
  language = "ko",
  currentYear,
  currentMonth,
  diaryLogs,
  onPrevMonth,
  onNextMonth,
  onCellClick,
  getLogForDate,
}) => {
  const t = translations[language];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  return (
    <div className="bg-white rounded-[28px] p-4 border border-purple-100 shadow-sm">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-100">
        <h4 className="font-black text-sm text-purple-950 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-purple-500" />
          {t.moodCalendarTitle}
        </h4>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={onPrevMonth}
            className="p-1 hover:bg-purple-50 rounded-lg text-slate-400 hover:text-purple-700 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-purple-800 min-w-[75px] text-center">
            {language === "ko" 
              ? `${currentYear}년 ${currentMonth + 1}월` 
              : `${new Date(currentYear, currentMonth).toLocaleString("en", { month: "short" })} ${currentYear}`}
          </span>
          <button 
            onClick={onNextMonth}
            className="p-1 hover:bg-purple-50 rounded-lg text-slate-400 hover:text-purple-700 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day of Week Labels */}
      <div className="grid grid-cols-7 text-center text-xs font-black text-slate-400 mb-2">
        <div className="text-rose-500">{t.calendarDays[0]}</div>
        <div>{t.calendarDays[1]}</div>
        <div>{t.calendarDays[2]}</div>
        <div>{t.calendarDays[3]}</div>
        <div>{t.calendarDays[4]}</div>
        <div>{t.calendarDays[5]}</div>
        <div className="text-indigo-500">{t.calendarDays[6]}</div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-9.5"></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const formattedMonth = (currentMonth + 1).toString().padStart(2, "0");
          const formattedDay = dayNum.toString().padStart(2, "0");
          const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
          const log = getLogForDate(dateStr);
          const today = new Date();
          const isToday = currentYear === today.getFullYear() && currentMonth === today.getMonth() && dayNum === today.getDate();

          return (
            <button
              key={`day-${dayNum}`}
              onClick={() => onCellClick(dayNum)}
              className={`h-9.5 flex flex-col items-center justify-center rounded-xl transition duration-150 relative cursor-pointer group hover:bg-purple-100/50 ${
                isToday ? "border-2 border-[#A855F7] bg-[#F3E8FF] shadow-2xs" : "bg-purple-50/40 border border-purple-100/50"
              }`}
            >
              <span className={`text-[10px] font-black ${
                isToday ? "text-[#6B21A8]" : "text-slate-600"
              }`}>
                {dayNum}
              </span>
              
              {log ? (
                <span className="text-base leading-none mt-0.5">{EMOTICONS[log.emoticon].emoji}</span>
              ) : (
                <Plus className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition duration-150 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between w-full">
        <button
          onClick={() => onCellClick(new Date().getDate())}
          className="text-xs text-purple-600 hover:text-purple-800 font-extrabold flex items-center gap-1.5 transition cursor-pointer text-left"
        >
          {t.calendarFooterHint}
        </button>
      </div>
    </div>
  );
};
