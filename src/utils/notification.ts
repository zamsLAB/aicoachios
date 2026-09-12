import { LocalNotifications } from "@capacitor/local-notifications";

/**
 * Helper to fire system notifications on native Android (Capacitor) and browser fallback.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  const win = typeof window !== "undefined" ? (window as any) : null;
  const isNative = win?.Capacitor?.isNativePlatform?.();

  if (isNative) {
    try {
      const permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display === "prompt" || permStatus.display === "prompt-with-rationale") {
        const res = await LocalNotifications.requestPermissions();
        if (res.display === "granted") return "granted";
      } else if (permStatus.display === "granted") {
        return "granted";
      }
    } catch (capNotifErr) {
      console.warn("Capacitor LocalNotifications requestPermissions error:", capNotifErr);
    }
  }

  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    return new Promise((resolve) => {
      try {
        Notification.requestPermission((res) => resolve(res));
      } catch {
        resolve("denied");
      }
    });
  }
}

export async function sendPushNotification(title: string, body: string, icon = "/favicon.png") {
  const win = typeof window !== "undefined" ? (window as any) : null;
  const isNative = win?.Capacitor?.isNativePlatform?.();

  if (isNative) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 1000000),
            title,
            body,
            schedule: { at: new Date(Date.now() + 500) },
            sound: undefined,
            extra: null,
          }
        ]
      });
      return true;
    } catch (e) {
      console.warn("Native LocalNotifications.schedule failed:", e);
    }
  }

  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  try {
    const notif = new Notification(title, { body, icon });
    notif.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notif.close();
    };
    return true;
  } catch (e) {
    console.warn("Notification constructor failed:", e);
    return false;
  }
}
