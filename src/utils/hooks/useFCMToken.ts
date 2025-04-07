"use client";
import FCMApp from "@/utils/firebase";
import { getMessaging, getToken } from "firebase/messaging";
import { useEffect, useState } from "react";
import { getFcmTokenFromCookies, setFcmTokenInCookies } from "../token";

const useFcmToken = () => {
  const [fcmToken, setFCMToken] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return getFcmTokenFromCookies();
    }
    return "";
  });

  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState("");

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          const messaging = getMessaging(FCMApp);

          // Request notification permission
          const permission = await Notification.requestPermission();
          setNotificationPermissionStatus(permission);

          if (permission === "granted") {
            const currentToken = await getToken(messaging, {
              vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
            });

            if (currentToken) {
              setFCMToken(currentToken);
              setFcmTokenInCookies(currentToken);
            } else {
              console.log(
                "No registration token available. Request permission to generate one."
              );
            }
          }
        }
      } catch (error) {
        console.log("Error retrieving token:", error);
      }
    };

    retrieveToken();
  }, []);

  return { fcmToken, notificationPermissionStatus };
};

export default useFcmToken;
