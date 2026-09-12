// Google Analytics (gtag.js) Event Tracking Helper

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...params,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.debug('Analytics tracking error:', err);
  }
};

export const AnalyticsEvents = {
  PAGE_VIEW: (pageTitle: string) => trackEvent('page_view', { page_title: pageTitle }),
  CONDITION_CHECK_START: () => trackEvent('condition_check_start'),
  CONDITION_CHECK_COMPLETE: (score: number, status: string) =>
    trackEvent('condition_check_complete', { battery_score: score, status }),
  MATCHING_TEST: (myType: string, targetType: string, score: number) =>
    trackEvent('matching_test_complete', { my_type: myType, target_type: targetType, match_score: score }),
  WATCH_AD_START: () => trackEvent('watch_ad_start'),
  REWARD_EARNED: (amount: number, newBalance: number) =>
    trackEvent('reward_earned', { reward_amount: amount, new_balance: newBalance }),
  SYNC_ACCOUNT: (provider: string) => trackEvent('sync_account', { provider }),
  SHARE_APP: (method: string) => trackEvent('share_app', { method }),
};
