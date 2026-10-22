import api from './api';

export const transactionService = {
  async getTransactions(params = {}) {
    const res = await api.get('/transactions', { params });
    return res.data.data;
  },

  async getTransactionById(id) {
    const res = await api.get(`/transactions/${id}`);
    return res.data.data.transaction;
  },

  async createTransaction(data) {
    const res = await api.post('/transactions', data);
    return res.data.data.transaction;
  },

  async updateTransaction(id, data) {
    const res = await api.patch(`/transactions/${id}`, data);
    return res.data.data.transaction;
  },

  async deleteTransaction(id) {
    const res = await api.delete(`/transactions/${id}`);
    return res.data;
  },

  async exportCsv(params = {}) {
    const res = await api.get('/transactions/export', {
      params,
      responseType: 'text',
    });
    return res.data;
  },
};
