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

  changePassword: async (currentPassword, newPassword) => {
    return request('/user/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    });
  },

  updatePreferences: async (preferences) => {
    return request('/user/preferences', {
      method: 'PATCH',
      body: preferences,
    });
  },

  getPreferences: async () => {
    return request('/user/preferences', {
      method: 'GET',
    });
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return request('/user/avatar', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  },
};

