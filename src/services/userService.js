import { request } from './api';

export const userService = {
  getProfile: async () => {
    return request('/user/profile', {
      method: 'GET',
    });
  },

  updateProfile: async (updates) => {
    return request('/user/profile', {
      method: 'PATCH',
      body: updates,
    });
  },
};
