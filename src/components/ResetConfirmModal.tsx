import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Language } from "../utils/i18n";

interface ResetConfirmModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  language,
  onClose,
  onConfirmReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-2xl border border-rose-100 space-y-5 relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {language === "en" ? "Reset All App Data?" : "앱 데이터 완전 초기화"}
            </h3>
            <p className="text-xs text-rose-600 font-bold mt-1">
              {language === "en"
                ? "This action cannot be undone."
                : "삭제된 데이터는 복구할 수 없습니다."}
            </p>
          </div>
        </div>

        {/* Details list */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 space-y-2 font-medium">
          <p className="font-bold text-slate-800">
            {language === "en" ? "The following will be completely deleted:" : "다음 데이터가 기기에서 완전히 삭제됩니다:"}
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11.5px] text-slate-600">
            <li>{language === "en" ? "My profile info (Nickname, Birthdate)" : "내 프로필 정보 (이름, 생년월일, 성별)"}</li>
            <li>{language === "en" ? "Mood calendar & diary logs" : "기분 달력 & 다이어리 기록"}</li>
            <li>{language === "en" ? "All saved matching partner profiles" : "등록된 인연 궁합 상대방 목록"}</li>
            <li>{language === "en" ? "Points & attendance check status" : "보유 포인트 및 출석 체크 기록"}</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
          >
            {language === "en" ? "Cancel" : "취소"}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-black shadow-md hover:from-rose-600 hover:to-red-700 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{language === "en" ? "Reset Everything" : "완전 삭제 및 초기화"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
