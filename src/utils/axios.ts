import { ENDPOINTS } from "@/service/api.endpoint";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/utils/token";
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { getDeviceId } from "./fingerprint";

class ApiClient {
  private static instance: AxiosInstance;
  private static isRefreshing = false;
  private static failedQueue: { resolve: Function; reject: Function }[] = [];

  private constructor() {}

  private static processQueue(error: any = null) {
    ApiClient.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });

    ApiClient.failedQueue = [];
  }

  public static getInstance(): AxiosInstance {
    if (!ApiClient.instance) {
      ApiClient.instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || "",
      });

      // Request interceptor
      ApiClient.instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
          const token = getAccessToken();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Response interceptor
      ApiClient.instance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
          const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
          };

          if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
          ) {
            originalRequest._retry = true;

            if (ApiClient.isRefreshing) {
              // Nếu đang refresh token, thêm request vào hàng đợi
              return new Promise((resolve, reject) => {
                ApiClient.failedQueue.push({ resolve, reject });
              })
                .then(() => {
                  // Khi refresh hoàn tất, thử lại request với token mới
                  const token = getAccessToken();
                  if (token && originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                  }
                  return ApiClient.instance(originalRequest);
                })
                .catch((err) => {
                  return Promise.reject(err);
                });
            }

            ApiClient.isRefreshing = true;

            try {
              // Lấy refresh token
              const refreshToken = getRefreshToken();

              if (!refreshToken) {
                // Không có refresh token, từ chối request
                ApiClient.processQueue(error);
                ApiClient.isRefreshing = false;
                return Promise.reject(error);
              }
              const deviceId = await getDeviceId();
              // Tạo instance mới để tránh vòng lặp interceptor
              const refreshResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}${ENDPOINTS.AUTH.REFRESH}`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${refreshToken}`,
                    "x-device-id": deviceId,
                  },
                }
              );

              if (
                refreshResponse.data &&
                refreshResponse.data.statusCode === 200 &&
                refreshResponse.data.data
              ) {
                // Lưu token mới
                const { access_token, refresh_token } =
                  refreshResponse.data.data;
                setAccessToken(access_token);
                setRefreshToken(refresh_token);

                // Cập nhật token trong request hiện tại
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }

                // Xử lý tất cả các request đang chờ
                ApiClient.processQueue();
                ApiClient.isRefreshing = false;

                // Thử lại request ban đầu
                return ApiClient.instance(originalRequest);
              } else {
                ApiClient.processQueue(error);
                ApiClient.isRefreshing = false;
                return Promise.reject(error);
              }
            } catch (refreshError: any) {
              // Nếu refresh token không hợp lệ, từ chối request
              ApiClient.processQueue(refreshError);
              ApiClient.isRefreshing = false;
              return Promise.reject(refreshError);
            }
          } else if (error.response) {
            console.error("Lỗi Response:", {
              status: error.response.status,
              data: error.response.data,
              message: error.message,
            });
          } else if (error.request) {
            console.error("Lỗi Request:", error.request);
          } else {
            console.error("Lỗi:", error.message);
          }
          return Promise.reject(error);
        }
      );
    }
    return ApiClient.instance;
  }
}

export default ApiClient;
