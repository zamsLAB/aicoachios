import React from "react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-[80] flex items-center justify-center p-5 animate-fadeIn">
      <div className="w-full max-h-[80vh] bg-white rounded-3xl p-6 text-slate-800 shadow-2xl flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
            <span>📜</span> 서비스 이용약관
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto text-xs text-slate-600 space-y-3 leading-relaxed pr-1">
          <p className="font-bold text-slate-800">제 1 조 (목적)</p>
          <p>본 약관은 AI 데일리 코칭(이하 "서비스")이 제공하는 일기 및 AI 개인화 바이오리듬 분석 서비스를 이용함에 있어 이용자의 권리와 의무, 책임사항을 규정함을 목적으로 합니다.</p>
          
          <p className="font-bold text-slate-800">제 2 조 (용어의 정의)</p>
          <p>1. "이용자"란 본 약관에 동의하고 서비스를 이용하는 회원 및 게스트 사용자를 말합니다.<br />2. "포인트"란 서비스 내 코칭 분석 및 특수 기능을 이용하기 위해 지급되는 가상 자산을 의미합니다.</p>

          <p className="font-bold text-slate-800">제 3 조 (서비스의 제공 및 변경)</p>
          <p>서비스는 AI 모델 기반 감정 분석, 바이오리듬 매칭 및 일기 기록 기능을 제공하며, 기술적 필요에 따라 업데이트될 수 있습니다.</p>

          <p className="font-bold text-slate-800">제 4 조 (회원의 의무 및 보호)</p>
          <p>이용자는 타인의 명예를 훼손하거나 불법적인 목적으로 서비스를 이용하여서는 안 되며, 서비스는 관련 법령에 따라 이용자의 데이터를 안전하게 보호합니다.</p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer shadow-md"
          >
            확인 및 동의
          </button>
        </div>
      </div>
    </div>
  );
};
