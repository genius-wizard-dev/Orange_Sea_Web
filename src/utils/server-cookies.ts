import { cookies } from "next/headers";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const FCM_TOKEN_KEY = "fcm_token";

/**
 * Server-only function to get FCM token
 * Use this in server components or server actions
 */
export const getServerFcmToken = (): string => {
  try {
    const cookieStore = cookies();
    return cookieStore.get(FCM_TOKEN_KEY)?.value || "";
  } catch (error) {
    console.error("Error getting FCM token from server cookies:", error);
    return "";
  }
};

/**
 * Server-only function to get access token
 * Use this in server components or server actions
 */
export const getServerAccessToken = (): string | null => {
  try {
    const cookieStore = cookies();
    return cookieStore.get(ACCESS_TOKEN_KEY)?.value || null;
  } catch (error) {
    console.error("Error getting access token from server cookies:", error);
    return null;
  }
};

/**
 * Server-only function to get refresh token
 * Use this in server components or server actions
 */
export const getServerRefreshToken = (): string | null => {
  try {
    const cookieStore = cookies();
    return cookieStore.get(REFRESH_TOKEN_KEY)?.value || null;
  } catch (error) {
    console.error("Error getting refresh token from server cookies:", error);
    return null;
  }
};
