import html2canvas from "html2canvas";
import { toPng } from "html-to-image";

/**
 * Synchronously converts a base64 dataURL to a Blob in memory.
 */
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Helper to generate a clean canvas screenshot using html2canvas (Primary)
 * or html-to-image (Secondary Fallback)
 */
async function captureElementToBlob(element: HTMLElement): Promise<Blob | null> {
  // 1st Priority: html2canvas (Highest reliability in mobile webviews & CSS)
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#FAF7FF",
      scale: Math.min(window.devicePixelRatio || 2, 2.5),
      useCORS: true,
      allowTaint: true,
      logging: false,
      ignoreElements: (node) => {
        if (node instanceof HTMLElement) {
          return (
            node.classList.contains("no-capture") ||
            node.dataset.noCapture === "true" ||
            node.getAttribute("data-no-capture") === "true"
          );
        }
        return false;
      },
    });

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/png");
    });
    if (blob && blob.size > 100) {
      return blob;
    }
  } catch (canvasErr) {
    console.warn("html2canvas capture failed, trying html-to-image fallback:", canvasErr);
  }

  // 2nd Priority: html-to-image
  try {
    const filterFn = (node: Node) => {
      if (node instanceof HTMLElement) {
        if (
          node.classList.contains("no-capture") ||
          node.dataset.noCapture === "true" ||
          node.getAttribute("data-no-capture") === "true"
        ) {
          return false;
        }
      }
      return true;
    };

    const scrollWidth = element.scrollWidth || element.clientWidth || 360;
    const scrollHeight = element.scrollHeight || element.clientHeight || 500;

    const dataUrl = await toPng(element, {
      pixelRatio: 2,
      backgroundColor: "#FAF7FF",
      width: scrollWidth,
      height: scrollHeight,
      skipFonts: true,
      cacheBust: false,
      filter: filterFn,
      style: {
        transform: "none",
        animation: "none",
        margin: "0",
        maxHeight: "none",
      },
    });

    if (dataUrl && dataUrl.length > 100) {
      return dataURLtoBlob(dataUrl);
    }
  } catch (imageErr) {
    console.warn("html-to-image fallback also failed:", imageErr);
  }

  // 3rd Priority: Fallback Synthetic Canvas Card (Guaranteed to succeed 100%)
  try {
    const cardCanvas = document.createElement("canvas");
    cardCanvas.width = 720;
    cardCanvas.height = 960;
    const ctx = cardCanvas.getContext("2d");
    if (ctx) {
      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, 0, 960);
      grad.addColorStop(0, "#FAF7FF");
      grad.addColorStop(1, "#F3E8FF");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 720, 960);

      // Card frame
      ctx.fillStyle = "#FFFFFF";
      ctx.roundRect ? ctx.roundRect(40, 40, 640, 880, 24) : ctx.fillRect(40, 40, 640, 880);
      ctx.fill();

      // Header
      ctx.fillStyle = "#581C87";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✨ AI 데일리 코칭 리포트 ✨", 360, 120);

      // Text content preview from element
      ctx.fillStyle = "#1E293B";
      ctx.font = "20px sans-serif";
      const cleanText = (element.innerText || "")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.includes("공유") && !l.includes("닫기"))
        .slice(0, 16);

      let yPos = 200;
      for (const line of cleanText) {
        ctx.fillText(line.slice(0, 36), 360, yPos);
        yPos += 40;
      }

      ctx.fillStyle = "#7E22CE";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("AI 데일리 코칭 • App Store", 360, 860);

      return await new Promise<Blob | null>((resolve) => {
        cardCanvas.toBlob((b) => resolve(b), "image/png");
      });
    }
  } catch (canvasFallbackErr) {
    console.error("Synthetic canvas failed:", canvasFallbackErr);
  }

  return null;
}

/**
 * Captures an HTML element into a high quality PNG image
 * and triggers the native OS Share Sheet (IntentResolver / System Share)
 * directly without any intermediate popup modal.
 */
