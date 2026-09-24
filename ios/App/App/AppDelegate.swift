import UIKit
import Capacitor
import UnityAds
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UnityAdsInitializationDelegate, UnityAdsShowDelegate {

    var window: UIWindow?
    let gameId = "800365063" // 유니티 iOS Game ID (필요시 iOS용 ID 확인)
    let testMode = true      // 출시 시 false로 변경

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // 1. Unity Ads SDK 초기화
        UnityAds.initialize(gameId, testMode: testMode, initializationDelegate: self)
        
        return true
    }

    // 2. 웹뷰에 JS Interface 연결 (웹뷰 로드 완료 시)
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesBegan(touches, with: event)
        setupBridge()
    }

    private func setupBridge() {
        guard let bridgeVC = window?.rootViewController as? CAPBridgeViewController,
              let webView = bridgeVC.webView else { return }
        
        let jsScript = """
        window.UnityAdsBridge = {
            showRewardedAd: function() {
                window.webkit.messageHandlers.showRewarded.postMessage(null);
            },
            showInterstitialAd: function() {
                window.webkit.messageHandlers.showInterstitial.postMessage(null);
            }
        };
        """
        webView.evaluateJavaScript(jsScript, completionHandler: nil)
    }

    // --- Unity Ads Delegate 콜백 ---
    func initializationComplete() {
        print("Unity Ads iOS Initialized successfully")
        UnityAds.load("Rewarded_iOS")
        UnityAds.load("Interstitial_iOS")
    }

    func initializationFailed(_ error: UnityAdsInitializationError, message: String) {
        print("Unity Ads iOS Init Failed: \(message)")
    }
    
    func unityAdsShowComplete(_ placementId: String, withFinishState state: UnityAdsShowCompletionState) {
        guard let bridgeVC = window?.rootViewController as? CAPBridgeViewController else { return }
        bridgeVC.webView?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('unityRewardCompleted'));", completionHandler: nil)
    }
    
    func unityAdsShowFailed(_ placementId: String, withError error: UnityAdsShowError, message: String) {
        guard let bridgeVC = window?.rootViewController as? CAPBridgeViewController else { return }
        bridgeVC.webView?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('unityAdFailed'));", completionHandler: nil)
    }
    
    func unityAdsShowStart(_ placementId: String) {}
    func unityAdsShowClick(_ placementId: String) {}

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}
