"use client";
import FCMApp from "@/utils/firebase";
import useFcmToken from "@/utils/hooks/useFCMToken";
import { getMessaging, onMessage } from "firebase/messaging";
import { useEffect, useRef } from "react";

export default function FCMToken() {
  const { fcmToken, notificationPermissionStatus } = useFcmToken();
  // Sử dụng useRef để tránh lặp lại setup không cần thiết
  const unsubscribeRef = useRef<(() => void) | null>(null);
  console.log(fcmToken, "FCM Token");
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (notificationPermissionStatus !== "granted") {
      return;
    }

    const setupForegroundMessaging = async () => {
      try {
        // Nếu đã có subscription, không cần thiết lập lại
        if (unsubscribeRef.current) {
          return;
        }

        const messaging = getMessaging(FCMApp);
        unsubscribeRef.current = onMessage(messaging, (payload) => {
          console.log("Foreground push notification received:", payload);

          // Extract data from both notification and data objects
          const notificationData = payload.notification || {};
          const customData = payload.data || {};

          // Use notification data first, then fall back to custom data
          const title =
            notificationData.title || customData.title || "Tin nhắn mới";
          const body =
            notificationData.body || customData.body || "Bạn có tin nhắn mới.";
          const image =
            notificationData.image ||
            customData.image ||
            "/images/firebase.png";

          if (Notification.permission === "granted") {
            new Notification(title, {
              body,
              icon: image,
              tag: customData.tag || `notification-${Date.now()}`,
              data: customData,
            });
          }
        });
      } catch (error) {
        console.error("Error setting up foreground messaging:", error);
      }
    };

    setupForegroundMessaging();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [notificationPermissionStatus]);

  return null;
}
