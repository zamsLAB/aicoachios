using UnityEngine;
using UnityEngine.Advertisements;

public class UnityAdsManager : MonoBehaviour, IUnityAdsInitializationListener, IUnityAdsLoadListener, IUnityAdsShowListener
{
    [Header("iOS Game Settings")]
    private string iosGameId = "800380054";
    private bool testMode = false; // 출시 배포 시 false로 변경

    [Header("iOS Placement IDs")]
    private string rewardedAdUnitId = "Rewarded_iOS";
    private string interstitialAdUnitId = "Interstitial_iOS";

    private void Awake()
    {
        InitializeAds();
    }

    public void InitializeAds()
    {
        if (!Advertisement.isInitialized && Advertisement.isSupported)
        {
            Advertisement.Initialize(iosGameId, testMode, this);
        }
    }

    // --- 초기화 콜백 ---
    public void OnInitializationComplete()
    {
        Debug.Log("iOS Unity Ads 초기화 완료");
        LoadAds();
    }

    public void OnInitializationFailed(UnityAdsInitializationError error, string message)
    {
        Debug.LogError($"Unity Ads 초기화 실패: {error} - {message}");
    }

    // --- 광고 로드 (보상형/전면) ---
    public void LoadAds()
    {
        Advertisement.Load(rewardedAdUnitId, this);
        Advertisement.Load(interstitialAdUnitId, this);
    }

    // --- 보상형 광고 출력 ---
    public void ShowRewardedAd()
    {
        Advertisement.Show(rewardedAdUnitId, this);
    }

    // --- 전면 광고 출력 ---
    public void ShowInterstitialAd()
    {
        Advertisement.Show(interstitialAdUnitId, this);
    }

    // --- Interface Callbacks ---
    public void OnUnityAdsAdLoaded(string placementId) { }
    public void OnUnityAdsFailedToLoad(string placementId, UnityAdsLoadError error, string message) { }
    public void OnUnityAdsShowFailure(string placementId, UnityAdsShowError error, string message) { }
    public void OnUnityAdsShowStart(string placementId) { }
    public void OnUnityAdsShowClick(string placementId) { }

    public void OnUnityAdsShowComplete(string placementId, UnityAdsShowCompletionState showCompletionState)
    {
        if (placementId.Equals(rewardedAdUnitId) && showCompletionState.Equals(UnityAdsShowCompletionState.COMPLETED))
        {
            Debug.Log("iOS 보상형 광고 시청 완료 - 보상 지급 로직 처리");
        }
    }
}