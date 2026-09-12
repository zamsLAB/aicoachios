import React from "react";
import { Language, translations } from "../utils/i18n";
import appIcon from "../assets/images/app_icon_robot_1785405143321.jpg";

interface LoginSectionProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onAppleLogin: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const LoginSection: React.FC<LoginSectionProps> = ({
  language,
  onSelectLanguage,
  onAppleLogin,
  onOpenTerms,
  onOpenPrivacy,
}) => {
  const t = translations[language];

  return (
    <div className="flex-1 flex flex-col justify-between p-8 pb-12 md:pb-16 relative z-10 text-white">
      {/* Background ambient stars/glowing dots */}
      <div className="absolute top-16 right-10 w-2 h-2 rounded-full bg-pink-300/60 blur-[1px] animate-pulse" />
      <div className="absolute bottom-28 right-6 w-1.5 h-1.5 rounded-full bg-purple-300/50 blur-[0.5px]" />
      <div className="absolute top-1/3 left-8 w-1 h-1 rounded-full bg-indigo-200/40" />

      {/* Top Header Bar with Language Switcher */}
      <div className="w-full flex justify-end items-center pt-1">
        <div className="inline-flex items-center p-1 rounded-full bg-black/25 border border-white/20 backdrop-blur-md shadow-sm">
          <button
            type="button"
            onClick={() => onSelectLanguage("ko")}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
              language === "ko"
                ? "bg-white text-purple-950 shadow-xs scale-102"
                : "text-purple-200 hover:text-white"
            }`}
          >
            🇰🇷 한국어
          </button>
          <button
            type="button"
            onClick={() => onSelectLanguage("en")}
            className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
              language === "en"
                ? "bg-white text-purple-950 shadow-xs scale-102"
                : "text-purple-200 hover:text-white"
            }`}
          >
            🇺🇸 English
          </button>
        </div>
      </div>

      {/* Main Title & Robot Icon Section */}
      <div className="flex-1 flex flex-col justify-center items-center text-center pt-2 space-y-4">
        {/* Cute glowing 3D app icon */}
        <div className="w-24 h-24 rounded-[30px] overflow-hidden shadow-2xl shadow-purple-900/80 border-2 border-white/30 transition-transform duration-300 hover:scale-105 active:scale-95 bg-purple-900/40">
          <img
            src={appIcon}
            alt="AI Daily Coaching App Icon"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Main Title - Cute Teen Font with Glowing Gradient */}
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-purple-100 font-diary">
          {t.appTitle}
        </h1>

        {/* Subtitle - Cute Teen Font */}
        <p className="text-purple-200/90 text-sm mt-1 leading-relaxed max-w-[280px] font-diary tracking-wide">
          {t.appSubtitle}
        </p>
      </div>

      {/* Buttons & Login Options */}
      <div className="space-y-2.5 mb-4">
        {/* Apple Sign-In for iOS */}
        <button
          onClick={onAppleLogin}
          className="w-full bg-white text-gray-800 h-13 rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-xl hover:bg-gray-50 active:scale-98 transition duration-200 cursor-pointer border border-gray-200/80 relative"
        >
          <svg className="w-4.5 h-4.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16.8 12.4c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.5 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.1 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 1.9-1 2.6-2 .8-1.2 1.1-2.4 1.1-2.5-.1-.1-2.1-.8-3.3-3.2zm-2.5-6.7c.6-.7 1-1.6.9-2.5-.8.1-1.9.5-2.5 1.2-.6.7-1.1 1.6-1 2.5.9.1 1.9-.4 2.6-1.2z" />
          </svg>
          <span className="text-sm font-semibold tracking-tight text-gray-800">{t.loginWithApple}</span>
          <span className="bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-2xs">
            +100P
          </span>
        </button>

        {/* Terms of Service & Privacy Policy Links */}
        <div className="pt-2 text-center space-y-1.5">
          <p className="text-[9px] text-purple-200/90 leading-normal px-2">
            {t.termsAgreementNote}
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-purple-200/90 font-medium">
            <button
              type="button"
              onClick={onOpenTerms}
              className="hover:text-white underline transition cursor-pointer"
            >
              {t.termsOfService}
            </button>
            <span>|</span>
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="hover:text-white underline transition cursor-pointer"
            >
              {t.privacyPolicy}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


