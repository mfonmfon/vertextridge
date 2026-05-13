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
    try {
      console.log('AdminService: Fetching users...', { page, limit, search });
      const response = await request(`/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      console.log('AdminService: Users response:', response);
      return response;
    } catch (error) {
      console.error('AdminService: Failed to fetch users:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },

  async updateUserBalance(userId, balance, reason) {
    return request(`/admin/users/${userId}/balance`, {
      method: 'PATCH',
      body: { balance, reason }
    });
  },

  async updateUserProfile(userId, updates) {
    console.log('🔧 ADMIN SERVICE: Updating user profile', { userId, updates });
    const response = await request(`/admin/users/${userId}/profile`, {
      method: 'PATCH',
      body: updates
    });
    console.log('✅ ADMIN SERVICE: Profile update response', response);
    return response;
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

  // Wallet management
  async generateWalletAddress(userId, currency, network, label) {
    return request(`/admin/users/${userId}/wallet`, {
      method: 'POST',
      body: { currency, network, label }
    });
  },

  async getUserWallets(userId) {
    return request(`/admin/users/${userId}/wallets`);
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
  },

  // Copy trading management
  async getMasterTraders() {
    return request('/copy-trading/masters');
  },

  async assignCopyTrader(userId, masterId, allocatedAmount, copyPercentage = 100) {
    return request(`/admin/users/${userId}/copy-trading`, {
      method: 'POST',
      body: { masterId, allocatedAmount, copyPercentage }
    });
  },

  async getUserCopyRelationships(userId) {
    return request(`/admin/users/${userId}/copy-trading`);
  },

  async stopUserCopyRelationship(relationshipId) {
    return request(`/admin/copy-trading/${relationshipId}/stop`, {
      method: 'POST'
    });
  },

  // Master Trader management
  async getAllTraders() {
    return request('/admin/traders');
  },

  async createTrader(traderData) {
    return request('/admin/traders', {
      method: 'POST',
      body: traderData
    });
  },

  async updateTrader(traderId, updates) {
    return request(`/admin/traders/${traderId}`, {
      method: 'PATCH',
      body: updates
    });
  },

  async deleteTrader(traderId) {
    return request(`/admin/traders/${traderId}`, {
      method: 'DELETE'
    });
  }
};
