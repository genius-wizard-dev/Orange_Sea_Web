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
    INFO: (id: string) => `${BASE_ENDPOINT}/profile/${id}`,
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
    SEARCH_NEW_FRIEND: (keyword: string) =>
      `${BASE_ENDPOINT}/friend/search/${keyword}`,
  },
  GROUP: {
    LIST: `${BASE_ENDPOINT}/group`,
    DETAIL: (id: string) => `${BASE_ENDPOINT}/group/${id}`,
    CREATE: `${BASE_ENDPOINT}/group`,
    RENAME: (id: string) => `${BASE_ENDPOINT}/group/${id}/rename`,
    DELETE: (id: string) => `${BASE_ENDPOINT}/group/${id}`,
    MEMBERS: (id: string) => `${BASE_ENDPOINT}/group/${id}/members`,
    ADD_MEMBER: (id: string) => `${BASE_ENDPOINT}/group/${id}/members`,
    REMOVE_MEMBER: (id: string, memberId: string) =>
      `${BASE_ENDPOINT}/group/${id}/members/${memberId}`,
  },
  CHAT: {
    SEND: `${BASE_ENDPOINT}/chat/send`,
    UPLOAD_MEDIA: `${BASE_ENDPOINT}/chat/upload`,
    STICKER: `${BASE_ENDPOINT}/chat/sticker`,
    MESSAGE_LIST: (groupId: string, cursor: string) => `${BASE_ENDPOINT}/chat/messages/${groupId}?cursor=${cursor}`,
    RECALL: (messageId: string) => `${BASE_ENDPOINT}/chat/recall/${messageId}`,
    DELETE: (messageId: string) => `${BASE_ENDPOINT}/chat/delete/${messageId}`,
    FORWARD: `${BASE_ENDPOINT}/chat/forward`,
    MARK_AS_READ: (groupId: string) => `${BASE_ENDPOINT}/chat/read/${groupId}`,
    UNREAD_COUNTS: `${BASE_ENDPOINT}/chat/unread-counts`,
    REACTIONS: (messageId: string) => `${BASE_ENDPOINT}/chat/message/${messageId}/reactions`,
    ADD_REACTION: (messageId: string) => `${BASE_ENDPOINT}/chat/message/${messageId}/reaction`,
    EDIT: (messageId: string) => `${BASE_ENDPOINT}/chat/edit/${messageId}`,
  }
};