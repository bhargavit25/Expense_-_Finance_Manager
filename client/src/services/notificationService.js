import api from './api';

export const notificationService = {
  async getNotifications(limit = 50) {
    const res = await api.get('/notifications', { params: { limit } });
    return res.data.data;
  },

  async markAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data.data.notification;
  },

  async markAllAsRead() {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
};