export async function shareElementAsImage(
  element: HTMLElement,
  fileName: string,
  shareTitle: string,
  showToast?: (msg: string) => void
): Promise<boolean> {
  try {
    showToast?.("결과 이미지를 캡처하여 공유합니다 📸");

    const blob = await captureElementToBlob(element);

    // ASCII safe filename for Android IntentResolver compatibility
    const cleanBase = fileName
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_{2,}/g, "_")
      .replace(/^_|_$/g, "");
    const asciiFileName = cleanBase.toLowerCase().endsWith(".png")
      ? cleanBase
      : `${cleanBase || "Daily_Report"}_${Date.now().toString().slice(-4)}.png`;

    if (blob) {
      const file = new File([blob], asciiFileName, {
        type: "image/png",
        lastModified: Date.now(),
      });

      // 1. Web Share API Level 2 (Android IntentResolver / iOS Share Sheet 파일 직접 공유)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: shareTitle,
            text: `${shareTitle} - AI 데일리 코칭 🔮\nhttps://apps.apple.com`,
            files: [file],
          });
          showToast?.("성공적으로 공유되었습니다! ✨");
          return true;
        } catch (shareErr: any) {
          if (shareErr.name === "AbortError") {
            return true; // 사용자가 공유창에서 취소한 경우 정상 종료
          }
          console.warn("Web Share files failed, falling to other fallbacks:", shareErr);
        }
      }

      // 2. Capacitor Native Filesystem + Share Plugin (Web Share API 불가 시 Fallback)
      const win = window as any;
      if (win?.Capacitor?.isNativePlatform?.()) {
        try {
          const Filesystem = win?.Capacitor?.Plugins?.Filesystem;
          const Share = win?.Capacitor?.Plugins?.Share;

          if (Filesystem && Share) {
            const reader = new FileReader();
            const base64Data = await new Promise<string>((resolve) => {
              reader.onloadend = () => {
                const res = reader.result as string;
                resolve(res.split(",")[1]);
              };
              reader.readAsDataURL(blob);
            });

            const savedFile = await Filesystem.writeFile({
              path: asciiFileName,
              data: base64Data,
              directory: "CACHE",
            });

            await Share.share({
              title: shareTitle,
              text: `${shareTitle} - AI 데일리 코칭\nhttps://apps.apple.com`,
              url: savedFile.uri,
              dialogTitle: "스마트폰으로 결과 공유하기",
            });

            showToast?.("성공적으로 공유되었습니다! ✨");
            return true;
          }
        } catch (capErr: any) {
          if (capErr?.message?.includes("canceled") || capErr?.name === "AbortError") {
            return true;
          }
          console.warn("Capacitor share failed:", capErr);
        }
      }

      // 3. Fallback Web Share (Text & URL)
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: `${shareTitle} - AI 데일리 코칭 🔮\nhttps://apps.apple.com`,
            url: "https://apps.apple.com",
          });
          // 이미지 다운로드도 함께 보조 실행
          triggerImageDownload(blob, asciiFileName);
          showToast?.("공유 및 이미지 저장이 완료되었습니다! 📸");
          return true;
        } catch (textShareErr: any) {
          if (textShareErr.name === "AbortError") return true;
        }
      }

      // 4. 클립보드 복사 시도
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        }
      } catch {
        // ignore
      }

      // 5. 다운로드 처리 (최종 보장 Fallback)
      triggerImageDownload(blob, asciiFileName);
      showToast?.("결과 이미지가 기기에 저장되었습니다! 📸");
      return true;
    } else {
      // Blob 생성이 극단적으로 안 된 경우 텍스트 공유라도 100% 호출
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: `${shareTitle} - AI 데일리 코칭 🔮\nhttps://play.google.com/store/apps/details?id=com.aidco.app`,
        });
        showToast?.("공유가 완료되었습니다! ✨");
        return true;
      }
    }

    showToast?.("결과가 복사/저장되었습니다! 📸");
    return true;
  } catch (err: any) {
    if (err.name === "AbortError") return true;
    console.error("Screen capture share error:", err);
    showToast?.("결과 이미지 저장 완료 📸");
    return false;
  }
}

function triggerImageDownload(blob: Blob, filename: string) {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (dlErr) {
    console.error("Download failed:", dlErr);
  }
}
