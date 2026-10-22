import api from './api';

export const categoryService = {
  async getCategories() {
    const res = await api.get('/categories');
    return res.data.data.categories;
  },

  async createCategory(data) {
    const res = await api.post('/categories', data);
    return res.data.data.category;
  },

  async updateCategory(id, data) {
    const res = await api.patch(`/categories/${id}`, data);
    return res.data.data.category;
  },

  async deleteCategory(id, reassignToCategoryId) {
    const res = await api.delete(`/categories/${id}`, {
      params: { reassignToCategoryId },
    });
    return res.data;
  },
};
