import { ApiService } from "@/types/api.service";
import ApiClient from "@/utils/axios";
import { getDeviceId } from "@/utils/fingerprint";
import {
  getFcmTokenFromCookies,
  getFcmTokenFromServerCookies,
  isServer,
} from "@/utils/token";

// Get the preconfigured axios instance
const axiosInstance = ApiClient.getInstance();

class ApiServiceImpl implements ApiService {
  private async request<T>(
    method: string,
    uri: string,
    data?: any
  ): Promise<T> {
    try {
      console.log(`📤 Making ${method} request to ${uri}`, { data });

      // Skip device ID and FCM token on server-side
      let headers: Record<string, string> = {};

      if (!isServer()) {
        // Client-side - get device ID and FCM token
        const deviceId = await getDeviceId();
        console.log(deviceId);
        const fcmToken = getFcmTokenFromCookies();

        headers = {
          "X-Device-ID": deviceId,
          "X-FCM-Token": fcmToken,
        };
      } else {
        // Server-side - only add available headers
        // We could try to get FCM from server cookies if needed
        const fcmToken = getFcmTokenFromServerCookies();
        if (fcmToken) {
          headers["X-FCM-Token"] = fcmToken;
        }
      }

      // Nếu data là FormData, không set Content-Type header
      if (data instanceof FormData) {
        delete headers["Content-Type"];
      }

      const response = await axiosInstance.request<T>({
        method,
        url: uri,
        data,
        headers,
      });

      return response.data;
    } catch (error) {
      console.error(`❌ Error in ${method} request to ${uri}:`, error);
      throw error;
    }
  }

  async get<T>(uri: string): Promise<T> {
    return this.request<T>("GET", uri);
  }

  async post<T>(uri: string, data?: any): Promise<T> {
    return this.request<T>("POST", uri, data);
  }

  async put<T>(uri: string, data?: any): Promise<T> {
    return this.request<T>("PUT", uri, data);
  }

  async delete<T>(uri: string): Promise<T> {
    return this.request<T>("DELETE", uri);
  }
}

const apiService = new ApiServiceImpl();

export default apiService;
