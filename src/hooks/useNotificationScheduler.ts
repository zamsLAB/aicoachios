import { useEffect, useState, useCallback } from "react";
import { UserProfile } from "../types";
import { sendPushNotification } from "../utils/notification";

interface UseNotificationSchedulerProps {
  userProfile: UserProfile;
  showToast: (msg: string) => void;
}

export function useNotificationScheduler({ userProfile, showToast }: UseNotificationSchedulerProps) {
  const [isNotifPermissionModalOpen, setIsNotifPermissionModalOpen] = useState(false);
  const [isOverlayPermissionModalOpen, setIsOverlayPermissionModalOpen] = useState(false);

  // Window/Tab Visibility Re-entry Notification Engine
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // When user unlocks phone or switches back to internet browser
        const todayStr = new Date().toISOString().split("T")[0];
        const lastCheckedDate = localStorage.getItem("coaching_last_visible_checked");

        if (lastCheckedDate !== todayStr && userProfile?.name) {
          localStorage.setItem("coaching_last_visible_checked", todayStr);
          sendPushNotification(
            "☀️ AI 데일리 코칭",
            `${userProfile.name}님, 오늘의 기분과 컨디션 배터리를 확인해보세요! 🔋`
          );
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [userProfile?.name]);

  // Background Daily Auto Notification Scheduler
  useEffect(() => {
    const autoEnabled = userProfile.autoNotificationEnabled ?? true;

    const autoScheduleMessages: Record<string, string> = {
      "08:00": `☀️[아침 스타트 코칭] ${userProfile.name}님! 오늘 기분 어때요?`,
      "12:00": `🍱[점심 배터리 체크] 오늘의 컨디션 배터리를 확인해보세요 🔋`,
      "17:00": `🌸[저녁 분석 리포트] 오늘 저녁! 분석 리포트가 기다립니다 📝`,
      "21:00": `🌙[밤 다이어리 타임] 오늘의 기분 일기를 기록해보세요 ✏️`,
    };

    let lastFiredMin = "";

    const timer = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const timeKey = `${hours}:${minutes}`;

      if (lastFiredMin === timeKey) return;

      const notifChoice = localStorage.getItem("coaching_notification_choice");

      // Check Automatic Push Notifications (08:00, 12:00, 17:00, 21:00)
      if (autoScheduleMessages[timeKey]) {
        if (notifChoice === "deny" && timeKey !== "12:00") {
          // Skip if user explicitly denied except 12:00 lunch check
        } else if (autoEnabled || timeKey === "12:00") {
          lastFiredMin = timeKey;
          const msg = autoScheduleMessages[timeKey];

          sendPushNotification("🤖AI코칭", msg);
          showToast(msg);
        }
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [userProfile, showToast]);

  const handleAllowNotif = () => {
    localStorage.setItem("coaching_notification_prompt_answered", "true");
    localStorage.setItem("coaching_notification_choice", "allow");
    setIsNotifPermissionModalOpen(false);

    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          sendPushNotification("AI 데일리 코칭 🤖", "알림! 매일 맞춤 코칭이 발송됩니다 ☀️");
          showToast("🔔 AI 코칭 알림이 발송됩니다.");
        } else {
          showToast("🔔 알림 설정이 완료되었습니다.");
        }
      });
    }

    // After accepting notification permission on first launch, check if overlay guide was shown
    const guided = localStorage.getItem("coaching_overlay_permission_guided");
    if (!guided) {
      setTimeout(() => {
        setIsOverlayPermissionModalOpen(true);
      }, 600);
    }
  };

  const handleDenyNotif = () => {
    localStorage.setItem("coaching_notification_prompt_answered", "true");
    localStorage.setItem("coaching_notification_choice", "deny");
    setIsNotifPermissionModalOpen(false);
  };

  const openOverlayGuide = useCallback(() => {
    setIsOverlayPermissionModalOpen(true);
  }, []);

  const closeOverlayGuide = useCallback(() => {
    localStorage.setItem("coaching_overlay_permission_guided", "true");
    setIsOverlayPermissionModalOpen(false);
  }, []);

  return {
    isNotifPermissionModalOpen,
    setIsNotifPermissionModalOpen,
    handleAllowNotif,
    handleDenyNotif,
    isOverlayPermissionModalOpen,
    openOverlayGuide,
    closeOverlayGuide,
  };
}
