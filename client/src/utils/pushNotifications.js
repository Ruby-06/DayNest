import { api } from "../App.jsx";

// Convert VAPID key URL safe base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function initPushNotifications() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    // 1. Register Service Worker
    const registration = await navigator.serviceWorker.register("/sw.js");

    // 2. Check Notification Permission
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
    }

    if ("Notification" in window && Notification.permission !== "granted") {
      return;
    }

    // 3. Fetch VAPID Key and Subscribe to Web Push if supported
    if ("PushManager" in window) {
      try {
        const { data } = await api.get("/notifications/vapid-key");
        if (data && data.publicKey) {
          const applicationServerKey = urlBase64ToUint8Array(data.publicKey);
          let subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey
            });
          }
          await api.post("/notifications/subscribe", { subscription });
        }
      } catch (err) {
        console.warn("Push subscription optional setup:", err.message);
      }
    }
  } catch (err) {
    console.warn("Service worker registration error:", err.message);
  }
}

export function showBrowserNotification(title, message, onClickUrl = "/habits") {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    const notification = new Notification(title, {
      body: message,
      icon: "/favicon.ico"
    });

    notification.onclick = () => {
      window.focus();
      if (onClickUrl) {
        window.location.hash = onClickUrl;
      }
      notification.close();
    };
  } catch (err) {
    console.warn("Could not trigger browser notification:", err.message);
  }
}
