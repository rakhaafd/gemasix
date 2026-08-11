import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { clientDb } from "./firebase-client";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushNotificationSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function checkPushSubscriptionStatus(): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription && Notification.permission === "granted";
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
}

export async function subscribeToPushNotifications(): Promise<{ success: boolean; message: string }> {
  if (!isPushNotificationSupported()) {
    return { success: false, message: "Browser tidak mendukung Web Push Notification." };
  }

  if (!VAPID_PUBLIC_KEY) {
    return { success: false, message: "VAPID Public Key belum dikonfigurasi." };
  }

  try {
    // 1. Minta izin notifikasi
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, message: "Izin notifikasi ditolak oleh pengguna." };
    }

    // 2. Daftarkan Service Worker
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // 3. Subscribe Push Manager
    const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    const subJson = subscription.toJSON();
    if (!subJson.endpoint || !subJson.keys) {
      return { success: false, message: "Gagal membuat format subscription." };
    }

    // 4. Simpan ke Firestore
    // Gunakan hash atau encode endpoint sebagai ID document
    const subId = btoa(subJson.endpoint).replace(/\//g, "_").replace(/\+/g, "-").slice(-40);
    
    await setDoc(doc(clientDb, "push_subscriptions", subId), {
      endpoint: subJson.endpoint,
      keys: {
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
      },
      userAgent: navigator.userAgent,
      updatedAt: serverTimestamp(),
    });

    return { success: true, message: "Notifikasi NGL berhasil diaktifkan di perangkat ini!" };
  } catch (error: any) {
    console.error("Error subscribing to push:", error);
    return { success: false, message: error?.message || "Terjadi kesalahan saat mengaktifkan notifikasi." };
  }
}

export async function unsubscribeFromPushNotifications(): Promise<{ success: boolean; message: string }> {
  if (!isPushNotificationSupported()) {
    return { success: false, message: "Browser tidak mendukung Web Push Notification." };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const subJson = subscription.toJSON();
      if (subJson.endpoint) {
        const subId = btoa(subJson.endpoint).replace(/\//g, "_").replace(/\+/g, "-").slice(-40);
        try {
          await deleteDoc(doc(clientDb, "push_subscriptions", subId));
        } catch (e) {
          console.error("Error deleting subscription doc:", e);
        }
      }
      await subscription.unsubscribe();
    }

    return { success: true, message: "Notifikasi telah dinonaktifkan." };
  } catch (error: any) {
    console.error("Error unsubscribing:", error);
    return { success: false, message: error?.message || "Gagal menonaktifkan notifikasi." };
  }
}
