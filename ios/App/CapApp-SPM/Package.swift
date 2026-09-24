// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", branch: "main")
    ],
    targets: [
        // 1. 방금 다운로드한 로컬 xcframework 지정
        .binaryTarget(
            name: "UnityAds",
            path: "../Frameworks/UnityAds.xcframework"
        ),
        // 2. 메인 SPM 타겟에 로컬 UnityAds 연결
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .target(name: "UnityAds")
            ]
        )
    ]
)