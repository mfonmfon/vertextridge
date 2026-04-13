import { request } from './api';

/**
 * Notification Service
 */

export const notificationService = {
  async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    return request(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
  },

  async getUnreadCount() {
    return request('/notifications/unread-count');
  },

  async markAsRead(notificationId) {
    return request(`/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  },

  async markAllAsRead() {
    return request('/notifications/mark-all-read', {
      method: 'PATCH'
    });
  },

  async deleteNotification(notificationId) {
    return request(`/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }
};
