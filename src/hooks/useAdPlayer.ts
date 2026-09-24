import { useState } from "react";
import { AnalyticsEvents } from "../utils/analytics";

export type AdKind = "interstitial" | "rewarded";
export type AdPurpose =
  | "rewarded_points"       // +100P point charge
  | "rewarded_matching"     // Unlock / check match connection (+100P value)
  | "interstitial_coaching" // Today condition analysis
  | "interstitial_profile"  // Edit profile button click
  | null;

const showNativeUnityAd = (
  type: "rewarded" | "interstitial",
  onComplete: () => void,
  onError: (msg: string) => void
) => {
  const win = window as any;
  const isNative = win?.Capacitor?.isNativePlatform?.();
  
  if (isNative && (win.UnityAdsBridge || win.webkit?.messageHandlers)) {
    const completeEvent = type === "rewarded" ? "unityRewardCompleted" : "unityInterstitialCompleted";
    
    const handleComplete = () => {
      cleanup();
      onComplete();
    };
    
    const handleFail = (e: any) => {
      cleanup();
      onError(e.detail || "Unity Ad failed");
    };

    const cleanup = () => {
      window.removeEventListener(completeEvent, handleComplete);
      window.removeEventListener("unityAdFailed", handleFail);
    };

    window.addEventListener(completeEvent, handleComplete);
    window.addEventListener("unityAdFailed", handleFail);

    try {
      if (type === "rewarded") {
        if (win.UnityAdsBridge?.showRewardedAd) {
          win.UnityAdsBridge.showRewardedAd();
        } else if (win.webkit?.messageHandlers?.showRewardedAd) {
          win.webkit.messageHandlers.showRewardedAd.postMessage(null);
        } else {
          throw new Error("No rewarded ad bridge");
        }
      } else {
        if (win.UnityAdsBridge?.showInterstitialAd) {
          win.UnityAdsBridge.showInterstitialAd();
        } else if (win.webkit?.messageHandlers?.showInterstitialAd) {
          win.webkit.messageHandlers.showInterstitialAd.postMessage(null);
        } else {
          throw new Error("No interstitial ad bridge");
        }
      }
    } catch (err: any) {
      cleanup();
      onError(err.message || String(err));
    }
  } else {
    onError("No Native Unity Bridge");
  }
};

interface UseAdPlayerProps {
  userPoints: number;
  updatePoints: (pts: number) => void;
  showToast: (msg: string) => void;
  runCoachingAnalysis?: () => void;
}

export function useAdPlayer({ userPoints, updatePoints, showToast, runCoachingAnalysis }: UseAdPlayerProps) {
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [adCountdown, setAdCountdown] = useState<number>(3);
  const [adPurpose, setAdPurpose] = useState<AdPurpose>(null);
  const [adKind, setAdKind] = useState<AdKind>("interstitial");

  /**
   * Start either an Interstitial (3s) or Rewarded (15s) ad
   */
  const startAdPlayer = (purpose: NonNullable<AdPurpose>, callback?: () => void, immediateAction: boolean = false) => {
    const isRewarded = purpose === "rewarded_points" || purpose === "rewarded_matching";
    const kind: AdKind = isRewarded ? "rewarded" : "interstitial";
    const initialSeconds = isRewarded ? 15 : 3;
    const shouldProceedImmediately = immediateAction && (purpose === "interstitial_profile" || purpose === "interstitial_coaching");

    AnalyticsEvents.WATCH_AD_START();

    // Immediately show a fullscreen ad placeholder so the press feels instant even before native AdMob finishes preparing.
    setIsWatchingAd(true);
    setAdKind(kind);
    setAdCountdown(initialSeconds);
    setAdPurpose(purpose);

    if (shouldProceedImmediately && callback) {
      callback();
    }

    // Check if running on native platform to use Unity Ads
    showNativeUnityAd(
      kind,
      () => {
        // onComplete
        setIsWatchingAd(false);
        setAdPurpose(null);

        if (purpose === "rewarded_points") {
          const currentPts = parseInt(localStorage.getItem("coaching_user_points") || "0") || userPoints;
          const newPts = currentPts + 100;
          updatePoints(newPts);
          AnalyticsEvents.REWARD_EARNED(100, newPts);
          showToast("100P가 성공적으로 적립되었습니다! 🪙");
        }
        if (!shouldProceedImmediately && callback) {
          callback();
        } else if (purpose === "interstitial_coaching" && runCoachingAnalysis) {
          runCoachingAnalysis();
        }
      },
      (errMsg) => {
        // onError fallback
        console.warn("Native Unity ad fallback to web player:", errMsg);
        runWebSimulation(purpose, kind, initialSeconds, callback, shouldProceedImmediately);
      }
    );
  };

  const runWebSimulation = (
    purpose: NonNullable<AdPurpose>,
    kind: AdKind,
    initialSeconds: number,
    callback?: () => void,
    shouldProceedImmediately: boolean = false
  ) => {
    setIsWatchingAd(true);
    setAdKind(kind);
    setAdCountdown(initialSeconds);
    setAdPurpose(purpose);

    let secondsLeft = initialSeconds;
    const interval = setInterval(() => {
      secondsLeft -= 1;
      setAdCountdown(secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(interval);
        setIsWatchingAd(false);
        setAdPurpose(null);

        if (shouldProceedImmediately) return;

        if (purpose === "rewarded_points") {
          const currentPts = parseInt(localStorage.getItem("coaching_user_points") || "0") || userPoints;
          const newPts = currentPts + 100;
          updatePoints(newPts);
          AnalyticsEvents.REWARD_EARNED(100, newPts);
          showToast("100P가 성공적으로 적립되었습니다! 🪙");
        } else if (purpose === "rewarded_matching") {
          showToast("보상형 광고 시청 완료! 매칭 분석이 진행됩니다 ✨");
          if (callback) callback();
        } else if (purpose === "interstitial_coaching") {
          showToast("컨디션 분석 리포트를 조회합니다 ✨");
          if (runCoachingAnalysis) runCoachingAnalysis();
        } else if (purpose === "interstitial_profile") {
          showToast("정보 수정 화면으로 이동합니다 ✏️");
          if (callback) callback();
        } else if (callback) {
          callback();
        }
      }
    }, 1000);
  };

  // Shortcut to trigger Rewarded Ad (+100P)
  const handleWatchRewardedAd = (callback?: () => void) => {
    startAdPlayer("rewarded_points", callback);
  };

  // Shortcut to trigger Interstitial Ad
  const handleShowInterstitial = (purpose: "interstitial_coaching" | "interstitial_profile", callback?: () => void) => {
    startAdPlayer(purpose, callback);
  };

  return {
    isWatchingAd,
    adCountdown,
    adPurpose,
    adKind,
    startAdPlayer,
    handleWatchRewardedAd,
    handleShowInterstitial,
  };
}
