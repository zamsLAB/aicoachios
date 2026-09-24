import UIKit
import WebKit
import Capacitor
import UnityAds

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, WKScriptMessageHandler, UADSBannerViewDelegate, UnityAdsInitializationDelegate, UnityAdsLoadDelegate, UnityAdsShowDelegate {

    var window: UIWindow?
    
    // 유니티 대시보드 스크린샷 기준 ID 매칭
    let gameId = "800380054" // iOS Game ID
    let testMode = false      // 테스트 시 true
    
    let bannerPlacement = "Banner_ios"
    let rewardedPlacement = "BP_Rewarded_iOS"
    let interstitialPlacement = "BP_Interstitial_iOS"
    
    var currentBannerView: UADSBannerView?
    var bridgeWebView: WKWebView?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // 1. Unity Ads SDK 초기화
        UnityAds.initialize(gameId, testMode: testMode, initializationDelegate: self)
        
        return true
    }

    // Capacitor 브릿지가 로드된 후 JS 브릿지 메시지 핸들러 등록
    override func applicationDidBecomeActive(_ application: UIApplication) {
        super.applicationDidBecomeActive(application)
        
        if let rootViewController = self.window?.rootViewController as? CAPBridgeViewController {
            if self.bridgeWebView == nil {
                self.bridgeWebView = rootViewController.webView
                
                // JavaScript(window.webkit.messageHandlers) 호출 핸들러 등록
                let userContentController = rootViewController.webView?.configuration.userContentController
                userContentController?.removeScriptMessageHandler(forName: "showBannerAd")
                userContentController?.removeScriptMessageHandler(forName: "hideBannerAd")
                userContentController?.removeScriptMessageHandler(forName: "showRewardedAd")
                userContentController?.removeScriptMessageHandler(forName: "showInterstitialAd")

                userContentController?.add(self, name: "showBannerAd")
                userContentController?.add(self, name: "hideBannerAd")
                userContentController?.add(self, name: "showRewardedAd")
                userContentController?.add(self, name: "showInterstitialAd")
            }
        }
    }

    // MARK: - WKScriptMessageHandler (JS에서 호출한 메세지 처리)
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        switch message.name {
        case "showBannerAd":
            showBannerAd()
        case "hideBannerAd":
            hideBannerAd()
        case "showRewardedAd":
            showRewardedAd()
        case "showInterstitialAd":
            showInterstitialAd()
        default:
            break
        }
    }

    // MARK: - Unity Ads Initialization Delegate
    func initializationComplete() {
        print("Unity Ads initialized successfully in iOS Native")
        loadAds()
    }

    func initializationFailed(_ error: UnityAdsInitializationError, withMessage message: String) {
        print("Unity Ads initialization failed: \(error) - \(message)")
    }

    // 광고 재로드 함수
    func loadAds() {
        UnityAds.load(rewardedPlacement, loadDelegate: self)
        UnityAds.load(interstitialPlacement, loadDelegate: self)
    }

    // MARK: - Unity Ads Load Delegate
    func onUnityAdsAdLoaded(_ placementId: String) {
        print("Unity ad loaded successfully: \(placementId)")
    }

    func onUnityAdsFailedToLoad(_ placementId: String, error: UnityAdsLoadError, message: String) {
        print("Unity ad load failed: \(error) - \(message)")
    }

    // MARK: - Unity Ads Show Delegate
    func onUnityAdsShowComplete(_ placementId: String, showCompletionState: UnityAdsShowCompletionState) {
        print("Unity ad complete: \(placementId)")
        
        // 🔥 중요: 시청 완료 후 다음 광고 미리 재로드!
        loadAds()
        
        if placementId == rewardedPlacement {
            evaluateJS(script: "window.dispatchEvent(new CustomEvent('unityRewardCompleted'));")
        } else if placementId == interstitialPlacement {
            evaluateJS(script: "window.dispatchEvent(new CustomEvent('unityInterstitialCompleted'));")
        }
    }

    func onUnityAdsShowFailure(_ placementId: String, error: UnityAdsShowError, message: String) {
        print("Unity ad show failed: \(error) - \(message)")
        
        // 🔥 중요: 광고 표시 실패 시에도 다음 광고 미리 재로드!
        loadAds()
        
        evaluateJS(script: "window.dispatchEvent(new CustomEvent('unityAdFailed', { detail: '\(message)' }));")
    }

    func onUnityAdsShowStart(_ placementId: String) {
        print("Unity ad show start: \(placementId)")
    }

    func onUnityAdsShowClick(_ placementId: String) {
        print("Unity ad clicked: \(placementId)")
    }

    // MARK: - JavaScript 통신용 헬퍼 함수
    func evaluateJS(script: String) {
        DispatchQueue.main.async {
            if let rootVC = self.window?.rootViewController as? CAPBridgeViewController {
                rootVC.webView?.evaluateJavaScript(script, completionHandler: nil)
            }
        }
    }
    
    // MARK: - 네이티브 광고 제어 함수
    @objc public func showBannerAd() {
        DispatchQueue.main.async {
            guard let rootVC = self.window?.rootViewController else { return }
            
            // 기존 배너 제거
            self.currentBannerView?.removeFromSuperview()
            
            // 새 배너 생성
            let banner = UADSBannerView(placementId: self.bannerPlacement, size: CGSize(width: 320, height: 50))
            banner.delegate = self
            
            // 하단 중앙 배치 제약 조건 설정
            banner.translatesAutoresizingMaskIntoConstraints = false
            rootVC.view.addSubview(banner)
            rootVC.view.bringSubviewToFront(banner) // 🔥 웹뷰 레이어 뒤로 숨김 방지
            
            NSLayoutConstraint.activate([
                banner.centerXAnchor.constraint(equalTo: rootVC.view.centerXAnchor),
                banner.bottomAnchor.constraint(equalTo: rootVC.view.safeAreaLayoutGuide.bottomAnchor)
            ])
            
            banner.load()
            self.currentBannerView = banner
        }
    }

    @objc public func hideBannerAd() {
        DispatchQueue.main.async {
            self.currentBannerView?.removeFromSuperview()
            self.currentBannerView = nil
        }
    }

    @objc public func showRewardedAd() {
        DispatchQueue.main.async {
            guard let rootVC = self.window?.rootViewController else { return }
            UnityAds.show(rootVC, placementId: self.rewardedPlacement, showDelegate: self)
        }
    }

    @objc public func showInterstitialAd() {
        DispatchQueue.main.async {
            guard let rootVC = self.window?.rootViewController else { return }
            UnityAds.show(rootVC, placementId: self.interstitialPlacement, showDelegate: self)
        }
    }

    // MARK: - UADSBannerViewDelegate
    func bannerViewDidLoad(_ bannerView: UADSBannerView) {
        print("iOS Unity Banner Loaded Successfully")
    }

    func bannerViewDidClick(_ bannerView: UADSBannerView) {
        print("iOS Unity Banner Clicked")
    }

    func bannerViewDidLeaveApplication(_ bannerView: UADSBannerView) {
        print("iOS Unity Banner Left Application")
    }

    func bannerViewDidError(_ bannerView: UADSBannerView, error: UADSBannerError) {
        print("iOS Unity Banner Load Error: \(error.localizedDescription)")
    }
}