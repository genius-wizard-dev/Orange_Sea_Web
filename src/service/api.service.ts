import { ApiService } from "@/types/api.service";
import ApiClient from "@/utils/axios";
import { getDeviceId } from "@/utils/fingerprint";
import {
  clearTokens,
  getAccessToken,
  getAccessTokenSafe,
  getFcmTokenFromCookies,
  getFcmTokenFromServerCookies,
  getRefreshToken,
  isServer,
  setAccessToken,
  setRefreshToken,
} from "@/utils/token";
import { InternalAxiosRequestConfig } from "axios";
import { ENDPOINTS } from "./api.endpoint";

// Get the preconfigured axios instance
const axiosInstance = ApiClient.getInstance();

// Add authorization token to requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Use safe version of getAccessToken that works in both client and server
    const token = isServer()
      ? getAccessTokenSafe(config.headers?.cookie as string)
      : getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response and potential token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 (Unauthorized) - token expiration
    if (error.response && error.response.status === 401) {
      const originalRequest = error.config;

      // Avoid infinite loop - only try to refresh once
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Get refresh token
          const refreshToken = isServer()
            ? getAccessTokenSafe(
                originalRequest.headers?.cookie as string,
                true
              )
            : getRefreshToken();

          if (!refreshToken) {
            // No refresh token available, clear tokens and reject
            if (!isServer()) {
              clearTokens();
            }
            return Promise.reject(error);
          }

          // Create a new instance to avoid interceptors loop
          const refreshResponse = await ApiClient.getInstance().post(
            ENDPOINTS.AUTH.REFRESH,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          if (refreshResponse.data && refreshResponse.data.access_token) {
            // Save new tokens
            const { access_token, refresh_token } = refreshResponse.data;

            if (!isServer()) {
              setAccessToken(access_token);
              setRefreshToken(refresh_token);
            }

            // Update token in current request and retry
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError: any) {
          // If refresh token is invalid (401), clear tokens
          if (refreshError.response && refreshError.response.status === 401) {
            if (!isServer()) {
              clearTokens();
            }
          }
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

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
