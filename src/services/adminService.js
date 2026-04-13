import { request } from './api';

/**
 * Admin Service - API calls for admin dashboard
 */

export const adminService = {
  // Dashboard stats
  async getDashboardStats() {
    return request('/admin/stats');
  },

  // User management
  async getUsers(page = 1, limit = 20, search = '') {
    return request(`/admin/users?page=${page}&limit=${limit}&search=${search}`);
  },

  async updateUserBalance(userId, balance, reason) {
    return request(`/admin/users/${userId}/balance`, {
      method: 'PATCH',
      body: { balance, reason }
    });
  },

  async updateKYCStatus(userId, kycStatus) {
    return request(`/admin/users/${userId}/kyc`, {
      method: 'PATCH',
      body: { kycStatus }
    });
  },

  async deleteUser(userId) {
    return request(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  // Platform settings
  async getSettings() {
    return request('/admin/settings');
  },

  async updateSetting(key, value) {
    return request('/admin/settings', {
      method: 'PUT',
      body: { key, value }
    });
  },

  // Activity logs
  async getActivityLogs(page = 1, limit = 50) {
    return request(`/admin/activity-logs?page=${page}&limit=${limit}`);
  }
};
