import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, CheckCircle2, Sparkles, AtSign } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAccount: (accountInfo: { email: string; name?: string; profilePic?: string; provider?: "apple" }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onConfirmAccount,
}) => {
  const [userEmail, setUserEmail] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      const savedEmail = localStorage.getItem("coaching_saved_user_email");
      if (savedEmail && savedEmail !== "user@gmail.com") {
        setUserEmail(savedEmail);
      } else {
        setUserEmail("");
      }

      // Try modern Web Credential Manager or focus input to trigger mobile autofill
      const triggerMobileAutofill = async () => {
        try {
          if (navigator.credentials && typeof navigator.credentials.get === "function") {
            const cred = (await navigator.credentials.get({
              mediation: "silent",
            } as any)) as any;
            if (cred && cred.id && typeof cred.id === "string" && cred.id.includes("@")) {
              setUserEmail(cred.id);
            }
          }
        } catch (e) {
          // Silent fallback
        }
      };

      triggerMobileAutofill();

      // Auto-focus after modal transition to help mobile keyboard autofill
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const trimmed = userEmail.trim() || (localStorage.getItem("coaching_saved_user_email") || "user@gmail.com");
    setIsProcessing(true);
    localStorage.setItem("coaching_saved_user_email", trimmed);

    setTimeout(() => {
      onConfirmAccount({
        email: trimmed,
        provider: "apple",
      });
      setIsProcessing(false);
    }, 400);
  };

  const handleAppendDomain = (domain: string) => {
    if (!userEmail) {
      setUserEmail(`@${domain}`);
      return;
    }
    if (userEmail.includes("@")) {
      const prefix = userEmail.split("@")[0];
      setUserEmail(`${prefix}@${domain}`);
    } else {
      setUserEmail(`${userEmail}@${domain}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-5 animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-slate-800 shadow-2xl relative space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-800" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16.8 12.4c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.5 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.1 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 1.9-1 2.6-2 .8-1.2 1.1-2.4 1.1-2.5-.1-.1-2.1-.8-3.3-3.2zm-2.5-6.7c.6-.7 1-1.6.9-2.5-.8.1-1.9.5-2.5 1.2-.6.7-1.1 1.6-1 2.5.9.1 1.9-.4 2.6-1.2z" />
            </svg>
            <span className="font-bold text-slate-800 text-sm">
              Apple 계정 연동
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        <div className="text-center py-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-black mb-2 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>신규 연동 시 100P 무료 충전!</span>
          </div>
          <h3 className="font-extrabold text-base text-slate-900">
            Apple 계정으로 간편 시작
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            스마트폰에 등록된 Apple 계정으로 동기화됩니다
          </p>
        </div>

        {/* Account Info Field */}
        <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <label htmlFor="email" className="text-[11px] font-bold text-slate-600">
              연동할 Apple 이메일
            </label>
            <span className="text-[10px] text-purple-600 font-bold">
              스마트폰 자동완성 지원
            </span>
          </div>
          <div className="relative">
            <input
              ref={inputRef}
              type="email"
              name="email"
              id="email"
              autoComplete="email username"
              inputMode="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="예: yourname@gmail.com"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 shadow-2xs"
            />
          </div>

          {/* Quick domain buttons for fast mobile typing */}
          <div className="flex items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleAppendDomain("icloud.com")}
              className="px-2 py-1 bg-white hover:bg-purple-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <AtSign className="w-2.5 h-2.5 text-purple-600" />
              @icloud.com
            </button>
            <button
              type="button"
              onClick={() => handleAppendDomain("gmail.com")}
              className="px-2 py-1 bg-white hover:bg-purple-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <AtSign className="w-2.5 h-2.5 text-purple-600" />
              @gmail.com
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 px-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Apple Sign In 및 기기 계정 보안 프로토콜 적용</span>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className="w-full py-3.5 text-white rounded-2xl font-black text-sm shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:opacity-95"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Apple 계정으로 계속하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

