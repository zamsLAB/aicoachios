/**
 * Google AdMob Production & Test Configuration (Android & iOS)
 */

// Helper to detect iOS environment
const isIOS = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const ADMOB_CONFIG = {
  // Google Publisher ID
  CLIENT_ID: "ca-pub-6698738823810950",

  // Production ads are enabled for the signed release build.
  IS_TEST_MODE: false,

  // Registered Test Device IDs
  TEST_DEVICE_IDS: [
    "7c01d58e-5869-49eb-b598-af680cbf0f2a",
    "EMULATOR",
  ],

  // Official Google AdMob Test Ad Unit IDs (guarantees 100% fill and protects real publisher account from policy violations)
  TEST_UNITS: {
    INTERSTITIAL: "ca-app-pub-3940256099942544/1033173712",
    REWARDED: "ca-app-pub-3940256099942544/5224354917",
  },

  // 1. Android AdMob Production IDs (stored for release)
  ANDROID_PROD: {
    APP_ID: "ca-app-pub-6698738823810950~4155741113",
    INTERSTITIAL_AD_UNIT_ID: "ca-app-pub-6698738823810950/4940227219", // 확인_수정
    REWARDED_AD_UNIT_ID: "ca-app-pub-6698738823810950/3627145544",     // 포인트
  },

  // 2. iOS (Apple App Store) AdMob Production IDs
  IOS_PROD: {
    APP_ID: "ca-app-pub-6698738823810950~3272912009",
    INTERSTITIAL_AD_UNIT_ID: "ca-app-pub-6698738823810950/8540666078", // 확인_수정 (iOS)
    REWARDED_AD_UNIT_ID: "ca-app-pub-6698738823810950/7036012714",     // 포인트 (iOS)
  },

  // Dynamic getters returning either Test Unit IDs or Production Unit IDs based on IS_TEST_MODE
  get INTERSTITIAL_AD_UNIT_ID() {
    if (this.IS_TEST_MODE) return this.TEST_UNITS.INTERSTITIAL;
    return isIOS() ? this.IOS_PROD.INTERSTITIAL_AD_UNIT_ID : this.ANDROID_PROD.INTERSTITIAL_AD_UNIT_ID;
  },

  get REWARDED_AD_UNIT_ID() {
    if (this.IS_TEST_MODE) return this.TEST_UNITS.REWARDED;
    return isIOS() ? this.IOS_PROD.REWARDED_AD_UNIT_ID : this.ANDROID_PROD.REWARDED_AD_UNIT_ID;
  },

};

