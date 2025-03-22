import { ApiService } from "@/types/api.service";
import ApiClient from "@/utils/axios";
import { getDeviceId } from "@/utils/fingerprint";
import { AxiosResponse, Method } from "axios";

// Lấy instance từ ApiClient
const instance = ApiClient.getInstance();

const getHeaders = async (token?: string): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const deviceId = await getDeviceId();
  headers["X-Device-ID"] = deviceId;
  return headers;
};

const request = async <T>(
  method: Method,
  uri: string,
  data?: any,
  token?: string,
  params?: any
): Promise<AxiosResponse<T>> => {
  try {
    const headers = await getHeaders(token);
    return await instance.request<T>({ method, url: uri, headers, data, params });
  } catch (error: any) {
    throw error.response?.data || error.message || error;
  }
};

const apiService: ApiService = {
  get: <T>(uri: string, token?: string, params?: any) => request<T>("GET", uri, undefined, token, params),
  post: <T>(uri: string, data?: any, token?: string) => request<T>("POST", uri, data, token),
  put: <T>(uri: string, data?: any, token?: string) => request<T>("PUT", uri, data, token),
  delete: <T>(uri: string, data?: any, token?: string) => request<T>("DELETE", uri, data, token),
};

export default apiService;
