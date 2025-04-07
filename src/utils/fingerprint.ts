import FingerprintJS from "@fingerprintjs/fingerprintjs";

export const getDeviceId = async (): Promise<string> => {
  try {
    // Check if code is running in browser environment
    if (typeof window !== "undefined") {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      return result.visitorId;
    }
    return "server-side-rendering";
  } catch (error) {
    console.error("Lỗi khi lấy Device ID:", error);
    return "unknown-device";
  }
};
