import { request } from './api';

export const authService = {
  signup: async (userData) => {
    return request('/auth/signup', {
      method: 'POST',
      body: userData,
    });
  },

  login: async (credentials) => {
    return request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },

  googleLogin: async (credential, country = 'Not specified') => {
    return request('/auth/google', {
      method: 'POST',
      body: { credential, country },
    });
  },

  logout: async () => {
    return request('/auth/logout', {
      method: 'POST',
    });
  },
};
