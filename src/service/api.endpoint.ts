const BASE_ENDPOINT = "/api";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_ENDPOINT}/auth/login`,
    REGISTER: `${BASE_ENDPOINT}/auth/register`,
    REFRESH: `${BASE_ENDPOINT}/auth/refresh`,
    LOGOUT: `${BASE_ENDPOINT}/auth/logout`,
    IS_REGISTER: `${BASE_ENDPOINT}/auth/is-register`,
    VERIFY_OTP: `${BASE_ENDPOINT}/auth/verify-otp`,
    FORGOT: `${BASE_ENDPOINT}/auth/forgot-password`,
    RESET: `${BASE_ENDPOINT}/auth/reset-password`,
  },
  PROFILE: {
    ME: `${BASE_ENDPOINT}/profile/me`,
    INFO: (id: number) => `${BASE_ENDPOINT}/profile/${id}`,
    GET_BY_USERNAME: (username: string) =>
      `${BASE_ENDPOINT}/profile/username/${username}`,
  },
  ACCOUNT: {
    INFO: (id: number) => `${BASE_ENDPOINT}/account/${id}`,
    GET_BY_USERNAME: (username: string) =>
      `${BASE_ENDPOINT}/account/username/${username}`,
    PASSWORD: (id: string) => `${BASE_ENDPOINT}/account/${id}/password`,
  },
  FRIEND: {
    BASE: `${BASE_ENDPOINT}/friend`, //Post | Get
    SEND_REQUEST: `${BASE_ENDPOINT}/friend`,
    REQUESTS_RECEIVED: `${BASE_ENDPOINT}/friend/requests/received`,
    REQUESTS_SENT: `${BASE_ENDPOINT}/friend/requests/sent`,
    HANDLE_REQUEST: (id: string) => `${BASE_ENDPOINT}/friend/requests/${id}`,
    REMOVE_FRIEND: (id: string) => `${BASE_ENDPOINT}/friend/delete/${id}`,
  },
};
