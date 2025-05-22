export interface ApiService {
  get<T>(uri: string, params?: any): Promise<T>;
  post<T>(uri: string, data?: any): Promise<T>;
  put<T>(uri: string, data?: any): Promise<T>;
  delete<T>(uri: string, data?: any): Promise<T>;
}
