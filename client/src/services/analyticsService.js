import api from './api';

export const analyticsService = {
  async getSummary(params = {}) {
    const res = await api.get('/analytics/summary', { params });
    return res.data.data;
  },

  async getIncomeVsExpenses(months = 6) {
    const res = await api.get('/analytics/income-expenses', {
      params: { months },
    });
    return res.data.data;
  },

  async getExpenseBreakdown(params = {}) {
    const res = await api.get('/analytics/expense-breakdown', { params });
    return res.data.data;
  },

  async getMonthlyTrend(months = 6) {
    const res = await api.get('/analytics/monthly-trend', {
      params: { months },
    });
    return res.data.data;
  },

  async getCategoryComparison(params = {}) {
    const res = await api.get('/analytics/category-comparison', { params });
    return res.data.data;
  },

  async getBudgetComparison(month, year) {
    const res = await api.get('/analytics/budget-comparison', {
      params: { month, year },
    });
    return res.data.data;
  },

  async getSavingsTrend(months = 6) {
    const res = await api.get('/analytics/savings-trend', {
      params: { months },
    });
    return res.data.data;
  },
};
