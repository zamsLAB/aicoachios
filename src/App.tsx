import React, { useState, useEffect, useRef } from "react";
import { Battery, Heart, User, Calendar } from "lucide-react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { UserProfile, DiaryLog, CoachingResponse, EmoticonType, MatchingTarget } from "./types";
import { calculateBiorhythm } from "./utils/biorhythm";
import { analyzeMatching } from "./utils/matching";
import { getCoachingTags, getBatteryRecommendations } from "./utils/coachingHelper";
import { isCrisisKeyword } from "./utils/recommendations";
import { Language, translations, formatTodayBadge } from "./utils/i18n";
import { useAdPlayer } from "./hooks/useAdPlayer";
import { useNotificationScheduler } from "./hooks/useNotificationScheduler";
import { MatchingSection } from "./components/MatchingSection";
import { ProfileSection } from "./components/ProfileSection";
import { CoachingSection } from "./components/CoachingSection";
import { TermsModal } from "./components/TermsModal";
import { PrivacyModal } from "./components/PrivacyModal";
import { LoginSection } from "./components/LoginSection";
import { OnboardingSection } from "./components/OnboardingSection";
import { EmojiRecordModal } from "./components/EmojiRecordModal";
import { ResetConfirmModal } from "./components/ResetConfirmModal";
import { AnalyticsEvents } from "./utils/analytics";
import { requestNotificationPermission, sendPushNotification } from "./utils/notification";
import { getApiBaseUrl, apiFetch } from "./utils/apiConfig";
import { generateSmartCoaching } from "./utils/coachingEngine";
import { getTodayStr, getTodayKoreanStr } from "./utils/date";
import robotAppIcon from "./assets/images/app_icon_robot_1785405143321.jpg";

