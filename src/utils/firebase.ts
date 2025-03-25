import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// Cấu hình Firebase từ biến môi trường
const firebaseConfig = {
  apiKey: process.env.FIRE_BASE_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGE_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Hàm lấy FCM token
export const getFcmToken = async (): Promise<string | null> => {
  try {
    const vapidKey = process.env.MESSAGE_KEY_PAIR; // VAPID key từ .env
    if (!vapidKey) {
      throw new Error("VAPID key is not defined in environment variables");
    }
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null; // Trả về null nếu lỗi
  }
};

export { messaging };

