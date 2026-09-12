import React from "react";
import { EMOTICONS, EmoticonType, DiaryLog } from "../types";

interface EmojiRecordModalProps {
  isOpen: boolean;
  selectedDate: string;
  tempNote: string;
  setTempNote: (val: string) => void;
  onSaveEmoji: (type: EmoticonType) => void;
  onClearEmoji: () => void;
  onClose: () => void;
  getLogForDate: (dateStr: string) => DiaryLog | undefined;
}

export const EmojiRecordModal: React.FC<EmojiRecordModalProps> = ({
  isOpen,
  selectedDate,
  tempNote,
  setTempNote,
  onSaveEmoji,
  onClearEmoji,
  onClose,
  getLogForDate,
}) => {
  if (!isOpen) return null;

  const currentLog = getLogForDate(selectedDate);

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fadeIn">
      <div className="w-full bg-white rounded-[32px] p-6 text-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-black text-purple-700">📅 {selectedDate} 기분 일기</span>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Diary Note Input */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-400 pl-1">소소한 오늘 일기 한 줄</label>
          <input 
            type="text"
            value={tempNote}
            onChange={(e) => setTempNote(e.target.value)}
            placeholder="오늘 마라탕 먹고 행복했음!"
            className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-3.5 text-xs text-slate-800 focus:outline-none focus:border-purple-400 transition font-bold"
          />
        </div>

        {/* Emoji choices */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-slate-400 pl-1">상태 이모티콘 선택</label>
          <div className="grid grid-cols-3 gap-2.5">
            {Object.values(EMOTICONS).map((emo) => (
              <button
                key={emo.type}
                onClick={() => onSaveEmoji(emo.type)}
                className="flex items-center justify-center p-4 bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 rounded-2xl transition duration-150 cursor-pointer text-3xl leading-none"
              >
                {emo.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Recorded Battery Score Display */}
        <div className="bg-purple-50/50 rounded-2xl p-3.5 border border-purple-100/40 flex items-center justify-between">
          <span className="text-[10px] font-black text-purple-700 flex items-center gap-1.5">
            🔋 컨디션 배터리 점수
          </span>
          <span className="text-xs font-black text-slate-700">
            {currentLog?.battery !== undefined ? (
              <span className="flex items-center gap-1">
                <span className="text-purple-600 text-sm font-black">
                  {currentLog.battery}%
                </span>
                <span className="text-[10px] text-slate-400 font-bold">기록됨</span>
              </span>
            ) : (
              <span className="text-slate-400 text-[10px] font-bold">아직 분석 전이에요</span>
            )}
          </span>
        </div>

        {/* Delete / Clear button */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClearEmoji}
            className="flex-1 h-9 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-[10px] font-bold rounded-lg transition cursor-pointer"
          >
            기록 삭제하기
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg transition cursor-pointer"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
