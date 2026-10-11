import UIKit
import WebKit
import Capacitor
import UnityAds
import FirebaseCore
import AppTrackingTransparency

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, WKScriptMessageHandler, UADSBannerViewDelegate, UnityAdsInitializationDelegate, UnityAdsLoadDelegate, UnityAdsShowDelegate {

    var window: UIWindow?

    // Unity 대시보드 기준 ID
    let gameId = "800380054" // iOS Game ID

    // Xcode에서 직접 실행(Debug)하면 테스트 광고, Archive(Release)는 실제 광고
    #if DEBUG
    let testMode = true
    #else
    let testMode = false
    #endif

    let bannerPlacement = "Banner_ios"
    let rewardedPlacement = "BP_Rewarded_iOS"
    let interstitialPlacement = "BP_Interstitial_iOS"

    var currentBannerView: UADSBannerView?
    var bridgeWebView: WKWebView?
    private var attRequested = false

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        // Firebase 초기화
        FirebaseApp.configure()

        // Unity Ads SDK 초기화
        UnityAds.initialize(gameId, testMode: testMode, initializationDelegate: self)

        // 씬(Scene) 기반 앱에서는 applicationDidBecomeActive(_:)가 호출되지 않을 수 있어서
        // 알림(Notification)으로 대신 받는다.
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )

        return true
    }

    // 씬 미사용 환경 대비 (두 경로 모두 중복 실행되어도 안전하게 처리됨)
    func applicationDidBecomeActive(_ application: UIApplication) {
        setupBridgeIfNeeded()
    }

    @objc func appDidBecomeActive() {
        setupBridgeIfNeeded()
        requestTrackingIfNeeded()
    }

    // MARK: - Root ViewController (Scene 대응)
    func currentRootViewController() -> UIViewController? {
        return UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first(where: { $0.isKeyWindow })?
            .rootViewController
    }

    // MARK: - ATT (앱 추적 투명성) 권한 요청
    private func requestTrackingIfNeeded() {
        guard !attRequested else { return }
        attRequested = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            if #available(iOS 14, *) {
                if ATTrackingManager.trackingAuthorizationStatus == .notDetermined {
                    ATTrackingManager.requestTrackingAuthorization { status in
                        print("ATT status: \(status.rawValue)")
                    }
                }
            }
        }
    }

    // MARK: - Capacitor 브릿지 로드 및 JS 메시지 핸들러 등록
    private func setupBridgeIfNeeded() {
        guard bridgeWebView == nil,
              let bridgeVC = currentRootViewController() as? CAPBridgeViewController,
              let webView = bridgeVC.webView else { return }

        bridgeWebView = webView
        let userContentController = webView.configuration.userContentController

        for name in ["showBannerAd", "hideBannerAd", "showRewardedAd", "showInterstitialAd"] {
            userContentController.removeScriptMessageHandler(forName: name)
            userContentController.add(self, name: name)
        }

        // 안드로이드 UnityAdsBridge 호환용 JS 인터페이스
        let js = """
        window.UnityAdsBridge = {
            showBannerAd: function() { window.webkit.messageHandlers.showBannerAd.postMessage(null); },
            hideBannerAd: function() { window.webkit.messageHandlers.hideBannerAd.postMessage(null); },
            showRewardedAd: function() { window.webkit.messageHandlers.showRewardedAd.postMessage(null); },
            showInterstitialAd: function() { window.webkit.messageHandlers.showInterstitialAd.postMessage(null); }
        };
        """
        // 이후 페이지 로드용
        userContentController.addUserScript(WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        // 이미 로드된 현재 페이지용
        webView.evaluateJavaScript(js, completionHandler: nil)

        print("Unity Ads JS bridge registered")
    }

    // MARK: - WKScriptMessageHandler
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
        print("Unity Ads initialized successfully in iOS Native (testMode: \(testMode))")
        loadAds()
    }

    func initializationFailed(_ error: UnityAdsInitializationError, withMessage message: String) {
        print("Unity Ads initialization failed: \(error) - \(message)")
    }

    func loadAds() {
        UnityAds.load(rewardedPlacement, loadDelegate: self)
        UnityAds.load(interstitialPlacement, loadDelegate: self)
    }

    // MARK: - Unity Ads Load Delegate
    func unityAdsAdLoaded(_ placementId: String) {
        print("Unity ad loaded successfully: \(placementId)")
    }

    func unityAdsAdFailed(toLoad placementId: String, withError error: UnityAdsLoadError, withMessage message: String) {
        print("Unity ad load failed: \(placementId) - \(error) - \(message)")
    }

    // MARK: - Unity Ads Show Delegate
    func unityAdsShowStart(_ placementId: String) {
        print("Unity ad show start: \(placementId)")
    }

    func unityAdsShowClick(_ placementId: String) {
        print("Unity ad clicked: \(placementId)")
    }

    func unityAdsShowComplete(_ placementId: String, withFinish state: UnityAdsShowCompletionState) {
        print("Unity ad complete: \(placementId) state: \(state)")
        loadAds()

        if placementId == rewardedPlacement {
            // 끝까지 시청한 경우에만 보상 지급 (건너뛰기는 실패 이벤트로 전달)
            if state == .showCompletionStateCompleted {
                evaluateJS(script: "window.dispatchEvent(new CustomEvent('unityRewardCompleted'));")
            } else {
                evaluateJS(script: "window.dispatchEvent(new CustomEvent('unityAdFailed', { detail: 'skipped' }));")
            }
        } else if placementId == interstitialPlacement {
            evaluateJS(script: "window.dispatchEvent(new CustomEvent('unityInterstitialCompleted'));")
        }
    }

    func unityAdsShowFailed(_ placementId: String, withError error: UnityAdsShowError, withMessage message: String) {
        print("Unity ad show failed: \(placementId) - \(error) - \(message)")
        loadAds()
        evaluateJS(script: "window.dispatchEvent(new CustomEvent('unityAdFailed', { detail: '\(jsEscaped(message))' }));")
    }

    // MARK: - Helper & Native Ad Functions
    private func jsEscaped(_ text: String) -> String {
        return text
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "'", with: "\\'")
            .replacingOccurrences(of: "\n", with: " ")
            .replacingOccurrences(of: "\r", with: " ")
    }

    func evaluateJS(script: String) {
        DispatchQueue.main.async {
            let webView = self.bridgeWebView ?? (self.currentRootViewController() as? CAPBridgeViewController)?.webView
            webView?.evaluateJavaScript(script, completionHandler: nil)
        }
    }

    @objc public func showBannerAd() {
        DispatchQueue.main.async {
            guard let rootVC = self.currentRootViewController() else {
                print("showBannerAd: rootViewController not found")
                return
            }
            self.currentBannerView?.removeFromSuperview()

            let banner = UADSBannerView(placementId: self.bannerPlacement, size: CGSize(width: 320, height: 50))
            banner.delegate = self
            banner.translatesAutoresizingMaskIntoConstraints = false
            rootVC.view.addSubview(banner)
            rootVC.view.bringSubviewToFront(banner)

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
            guard let rootVC = self.currentRootViewController() else {
                print("showRewardedAd: rootViewController not found")
                return
            }
            UnityAds.show(rootVC, placementId: self.rewardedPlacement, showDelegate: self)
        }
    }

    @objc public func showInterstitialAd() {
        DispatchQueue.main.async {
            guard let rootVC = self.currentRootViewController() else {
                print("showInterstitialAd: rootViewController not found")
                return
            }
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