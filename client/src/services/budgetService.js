import api from './api';

export const budgetService = {
  async getBudgets(month, year) {
    const res = await api.get('/budgets', {
      params: { month, year },
    });
    return res.data.data;
  },

  async setBudget(data) {
    const res = await api.post('/budgets', data);
    return res.data.data.budget;
  },

  async updateBudget(id, amount) {
    const res = await api.patch(`/budgets/${id}`, { amount });
    return res.data.data.budget;
  },

  async deleteBudget(id) {
    const res = await api.delete(`/budgets/${id}`);
    return res.data;
  },
};