export default function App() {
  // Session / Profile states
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // App Language ("ko" | "en")
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("coaching_app_language");
    return (saved === "en" || saved === "ko") ? saved : "ko";
  });

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("coaching_app_language", lang);
    showToast(translations[lang].toastLanguageSwitched);
  };
  
  // Terms & Privacy Policy Modals for App Store compliance
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  
  // Onboarding Form States
  const [formName, setFormName] = useState<string>("");
  const [formYear, setFormYear] = useState<string>("2010");
  const [formMonth, setFormMonth] = useState<string>("1");
  const [formDay, setFormDay] = useState<string>("1");
  const [formHour, setFormHour] = useState<string>("모름");
  const [formGender, setFormGender] = useState<"여자" | "남자">("여자");
  const [formProfilePic, setFormProfilePic] = useState<string>("");

  // App tabs / Navigation: "coaching" | "matching" | "profile"
  type TabName = "coaching" | "matching" | "profile";
  const [activeTab, setActiveTab] = useState<TabName>("coaching");
  const [tabHistory, setTabHistory] = useState<TabName[]>([]);
  const lastBackPressRef = useRef<number>(0);

  const navigateToTab = (nextTab: TabName) => {
    if (nextTab === activeTab) return;
    setTabHistory((prev) => [...prev, activeTab]);
    setActiveTab(nextTab);
  };

  const handleAppBack = () => {
    if (isTermsModalOpen) {
      setIsTermsModalOpen(false);
      return;
    }
    if (isPrivacyModalOpen) {
      setIsPrivacyModalOpen(false);
      return;
    }
    if (isResetModalOpen) {
      setIsResetModalOpen(false);
      return;
    }
    if (isEmojiModalOpen) {
      setIsEmojiModalOpen(false);
      return;
    }
    if (isAddMatchOpen) {
      setIsAddMatchOpen(false);
      return;
    }

    if (tabHistory.length > 0) {
      const previousTab = tabHistory[tabHistory.length - 1];
      setTabHistory((prev) => prev.slice(0, -1));
      setActiveTab(previousTab);
      return;
    }

    const now = Date.now();
    if (now - lastBackPressRef.current < 2000) {
      try {
        CapacitorApp.minimizeApp();
      } catch (error) {
        console.warn("Minimize app failed:", error);
      }
      return;
    }

    lastBackPressRef.current = now;
    showToast(language === "en" ? "Press again to move the app to the background" : "한번 더 누르면 앱이 백그라운드로 이동합니다");
  };

  // Coaching Action States
  const [todayMood, setTodayMood] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [coachingResult, setCoachingResult] = useState<CoachingResponse | null>(null);

  // Diary Logs State
  const [diaryLogs, setDiaryLogs] = useState<DiaryLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(""); // YYYY-MM-DD
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState<boolean>(false);
  const [tempNote, setTempNote] = useState<string>("");

  // Matching Compatibility States
  const [matchingTargets, setMatchingTargets] = useState<MatchingTarget[]>([]);
  const [activeMatchingTargetId, setActiveMatchingTargetId] = useState<string | null>(null);
  const [matchName, setMatchName] = useState<string>("");
  const [matchYear, setMatchYear] = useState<string>("2000");
  const [matchMonth, setMatchMonth] = useState<string>("01");
  const [matchDay, setMatchDay] = useState<string>("01");
  const [matchRelation, setMatchRelation] = useState<string>("");
  const [matchPhoto, setMatchPhoto] = useState<string>("");
  const [isAddMatchOpen, setIsAddMatchOpen] = useState<boolean>(false);

  // Calendar navigation
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(6); // 0-indexed (6 is July)

  // Points state for rewarded ads and matching
  const [userPoints, setUserPoints] = useState<number>(0);
  const [unlockedTargets, setUnlockedTargets] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Match cache & loading states
  const [cachedMatchResults, setCachedMatchResults] = useState<Record<string, any>>({});
  const [isMatchingLoading, setIsMatchingLoading] = useState<boolean>(false);

  // Keyboard visibility detection for mobile devices (hides bottom dock when typing)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // ATT authorization (if using external plugins for it or just let iOS handle it)
    // Unity Ads initialization happens on Native side now (AppDelegate / MainActivity)
  }, []);

  useEffect(() => {
    const backButtonSubscription = CapacitorApp.addListener("backButton", () => {
      handleAppBack();
    });

    return () => {
      backButtonSubscription.then((subscription) => subscription.remove());
    };
  }, [activeTab, tabHistory, isTermsModalOpen, isPrivacyModalOpen, isResetModalOpen, isEmojiModalOpen, isAddMatchOpen, language]);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        setIsKeyboardVisible(true);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const activeEl = document.activeElement as HTMLElement | null;
        if (!activeEl || (activeEl.tagName !== "INPUT" && activeEl.tagName !== "TEXTAREA" && !activeEl.isContentEditable)) {
          setIsKeyboardVisible(false);
        }
      }, 150);
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    const handleViewportResize = () => {
      if (window.visualViewport) {
        const isShrunk = window.visualViewport.height < window.innerHeight * 0.78;
        if (isShrunk) {
          setIsKeyboardVisible(true);
        } else {
          const activeEl = document.activeElement as HTMLElement | null;
          if (!activeEl || (activeEl.tagName !== "INPUT" && activeEl.tagName !== "TEXTAREA" && !activeEl.isContentEditable)) {
            setIsKeyboardVisible(false);
          }
        }
      }
    };

    window.visualViewport?.addEventListener("resize", handleViewportResize);

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
      window.visualViewport?.removeEventListener("resize", handleViewportResize);
    };
  }, []);

  // Load initial data from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("coaching_user_profile");

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed && parsed.name && !parsed.isGuest) {
          setUserProfile(parsed);
          setIsLoggedIn(true);
        } else {
          setUserProfile(null);
          setIsLoggedIn(false);
        }
      } catch (e) {
        setUserProfile(null);
        setIsLoggedIn(false);
      }
    } else {
      setUserProfile(null);
      setIsLoggedIn(false);
    }

    const savedLogs = localStorage.getItem("coaching_diary_logs");
    if (savedLogs) {
      try { setDiaryLogs(JSON.parse(savedLogs)); } catch (e) {}
    }

    const savedTargets = localStorage.getItem("coaching_matching_targets");
    if (savedTargets) {
      try { setMatchingTargets(JSON.parse(savedTargets)); } catch (e) {}
    }

    const savedPoints = localStorage.getItem("coaching_user_points");
    if (savedPoints !== null) {
      setUserPoints(parseInt(savedPoints) || 0);
    } else {
      setUserPoints(0);
    }

    const savedUnlocked = localStorage.getItem("coaching_unlocked_targets");
    if (savedUnlocked) {
      try { setUnlockedTargets(JSON.parse(savedUnlocked)); } catch (e) {}
    }
    const savedCache = localStorage.getItem("coaching_match_results_cache");
    if (savedCache) {
      try { setCachedMatchResults(JSON.parse(savedCache)); } catch (e) {}
    }

    // Check if user visited /privacy or /terms directly
    if (window.location.pathname.includes("privacy") || window.location.search.includes("privacy")) {
      setIsPrivacyModalOpen(true);
    } else if (window.location.pathname.includes("terms") || window.location.search.includes("terms")) {
      setIsTermsModalOpen(true);
    }

    // Ask notification permission on startup (Android 13+ POST_NOTIFICATIONS dialog & Web)
    const askNotificationPermission = async () => {
      try {
        await requestNotificationPermission();
      } catch (err) {
        console.warn("Initial notification permission check failed:", err);
      }
    };
    askNotificationPermission();

    // Set calendar to current local time month
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  }, []);

  // Ensure native Unity banner is shown/hidden based on sign-in profile.
  useEffect(() => {
    const win = window as any;
    const shouldShow = isLoggedIn && !!userProfile;
    const isNative = win?.Capacitor?.isNativePlatform?.();

    if (isNative) {
      if (shouldShow) {
        if (win.UnityAdsBridge?.showBannerAd) {
          win.UnityAdsBridge.showBannerAd();
        } else if (win.webkit?.messageHandlers?.showBannerAd) {
          win.webkit.messageHandlers.showBannerAd.postMessage(null);
        }
      } else {
        if (win.UnityAdsBridge?.hideBannerAd) {
          win.UnityAdsBridge.hideBannerAd();
        } else if (win.webkit?.messageHandlers?.hideBannerAd) {
          win.webkit.messageHandlers.hideBannerAd.postMessage(null);
        }
      }
    }
  }, [isLoggedIn, userProfile]);

  // Show customized toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Notification Scheduler Custom Hook
  useNotificationScheduler({
    userProfile: userProfile || { name: "사용자", birthdate: "2010-01-01", birthTime: "모름" },
    showToast,
  });

  // Sync logs with localStorage whenever they change
  const saveLogs = (updatedLogs: DiaryLog[]) => {
    setDiaryLogs(updatedLogs);
    localStorage.setItem("coaching_diary_logs", JSON.stringify(updatedLogs));
  };

  // Sync today's mood input with calendar's diary log of today
  const handleTodayMoodChange = (val: string) => {
    setTodayMood(val);
    const todayStr = getTodayStr();
    const existingIndex = diaryLogs.findIndex(l => l.date === todayStr);
    let updatedLogs = [...diaryLogs];
    if (existingIndex > -1) {
      updatedLogs[existingIndex] = {
        ...updatedLogs[existingIndex],
        note: val
      };
    } else {
      updatedLogs.push({
        date: todayStr,
        emoticon: "NEUTRAL",
        note: val
      });
    }
    saveLogs(updatedLogs);
  };

  // Sync matching targets with localStorage
  const saveMatchingTargets = (updatedTargets: MatchingTarget[]) => {
    setMatchingTargets(updatedTargets);
    localStorage.setItem("coaching_matching_targets", JSON.stringify(updatedTargets));
  };

  // Helper to save point value
  const updatePoints = (pts: number) => {
    setUserPoints(pts);
    localStorage.setItem("coaching_user_points", pts.toString());
  };

  // Apple sign in handlers - directly proceed to Basic Info Onboarding screen
  const handleAppleLogin = () => {
    // Check if profile exists for this account
    const savedProfileStr = localStorage.getItem("coaching_user_profile");
    let existingProfile = null;
    if (savedProfileStr) {
      try {
        existingProfile = JSON.parse(savedProfileStr);
      } catch (e) {}
    }

    if (existingProfile && existingProfile.name && !existingProfile.isGuest) {
      setUserProfile(existingProfile);
    } else {
      setUserProfile({
        name: "",
        birthdate: "2010-01-01",
        birthTime: "모름",
        gender: "여자"
      });
      setFormName("");
    }

    setIsLoggedIn(true);
    AnalyticsEvents.SYNC_ACCOUNT("apple");

    // Grant 100 points ONLY on the very first initial signup
    const hasClaimedWelcome = localStorage.getItem("coaching_welcome_points_claimed") === "true";
    if (!hasClaimedWelcome) {
      setUserPoints(100);
      localStorage.setItem("coaching_user_points", "100");
      localStorage.setItem("coaching_welcome_points_claimed", "true");
      showToast(
        language === "en"
          ? `Apple Login Success! +100P welcome bonus 🪙`
          : `Apple 로그인 완료! 환영 보너스 100P 적립 🪙`
      );
    } else {
      const savedPts = localStorage.getItem("coaching_user_points");
      const currentPts = savedPts !== null ? parseInt(savedPts) : 0;
      setUserPoints(currentPts);
    }

    if ("Notification" in window && Notification.permission === "default") {
      requestNotificationPermission().then((permission) => {
        if (permission === "granted") {
          sendPushNotification("AI 데일리 코칭 🤖", "알림 권한 승인 완료! 매일 맞춤 코칭이 발송됩니다 ☀️");
          showToast("알림 권한 승인 완료! ⏰");
        }
      });
    }
  };

  // Submit onboarding basic details
  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetName = formName.trim();
    if (!targetName) {
      showToast(language === "en" ? "Please enter your name/nickname! (Max 8 letters)" : "이름(닉네임)을 입력해주세요! (최대 8자)");
      return;
    }
    if (targetName.length > 8) {
      showToast(language === "en" ? "Name or nickname can be up to 8 characters!" : "이름 또는 닉네임은 8글자까지만 가능해요!");
      return;
    }
    const formattedMonth = formMonth.padStart(2, "0");
    const formattedDay = formDay.padStart(2, "0");
    const birthdate = `${formYear}-${formattedMonth}-${formattedDay}`;

    const profile: UserProfile = {
      name: targetName,
      birthdate,
      birthTime: formHour,
      gender: formGender,
      profilePic: formProfilePic
    };

    const executeSave = () => {
      localStorage.setItem("coaching_user_profile", JSON.stringify(profile));
      setUserProfile(profile);
      setIsLoggedIn(true);
      setActiveTab("coaching");

      // Grant 100 points ONLY if welcome points were never claimed
      const hasClaimedWelcome = localStorage.getItem("coaching_welcome_points_claimed") === "true";
      if (!hasClaimedWelcome) {
        setUserPoints(100);
        localStorage.setItem("coaching_user_points", "100");
        localStorage.setItem("coaching_welcome_points_claimed", "true");
        showToast(
          language === "en"
            ? `Welcome, ${targetName}! 100P welcome bonus 🪙`
            : `반가워요, ${targetName}님! 100P 적립 🪙`
        );
      } else {
        const savedPts = localStorage.getItem("coaching_user_points");
        const currentPts = savedPts !== null ? parseInt(savedPts) : 0;
        setUserPoints(currentPts);
        showToast(
          language === "en"
            ? `Welcome, ${targetName}! ✨`
            : `반가워요, ${targetName}님! ✨`
        );
      }
    };

    executeSave();
  };

  // Hard Reset: Clean wipe all app state, storages, caches and caches
  const handleConfirmReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    if (typeof window !== "undefined" && "caches" in window) {
      try {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      } catch (e) {}
    }

    setUserProfile(null);
    setIsLoggedIn(false);
    setUserPoints(0);
    setTodayMood("");
    setCoachingResult(null);
    setDiaryLogs([]);
    setMatchingTargets([]);
    setActiveMatchingTargetId(null);
    setCachedMatchResults({});
    setUnlockedTargets([]);
    setFormName("");
    setFormYear("2010");
    setFormMonth("1");
    setFormDay("1");
    setFormHour("모름");
    setFormGender("여자");
    setFormProfilePic("");
    setActiveTab("coaching");

    showToast(
      language === "en"
        ? "All data have been completely deleted."
        : "모든 데이터와 기록이 삭제되었습니다."
    );
  };

  // Update Profile fields (e.g., notification settings)
  const handleUpdateProfile = (updatedFields: Partial<UserProfile>) => {
    if (!userProfile) return;
    const newProfile = { ...userProfile, ...updatedFields };
    setUserProfile(newProfile);
    localStorage.setItem("coaching_user_profile", JSON.stringify(newProfile));
  };

  const handleAddMatchingTarget = () => {
    if (!matchName.trim()) {
      showToast("상대방 이름을 입력해주세요 ✏️");
      return;
    }
    if (!matchRelation.trim()) {
      showToast("나와의 관계를 입력해주세요 💕");
      return;
    }

    const formattedMonth = matchMonth.padStart(2, "0");
    const formattedDay = matchDay.padStart(2, "0");
    const birthdate = `${matchYear}-${formattedMonth}-${formattedDay}`;

    const newTarget: MatchingTarget = {
      id: Date.now().toString(),
      name: matchName.trim(),
      birthdate,
      birthTime: "모름",
      relationType: matchRelation.trim(),
      photo: matchPhoto
    };

    const executeAdd = () => {
      const updated = [...matchingTargets, newTarget];
      saveMatchingTargets(updated);
      setActiveMatchingTargetId(null);
      setIsAddMatchOpen(false);
      setMatchName("");
      setMatchRelation("");
      setMatchYear("2000");
      setMatchMonth("01");
      setMatchDay("01");
      setMatchPhoto("");
      showToast("새로운 인연이 추가되었습니다 🌟");
    };

    executeAdd();
  };

  const handleDeleteMatchingTarget = (id: string, name: string) => {
    if (confirm(`${name}님을 삭제할까요?`)) {
      const updated = matchingTargets.filter(t => t.id !== id);
      saveMatchingTargets(updated);
      if (activeMatchingTargetId === id) setActiveMatchingTargetId(null);
    }
  };

  // Check Match target deducting 100p only if not already unlocked for today
  const handleCheckMatch = async (targetId: string) => {
    const target = matchingTargets.find(t => t.id === targetId);
    if (!target || !userProfile) return;

    const todayStr = getTodayStr();
    const unlockKey = `${targetId}_${todayStr}`;

    const alreadyUnlocked = unlockedTargets.includes(unlockKey);

    // If already unlocked and result exists in cache, toggle open/close with 0 points
    if (alreadyUnlocked) {
      setActiveMatchingTargetId(activeMatchingTargetId === targetId ? null : targetId);
      if (cachedMatchResults[unlockKey] || cachedMatchResults[targetId]) {
        return;
      }
    }

    if (!alreadyUnlocked && userPoints < 100) {
      showToast("포인트 보상형 광고가 시작됩니다! 📺");
      startAdPlayer("rewarded_points", () => {
        handleCheckMatch(targetId);
      });
      return;
    }

    setIsMatchingLoading(true);
    setActiveMatchingTargetId(targetId);

    const todayLog = diaryLogs.find(l => l.date === todayStr);
    const activeBattery = coachingResult ? coachingResult.conditionBattery : (todayLog?.battery || 70);

    try {
      // 1. Point deduction ONLY if unlocking new target for today
      if (!alreadyUnlocked) {
        const newPoints = Math.max(0, userPoints - 100);
        updatePoints(newPoints);

        const updatedUnlocked = Array.from(new Set([...unlockedTargets, unlockKey]));
        setUnlockedTargets(updatedUnlocked);
        localStorage.setItem("coaching_unlocked_targets", JSON.stringify(updatedUnlocked));
        showToast("오늘의 매칭을 분석합니다! 🤖");
      }

      // Add minimum delay for smooth loading animation
      const minDelayPromise = new Promise(resolve => setTimeout(resolve, 5000));

      // 2. Priority: API Call
      let apiResult: any = null;
      try {
        const response = await apiFetch("/api/matching", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: userProfile.name,
            userBirthdate: userProfile.birthdate,
            userGender: userProfile.gender || "여자",
            targetName: target.name,
            targetBirthdate: target.birthdate,
            relationType: target.relationType,
            userBattery: activeBattery,
            language
          })
        }, 5000);

        if (response.ok) {
          const data = await response.json();
          if (data && typeof data.score === "number" && data.coachingMessage) {
            apiResult = data;
          }
        }
      } catch (e) {
        console.warn("API request failed, fallback to script analyzer:", e);
      }

      await minDelayPromise;

      // 3. Fallback: Local script analyzer if API failed or returned invalid data
      const finalResult = apiResult || analyzeMatching(
        userProfile.name,
        userProfile.birthdate || "2010-01-01",
        userProfile.gender || "여자",
        target.name,
        target.birthdate,
        target.relationType,
        activeBattery,
        language
      );

      AnalyticsEvents.MATCHING_TEST(userProfile.name, target.name, finalResult.score);

      const updatedCache = {
        ...cachedMatchResults,
        [unlockKey]: finalResult,
        [targetId]: finalResult
      };
      setCachedMatchResults(updatedCache);
      localStorage.setItem("coaching_match_results_cache", JSON.stringify(updatedCache));
    } catch (err) {
      console.error("Error during matching check:", err);
      const fallbackResult = analyzeMatching(
        userProfile.name,
        userProfile.birthdate || "2010-01-01",
        userProfile.gender || "여자",
        target.name,
        target.birthdate,
        target.relationType,
        activeBattery,
        language
      );
      const updatedCache = {
        ...cachedMatchResults,
        [unlockKey]: fallbackResult,
        [targetId]: fallbackResult
      };
      setCachedMatchResults(updatedCache);
      localStorage.setItem("coaching_match_results_cache", JSON.stringify(updatedCache));
    } finally {
      setIsMatchingLoading(false);
    }
  };

  // Internal AI coaching analysis execution
  const runCoachingAnalysis = async () => {
    setIsLoading(true);
    setCoachingResult(null);

    await new Promise(resolve => setTimeout(resolve, 400));

    const todayStr = getTodayStr(); // System reference local date
    const todayLog = diaryLogs.find(l => l.date === todayStr);
    const todayEmoticon = todayLog ? todayLog.emoticon : null;

    let coachingData = generateSmartCoaching({
      name: userProfile?.name,
      birthdate: userProfile?.birthdate,
      birthTime: userProfile?.birthTime,
      gender: userProfile?.gender || "여자",
      todayMood,
      todayEmoticon,
      history: diaryLogs,
      language
    });

    try {
      setCoachingResult(coachingData);
      AnalyticsEvents.CONDITION_CHECK_COMPLETE(coachingData.conditionBattery, coachingData.isCrisis ? 'crisis' : 'normal');

      let emoticon: EmoticonType = todayEmoticon || "NEUTRAL";
      
      // Smart map battery to emoticon if they haven't manually logged today yet
      if (!todayEmoticon) {
        if (coachingData.isCrisis) emoticon = "CRYING";
        else if (coachingData.conditionBattery >= 81) emoticon = "VERY_HAPPY";
        else if (coachingData.conditionBattery >= 61) emoticon = "HAPPY";
        else if (coachingData.conditionBattery >= 41) emoticon = "NEUTRAL";
        else if (coachingData.conditionBattery >= 25) emoticon = "SAD";
        else emoticon = "CRYING";
      }

      const existingIndex = diaryLogs.findIndex(l => l.date === todayStr);
      let updatedLogs = [...diaryLogs];
      if (existingIndex > -1) {
        updatedLogs[existingIndex] = {
          ...updatedLogs[existingIndex],
          emoticon,
          note: todayMood,
          battery: coachingData.conditionBattery // Save the battery score!
        };
      } else {
        updatedLogs.push({
          date: todayStr,
          emoticon,
          note: todayMood,
          battery: coachingData.conditionBattery // Save the battery score!
        });
      }
      saveLogs(updatedLogs);
    } finally {
      setIsLoading(false);
    }
  };

  // Ad Player Custom Hook
  const {
    isWatchingAd,
    adCountdown,
    adPurpose,
    adKind,
    startAdPlayer,
    handleWatchRewardedAd,
    handleShowInterstitial,
  } = useAdPlayer({
    userPoints,
    updatePoints,
    showToast,
    runCoachingAnalysis,
  });

  // Request AI Coaching - Triggers Interstitial Ad (전면 광고)
  const handleCoachingRequest = async () => {
    if (!todayMood.trim()) {
      showToast("오늘 기분을 한 단어라도 입력해주세요 ✏️");
      return;
    }
    startAdPlayer("interstitial_coaching");
  };

  // Calendar math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getLogForDate = (dateStr: string) => {
    return diaryLogs.find(log => log.date === dateStr);
  };

  // Open emoji recording modal for a cell
  const handleCellClick = (dayNum: number) => {
    const formattedMonth = (currentMonth + 1).toString().padStart(2, "0");
    const formattedDay = dayNum.toString().padStart(2, "0");
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    setSelectedDate(dateStr);
    
    const existingLog = getLogForDate(dateStr);
    setTempNote(existingLog?.note || "");
    setIsEmojiModalOpen(true);
  };

  // Save emoji record
  const handleSaveEmoji = (type: EmoticonType) => {
    const existingIndex = diaryLogs.findIndex(l => l.date === selectedDate);
    let updatedLogs = [...diaryLogs];

    if (existingIndex > -1) {
      updatedLogs[existingIndex] = {
        ...updatedLogs[existingIndex],
        emoticon: type,
        note: tempNote
      };
    } else {
      updatedLogs.push({
        date: selectedDate,
        emoticon: type,
        note: tempNote
      });
    }

    saveLogs(updatedLogs);
    if (selectedDate === getTodayStr()) {
      setTodayMood(tempNote);
    }
    setIsEmojiModalOpen(false);
  };

  // Clear emoji record
  const handleClearEmoji = () => {
    const updatedLogs = diaryLogs.filter(l => l.date !== selectedDate);
    saveLogs(updatedLogs);
    if (selectedDate === getTodayStr()) {
      setTodayMood("");
    }
    setIsEmojiModalOpen(false);
  };

  return (
    <div className="app-shell flex items-center justify-center p-0 md:p-6 bg-[#F3EEFB] font-sans text-slate-800">
      {/* App Shell Container - Optimized for Mobile & Desktop Preview with soft pastel theme */}
      <div className="w-full max-w-[430px] h-full md:h-[860px] bg-[#FAF8FF] md:rounded-[40px] shadow-xl flex flex-col overflow-hidden relative border-0 md:border-[8px] border-white/90 text-slate-800">
        
        {/* Decorative Cosmic Space Background Layer for Login */}
        {!isLoggedIn && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-br from-[#120b24] via-[#1a103c] to-[#080410]">
            <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full star opacity-80 shadow-[0_0_8px_#fff]"></div>
            <div className="absolute top-28 right-16 w-1.5 h-1.5 bg-pink-300 rounded-full star opacity-90 delay-1000 shadow-[0_0_6px_#fca5a5]"></div>
            <div className="absolute bottom-40 left-16 w-2 h-2 bg-indigo-300 rounded-full star opacity-75 delay-75 shadow-[0_0_10px_#818cf8]"></div>
            <div className="absolute top-1/2 right-12 w-1 h-1 bg-purple-200 rounded-full star opacity-60 delay-500"></div>
            <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-yellow-100 rounded-full star opacity-80 delay-1500 shadow-[0_0_8px_#fef08a]"></div>
          </div>
        )}

        {/* 1. LOGIN SCREEN */}
        {!isLoggedIn && (
          <LoginSection
            language={language}
            onSelectLanguage={handleSelectLanguage}
            onAppleLogin={handleAppleLogin}
            onOpenTerms={() => setIsTermsModalOpen(true)}
            onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
          />
        )}

        {/* 2. ONBOARDING FORM SCREEN (Basic Info Input) */}
        {isLoggedIn && userProfile && !userProfile.name && (
          <OnboardingSection
            language={language}
            isLoggedIn={isLoggedIn}
            formName={formName}
            setFormName={setFormName}
            formGender={formGender}
            setFormGender={setFormGender}
            formYear={formYear}
            setFormYear={setFormYear}
            formMonth={formMonth}
            setFormMonth={setFormMonth}
            formDay={formDay}
            setFormDay={setFormDay}
            formHour={formHour}
            setFormHour={setFormHour}
            formProfilePic={formProfilePic}
            setFormProfilePic={setFormProfilePic}
            onSubmit={handleOnboardingSubmit}
          />
        )}

        {/* 3. MAIN WORKSPACE */}
        {isLoggedIn && userProfile && userProfile.name && (
          <div className="flex-1 flex flex-col bg-purple-50/30 overflow-hidden relative text-slate-800">
            
            {/* Immersive Header */}
            <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-purple-100 flex-shrink-0 gap-2 shadow-xs">
              {/* Left: Profile & Name */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {userProfile.profilePic ? (
                  <img 
                    src={userProfile.profilePic} 
                    alt="Profile" 
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-purple-200 shadow-2xs flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-purple-200 shadow-2xs flex-shrink-0 bg-purple-100 flex items-center justify-center">
                    <img
                      src={robotAppIcon}
                      alt="AI Coach"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-[13px] font-black text-purple-950 truncate block">{userProfile.name} 🍀</span>
                </div>
              </div>

              {/* Point Badge in the middle */}
              <div
                className="bg-[#FEF08A] border border-[#FACC15] text-[#713F12] text-xs font-black px-3 py-1.5 rounded-full shadow-2xs flex items-center gap-1 flex-shrink-0"
                title={language === "en" ? "Current points" : "보유 포인트"}
              >
                <span>🪙</span>
                <span className="truncate">{userPoints.toLocaleString()}P</span>
              </div>

              {/* Date Badge on the right */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("coaching");
                  const todayStr = getTodayStr();
                  setSelectedDate(todayStr);
                  setTempNote(getLogForDate(todayStr)?.note || "");
                  setIsEmojiModalOpen(true);
                }}
                className="flex items-center gap-1 bg-[#F3E8FF] border border-[#E9D5FF] text-[#6B21A8] text-[10px] font-black px-2.5 py-1 rounded-full shadow-2xs flex-shrink-0 transition active:scale-95 cursor-pointer hover:bg-[#EDE3FF]"
                title={language === "en" ? "Open today's mood diary" : "오늘의 기분 일기 열기"}
              >
                <Calendar className="w-3 h-3 text-[#7E22CE]" />
                <span>{formatTodayBadge(new Date(), language)}</span>
              </button>
            </header>

            {/* TAB CONTENT CONTAINER */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${!isKeyboardVisible ? "pb-32" : "pb-8"}`}>
              
              {/* TAB 1: 오늘의 하루 (Coaching) */}
              {activeTab === "coaching" && (
                <CoachingSection 
                  language={language}
                  userProfile={userProfile}
                  currentYear={currentYear}
                  currentMonth={currentMonth}
                  diaryLogs={diaryLogs}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onCellClick={handleCellClick}
                  getLogForDate={getLogForDate}
                  todayMood={todayMood}
                  setTodayMood={handleTodayMoodChange}
                  isLoading={isLoading}
                  coachingResult={coachingResult}
                  onCoachingRequest={handleCoachingRequest}
                  getCoachingTags={getCoachingTags}
                  calculateBiorhythm={(bdate) => calculateBiorhythm(bdate, new Date(), language)}
                  showToast={showToast}
                />
              )}

              {/* TAB 2: 매칭 입력 & 분석 (Matching) */}
              {activeTab === "matching" && (
                <MatchingSection
                  language={language}
                  matchingTargets={matchingTargets}
                  activeMatchingTargetId={activeMatchingTargetId}
                  userProfile={userProfile}
                  isAddMatchOpen={isAddMatchOpen}
                  setIsAddMatchOpen={setIsAddMatchOpen}
                  matchName={matchName}
                  setMatchName={setMatchName}
                  matchYear={matchYear}
                  setMatchYear={setMatchYear}
                  matchMonth={matchMonth}
                  setMatchMonth={setMatchMonth}
                  matchDay={matchDay}
                  setMatchDay={setMatchDay}
                  matchRelation={matchRelation}
                  setMatchRelation={setMatchRelation}
                  matchPhoto={matchPhoto}
                  setMatchPhoto={setMatchPhoto}
                  onAddTarget={handleAddMatchingTarget}
                  onDeleteTarget={handleDeleteMatchingTarget}
                  setActiveMatchingTargetId={setActiveMatchingTargetId}
                  onCheckMatch={handleCheckMatch}
                  unlockedTargets={unlockedTargets}
                  cachedMatchResults={cachedMatchResults}
                  isMatchingLoading={isMatchingLoading}
                  userBattery={coachingResult ? coachingResult.conditionBattery : 70}
                  showToast={showToast}
                />
              )}

              {/* TAB 3: 마이프로필 (Profile) */}
              {activeTab === "profile" && userProfile && (
                <ProfileSection
                  language={language}
                  userProfile={userProfile}
                  diaryLogsCount={diaryLogs.length}
                  onSelectLanguage={handleSelectLanguage}
                  onEditProfile={() => {
                    const proceedToEdit = () => {
                      setFormName(userProfile.name);
                      setFormProfilePic(userProfile.profilePic || "");
                      setUserProfile({
                        ...userProfile,
                        name: ""
                      });
                    };
                    startAdPlayer("interstitial_profile", proceedToEdit, true);
                  }}
                  onOpenResetModal={() => setIsResetModalOpen(true)}
                  onUpdateProfile={handleUpdateProfile}
                  showToast={showToast}
                  onOpenTerms={() => setIsTermsModalOpen(true)}
                  onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
                  onAddPoints={(pts) => {
                    const currentPts = parseInt(localStorage.getItem("coaching_user_points") || "0") || userPoints;
                    const newPts = currentPts + pts;
                    updatePoints(newPts);
                  }}
                  onWatchRewardedAd={handleWatchRewardedAd}
                />
              )}

            </div>

            {/* UNIFIED BOTTOM DOCK: Navigation tabs (Hidden when virtual keyboard / typing is active) */}
            {!isKeyboardVisible && (
              <div className="bottom-dock absolute bottom-0 left-0 right-0 z-40 flex flex-col bg-white/95 backdrop-blur-md border-t border-pink-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] animate-fadeIn">
                {/* FLOATING NAVIGATION BAR ('오늘코칭' / '인연매칭' / '나의 정보') */}
                <nav className="w-full h-15 flex items-center justify-around px-4">
                  <button 
                    onClick={() => navigateToTab("coaching")}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition cursor-pointer ${
                      activeTab === "coaching" ? "text-pink-500 font-black scale-105" : "text-slate-400 hover:text-pink-400"
                    }`}
                  >
                    <Battery className="w-5 h-5" />
                    <span className="text-[10px] font-black">{translations[language].tabCoaching}</span>
                  </button>

                  <button 
                    onClick={() => navigateToTab("matching")}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition cursor-pointer ${
                      activeTab === "matching" ? "text-pink-500 font-black scale-105" : "text-slate-400 hover:text-pink-400"
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                    <span className="text-[10px] font-black">{translations[language].tabMatching}</span>
                  </button>

                  <button 
                    onClick={() => navigateToTab("profile")}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition cursor-pointer ${
                      activeTab === "profile" ? "text-pink-500 font-black scale-105" : "text-slate-400 hover:text-pink-400"
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-black">{translations[language].tabProfile}</span>
                  </button>
                </nav>
              </div>
            )}

          </div>
        )}

        {/* 4. MODAL FOR CELL EMOJI RECORDING */}
        <EmojiRecordModal
          isOpen={isEmojiModalOpen}
          selectedDate={selectedDate}
          tempNote={tempNote}
          setTempNote={setTempNote}
          getLogForDate={getLogForDate}
          onSaveEmoji={handleSaveEmoji}
          onClearEmoji={handleClearEmoji}
          onClose={() => setIsEmojiModalOpen(false)}
        />

        {/* 5. HARD RESET CONFIRMATION MODAL */}
        <ResetConfirmModal
          isOpen={isResetModalOpen}
          language={language}
          onClose={() => setIsResetModalOpen(false)}
          onConfirmReset={handleConfirmReset}
        />

        {/* 6. IMMERSIVE AD PLAYER OVERLAY (Google Ads Integration - Ultra Clean & Borderless) */}
        {isWatchingAd && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black p-4 animate-fadeIn">
            <img
              src="/광고스크린샷.png"
              alt="광고스크린샷"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}

        {/* 8. FLOATING CUSTOM TOAST */}
        {toastMessage && (
          <div className="absolute bottom-20 left-4 right-4 z-[70] bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl border border-white/10 shadow-xl flex items-center gap-2.5 justify-center text-xs font-black animate-slideUp text-center leading-relaxed">
            <span>✨</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 9. TERMS OF SERVICE MODAL */}
        <TermsModal
          isOpen={isTermsModalOpen}
          onClose={() => setIsTermsModalOpen(false)}
        />

        {/* 10. PRIVACY POLICY MODAL */}
        <PrivacyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
        />

      </div>
    </div>
  );
}
