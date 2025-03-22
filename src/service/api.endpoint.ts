const BASE_ENDPOINT = '/api'

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_ENDPOINT}/auth/login`,
    REGISTER: `${BASE_ENDPOINT}/auth/register`,
    REFRESH: `${BASE_ENDPOINT}/auth/refresh`,
    LOGOUT: `${BASE_ENDPOINT}/auth/logout`,
  },
  PROFILE: {
    ME: `${BASE_ENDPOINT}/profile/me`,
    INFO: (id: number) => `${BASE_ENDPOINT}/profile/${id}`,
  },
  ACCOUNT: {
    INFO: (id: number) => `${BASE_ENDPOINT}/account/${id}`,
    GET_BY_USERNAME: (username: string) => `${BASE_ENDPOINT}/account/username/${username}`,
    PASSWORD: (id: number) => `${BASE_ENDPOINT}/account/${id}/password`,
  }
}
