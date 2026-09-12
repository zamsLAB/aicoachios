import React from "react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-[80] flex items-center justify-center p-5 animate-fadeIn">
      <div className="w-full max-h-[80vh] bg-white rounded-3xl p-6 text-slate-800 shadow-2xl flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
            <span>🔒</span> 개인정보처리방침
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto text-xs text-slate-600 space-y-3 leading-relaxed pr-1">
          <p className="font-bold text-slate-800">1. 수집하는 개인정보 항목</p>
          <p>- Apple 계정 로그인 시: Apple 이메일 주소<br />- 서비스 이용 시: 생년월일, 태어난 시간(선택), 기분 일기 기록, 관계 분석 텍스트</p>

          <p className="font-bold text-slate-800">2. 개인정보의 수집 및 이용목적</p>
          <p>- 개인화된 AI 감정 코칭 및 바이오리듬 케미 분석 결과 생성<br />- 사용자 프로필 관리 및 일기 기록 저장 서비스 제공</p>

          <p className="font-bold text-slate-800">3. 개인정보의 보유 및 파기</p>
          <p>이용자의 개인정보는 서비스 이용 기간 동안 안전하게 보관되며, 회원 탈퇴 또는 서비스 초기화 시 지체 없이 파기됩니다.</p>

          <p className="font-bold text-slate-800">4. 제3자 제공 및 보안</p>
          <p>본 서비스는 법령에 특별한 규정이 있는 경우를 제외하고는 이용자의 개인정보를 제3자에게 제공하지 않습니다.</p>

          <p className="font-bold text-slate-800">5. 개인정보 보호책임자 연락처</p>
          <p>
            - 이메일: <span className="text-purple-600 font-bold select-all">zamslabinfo@gmail.com</span>

          </p>
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
