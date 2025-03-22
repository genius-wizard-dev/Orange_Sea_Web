import axios, { AxiosError, AxiosInstance } from 'axios';

class ApiClient {
    private static instance: AxiosInstance;

    private constructor() {}

    public static getInstance(): AxiosInstance {
        if (!ApiClient.instance) {
          ApiClient.instance = axios.create({
                baseURL: process.env.API_URL || '',
            });
            ApiClient.instance.interceptors.response.use(
                response => response,
                (error: AxiosError) => {
                    if (error.response) {
                        console.error('Lỗi Response:', {
                            status: error.response.status,
                            data: error.response.data,
                            message: error.message,
                        });
                    } else if (error.request) {
                        console.error('Lỗi Request:', error.request);
                    } else {
                        console.error('Lỗi:', error.message);
                    }
                    return Promise.reject(error);
                }
            );
        }
        return ApiClient.instance;
    }
}

export default ApiClient;
