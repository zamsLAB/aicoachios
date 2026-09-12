import React from "react";
import { Language, translations } from "../utils/i18n";

interface OnboardingSectionProps {
  language: Language;
  isLoggedIn: boolean;
  formName: string;
  setFormName: (val: string) => void;
  formGender: "여자" | "남자";
  setFormGender: (val: "여자" | "남자") => void;
  formYear: string;
  setFormYear: (val: string) => void;
  formMonth: string;
  setFormMonth: (val: string) => void;
  formDay: string;
  setFormDay: (val: string) => void;
  formHour: string;
  setFormHour: (val: string) => void;
  formProfilePic: string;
  setFormProfilePic: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const OnboardingSection: React.FC<OnboardingSectionProps> = ({
  language,
  isLoggedIn,
  formName,
  setFormName,
  formGender,
  setFormGender,
  formYear,
  setFormYear,
  formMonth,
  setFormMonth,
  formDay,
  setFormDay,
  formHour,
  setFormHour,
  formProfilePic,
  setFormProfilePic,
  onSubmit,
}) => {
  const t = translations[language];

  return (
    <div className="flex-1 flex flex-col justify-between p-8 relative z-10 text-slate-800 overflow-y-auto">
      <div className="text-center pt-2">
        <span className="text-xs font-bold px-3.5 py-1.5 bg-pink-100 text-pink-600 rounded-full border border-pink-200 uppercase tracking-widest font-black">
          {t.onboardingTag}
        </span>
        <h2 className="text-3xl font-black mt-3 text-purple-900">{t.onboardingTitle}</h2>
      </div>

      <form onSubmit={onSubmit} className="my-5 space-y-4 flex-1 flex flex-col justify-center">
        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center justify-center mb-3">
          <div className="relative group">
            <input
              type="file"
              id="profile-pic-upload"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormProfilePic(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
            />
            <label
              htmlFor="profile-pic-upload"
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-100 to-pink-100 border-2 border-purple-200/60 flex flex-col items-center justify-center cursor-pointer overflow-hidden shadow-md hover:border-purple-400 hover:shadow-lg transition-all relative"
            >
              {formProfilePic ? (
                <img
                  src={formProfilePic}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-2 text-purple-400 group-hover:text-purple-600 transition-colors">
                  <span className="text-2xl mb-1">😎</span>
                  <span className="text-[10px] font-black leading-tight">{t.selectImage}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-extrabold gap-1">
                <span>{t.changeImage}</span>
              </div>
            </label>
          </div>
          {formProfilePic && (
            <button
              type="button"
              onClick={() => setFormProfilePic("")}
              className="text-[10px] font-bold text-rose-500 mt-2 hover:underline cursor-pointer"
            >
              {t.deleteImage}
            </button>
          )}
        </div>

        {/* Name input */}
        <div>
          <div className="flex justify-between items-center mb-2 pl-1">
            <label className="block text-sm font-black text-purple-700">
              {t.nameLabel}
            </label>
            <span className="text-[10px] font-bold text-slate-400">{formName.length}/8 ({t.nameLimitNote})</span>
          </div>
          <input 
            type="text" 
            value={formName}
            onChange={(e) => {
              if (e.target.value.length <= 8) {
                setFormName(e.target.value);
              }
            }}
            placeholder={t.namePlaceholder}
            maxLength={8}
            className="w-full h-12 rounded-2xl bg-white border border-purple-100 px-4 text-sm text-slate-800 focus:outline-none focus:border-purple-400 focus:bg-white transition-all placeholder-slate-400 font-bold shadow-sm"
          />
        </div>

        {/* Gender Choice */}
        <div>
          <label className="block text-sm font-black text-purple-700 mb-2 pl-1">
            {t.genderLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormGender("여자")}
              className={`h-12 rounded-2xl font-black text-sm border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                formGender === "여자"
                  ? "bg-pink-100/80 border-pink-300 text-pink-700 shadow-sm"
                  : "bg-white/80 border-purple-100 text-slate-500 hover:border-purple-200"
              }`}
            >
              {t.female}
            </button>
            <button
              type="button"
              onClick={() => setFormGender("남자")}
              className={`h-12 rounded-2xl font-black text-sm border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                formGender === "남자"
                  ? "bg-blue-100/80 border-blue-300 text-blue-700 shadow-sm"
                  : "bg-white/80 border-purple-100 text-slate-500 hover:border-purple-200"
              }`}
            >
              {t.male}
            </button>
          </div>
        </div>

        {/* Birthdate selects */}
        <div>
          <label className="block text-sm font-black text-purple-700 mb-2 pl-1">
            {t.birthdateLabel}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <select 
              value={formYear}
              onChange={(e) => setFormYear(e.target.value)}
              className="h-12 rounded-2xl bg-white border border-purple-100 px-3 text-sm text-slate-800 focus:outline-none focus:border-purple-400 transition font-bold cursor-pointer shadow-sm"
            >
              {Array.from({ length: 87 }, (_, i) => 2026 - i).map(year => (
                <option key={year} value={year} className="text-slate-800 bg-white">
                  {year}{language === "ko" ? "년" : ""}
                </option>
              ))}
            </select>

            <select 
              value={formMonth}
              onChange={(e) => setFormMonth(e.target.value)}
              className="h-12 rounded-2xl bg-white border border-purple-100 px-3 text-sm text-slate-800 focus:outline-none focus:border-purple-400 transition font-bold cursor-pointer shadow-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month} className="text-slate-800 bg-white">
                  {month}{language === "ko" ? "월" : " /"}
                </option>
              ))}
            </select>

            <select 
              value={formDay}
              onChange={(e) => setFormDay(e.target.value)}
              className="h-12 rounded-2xl bg-white border border-purple-100 px-3 text-sm text-slate-800 focus:outline-none focus:border-purple-400 transition font-bold cursor-pointer shadow-sm"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day} className="text-slate-800 bg-white">
                  {day}{language === "ko" ? "일" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Birth time select */}
        <div>
          <label className="block text-sm font-black text-purple-700 mb-2 pl-1">
            {t.birthTimeLabel}
          </label>
          <select 
            value={formHour}
            onChange={(e) => setFormHour(e.target.value)}
            className="w-full h-12 rounded-2xl bg-white border border-purple-100 px-4 text-sm text-slate-800 focus:outline-none focus:border-purple-400 transition font-bold cursor-pointer shadow-sm"
          >
            <option value="모름" className="text-slate-800 bg-white">{t.unknownTime}</option>
            {Array.from({ length: 24 }).map((_, hour) => (
              <option key={hour} value={`${hour}시`} className="text-slate-800 bg-white">
                {hour.toString().padStart(2, "0")}{language === "ko" ? "시" : ":00"}
              </option>
            ))}
          </select>
        </div>

        <button 
          type="submit"
          className="w-full h-14 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 rounded-2xl font-black text-base text-white shadow-md hover:shadow-purple-300/40 active:scale-98 transition duration-200 cursor-pointer mt-2"
        >
          {isLoggedIn ? (language === "en" ? "Start Today's Analysis! 🧸" : "오늘 분석 시작하기! 🧸") : (language === "en" ? "READY START! 🧸" : "READY START! 🧸")}
        </button>
      </form>

      <p className="text-[10px] text-purple-300 text-center font-bold">
        {language === "en" ? "Your information is securely processed on your device!" : "입력한 정보는 다른 곳에 전송되지 않아 안심해도 돼요!"}
      </p>
    </div>
  );
};
