import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const FCM_TOKEN_KEY = "fcm_token";
const EMAIL_KEY = "register_email";
const REGISTER_KEY = "register_key";

// Helper to check if code is running on server
export const isServer = () => typeof window === "undefined";

// Get FCM token from cookies - client version
export const getFcmTokenFromCookies = (): string => {
  if (isServer()) {
    // Return empty string on server
    return "";
  }
  return Cookies.get(FCM_TOKEN_KEY) || "";
};

// Server-side function to get FCM token
export const getFcmTokenFromServerCookies = (cookieHeader?: string): string => {
  if (!isServer()) return getFcmTokenFromCookies();

  try {
    if (cookieHeader) {
      const fcmCookie = cookieHeader
        .split(";")
        .find((c) => c.trim().startsWith(`${FCM_TOKEN_KEY}=`));

      if (fcmCookie) {
        return fcmCookie.split("=")[1].trim();
      }
    }

    // Don't try to use server cookies API directly - it would cause imports from next/headers
    return "";
  } catch (error) {
    console.error("Error getting FCM token from server cookies:", error);
    return "";
  }
};

// Server-safe function to get access token
export const getAccessTokenSafe = (cookieHeader?: string): string | null => {
  if (!isServer()) return getAccessToken();

  try {
    if (cookieHeader) {
      const accessCookie = cookieHeader
        .split(";")
        .find((c) => c.trim().startsWith(`${ACCESS_TOKEN_KEY}=`));

      if (accessCookie) {
        return accessCookie.split("=")[1].trim();
      }
    }

    // Don't try to use server cookies API directly
    return null;
  } catch (error) {
    console.error("Error getting access token from server cookies:", error);
    return null;
  }
};

// Save FCM token to cookies
export const setFcmTokenInCookies = (token: string, expires = 30): void => {
  // Skip on server
  if (isServer()) return;

  Cookies.set(FCM_TOKEN_KEY, token, {
    expires,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
};

// Save access token to cookies
export const setAccessToken = (token: string, expires = 7): void => {
  // Skip on server
  if (isServer()) return;

  Cookies.set(ACCESS_TOKEN_KEY, token, {
    expires,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
};

// Get access token from cookies
export const getAccessToken = (): string | null => {
  // Skip on server
  if (isServer()) return null;
  return Cookies.get(ACCESS_TOKEN_KEY) || null;
};

// Remove access token from cookies
export const removeAccessToken = (): void => {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
};

// Save refresh token to cookies
export const setRefreshToken = (token: string, expires = 30): void => {
  Cookies.set(REFRESH_TOKEN_KEY, token, {
    expires,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
};

// Get refresh token from cookies
export const getRefreshToken = (): string | null => {
  return Cookies.get(REFRESH_TOKEN_KEY) || null;
};

// Remove refresh token from cookies
export const removeRefreshToken = (): void => {
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
};

// Save email to cookies
export const setEmailInCookies = (email: string, expires = 7): void => {
  // Skip on server
  if (isServer()) return;

  Cookies.set(EMAIL_KEY, email, {
    expires,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
};

// Get email from cookies
export const getEmailFromCookies = (): string | null => {
  // Skip on server
  if (isServer()) return null;

  return Cookies.get(EMAIL_KEY) || null;
};

// Remove email from cookies
export const removeEmailFromCookies = (): void => {
  Cookies.remove(EMAIL_KEY, { path: "/" });
};

// Save register key to cookies
export const setRegisterKeyInCookies = (key: string, expires = 5): void => {
  // Skip on server
  if (isServer()) return;

  Cookies.set(REGISTER_KEY, key, {
    expires,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
};

// Get register key from cookies
export const getRegisterKeyFromCookies = (): string | null => {
  // Skip on server
  if (isServer()) return null;

  return Cookies.get(REGISTER_KEY) || null;
};

// Remove register key from cookies
export const removeRegisterKeyFromCookies = (): void => {
  Cookies.remove(REGISTER_KEY, { path: "/" });
};

// Check if token exists
export const hasToken = (): boolean => {
  return !!getAccessToken();
};

// Clear all tokens
export const clearTokens = (): void => {
  removeAccessToken();
  removeRefreshToken();
};

// Clear all registration data
export const clearRegistrationData = (): void => {
  removeEmailFromCookies();
  removeRegisterKeyFromCookies();
};
