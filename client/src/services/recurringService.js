import api from './api';

export const recurringService = {
  async getRules() {
    const res = await api.get('/recurring');
    return res.data.data.rules;
  },

  async createRule(data) {
    const res = await api.post('/recurring', data);
    return res.data.data.rule;
  },

  async updateRule(id, data) {
    const res = await api.patch(`/recurring/${id}`, data);
    return res.data.data.rule;
  },

  async deleteRule(id) {
    const res = await api.delete(`/recurring/${id}`);
    return res.data;
  },

  async pauseRule(id) {
    const res = await api.post(`/recurring/${id}/pause`);
    return res.data.data.rule;
  },

  async resumeRule(id) {
    const res = await api.post(`/recurring/${id}/resume`);
    return res.data.data.rule;
  },

  async processDue() {
    const res = await api.post('/recurring/process-due');
    return res.data.data;
  },
};
